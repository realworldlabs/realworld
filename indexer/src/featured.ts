import { and, asc, eq, gte, lt } from "drizzle-orm";
import { encodeAbiParameters, keccak256, parseAbi, zeroAddress, type Address, type Hex } from "viem";
import { config, deployments } from "./config.ts";
import type { Db } from "./db.ts";
import { client } from "./rpc.ts";
import * as s from "./schema.ts";

/**
 * The RealWorld token itself is launched on pons v2, not on this launchpad, so nothing about it arrives through
 * the event sync. This module polls its live state instead: the pons factory says which phase the launch is in,
 * the curve prices it before graduation, and the Uniswap v4 pool prices it after. Samples are kept for a day of
 * change and a sparkline. Everything here is read-only and optional: without FEATURED_TOKEN nothing runs.
 */

const factoryAbi = parseAbi([
  "struct LaunchedToken { address token; address curve; address deployer; address creatorFeeRecipient; address pairToken; uint256 graduationThreshold; uint24 poolFee; int24 tickSpacing; uint16 creatorTaxBps; bool buybackEnabled; uint8 phase; uint256 sweptQuote; uint256 sweptTokens; uint256 sweptAt; bool exists; }",
  "function getLaunchedToken(address token) view returns (LaunchedToken)",
]);

const curveAbi = parseAbi([
  "function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)",
  "function realQuoteReserve() view returns (uint256)",
  "function graduationThreshold() view returns (uint256)",
]);

const tokenAbi = parseAbi([
  "struct Socials { string twitter; string telegram; string discord; string website; string farcaster; }",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function getTokenInfo() view returns (address tokenDeployer, string tokenLogo, string tokenDescription, Socials tokenSocials)",
]);

const erc20Abi = parseAbi(["function symbol() view returns (string)", "function decimals() view returns (uint8)"]);

const poolManagerAbi = parseAbi(["function extsload(bytes32 slot) view returns (bytes32)"]);

/** `mapping(PoolId => Pool.State) _pools` sits at slot 6 of the v4 PoolManager; slot0 is the first word of the state. */
const POOLS_SLOT = 6n;
const Q96 = 2 ** 96;

export type Phase = "curve" | "swept" | "pool" | "rescued";
const PHASES: Phase[] = ["curve", "swept", "pool", "rescued"];

export interface Featured {
  token: Address;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  description: string;
  socials: { twitter: string; telegram: string; discord: string; website: string; farcaster: string };
  pair: { address: Address; symbol: string; decimals: number };
  phase: Phase;
  curve: Address;
  poolId: Hex | null;
  /** Price of one token in the pair asset. */
  priceInPair: number;
  /** USD value of one pair asset; null when unknown (then USD figures are null too). */
  pairUsd: number | null;
  priceUsd: number | null;
  supply: number;
  marketCapInPair: number;
  marketCapUsd: number | null;
  /** Graduation progress while on the curve; 1 once graduated. */
  progress: number;
  change24h: number | null;
  spark: number[];
  ponsUrl: string;
  updatedAt: number;
}

export let featured: Featured | null = null;
export let featuredError: string | null = null;

const DAY = 86_400;
const WEEK = 7 * DAY;

const log = (message: string, extra: Record<string, unknown> = {}) =>
  console.log(JSON.stringify({ t: new Date().toISOString(), message, ...extra }));

let ethUsd: { price: number; at: number } | null = null;

/** ETH/USD from Coinbase's public spot endpoint, cached for five minutes; null when unreachable. */
async function ethUsdPrice(): Promise<number | null> {
  if (ethUsd && Date.now() - ethUsd.at < 300_000) return ethUsd.price;
  try {
    const res = await fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot", { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return ethUsd?.price ?? null;
    const body = (await res.json()) as { data?: { amount?: string } };
    const price = Number(body.data?.amount);
    if (!Number.isFinite(price) || price <= 0) return ethUsd?.price ?? null;
    ethUsd = { price, at: Date.now() };
    return price;
  } catch {
    return ethUsd?.price ?? null;
  }
}

