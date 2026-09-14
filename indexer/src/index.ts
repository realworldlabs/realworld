import { ponder, type Context } from "ponder:registry";
import { createPublicClient, http } from "viem";

/**
 * Reads at the latest block instead of the event block. Everything read here is immutable after creation
 * (asset config, token metadata, launch curve bounds), and the public Robinhood RPC is not an archive node:
 * state older than a few minutes is pruned, so event-pinned reads fail during backfill.
 */
const chain = createPublicClient({
  transport: http(process.env.PONDER_RPC_URL ?? "http://127.0.0.1:8545", { retryCount: 5, retryDelay: 1_000 }),
});
import {
  asset,
  assetPrice,
  buyback,
  candle,
  coin,
  feeBalance,
  holder,
  redemption,
  trade,
} from "ponder:schema";
import { zeroAddress, type Address, type Hex } from "viem";
import { assetRegistryAbi, launchFactoryAbi, launchHookAbi, launchTokenAbi, priceWallAbi } from "@rwa/abi";
import { encodeAbiParameters, keccak256 } from "viem";
import {
  bucketOf,
  CANDLE_INTERVALS,
  curveProgress,
  LAUNCH_SUPPLY_TOKENS,
  priceFromSqrt,
  sqrtPriceAtTick,
  synthPriceAtTick,
  USDG_DECIMALS,
  SYNTH_DECIMALS,
} from "./lib/math";

const CATEGORY = ["MACRO", "COLLECTIBLE"] as const;

// ---------------------------------------------------------------- assets

ponder.on("AssetRegistry:AssetAdded", async ({ event, context }) => {
  const { assetId, token, startTick } = event.args;
  const [config, key, synthIsToken0] = await Promise.all([
    chain.readContract({
      abi: assetRegistryAbi,
      address: context.contracts.AssetRegistry.address,
      functionName: "getConfig",
      args: [assetId],
    }),
    chain.readContract({
      abi: priceWallAbi,
      address: context.contracts.PriceWall.address,
      functionName: "poolKeyOf",
      args: [assetId],
    }),
    chain.readContract({
      abi: priceWallAbi,
      address: context.contracts.PriceWall.address,
      functionName: "synthIsToken0",
      args: [assetId],
    }),
  ]);
  const id = Number(assetId);
  await context.db.insert(asset).values({
    assetId: id,
    token,
    symbol: config.symbol,
    name: config.name,
    category: CATEGORY[config.category] ?? "MACRO",
    metadataUri: config.metadataURI,
    poolId: poolIdOf(key),
    synthIsToken0,
    tick: startTick,
    priceUsd: synthPriceAtTick(startTick, synthIsToken0),
    lastUpdate: Number(event.block.timestamp),
    paused: false,
    pot: 0n,
    launches: 0,
  });
});

ponder.on("AssetRegistry:PriceRecorded", async ({ event, context }) => {
  const id = Number(event.args.assetId);
  const row = await context.db.find(asset, { assetId: id });
  if (!row) return;
  const priceUsd = synthPriceAtTick(event.args.newTick, row.synthIsToken0);
  await context.db
    .update(asset, { assetId: id })
    .set({ tick: event.args.newTick, priceUsd, lastUpdate: Number(event.block.timestamp) });
});

ponder.on("AssetRegistry:PausedSet", async ({ event, context }) => {
  await context.db.update(asset, { assetId: Number(event.args.assetId) }).set({ paused: event.args.paused });
});

ponder.on("PriceWall:PriceMoved", async ({ event, context }) => {
  const id = Number(event.args.assetId);
  const row = await context.db.find(asset, { assetId: id });
  if (!row) return;
  await context.db.insert(assetPrice).values({
    id: event.id,
    assetId: id,
    tick: event.args.newTick,
    priceUsd: synthPriceAtTick(event.args.newTick, row.synthIsToken0),
    sourcesHash: event.args.sourcesHash,
    timestamp: Number(event.block.timestamp),
    txHash: event.transaction.hash,
  });
});

ponder.on("RedemptionVault:PotCredited", async ({ event, context }) => {
  await context.db
    .update(asset, { assetId: Number(event.args.assetId) })
    .set((row) => ({ pot: row.pot + event.args.amount }));
});

ponder.on("RedemptionVault:Redeemed", async ({ event, context }) => {
  const id = Number(event.args.assetId);
  const { usdgOut, fee, synthIn } = event.args;
  await context.db.update(asset, { assetId: id }).set((row) => ({ pot: row.pot - usdgOut - fee }));
  await context.db.insert(redemption).values({
    id: event.id,
    assetId: id,
    account: event.args.from,
    synthIn,
    usdgOut,
    fee,
    timestamp: Number(event.block.timestamp),
  });
});

// ---------------------------------------------------------------- launches

