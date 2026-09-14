/** Uniswap tick math for the price wall, mirroring contracts/src/libraries/PriceMath.sol. */

export const MIN_TICK = -887272;
export const MAX_TICK = 887272;
const LOG_BASE = Math.log(1.0001);

/**
 * Pool tick for a USD price per whole synth.
 * @param synthDecimals synth token decimals (18)
 * @param usdgDecimals USDG decimals (6)
 * @param synthIsToken0 pool ordering
 */
export function tickForPrice(priceUsd: number, synthIsToken0: boolean, synthDecimals = 18, usdgDecimals = 6): number {
  if (!(priceUsd > 0)) throw new Error(`invalid price ${priceUsd}`);
  // raw token1/token0 ratio
  const usdgPerSynthRaw = priceUsd * 10 ** (usdgDecimals - synthDecimals);
  const ratio = synthIsToken0 ? usdgPerSynthRaw : 1 / usdgPerSynthRaw;
  const tick = Math.floor(Math.log(ratio) / LOG_BASE);
  if (tick <= MIN_TICK || tick >= MAX_TICK) throw new Error(`tick out of range for price ${priceUsd}`);
  return tick;
}

export function priceForTick(tick: number, synthIsToken0: boolean, synthDecimals = 18, usdgDecimals = 6): number {
  const ratio = 1.0001 ** tick;
  const usdgPerSynthRaw = synthIsToken0 ? ratio : 1 / ratio;
  return usdgPerSynthRaw * 10 ** (synthDecimals - usdgDecimals);
}

export interface PlanInput {
  currentTick: number;
  targetPrice: number;
  synthIsToken0: boolean;
  maxMoveTicks: number;
  /** Skip moves smaller than this many ticks (25 ticks ~ 0.25%). */
  deadbandTicks: number;
  lastUpdate: number; // seconds
  minUpdateInterval: number; // seconds
  now: number; // seconds
}

export type Plan =
  | { action: "move"; newTick: number; targetTick: number; stepped: boolean }
  | { action: "skip"; reason: string; targetTick?: number };

/** Decides the next on-chain move, stepping toward the target when it exceeds the per-update bound. */
export function planMove(p: PlanInput): Plan {
  const targetTick = tickForPrice(p.targetPrice, p.synthIsToken0);
  const diff = targetTick - p.currentTick;
  if (Math.abs(diff) < p.deadbandTicks) return { action: "skip", reason: "within deadband", targetTick };
  if (p.now < p.lastUpdate + p.minUpdateInterval) return { action: "skip", reason: "min update interval", targetTick };
  const step = Math.max(-p.maxMoveTicks, Math.min(p.maxMoveTicks, diff));
  return { action: "move", newTick: p.currentTick + step, targetTick, stepped: step !== diff };
}
