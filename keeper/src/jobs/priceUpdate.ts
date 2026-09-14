import { aggregate } from "../aggregate.ts";
import { hashRecord, type AuditRecord, type AuditSink } from "../audit.ts";
import type { AssetConfig } from "../config.ts";
import type { KeeperChain } from "../chain.ts";
import type { Logger } from "../alerts.ts";
import { collect } from "../sources/index.ts";
import type { SourceContext } from "../sources/types.ts";
import { planMove } from "../ticks.ts";

export interface PriceUpdateDeps {
  chain: KeeperChain;
  sources: SourceContext;
  audit: AuditSink;
  logger: Logger;
  deadbandTicks: number;
}

export type PriceUpdateOutcome =
  | { status: "moved"; tick: number; txHash: string; stepped: boolean }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

/** Warn when this share of the heartbeat has passed without an on-chain update. */
const HEARTBEAT_WARN_RATIO = 0.8;

export async function runPriceUpdate(asset: AssetConfig, deps: PriceUpdateDeps): Promise<PriceUpdateOutcome> {
  const { chain, logger } = deps;
  const tag = { assetId: asset.assetId, symbol: asset.symbol };
  const nowMs = deps.sources.now();
  const [onChain, nowSec] = await Promise.all([chain.asset(asset.assetId), chain.now()]);
  const age = nowSec - onChain.lastUpdate;
  if (age > onChain.heartbeat * HEARTBEAT_WARN_RATIO) {
    logger.log("warn", "asset approaching stale heartbeat", { ...tag, ageSec: age, heartbeatSec: onChain.heartbeat });
  }
  if (onChain.paused) return skip("asset paused");

  const { observations, errors } = await collect(asset.sources, deps.sources);
  for (const e of errors) logger.log("warn", "source failed", { ...tag, error: e });

  const agg = aggregate(observations, asset.resolvedRules, nowMs);
  if (!agg.ok) {
    logger.log("error", "price not agreed", { ...tag, reason: agg.reason });
    return { status: "failed", reason: agg.reason };
  }

  const targetPrice = agg.price * asset.unitScale;
  const plan = planMove({
    currentTick: onChain.tick,
    targetPrice,
    synthIsToken0: onChain.synthIsToken0,
    maxMoveTicks: onChain.maxMoveTicks,
    deadbandTicks: deps.deadbandTicks,
    lastUpdate: onChain.lastUpdate,
    minUpdateInterval: onChain.minUpdateInterval,
    now: nowSec,
  });
  if (plan.action === "skip") return skip(plan.reason);

  const record: AuditRecord = {
    assetId: asset.assetId,
    symbol: asset.symbol,
    price: targetPrice,
    period: agg.period,
    observations: agg.used.map(({ source, price, period, observedAt, raw }) => ({ source, price, period, observedAt, raw })),
    createdAt: nowMs,
  };
  const hash = hashRecord(record);
  const location = await deps.audit.store(record, hash);
  const txHash = await chain.movePrice(asset.assetId, plan.newTick, hash);
  logger.log("info", "price moved", {
    ...tag,
    fromTick: onChain.tick,
    toTick: plan.newTick,
    targetTick: plan.targetTick,
    stepped: plan.stepped,
    price: targetPrice,
    period: agg.period,
    audit: location,
    txHash,
  });
  return { status: "moved", tick: plan.newTick, txHash, stepped: plan.stepped };

  function skip(reason: string): PriceUpdateOutcome {
    logger.log("info", "price update skipped", { ...tag, reason });
    return { status: "skipped", reason };
  }
}
