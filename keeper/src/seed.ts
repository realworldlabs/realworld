/**
 * Builds the initial asset list for the mainnet deployment from live, agreed source prices.
 *   node src/seed.ts [out=../contracts/deploy/initial-assets.json]
 * Asset ids in assets.json must be 0..n-1 in order: the registry assigns ids in the order assets are added.
 * Fails if any asset has no agreed price, so a deployment never opens a wall at a guessed price.
 */
import fs from "node:fs";
import path from "node:path";
import { aggregate } from "./aggregate.ts";
import { loadAssets } from "./config.ts";
import { collect } from "./sources/index.ts";

const out = path.resolve(process.argv[2] ?? "../contracts/deploy/initial-assets.json");
const assets = loadAssets(process.env.ASSETS_FILE ?? "assets.json");
const ctx = { fetch: globalThis.fetch, env: process.env, now: () => Date.now() };

const rows = [];
for (const [i, asset] of assets.entries()) {
  if (asset.assetId !== i) throw new Error(`${asset.symbol}: assetId ${asset.assetId} must be ${i} (ids follow insertion order)`);
  const { observations, errors } = await collect(asset.sources, ctx);
  const r = aggregate(observations, asset.resolvedRules, ctx.now());
  if (!r.ok) throw new Error(`${asset.symbol}: ${r.reason}${errors.length ? ` (${errors.join("; ")})` : ""}`);
  const price = r.price * asset.unitScale;
  rows.push({
    name: asset.name ?? asset.symbol,
    symbol: asset.symbol,
    category: asset.category === "MACRO" ? 0 : 1,
    // Decimal strings: forge parses them exactly, JSON numbers would lose precision.
    unitScale: BigInt(Math.round(asset.unitScale * 1e6)) * 10n ** 12n + "",
    priceX18: BigInt(Math.round(price * 1e6)) * 10n ** 12n + "",
    metadataURI: `sources:${asset.sources.map((s) => `${s.type}:${s.series ?? s.rate ?? s.dataset ?? s.marketHashName ?? s.iso ?? s.slug ?? (s.model ? `${s.year} ${s.make} ${s.model}` : undefined) ?? s.id ?? ""}`).join(",")}`,
  });
  console.log(`${asset.symbol.padEnd(11)} $${price}${r.period ? ` (${r.period})` : ""}`);
}

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), assets: rows }, null, 2) + "\n");
console.log(`wrote ${rows.length} assets to ${out}`);
