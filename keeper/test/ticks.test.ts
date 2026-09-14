import { describe, expect, it } from "vitest";
import { planMove, priceForTick, tickForPrice } from "../src/ticks.ts";

describe("tickForPrice", () => {
  it("matches the Solidity PriceMath result for $10 with synth as token0", () => {
    // contracts/test/libraries/PriceMath.t.sol: test_knownPrice_token0 expects -253298
    expect(tickForPrice(10, true)).toBe(-253298);
  });

  it("round-trips within one tick in both orderings", () => {
    for (const price of [0.0001, 3.63, 334.98, 5.69, 420_000]) {
      for (const token0 of [true, false]) {
        const back = priceForTick(tickForPrice(price, token0), token0);
        expect(Math.abs(back / price - 1)).toBeLessThan(1.0001e-4);
      }
    }
  });

  it("rejects non-positive prices", () => {
    expect(() => tickForPrice(0, true)).toThrow();
  });
});

describe("planMove", () => {
  const base = {
    currentTick: tickForPrice(100, true),
    synthIsToken0: true,
    maxMoveTicks: 500,
    deadbandTicks: 25,
    lastUpdate: 1_000,
    minUpdateInterval: 3_600,
    now: 10_000,
  };

  it("moves straight to a nearby target", () => {
    const plan = planMove({ ...base, targetPrice: 102 });
    expect(plan).toMatchObject({ action: "move", stepped: false });
    if (plan.action === "move") expect(plan.newTick).toBe(tickForPrice(102, true));
  });

  it("steps by at most maxMoveTicks toward a far target", () => {
    const plan = planMove({ ...base, targetPrice: 150 });
    expect(plan).toMatchObject({ action: "move", stepped: true, newTick: base.currentTick + 500 });
    const down = planMove({ ...base, targetPrice: 50 });
    expect(down).toMatchObject({ action: "move", stepped: true, newTick: base.currentTick - 500 });
  });

  it("skips inside the deadband", () => {
    expect(planMove({ ...base, targetPrice: 100.1 })).toMatchObject({ action: "skip", reason: "within deadband" });
  });

  it("skips before the minimum interval", () => {
    expect(planMove({ ...base, targetPrice: 110, now: 2_000 })).toMatchObject({ action: "skip", reason: "min update interval" });
  });

  it("moves the tick the opposite way when the synth is token1", () => {
    const cur = tickForPrice(100, false);
    const plan = planMove({ ...base, currentTick: cur, synthIsToken0: false, targetPrice: 102 });
    if (plan.action !== "move") throw new Error("expected move");
    expect(plan.newTick).toBeLessThan(cur);
  });
});
