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

async function tick() {
  for (const asset of assets) {
    try {
      await runPriceUpdate(asset, { chain, sources, audit, logger, deadbandTicks: env.DEADBAND_TICKS });
    } catch (e) {
      logger.log("error", "price job crashed", { assetId: asset.assetId, error: String((e as Error).message ?? e) });
    }
  }
  if (env.FACTORY) await runGraduations(chain, launchpad, logger);
  if (env.FACTORY && env.BUYBACK_VAULT) await runBuybacks(chain, launchpad, env.BUYBACK_MIN_BUDGET, logger);
}

logger.log("info", "keeper started", { assets: assets.map((a) => a.symbol), intervalSec: env.INTERVAL_SEC, once });
do {
  const started = Date.now();
  await tick();
  if (once) break;
  const wait = Math.max(0, env.INTERVAL_SEC * 1000 - (Date.now() - started));
  await new Promise((r) => setTimeout(r, wait));
} while (true);
