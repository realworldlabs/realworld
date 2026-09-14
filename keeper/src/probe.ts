/** Fetches every configured source live and prints the agreed price per asset. Touches no chain. */
import { aggregate } from "./aggregate.ts";
import { loadAssets } from "./config.ts";
import { collect } from "./sources/index.ts";

const assets = loadAssets(process.env.ASSETS_FILE ?? "assets.json");
const ctx = { fetch: globalThis.fetch, env: process.env, now: () => Date.now() };

for (const asset of assets) {
  const { observations, errors } = await collect(asset.sources, ctx);
  const r = aggregate(observations, asset.resolvedRules, ctx.now());
  const latest = [...new Map(observations.map((o) => [o.source, o])).values()]
    .map((o) => `${o.source}=${o.price}${o.period ? `@${o.period}` : ""}`)
    .join("  ");
  console.log(
    `${asset.symbol.padEnd(11)} ${r.ok ? `OK   $${(r.price * asset.unitScale).toPrecision(6)}${r.period ? ` (${r.period})` : ""}` : `FAIL ${r.reason}`}`,
  );
  console.log(`            ${latest}`);
  for (const e of errors) console.log(`            ! ${e}`);
}
