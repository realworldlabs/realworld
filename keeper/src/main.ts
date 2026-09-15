import { fileSink, pinataSink } from "./audit.ts";
import { createLogger } from "./alerts.ts";
import { loadAssets, loadEnv } from "./config.ts";
import { viemChain } from "./chain.ts";
import { runPriceUpdate } from "./jobs/priceUpdate.ts";
import { newLaunchpadState, runBuybacks, runGraduations } from "./jobs/launchpad.ts";

const env = loadEnv();
const logger = createLogger(env.ALERT_WEBHOOK);
const assets = loadAssets(env.ASSETS_FILE);
const chain = viemChain(env);
const audit = env.PINATA_JWT ? pinataSink(env.PINATA_JWT) : fileSink(env.AUDIT_DIR);
const sources = { fetch: globalThis.fetch, env: process.env, now: () => Date.now() };
const launchpad = newLaunchpadState();
const once = process.argv.includes("--once");

const lastRun = new Map<number, number>();

async function tick() {
  for (const asset of assets) {
    // Macro sources publish monthly or daily; polling them every tick only burns source quotas.
    const interval = asset.category === "MACRO" ? env.MACRO_INTERVAL_SEC : env.INTERVAL_SEC;
    const last = lastRun.get(asset.assetId) ?? 0;
    if (Date.now() - last < interval * 1000) continue;
    lastRun.set(asset.assetId, Date.now());
    try {
      await runPriceUpdate(asset, { chain, sources, audit, logger, deadbandTicks: env.DEADBAND_TICKS });
    } catch (e) {
      logger.log("error", "price job crashed", { assetId: asset.assetId, error: String((e as Error).message ?? e) });
    }
  }
  if (env.FACTORY) await runGraduations(chain, launchpad, logger);
  if (env.FACTORY && env.BUYBACK_VAULT) await runBuybacks(chain, launchpad, env.BUYBACK_MIN_BUDGET, logger);
}

logger.log("info", "keeper started", { assets: assets.map((a) => a.symbol), intervalSec: env.INTERVAL_SEC, macroIntervalSec: env.MACRO_INTERVAL_SEC, once });
do {
  const started = Date.now();
  await tick();
  if (once) break;
  const wait = Math.max(0, env.INTERVAL_SEC * 1000 - (Date.now() - started));
  await new Promise((r) => setTimeout(r, wait));
} while (true);
