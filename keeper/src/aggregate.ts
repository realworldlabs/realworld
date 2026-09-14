import type { Observation } from "./sources/types.ts";

export type Category = "MACRO" | "COLLECTIBLE";

export interface AgreementRules {
  /** Largest allowed spread between the lowest and highest accepted reading, in bps of the median. */
  agreementBps: number;
  /** Minimum number of independent readings. */
  minSources: number;
  /** Market readings older than this are ignored (ms). */
  maxAgeMs: number;
}

export const DEFAULT_RULES: Record<Category, AgreementRules> = {
  MACRO: { agreementBps: 50, minSources: 2, maxAgeMs: 120 * 24 * 3600_000 },
  COLLECTIBLE: { agreementBps: 1000, minSources: 2, maxAgeMs: 6 * 3600_000 },
};

export type AggregateResult =
  | { ok: true; price: number; period?: string; used: Observation[] }
  | { ok: false; reason: string; used: Observation[] };

export function median(values: number[]): number {
  if (values.length === 0) throw new Error("median of empty list");
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

/** Drops values further than `k` median absolute deviations from the median. */
export function filterOutliers(values: number[], k = 3): number[] {
  if (values.length < 3) return values;
  const m = median(values);
  const mad = median(values.map((v) => Math.abs(v - m)));
  if (mad === 0) return values.filter((v) => v === m);
  return values.filter((v) => Math.abs(v - m) <= k * mad);
}

/**
 * Picks the most recent reporting period that at least `minSources` sources have published.
 * Sources that lag (e.g. a mirror still on last year's number) are ignored rather than dragging the median.
 */
function alignPeriods(obs: Observation[], minSources: number): { period?: string; used: Observation[] } {
  const byPeriod = new Map<string, Observation[]>();
  for (const o of obs) {
    if (!o.period) continue;
    const list = byPeriod.get(o.period) ?? [];
    list.push(o);
    byPeriod.set(o.period, list);
  }
  const periods = [...byPeriod.keys()].sort().reverse();
  for (const p of periods) {
    const list = byPeriod.get(p)!;
    if (new Set(list.map((o) => o.source)).size >= minSources) return { period: p, used: list };
  }
  return { used: [] };
}

export function aggregate(obs: Observation[], rules: AgreementRules, now: number): AggregateResult {
  const valid = obs.filter((o) => Number.isFinite(o.price) && o.price > 0);
  const periodic = valid.filter((o) => o.period);
  let used: Observation[];
  let period: string | undefined;

  if (periodic.length > 0) {
    ({ period, used } = alignPeriods(periodic, rules.minSources));
    if (used.length === 0) return { ok: false, reason: "no reporting period shared by enough sources", used: periodic };
  } else {
    used = valid.filter((o) => now - o.observedAt <= rules.maxAgeMs);
  }

  const sources = new Set(used.map((o) => o.source));
  if (sources.size < rules.minSources) {
    return { ok: false, reason: `need ${rules.minSources} sources, have ${sources.size}`, used };
  }

  const prices = used.map((o) => o.price);
  const mid = median(prices);
  const spreadBps = ((Math.max(...prices) - Math.min(...prices)) / mid) * 10_000;
  if (spreadBps > rules.agreementBps) {
    return { ok: false, reason: `sources disagree by ${spreadBps.toFixed(1)} bps (limit ${rules.agreementBps})`, used };
  }
  return { ok: true, price: mid, period, used };
}
