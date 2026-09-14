/** Pure pricing helpers shared by handlers and tests. */

export const LAUNCH_SUPPLY_TOKENS = 1_000_000_000;
export const SYNTH_DECIMALS = 18;
export const USDG_DECIMALS = 6;
const Q96 = 2 ** 96;

/** Raw token1/token0 ratio from a v4 sqrt price. */
export function ratioFromSqrtPrice(sqrtPriceX96: bigint): number {
  const s = Number(sqrtPriceX96) / Q96;
  return s * s;
}

/**
 * Human price of `base` in `quote` units.
 * @param baseIsToken0 whether the priced asset is currency0
 */
export function priceFromSqrt(sqrtPriceX96: bigint, baseIsToken0: boolean, baseDecimals: number, quoteDecimals: number): number {
  const r = ratioFromSqrtPrice(sqrtPriceX96);
  if (r === 0) return 0;
  const quotePerBaseRaw = baseIsToken0 ? r : 1 / r;
  return quotePerBaseRaw * 10 ** (baseDecimals - quoteDecimals);
}

/** v4 sqrtPriceX96 at a tick (float precision is enough for display and progress). */
export function sqrtPriceAtTick(tick: number): bigint {
  return BigInt(Math.round(Math.sqrt(1.0001 ** tick) * Q96));
}

/** USD per synth at a wall tick. */
export function synthPriceAtTick(tick: number, synthIsToken0: boolean): number {
  const ratio = 1.0001 ** tick;
  const usdgPerSynthRaw = synthIsToken0 ? ratio : 1 / ratio;
  return usdgPerSynthRaw * 10 ** (SYNTH_DECIMALS - USDG_DECIMALS);
}

/**
 * Share of the curve's pair target raised so far, 0..1.
 * Raised pair is linear in sqrtP when the pair is currency1 (token is currency0) and linear in 1/sqrtP otherwise.
 */
export function curveProgress(start: bigint, end: bigint, current: bigint, tokenIsToken0: boolean): number {
  if (start === end) return 1;
  const s = Number(start);
  const e = Number(end);
  const c = Number(current);
  const p = tokenIsToken0 ? (c - s) / (e - s) : (1 / c - 1 / s) / (1 / e - 1 / s);
  return Math.max(0, Math.min(1, p));
}

/** Bucket start for a timestamp. */
export function bucketOf(timestamp: number, interval: number): number {
  return Math.floor(timestamp / interval) * interval;
}

export const CANDLE_INTERVALS = [60, 300, 3600, 86400] as const;
