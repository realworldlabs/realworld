import { describe, expect, it } from "vitest";
import { aggregate, DEFAULT_RULES, filterOutliers, median } from "../src/aggregate.ts";
import type { Observation } from "../src/sources/types.ts";

const NOW = Date.parse("2026-09-14T12:00:00Z");
const obs = (source: string, price: number, period?: string, ageMs = 0): Observation => ({
  source,
  price,
  period,
  observedAt: NOW - ageMs,
  raw: null,
});

describe("median / outliers", () => {
  it("computes odd and even medians", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it("drops values beyond 3 MAD", () => {
    expect(filterOutliers([10, 10.2, 9.9, 10.1, 50])).toEqual([10, 10.2, 9.9, 10.1]);
  });
});

describe("aggregate", () => {
  it("agrees on the latest period shared by enough sources, ignoring a lagging source", () => {
    const r = aggregate(
      [
        obs("bls", 334.98, "2026-08"),
        obs("bls", 333.918, "2026-07"),
        obs("fred", 333.918, "2026-07"),
        obs("fred", 333.952, "2026-06"),
      ],
      DEFAULT_RULES.MACRO,
      NOW,
    );
    expect(r).toMatchObject({ ok: true, price: 333.918, period: "2026-07" });
  });

  it("rejects macro sources that disagree beyond 50 bps", () => {
    const r = aggregate([obs("a", 100, "2026-08"), obs("b", 101, "2026-08")], DEFAULT_RULES.MACRO, NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/disagree/);
  });

  it("requires two distinct sources", () => {
    const r = aggregate([obs("a", 100, "2026-08"), obs("a", 100, "2026-07")], DEFAULT_RULES.MACRO, NOW);
    expect(r.ok).toBe(false);
  });

  it("accepts collectibles within 10% and takes the median", () => {
    const r = aggregate([obs("steam", 36.8), obs("skinport", 35.12)], DEFAULT_RULES.COLLECTIBLE, NOW);
    expect(r).toMatchObject({ ok: true, price: (36.8 + 35.12) / 2 });
  });

  it("ignores stale market readings", () => {
    const r = aggregate([obs("steam", 36.8), obs("skinport", 35.12, undefined, 7 * 3600_000)], DEFAULT_RULES.COLLECTIBLE, NOW);
    expect(r.ok).toBe(false);
  });

  it("drops non-positive and non-finite prices", () => {
    const r = aggregate([obs("steam", 36.8), obs("skinport", Number.NaN), obs("x", 0)], DEFAULT_RULES.COLLECTIBLE, NOW);
    expect(r.ok).toBe(false);
  });
});
