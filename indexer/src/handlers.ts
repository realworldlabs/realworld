import { eq, sql } from "drizzle-orm";
import { encodeAbiParameters, keccak256, zeroAddress, type Address, type Hex } from "viem";
import { assetRegistryAbi, launchFactoryAbi, launchHookAbi, launchTokenAbi, priceWallAbi } from "@rwa/abi";
import { deployments } from "./config.ts";
import type { Db } from "./db.ts";
import { blockTimestamp, client, txSender } from "./rpc.ts";
import * as s from "./schema.ts";
import {
  bucketOf,
  CANDLE_INTERVALS,
  curveProgress,
  LAUNCH_SUPPLY_TOKENS,
  priceFromSqrt,
  sqrtPriceAtTick,
  synthPriceAtTick,
  SYNTH_DECIMALS,
  USDG_DECIMALS,
} from "./lib/math.ts";

const CATEGORY = ["MACRO", "COLLECTIBLE"] as const;

/** A decoded log with its position, ready for a handler. */
export interface Ev<TArgs = Record<string, unknown>> {
  name: string;
  address: Address;
  args: TArgs;
  blockNumber: bigint;
  logIndex: number;
  txHash: Hex;
}

const lc = (a: string) => a.toLowerCase() as Address;
const eventId = (e: Ev) => `${e.blockNumber}-${e.logIndex}`;

/** Immutable reads happen at the latest block: the public Robinhood RPC prunes historical state within minutes. */
const registry = { abi: assetRegistryAbi, address: deployments.assetRegistry } as const;
const priceWall = { abi: priceWallAbi, address: deployments.priceWall } as const;
const factory = { abi: launchFactoryAbi, address: deployments.launchFactory } as const;
const hook = { abi: launchHookAbi, address: deployments.launchHook } as const;

type Handler = (db: Db, e: Ev<any>) => Promise<void>;