function poolIdFor(token: Address, pair: Address, fee: number, tickSpacing: number, hooks: Address): { poolId: Hex; tokenIs0: boolean } {
  const tokenIs0 = token.toLowerCase() < pair.toLowerCase();
  const [c0, c1] = tokenIs0 ? [token, pair] : [pair, token];
  const poolId = keccak256(
    encodeAbiParameters(
      [{ type: "address" }, { type: "address" }, { type: "uint24" }, { type: "int24" }, { type: "address" }],
      [c0, c1, fee, tickSpacing, hooks],
    ),
  );
  return { poolId, tokenIs0 };
}

/** Pair per token from a v4 pool's slot0, in human units. */
async function poolPrice(poolId: Hex, tokenIs0: boolean, tokenDecimals: number, pairDecimals: number): Promise<number> {
  const stateSlot = keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "uint256" }], [poolId, POOLS_SLOT]));
  const slot0 = await client.readContract({ address: deployments.poolManager, abi: poolManagerAbi, functionName: "extsload", args: [stateSlot] });
  const sqrtPriceX96 = BigInt(slot0) & ((1n << 160n) - 1n);
  if (sqrtPriceX96 === 0n) return 0;
  const raw = (Number(sqrtPriceX96) / Q96) ** 2; // currency1 per currency0, raw units
  const scale = 10 ** (tokenDecimals - pairDecimals);
  return tokenIs0 ? raw * scale : scale / raw;
}

interface Static {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  logo: string;
  description: string;
  socials: Featured["socials"];
  pair: Featured["pair"];
}

let cachedStatic: Static | null = null;

async function readStatic(token: Address, pairToken: Address): Promise<Static> {
  if (cachedStatic) return cachedStatic;
  const [name, symbol, decimals, totalSupply, info] = await Promise.all([
    client.readContract({ address: token, abi: tokenAbi, functionName: "name" }),
    client.readContract({ address: token, abi: tokenAbi, functionName: "symbol" }),
    client.readContract({ address: token, abi: tokenAbi, functionName: "decimals" }),
    client.readContract({ address: token, abi: tokenAbi, functionName: "totalSupply" }),
    client.readContract({ address: token, abi: tokenAbi, functionName: "getTokenInfo" }).catch(() => null),
  ]);
  let pair: Featured["pair"];
  if (pairToken === zeroAddress) pair = { address: zeroAddress, symbol: "ETH", decimals: 18 };
  else {
    const [ps, pd] = await Promise.all([
      client.readContract({ address: pairToken, abi: erc20Abi, functionName: "symbol" }),
      client.readContract({ address: pairToken, abi: erc20Abi, functionName: "decimals" }),
    ]);
    pair = { address: pairToken, symbol: ps, decimals: pd };
  }
  cachedStatic = {
    name,
    symbol,
    decimals,
    supply: Number(totalSupply) / 10 ** decimals,
    logo: info?.[1] ?? "",
    description: info?.[2] ?? "",
    socials: info?.[3] ?? { twitter: "", telegram: "", discord: "", website: "", farcaster: "" },
    pair,
  };
  return cachedStatic;
}

