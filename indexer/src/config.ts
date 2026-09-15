import fs from "node:fs";
import path from "node:path";
import { isAddress, type Address } from "viem";

export interface Deployments {
  chainId: number;
  startBlock: number;
  usdg: Address;
  poolManager: Address;
  assetRegistry: Address;
  priceWall: Address;
  wallHook: Address;
  launchFactory: Address;
  launchHook: Address;
  feeEscrow: Address;
  buybackVault: Address;
  launchLocker: Address;
  launchRouter: Address;
}

const env = process.env;

export const deploymentsFile = path.resolve(env.DEPLOYMENTS_FILE ?? "../contracts/deployments/devnet.json");
export const deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8")) as Deployments;

export const config = {
  /** Comma-separated JSON-RPC URLs; requests rotate across them. */
  rpcUrls: (env.RPC_URL ?? env.PONDER_RPC_URL ?? "http://127.0.0.1:8545").split(",").map((u) => u.trim()).filter(Boolean),
  /** Postgres URL; without it a local PGlite database is used (fine for the devnet). */
  databaseUrl: env.DATABASE_URL,
  pgliteDir: env.PGLITE_DIR ?? ".data/pglite",
  /** Largest eth_getLogs block span the RPC allows (QuickNode Discover: 5; public Robinhood RPC: 5000). */
  logRange: Number(env.LOG_RANGE ?? env.PONDER_LOG_RANGE ?? 5),
  /** Concurrent getLogs requests during backfill. */
  concurrency: Number(env.SYNC_CONCURRENCY ?? 4),
  pollMs: Number(env.POLL_MS ?? 6_000),
  /** Blocks behind the head to treat as settled (Orbit chains do not reorg in practice). */
  confirmations: Number(env.CONFIRMATIONS ?? 2),
  port: Number(env.PORT ?? 42069),
  /** Pinata JWT for coin image uploads (POST /upload). Uploads are disabled without it. */
  pinataJwt: env.PINATA_JWT,
  /** The RealWorld token, launched on pons v2: polled for the featured card (GET /featured). Off when unset. */
  featuredToken: env.FEATURED_TOKEN && isAddress(env.FEATURED_TOKEN) ? (env.FEATURED_TOKEN as Address) : undefined,
  featuredPollMs: Number(env.FEATURED_POLL_MS ?? 60_000),
  /** pons v2 contracts on Robinhood Chain (ponsfamily.com/docs/v2 → Contracts). */
  ponsFactory: (env.PONS_FACTORY ?? "0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e") as Address,
  ponsHook: (env.PONS_HOOK ?? "0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044") as Address,
};