export const handlers: Record<string, Handler> = {
  async AssetAdded(db, e: Ev<{ assetId: bigint; token: Address; symbol: string; startTick: number }>) {
    const { assetId, token, startTick } = e.args;
    const [config, key, synthIsToken0] = await Promise.all([
      client.readContract({ ...registry, functionName: "getConfig", args: [assetId] }),
      client.readContract({ ...priceWall, functionName: "poolKeyOf", args: [assetId] }),
      client.readContract({ ...priceWall, functionName: "synthIsToken0", args: [assetId] }),
    ]);
    await db
      .insert(s.asset)
      .values({
        assetId: Number(assetId),
        token: lc(token),
        symbol: config.symbol,
        name: config.name,
        category: CATEGORY[config.category] ?? "MACRO",
        metadataUri: config.metadataURI,
        poolId: poolIdOf(key),
        synthIsToken0,
        tick: startTick,
        priceUsd: synthPriceAtTick(startTick, synthIsToken0),
        lastUpdate: await blockTimestamp(e.blockNumber),
        paused: false,
        pot: 0n,
        wallSynth: config.wallSupply,
        launches: 0,
      })
      .onConflictDoNothing();
    await refreshWall(db, Number(assetId));
    // The opening price starts the history so change and sparkline have a baseline before the first keeper move.
    await db
      .insert(s.assetPrice)
      .values({
        id: `${eventId(e)}-open`,
        assetId: Number(assetId),
        tick: startTick,
        priceUsd: synthPriceAtTick(startTick, synthIsToken0),
        sourcesHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        timestamp: await blockTimestamp(e.blockNumber),
        txHash: e.txHash,
      })
      .onConflictDoNothing();
  },

  async PriceRecorded(db, e: Ev<{ assetId: bigint; oldTick: number; newTick: number }>) {
    const id = Number(e.args.assetId);
    const row = await db.query.asset.findFirst({ where: eq(s.asset.assetId, id) });
    if (!row) return;
    await db
      .update(s.asset)
      .set({ tick: e.args.newTick, priceUsd: synthPriceAtTick(e.args.newTick, row.synthIsToken0), lastUpdate: await blockTimestamp(e.blockNumber) })
      .where(eq(s.asset.assetId, id));
  },

  async PausedSet(db, e: Ev<{ assetId: bigint; paused: boolean }>) {
    await db.update(s.asset).set({ paused: e.args.paused }).where(eq(s.asset.assetId, Number(e.args.assetId)));
  },

  async PriceMoved(db, e: Ev<{ assetId: bigint; newTick: number; sourcesHash: Hex }>) {
    const id = Number(e.args.assetId);
    const row = await db.query.asset.findFirst({ where: eq(s.asset.assetId, id) });
    if (!row) return;
    await db
      .insert(s.assetPrice)
      .values({
        id: eventId(e),
        assetId: id,
        tick: e.args.newTick,
        priceUsd: synthPriceAtTick(e.args.newTick, row.synthIsToken0),
        sourcesHash: e.args.sourcesHash,
        timestamp: await blockTimestamp(e.blockNumber),
        txHash: e.txHash,
      })
      .onConflictDoNothing();
  },

  /** Anyone trading against a wall changes what it holds; the balances are re-read rather than tracked by delta. */
  async WallSwap(db, e: Ev<{ assetId: bigint; sender: Address; amount0: bigint; amount1: bigint; sqrtPriceX96: bigint }>) {
    await refreshWall(db, Number(e.args.assetId));
  },

  async WallReset(db, e: Ev<{ assetId: bigint; tick: number; synthLiquidity: bigint; usdgLiquidity: bigint }>) {
    await refreshWall(db, Number(e.args.assetId));
  },

  async Launched(
    db,
    e: Ev<{
      token: Address;
      creator: Address;
      pair: Address;
      poolId: Hex;
      configId: number;
      creatorTaxBps: number;
      buybackBps: number;
      firstBuyPair: bigint;
      firstBuyTokens: bigint;
    }>,
  ) {
    const { token, creator, pair, poolId, creatorTaxBps, buybackBps, firstBuyPair, firstBuyTokens } = e.args;
    const t = { abi: launchTokenAbi, address: token } as const;
    const [name, symbol, logo, description, info, pairAsset, launch] = await Promise.all([
      client.readContract({ ...t, functionName: "name" }),
      client.readContract({ ...t, functionName: "symbol" }),
      client.readContract({ ...t, functionName: "logo" }),
      client.readContract({ ...t, functionName: "description" }),
      client.readContract({ ...hook, functionName: "poolInfo", args: [poolId] }),
      client.readContract({ ...registry, functionName: "assetIdOf", args: [pair] }),
      client.readContract({ ...factory, functionName: "getLaunch", args: [token] }),
    ]);
    const [isSynth, assetIdBig] = pairAsset;
    const assetId = isSynth ? Number(assetIdBig) : null;
    const tokenIsToken0 = !info.pairIsToken0;
    const now = await blockTimestamp(e.blockNumber);
    const curveStart = sqrtPriceAtTick(tokenIsToken0 ? launch.curveLower : launch.curveUpper);

    // The creator's first buy trades before Launched is emitted, so it is recorded from the event.
    const pairDecimals = assetId === null ? USDG_DECIMALS : SYNTH_DECIMALS;
    const pairUsd = assetId === null ? 1 : ((await db.query.asset.findFirst({ where: eq(s.asset.assetId, assetId) }))?.priceUsd ?? 0);
    // Without a first buy the pool sits at the curve start, so the coin is priced there.
    const firstPrice =
      firstBuyTokens === 0n
        ? priceFromSqrt(curveStart, tokenIsToken0, SYNTH_DECIMALS, pairDecimals)
        : Number(firstBuyPair) / 10 ** pairDecimals / (Number(firstBuyTokens) / 1e18);
    const firstValueUsd = (Number(firstBuyPair) / 10 ** pairDecimals) * pairUsd;

    await db
      .insert(s.coin)
      .values({
        token: lc(token),
        name,
        symbol,
        logo,
        description,
        creator: lc(creator),
        feeRecipient: lc(info.feeRecipient),
        pair: lc(pair),
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
      })
      .onConflictDoNothing();
    if (firstBuyTokens > 0n) {
      await db
        .insert(s.trade)
        .values({
          id: eventId(e),
          token: lc(token),
          trader: lc(await txSender(e.txHash)),
          side: "buy",
          tokenAmount: firstBuyTokens,
          pairAmount: firstBuyPair,
          priceInPair: firstPrice,
          priceUsd: firstPrice * pairUsd,
          valueUsd: firstValueUsd,
          timestamp: now,
          txHash: e.txHash,
        })
        .onConflictDoNothing();
    }
    if (assetId !== null) {
      await db.update(s.asset).set({ launches: sql`${s.asset.launches} + 1` }).where(eq(s.asset.assetId, assetId));
    }
  },

  async Migrated(db, e: Ev<{ token: Address }>) {
    await db
      .update(s.coin)
      .set({ graduated: true, graduatedAt: await blockTimestamp(e.blockNumber), curveProgress: 1 })
      .where(eq(s.coin.token, lc(e.args.token)));
  },

  async CreatorSettingsUpdated(db, e: Ev<{ token: Address; feeRecipient: Address; buybackEnabled: boolean }>) {
    await db
      .update(s.coin)
      .set({ feeRecipient: lc(e.args.feeRecipient), buybackEnabled: e.args.buybackEnabled })
      .where(eq(s.coin.token, lc(e.args.token)));
  },

  async Traded(db, e: Ev<{ id: Hex; token: Address; amount0: bigint; amount1: bigint; sqrtPriceX96: bigint }>) {
    const { amount0, amount1, sqrtPriceX96 } = e.args;
    const token = lc(e.args.token);
    // The first buy trades before Launched is emitted and is recorded by that handler instead.
    const c = await db.query.coin.findFirst({ where: eq(s.coin.token, token) });
    if (!c) return;
    const ts = await blockTimestamp(e.blockNumber);
    const pairAmountSigned = c.tokenIsToken0 ? amount1 : amount0;
    const tokenAmountSigned = c.tokenIsToken0 ? amount0 : amount1;
    // Deltas are from the trader's side: negative pair means the trader paid pair, i.e. bought.
    const side = pairAmountSigned < 0n ? "buy" : "sell";
    const pairAmount = abs(pairAmountSigned);
    const tokenAmount = abs(tokenAmountSigned);

    const pairDecimals = c.assetId === null ? USDG_DECIMALS : SYNTH_DECIMALS;
    const pairUsd = c.assetId === null ? 1 : ((await db.query.asset.findFirst({ where: eq(s.asset.assetId, c.assetId) }))?.priceUsd ?? 0);
    const priceInPair = priceFromSqrt(sqrtPriceX96, c.tokenIsToken0, SYNTH_DECIMALS, pairDecimals);
    const priceUsd = priceInPair * pairUsd;
    const valueUsd = (Number(pairAmount) / 10 ** pairDecimals) * pairUsd;
    // Execution price for the trade itself; the pool price after the swap drives the coin row and candles.
    const tradePrice = tokenAmount === 0n ? priceInPair : Number(pairAmount) / 10 ** pairDecimals / (Number(tokenAmount) / 1e18);

    await db
      .update(s.coin)
      .set({
        sqrtPriceX96,
        priceInPair,
        priceUsd,
        marketCapUsd: priceUsd * LAUNCH_SUPPLY_TOKENS,
        curveProgress: c.graduated ? 1 : curveProgress(c.curveStartSqrtPriceX96, c.curveEndSqrtPriceX96, sqrtPriceX96, c.tokenIsToken0),
        volumeUsd: c.volumeUsd + valueUsd,
        trades: c.trades + 1,
        lastTradeAt: ts,
      })
      .where(eq(s.coin.token, token));

    await db
      .insert(s.trade)
      .values({
        id: eventId(e),
        token,
        trader: lc(await txSender(e.txHash)),
        side,
        tokenAmount,
        pairAmount,
        priceInPair: tradePrice,
        priceUsd: tradePrice * pairUsd,
        valueUsd,
        timestamp: ts,
        txHash: e.txHash,
      })
      .onConflictDoNothing();

    for (const interval of CANDLE_INTERVALS) {
      await db
        .insert(s.candle)
        .values({ token, interval, bucket: bucketOf(ts, interval), open: priceUsd, high: priceUsd, low: priceUsd, close: priceUsd, volumeUsd: valueUsd, trades: 1 })
        .onConflictDoUpdate({
          target: [s.candle.token, s.candle.interval, s.candle.bucket],
          set: {
            high: sql`greatest(${s.candle.high}, ${priceUsd})`,
            low: sql`least(${s.candle.low}, ${priceUsd})`,
            close: priceUsd,
            volumeUsd: sql`${s.candle.volumeUsd} + ${valueUsd}`,
            trades: sql`${s.candle.trades} + 1`,
          },
        });
    }
  },

  async Transfer(db, e: Ev<{ from: Address; to: Address; value: bigint }>) {
    const token = lc(e.address);
    const { from, to, value } = e.args;
    if (value === 0n) return;
    // Holder counts are derived in the API (excluding protocol contracts), so only balances are tracked.
    if (from !== zeroAddress) await bumpBalance(db, token, lc(from), -value);
    if (to !== zeroAddress) await bumpBalance(db, token, lc(to), value);
  },

  async Credited(db, e: Ev<{ account: Address; currency: Address; amount: bigint }>) {
    const { account, currency, amount } = e.args;
    await db
      .insert(s.feeBalance)
      .values({ account: lc(account), currency: lc(currency), credited: amount, claimed: 0n })
      .onConflictDoUpdate({
        target: [s.feeBalance.account, s.feeBalance.currency],
        set: { credited: sql`${s.feeBalance.credited} + ${amount.toString()}::numeric` },
      });
  },

  async Claimed(db, e: Ev<{ account: Address; currency: Address; to: Address; amount: bigint }>) {
    const { account, currency, amount } = e.args;
    await db
      .insert(s.feeBalance)
      .values({ account: lc(account), currency: lc(currency), credited: 0n, claimed: amount })
      .onConflictDoUpdate({
        target: [s.feeBalance.account, s.feeBalance.currency],
        set: { claimed: sql`${s.feeBalance.claimed} + ${amount.toString()}::numeric` },
      });
  },

  async BuybackExecuted(db, e: Ev<{ token: Address; pairSpent: bigint; tokensBought: bigint }>) {
    await db
      .insert(s.buyback)
      .values({ id: eventId(e), token: lc(e.args.token), pairSpent: e.args.pairSpent, tokensBought: e.args.tokensBought, timestamp: await blockTimestamp(e.blockNumber) })
      .onConflictDoNothing();
  },
};

