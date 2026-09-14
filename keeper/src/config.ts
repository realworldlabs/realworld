import { z } from "zod";
import fs from "node:fs";
import { DEFAULT_RULES, type AgreementRules } from "./aggregate.ts";

const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/, "expected an address");

const sourceSpec = z.object({ type: z.string() }).catchall(z.unknown());

const assetSchema = z.object({
  assetId: z.number().int().nonnegative(),
  symbol: z.string(),
  /** Human name used when the asset is created on-chain. */
  name: z.string().optional(),
  category: z.enum(["MACRO", "COLLECTIBLE"]),
  /** Token price = source price x unitScale (e.g. 0.001 when one token is 1/1000 of a card). */
  unitScale: z.number().positive().default(1),
  sources: z.array(sourceSpec).min(1),
  rules: z
    .object({ agreementBps: z.number().positive(), minSources: z.number().int().positive(), maxAgeMs: z.number().positive() })
    .partial()
    .optional(),
});

export type AssetConfig = z.infer<typeof assetSchema> & { resolvedRules: AgreementRules };

const envSchema = z.object({
  RPC_URL: z.string().url(),
  // MetaMask exports keys without the 0x prefix; accept both.
  KEEPER_PRIVATE_KEY: z
    .string()
    .trim()
    .transform((k) => (k.startsWith("0x") ? k : `0x${k}`))
    .pipe(z.string().regex(/^0x[0-9a-fA-F]{64}$/, "expected a 64-hex-character private key")),
  REGISTRY: address,
  PRICE_WALL: address,
  FACTORY: address.optional(),
  BUYBACK_VAULT: address.optional(),
  ASSETS_FILE: z.string().default("assets.json"),
  INTERVAL_SEC: z.coerce.number().int().positive().default(300),
  DEADBAND_TICKS: z.coerce.number().int().nonnegative().default(25),
  /** Smallest buyback budget worth a transaction, in the pair token's base units. */
  BUYBACK_MIN_BUDGET: z.coerce.bigint().default(1_000_000n),
  AUDIT_DIR: z.string().default("audit"),
  PINATA_JWT: z.string().optional(),
  ALERT_WEBHOOK: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(env: Record<string, string | undefined> = process.env): Env {
  return envSchema.parse(env);
}

export function parseAssets(json: unknown): AssetConfig[] {
  const assets = z.object({ assets: z.array(assetSchema) }).parse(json).assets;
  return assets.map((a) => ({ ...a, resolvedRules: { ...DEFAULT_RULES[a.category], ...a.rules } }));
}

export function loadAssets(file: string): AssetConfig[] {
  return parseAssets(JSON.parse(fs.readFileSync(file, "utf8")));
}