ponder.on("LaunchFactory:Launched", async ({ event, context }) => {
  const { token, creator, pair, poolId, creatorTaxBps, buybackBps } = event.args;
  const tokenAddress = { abi: launchTokenAbi, address: token } as const;
  const [name, symbol, logo, description, info, pairAsset, launch] = await Promise.all([
    chain.readContract({ ...tokenAddress, functionName: "name" }),
    chain.readContract({ ...tokenAddress, functionName: "symbol" }),
    chain.readContract({ ...tokenAddress, functionName: "logo" }),
    chain.readContract({ ...tokenAddress, functionName: "description" }),
    chain.readContract({
      abi: launchHookAbi,
      address: await hookAddress(context),
      functionName: "poolInfo",
      args: [poolId],
    }),
    chain.readContract({
      abi: assetRegistryAbi,
      address: context.contracts.AssetRegistry.address,
      functionName: "assetIdOf",
      args: [pair],
    }),
    chain.readContract({
      abi: launchFactoryAbi,
      address: context.contracts.LaunchFactory.address,
      functionName: "getLaunch",
      args: [token],
    }),
  ]);
  const [isSynth, assetIdBig] = pairAsset;
  const assetId = isSynth ? Number(assetIdBig) : null;
  const tokenIsToken0 = !info.pairIsToken0;
  const now = Number(event.block.timestamp);
  const curveStart = sqrtPriceAtTick(tokenIsToken0 ? launch.curveLower : launch.curveUpper);

  // The creator's first buy swaps before Launched is emitted, so the Swap handler cannot see this pool yet.
  // Record it from the event instead.
  const pairDecimals = assetId === null ? USDG_DECIMALS : SYNTH_DECIMALS;
  const pairUsd = assetId === null ? 1 : ((await context.db.find(asset, { assetId }))?.priceUsd ?? 0);
  const { firstBuyPair, firstBuyTokens } = event.args;
  const firstPrice = firstBuyTokens === 0n ? 0 : Number(firstBuyPair) / 10 ** pairDecimals / (Number(firstBuyTokens) / 1e18);
  const firstValueUsd = (Number(firstBuyPair) / 10 ** pairDecimals) * pairUsd;

  await context.db.insert(coin).values({
    token,
    name,
    symbol,
    logo,
    description,
    creator,
    feeRecipient: info.feeRecipient,
    pair,
    assetId,
    poolId,
    tokenIsToken0,
    creatorTaxBps,
    buybackBps,
    buybackEnabled: info.buybackEnabled,
    curveEndSqrtPriceX96: info.curveEndSqrtPriceX96,
    curveStartSqrtPriceX96: curveStart,
    createdAt: now,
    graduated: false,
    graduatedAt: null,
    sqrtPriceX96: curveStart,
    priceInPair: firstPrice,
    priceUsd: firstPrice * pairUsd,
    marketCapUsd: firstPrice * pairUsd * LAUNCH_SUPPLY_TOKENS,
    curveProgress: 0,
    volumeUsd: firstValueUsd,
    trades: firstBuyTokens > 0n ? 1 : 0,
    lastTradeAt: now,
  });
  if (firstBuyTokens > 0n) {
    await context.db.insert(trade).values({
      id: event.id,
      token,
      trader: event.transaction.from,
      side: "buy",
      tokenAmount: firstBuyTokens,
      pairAmount: firstBuyPair,
      priceInPair: firstPrice,
      priceUsd: firstPrice * pairUsd,
      valueUsd: firstValueUsd,
      timestamp: now,
      txHash: event.transaction.hash,
    });
  }
  if (assetId !== null) {
    await context.db.update(asset, { assetId }).set((row) => ({ launches: row.launches + 1 }));
  }
});

ponder.on("LaunchFactory:Migrated", async ({ event, context }) => {
  await context.db
    .update(coin, { token: event.args.token })
    .set({ graduated: true, graduatedAt: Number(event.block.timestamp), curveProgress: 1 });
});

ponder.on("LaunchFactory:CreatorSettingsUpdated", async ({ event, context }) => {
  await context.db
    .update(coin, { token: event.args.token })
    .set({ feeRecipient: event.args.feeRecipient, buybackEnabled: event.args.buybackEnabled });
});

// ---------------------------------------------------------------- trading

