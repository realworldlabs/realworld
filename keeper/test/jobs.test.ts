import { describe, expect, it } from "vitest";
import type { Address, Hex } from "viem";
import type { AuditSink } from "../src/audit.ts";
import type { AssetOnChain, KeeperChain } from "../src/chain.ts";
import { parseAssets } from "../src/config.ts";
import { runPriceUpdate } from "../src/jobs/priceUpdate.ts";
import { newLaunchpadState, runBuybacks, runGraduations } from "../src/jobs/launchpad.ts";
import { tickForPrice } from "../src/ticks.ts";
import { ALL_FIXTURES, ctx, fixtureFetch, memoryLogger } from "./helpers.ts";

const NOW = Date.parse("2026-09-14T12:00:00Z");

function fakeChain(asset: Partial<AssetOnChain> = {}) {
  const moves: { assetId: number; tick: number; hash: Hex }[] = [];
  const migrated: Address[] = [];
  const buybacks: Address[] = [];
  const state: AssetOnChain = {
    tick: tickForPrice(330, true),
    lastUpdate: Math.floor(NOW / 1000) - 7200,
    paused: false,
    maxMoveTicks: 500,
    minUpdateInterval: 3600,
    heartbeat: 45 * 86400,
    synthIsToken0: true,
    ...asset,
  };
  const tokens = ["0x1111111111111111111111111111111111111111", "0x2222222222222222222222222222222222222222"] as Address[];
  const chain: KeeperChain = {
    now: async () => Math.floor(NOW / 1000),
    asset: async () => state,
    movePrice: async (assetId, tick, hash) => {
      moves.push({ assetId, tick, hash });
      return "0xabc";
    },
    launchTokens: async (from) => tokens.slice(from),
    isGraduated: async (t) => migrated.includes(t),
    isReadyToMigrate: async (t) => t === tokens[1],
    migrate: async (t) => {
      migrated.push(t);
      return "0xdef";
    },
    buybackBudget: async (t) => (t === tokens[0] ? 5_000_000n : 10n),
    executeBuyback: async (t) => {
      buybacks.push(t);
      return "0x123";
    },
  };
  return { chain, moves, migrated, buybacks, tokens };
}

const memorySink = (): AuditSink & { stored: string[] } => {
  const stored: string[] = [];
  return { stored, store: async (_r, hash) => (stored.push(hash), `mem://${hash}`) };
};

const [cpi] = parseAssets({
  assets: [
    {
      assetId: 0,
      symbol: "sUSCPI",
      category: "MACRO",
      sources: [
        { type: "bls", series: "CUUR0000SA0" },
        { type: "fredCsv", series: "CPIAUCNS", period: "month" },
      ],
    },
  ],
});

describe("runPriceUpdate", () => {
  it("moves the wall to the agreed price and stores the audit record it hashes", async () => {
    const { chain, moves } = fakeChain();
    const audit = memorySink();
    const out = await runPriceUpdate(cpi!, {
      chain,
      sources: ctx(fixtureFetch(ALL_FIXTURES), NOW),
      audit,
      logger: memoryLogger(),
      deadbandTicks: 25,
    });
    expect(out.status).toBe("moved");
    expect(moves).toHaveLength(1);
    expect(moves[0]!.tick).toBe(tickForPrice(334.98, true));
    expect(audit.stored).toEqual([moves[0]!.hash]);
  });

  it("does nothing when sources are unreachable, and alerts", async () => {
    const { chain, moves } = fakeChain();
    const logger = memoryLogger();
    const out = await runPriceUpdate(cpi!, {
      chain,
      sources: ctx(fixtureFetch([]), NOW),
      audit: memorySink(),
      logger,
      deadbandTicks: 25,
    });
    expect(out.status).toBe("failed");
    expect(moves).toHaveLength(0);
    expect(logger.lines.some((l) => l.level === "error")).toBe(true);
  });

  it("skips paused assets", async () => {
    const { chain, moves } = fakeChain({ paused: true });
    const out = await runPriceUpdate(cpi!, {
      chain,
      sources: ctx(fixtureFetch(ALL_FIXTURES), NOW),
      audit: memorySink(),
      logger: memoryLogger(),
      deadbandTicks: 25,
    });
    expect(out).toEqual({ status: "skipped", reason: "asset paused" });
    expect(moves).toHaveLength(0);
  });

  it("warns when the heartbeat is close to expiring", async () => {
    const { chain } = fakeChain({ lastUpdate: Math.floor(NOW / 1000) - 40 * 86400, tick: tickForPrice(334.98, true) });
    const logger = memoryLogger();
    await runPriceUpdate(cpi!, {
      chain,
      sources: ctx(fixtureFetch(ALL_FIXTURES), NOW),
      audit: memorySink(),
      logger,
      deadbandTicks: 25,
    });
    expect(logger.lines.some((l) => l.message === "asset approaching stale heartbeat")).toBe(true);
  });
});

describe("launchpad jobs", () => {
  it("graduates ready coins once", async () => {
    const { chain, migrated, tokens } = fakeChain();
    const state = newLaunchpadState();
    const logger = memoryLogger();
    expect(await runGraduations(chain, state, logger)).toEqual([tokens[1]]);
    expect(await runGraduations(chain, state, logger)).toEqual([]);
    expect(migrated).toEqual([tokens[1]]);
  });

  it("executes buybacks above the minimum budget", async () => {
    const { chain, buybacks, tokens } = fakeChain();
    const state = newLaunchpadState();
    await runGraduations(chain, state, memoryLogger());
    expect(await runBuybacks(chain, state, 1_000_000n, memoryLogger())).toEqual([tokens[0]]);
    expect(buybacks).toEqual([tokens[0]]);
  });
});
