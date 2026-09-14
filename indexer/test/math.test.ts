import { describe, expect, it } from "vitest";
import { bucketOf, curveProgress, priceFromSqrt, sqrtPriceAtTick, synthPriceAtTick } from "../src/lib/math";

describe("pricing math", () => {
  it("prices a $10 synth at the tick the contracts use", () => {
    // contracts/test/libraries/PriceMath.t.sol: $10 with synth as token0 is tick -253298
    expect(synthPriceAtTick(-253298, true)).toBeCloseTo(10, 2);
    expect(synthPriceAtTick(253298, false)).toBeCloseTo(10, 2);
  });

  it("converts sqrt prices back to human prices in both orderings", () => {
    const sqrt = sqrtPriceAtTick(-253298);
    expect(priceFromSqrt(sqrt, true, 18, 6)).toBeCloseTo(10, 2);
    const inv = sqrtPriceAtTick(253298);
    expect(priceFromSqrt(inv, false, 18, 6)).toBeCloseTo(10, 2);
  });

  it("measures curve progress by pair raised for both orderings", () => {
    const start = sqrtPriceAtTick(0);
    const end0 = sqrtPriceAtTick(25_000);
    const mid0 = (start + end0) / 2n;
    expect(curveProgress(start, end0, mid0, true)).toBeCloseTo(0.5, 3);
    expect(curveProgress(start, end0, end0 * 2n, true)).toBe(1);

    const end1 = sqrtPriceAtTick(-25_000);
    // halfway in 1/sqrt space
    const midInv = 2 / (1 / Number(start) + 1 / Number(end1));
    expect(curveProgress(start, end1, BigInt(Math.round(midInv)), false)).toBeCloseTo(0.5, 3);
    expect(curveProgress(start, end1, start, false)).toBe(0);
  });

  it("buckets timestamps", () => {
    expect(bucketOf(1789386719, 60)).toBe(1789386660);
    expect(bucketOf(1789386719, 86400)).toBe(1789344000);
  });
});