ponder.on("LaunchHook:Traded", async ({ event, context }) => {
  const { token, amount0, amount1, sqrtPriceX96 } = event.args;
  // The creator's first buy trades before Launched is emitted; that trade is recorded by the Launched handler.
  const c = await context.db.find(coin, { token });
  if (!c) return;
  const ts = Number(event.block.timestamp);
  const pairAmountSigned = c.tokenIsToken0 ? amount1 : amount0;
  const tokenAmountSigned = c.tokenIsToken0 ? amount0 : amount1;
  // Deltas are from the trader's side: negative pair means the trader paid pair, i.e. bought.
  const side = pairAmountSigned < 0n ? "buy" : "sell";
  const pairAmount = abs(pairAmountSigned);
  const tokenAmount = abs(tokenAmountSigned);

  const pairDecimals = c.assetId === null ? USDG_DECIMALS : SYNTH_DECIMALS;
  const pairUsd = c.assetId === null ? 1 : ((await context.db.find(asset, { assetId: c.assetId }))?.priceUsd ?? 0);
  const priceInPair = priceFromSqrt(sqrtPriceX96, c.tokenIsToken0, SYNTH_DECIMALS, pairDecimals);
  const priceUsd = priceInPair * pairUsd;
  const valueUsd = (Number(pairAmount) / 10 ** pairDecimals) * pairUsd;
  // Execution price for the trade itself; the pool price after the swap drives the coin row and candles.
  const tradePrice = tokenAmount === 0n ? priceInPair : Number(pairAmount) / 10 ** pairDecimals / (Number(tokenAmount) / 1e18);

  await context.db.update(coin, { token: c.token }).set((row) => ({
    sqrtPriceX96,
    priceInPair,
    priceUsd,
    marketCapUsd: priceUsd * LAUNCH_SUPPLY_TOKENS,
    curveProgress: row.graduated ? 1 : curveProgress(row.curveStartSqrtPriceX96, row.curveEndSqrtPriceX96, sqrtPriceX96, row.tokenIsToken0),
    volumeUsd: row.volumeUsd + valueUsd,
    trades: row.trades + 1,
    lastTradeAt: ts,
  }));

  await context.db.insert(trade).values({
    id: event.id,
    token: c.token,
    trader: event.transaction.from,
    side,
    tokenAmount,
    pairAmount,
    priceInPair: tradePrice,
    priceUsd: tradePrice * pairUsd,
    valueUsd,
    timestamp: ts,
    txHash: event.transaction.hash,
  });

  for (const interval of CANDLE_INTERVALS) {
    const bucket = bucketOf(ts, interval);
    await context.db
      .insert(candle)
      .values({ token: c.token, interval, bucket, open: priceUsd, high: priceUsd, low: priceUsd, close: priceUsd, volumeUsd: valueUsd, trades: 1 })
      .onConflictDoUpdate((row) => ({
        high: Math.max(row.high, priceUsd),
        low: Math.min(row.low, priceUsd),
        close: priceUsd,
        volumeUsd: row.volumeUsd + valueUsd,
        trades: row.trades + 1,
      }));
  }
});

ponder.on("LaunchToken:Transfer", async ({ event, context }) => {
  const token = event.log.address;
  const { from, to, value } = event.args;
  if (value === 0n) return;
  // Holder counts are derived in the API (excluding protocol contracts), so only balances are tracked here.
  if (from !== zeroAddress) {
    await context.db
      .insert(holder)
      .values({ token, account: from, balance: 0n })
      .onConflictDoUpdate((r) => ({ balance: r.balance - value }));
  }
  if (to !== zeroAddress) {
    await context.db
      .insert(holder)
      .values({ token, account: to, balance: value })
      .onConflictDoUpdate((r) => ({ balance: r.balance + value }));
  }
});

// ---------------------------------------------------------------- fees & buybacks

ponder.on("FeeEscrow:Credited", async ({ event, context }) => {
  const { account, currency, amount } = event.args;
  await context.db
    .insert(feeBalance)
    .values({ account, currency, credited: amount, claimed: 0n })
    .onConflictDoUpdate((r) => ({ credited: r.credited + amount }));
});

ponder.on("FeeEscrow:Claimed", async ({ event, context }) => {
  const { account, currency, amount } = event.args;
  await context.db
    .insert(feeBalance)
    .values({ account, currency, credited: 0n, claimed: amount })
    .onConflictDoUpdate((r) => ({ claimed: r.claimed + amount }));
});

ponder.on("BuybackVault:BuybackExecuted", async ({ event, context }) => {
  await context.db.insert(buyback).values({
    id: event.id,
    token: event.args.token,
    pairSpent: event.args.pairSpent,
    tokensBought: event.args.tokensBought,
    timestamp: Number(event.block.timestamp),
  });
});

// ---------------------------------------------------------------- helpers

function abs(x: bigint): bigint {
  return x < 0n ? -x : x;
}

let cachedHook: Address | undefined;
async function hookAddress(context: Context): Promise<Address> {
  if (!cachedHook) {
    cachedHook = await chain.readContract({
      abi: [{ type: "function", name: "hook", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" }] as const,
      address: context.contracts.LaunchFactory.address,
      functionName: "hook",
    });
  }
  return cachedHook;
}

/** v4 PoolId = keccak256(abi.encode(PoolKey)). */
function poolIdOf(key: { currency0: Address; currency1: Address; fee: number; tickSpacing: number; hooks: Address }): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: "address" },
        { type: "address" },
        { type: "uint24" },
        { type: "int24" },
        { type: "address" },
      ],
      [key.currency0, key.currency1, key.fee, key.tickSpacing, key.hooks],
    ),
  );
}