/** Reads the wall at the latest block: a swap and its balance read can be a few blocks apart, which is fine for display. */
async function refreshWall(db: Db, assetId: number) {
  const [synthAmount, usdgAmount] = await client.readContract({ ...priceWall, functionName: "wallBalances", args: [BigInt(assetId)] });
  await db.update(s.asset).set({ pot: usdgAmount, wallSynth: synthAmount }).where(eq(s.asset.assetId, assetId));
}

async function bumpBalance(db: Db, token: Address, account: Address, delta: bigint) {
  await db
    .insert(s.holder)
    .values({ token, account, balance: delta })
    .onConflictDoUpdate({
      target: [s.holder.token, s.holder.account],
      set: { balance: sql`${s.holder.balance} + ${delta.toString()}::numeric` },
    });
}

function abs(x: bigint): bigint {
  return x < 0n ? -x : x;
}

/** v4 PoolId = keccak256(abi.encode(PoolKey)). */
function poolIdOf(key: { currency0: Address; currency1: Address; fee: number; tickSpacing: number; hooks: Address }): Hex {
  return keccak256(
    encodeAbiParameters(
      [{ type: "address" }, { type: "address" }, { type: "uint24" }, { type: "int24" }, { type: "address" }],
      [key.currency0, key.currency1, key.fee, key.tickSpacing, key.hooks],
    ),
  );
}
