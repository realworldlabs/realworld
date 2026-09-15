import fs from "node:fs";
import path from "node:path";
import type { Address } from "viem";

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
};