/** One reading of the token's live state, without touching the database. */
export async function readFeatured(token: Address): Promise<Omit<Featured, "change24h" | "spark">> {
  const launch = await client.readContract({ address: config.ponsFactory, abi: factoryAbi, functionName: "getLaunchedToken", args: [token] });
  if (!launch.exists) throw new Error(`${token} is not a pons v2 launch on factory ${config.ponsFactory}`);
  const st = await readStatic(token, launch.pairToken);
  const phase = PHASES[launch.phase] ?? "curve";

  let priceInPair = 0;
  let progress = 1;
  let poolId: Hex | null = null;
  if (phase === "curve") {
    const [[quoteReserve, tokenReserve], raised, threshold] = await Promise.all([
      client.readContract({ address: launch.curve, abi: curveAbi, functionName: "getReserves" }),
      client.readContract({ address: launch.curve, abi: curveAbi, functionName: "realQuoteReserve" }),
      client.readContract({ address: launch.curve, abi: curveAbi, functionName: "graduationThreshold" }),
    ]);
    if (tokenReserve > 0n) priceInPair = (Number(quoteReserve) / 10 ** st.pair.decimals) / (Number(tokenReserve) / 10 ** st.decimals);
    progress = threshold > 0n ? Math.min(1, Number(raised) / Number(threshold)) : 0;
  } else {
    const key = poolIdFor(token, launch.pairToken, launch.poolFee, launch.tickSpacing, config.ponsHook);
    poolId = key.poolId;
    if (phase === "pool") priceInPair = await poolPrice(key.poolId, key.tokenIs0, st.decimals, st.pair.decimals);
    else priceInPair = featured?.priceInPair ?? 0; // swept: between curve and pool, keep the last reading
  }

  const pairUsd = st.pair.address === zeroAddress ? await ethUsdPrice() : st.pair.address.toLowerCase() === deployments.usdg.toLowerCase() ? 1 : null;
  const priceUsd = pairUsd === null ? null : priceInPair * pairUsd;
  return {
    token,
    name: st.name,
    symbol: st.symbol,
    decimals: st.decimals,
    logo: st.logo,
    description: st.description,
    socials: st.socials,
    pair: st.pair,
    phase,
    curve: launch.curve,
    poolId,
    priceInPair,
    pairUsd,
    priceUsd,
    supply: st.supply,
    marketCapInPair: priceInPair * st.supply,
    marketCapUsd: priceUsd === null ? null : priceUsd * st.supply,
    progress,
    ponsUrl: `https://www.ponsfamily.com/launchpad/${token}`,
    updatedAt: Math.floor(Date.now() / 1000),
  };
}

/** 24h change and a downsampled sparkline from the stored samples. */
async function history(db: Db, token: string): Promise<{ change24h: number | null; spark: number[] }> {
  const now = Math.floor(Date.now() / 1000);
  const rows = await db
    .select({ timestamp: s.featuredPrice.timestamp, price: s.featuredPrice.priceInPair })
    .from(s.featuredPrice)
    .where(and(eq(s.featuredPrice.token, token), gte(s.featuredPrice.timestamp, now - DAY - 600)))
    .orderBy(asc(s.featuredPrice.timestamp));
  if (rows.length === 0) return { change24h: null, spark: [] };
  const base = rows[0]!;
  const last = rows.at(-1)!;
  // Only call it a 24h change once we have close to a day of samples; before that the baseline is just the first poll.
  const change24h = base.price > 0 && last.timestamp - base.timestamp >= DAY * 0.9 ? last.price / base.price - 1 : null;
  const step = Math.max(1, Math.ceil(rows.length / 48));
  const spark = rows.filter((_, i) => i % step === 0 || i === rows.length - 1).map((r) => r.price);
  return { change24h, spark };
}

async function tick(db: Db, token: Address) {
  const live = await readFeatured(token);
  await db
    .insert(s.featuredPrice)
    .values({ token: token.toLowerCase(), timestamp: live.updatedAt, priceInPair: live.priceInPair })
    .onConflictDoNothing();
  await db.delete(s.featuredPrice).where(lt(s.featuredPrice.timestamp, live.updatedAt - WEEK));
  featured = { ...live, ...(await history(db, token.toLowerCase())) };
  featuredError = null;
}

/** Polls forever; a failed reading is logged and retried on the next interval, the last good snapshot stays served. */
export async function runFeatured(db: Db) {
  const token = config.featuredToken;
  if (!token) return;
  log("featured token poller started", { token, factory: config.ponsFactory, intervalMs: config.featuredPollMs });
  for (;;) {
    try {
      await tick(db, token);
    } catch (err) {
      featuredError = err instanceof Error ? err.message : String(err);
      log("featured read failed", { error: featuredError });
    }
    await new Promise((r) => setTimeout(r, config.featuredPollMs));
  }
}
