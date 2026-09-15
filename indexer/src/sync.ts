import { and, eq, sql } from "drizzle-orm";
import { decodeEventLog, type Abi, type Address } from "viem";
import {
  assetRegistryAbi,
  buybackVaultAbi,
  feeEscrowAbi,
  launchFactoryAbi,
  launchHookAbi,
  launchTokenAbi,
  priceWallAbi,
  wallHookAbi,
} from "@rwa/abi";
import { config, deployments } from "./config.ts";
import type { Db } from "./db.ts";
import { handlers, type Ev } from "./handlers.ts";
import { client, getLogsChunked, type RawLog } from "./rpc.ts";
import * as s from "./schema.ts";

const CURSOR = "robinhood";

/** Which ABI decodes logs from which address. Launch tokens are added as they are discovered. */
const abis = new Map<string, Abi>([
  [deployments.assetRegistry.toLowerCase(), assetRegistryAbi],
  [deployments.priceWall.toLowerCase(), priceWallAbi],
  [deployments.wallHook.toLowerCase(), wallHookAbi],
  [deployments.launchFactory.toLowerCase(), launchFactoryAbi],
  [deployments.launchHook.toLowerCase(), launchHookAbi],
  [deployments.feeEscrow.toLowerCase(), feeEscrowAbi],
  [deployments.buybackVault.toLowerCase(), buybackVaultAbi],
]);
export interface SyncStatus {
  lastBlock: number;
  headBlock: number;
  ready: boolean;
  lastError?: string;
}

export const status: SyncStatus = { lastBlock: 0, headBlock: 0, ready: false };

export async function loadKnownTokens(db: Db) {
  const rows = await db.select({ token: s.coin.token }).from(s.coin);
  for (const r of rows) abis.set(r.token.toLowerCase(), launchTokenAbi);
}

function decode(log: RawLog): Ev | null {
  const abi = abis.get(log.address.toLowerCase());
  if (!abi || log.blockNumber === null || log.logIndex === null || log.transactionHash === null) return null;
  try {
    const decoded = decodeEventLog({ abi, data: log.data, topics: log.topics }) as { eventName?: string; args?: unknown };
    const name = decoded.eventName;
    if (!name || !handlers[name]) return null;
    return { name, address: log.address, args: decoded.args as Record<string, unknown>, blockNumber: log.blockNumber, logIndex: log.logIndex, txHash: log.transactionHash };
  } catch {
    return null; // an event this ABI does not describe (e.g. Approval on a launch token)
  }
}

/** Indexes [from, to] inclusive inside one transaction, so the cursor and the data always agree. */
async function indexSpan(db: Db, from: bigint, to: bigint) {
  const known = new Set(abis.keys());
  let logs = await getLogsChunked([...known] as Address[], from, to);
  let events = logs.map(decode).filter((e): e is Ev => e !== null);

  // Tokens launched inside this span emit Transfer logs before we know their address: fetch those too.
  const newTokens = events.filter((e) => e.name === "Launched").map((e) => (e.args.token as string).toLowerCase() as Address);
  if (newTokens.length > 0) {
    for (const t of newTokens) abis.set(t, launchTokenAbi);
    const extra = await getLogsChunked(newTokens, from, to);
    events = events.concat(extra.map(decode).filter((e): e is Ev => e !== null));
  }
  events.sort((a, b) => (a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber < b.blockNumber ? -1 : 1));

  await db.transaction(async (tx) => {
    for (const e of events) await handlers[e.name]!(tx as unknown as Db, e);
    // Compare-and-set on the cursor: two instances overlap during a redeploy, and only the one that owns the
    // preceding block may commit, so no span is applied twice (balances and pots are incremental).
    const moved = await tx
      .update(s.syncState)
      .set({ lastBlock: Number(to) })
      .where(and(eq(s.syncState.key, CURSOR), eq(s.syncState.lastBlock, Number(from) - 1)))
      .returning({ lastBlock: s.syncState.lastBlock });
    if (moved.length === 0) throw new StaleCursor();
  });
  status.lastBlock = Number(to);
  return events.length;
}

class StaleCursor extends Error {
  constructor() {
    super("cursor moved by another instance");
  }
}

async function readCursor(db: Db): Promise<bigint> {
  await db
    .insert(s.syncState)
    .values({ key: CURSOR, lastBlock: deployments.startBlock - 1 })
    .onConflictDoNothing();
  const row = await db.query.syncState.findFirst({ where: eq(s.syncState.key, CURSOR) });
  return BigInt(row!.lastBlock + 1);
}

/** A redeployed registry means a new set of assets and coins: the old rows are dropped and the sync restarts. */
export async function resetIfRedeployed(db: Db, log: (m: string, extra?: Record<string, unknown>) => void) {
  const tag = `registry:${deployments.assetRegistry.toLowerCase()}`;
  const rows = await db.select().from(s.syncState);
  const previous = rows.find((r) => r.key.startsWith("registry:"));
  if (previous?.key === tag) return;
  if (previous) {
    log("registry changed; clearing indexed data", { from: previous.key, to: tag });
    for (const t of ["asset", "asset_price", "coin", "trade", "candle", "holder", "fee_balance", "buyback", "redemption", "sync_state"]) {
      await db.execute(sql.raw(`delete from ${t}`));
    }
  }
  await db.insert(s.syncState).values({ key: tag, lastBlock: 0 }).onConflictDoNothing();
}

export async function runSync(db: Db, log: (m: string, extra?: Record<string, unknown>) => void) {
  await resetIfRedeployed(db, log);
  await loadKnownTokens(db);
  let next = await readCursor(db);
  status.lastBlock = Number(next - 1n);
  log("sync starting", { from: Number(next), rpcs: config.rpcUrls.length, logRange: config.logRange });

  // Large backfills go in bigger spans so each DB transaction covers many chunks.
  const spanBlocks = BigInt(config.logRange * config.concurrency * 10);
  for (;;) {
    try {
      const head = (await client.getBlockNumber()) - BigInt(config.confirmations);
      status.headBlock = Number(head);
      if (next <= head) {
        const to = next + spanBlocks - 1n < head ? next + spanBlocks - 1n : head;
        const n = await indexSpan(db, next, to);
        if (n > 0 || Number(to) % 5_000 === 0) log("indexed", { from: Number(next), to: Number(to), events: n, behind: Number(head - to) });
        next = to + 1n;
        status.lastError = undefined;
        if (to < head) continue; // keep going without sleeping while catching up
      }
      status.ready = true;
    } catch (err) {
      if (err instanceof StaleCursor) {
        // Another instance is ahead: pick up from where it left off and let the newer tokens it found load.
        await loadKnownTokens(db);
        next = await readCursor(db);
        log("cursor taken over", { from: Number(next) });
        await sleep(config.pollMs);
        continue;
      }
      status.lastError = err instanceof Error ? err.message : String(err);
      log("sync error", { error: status.lastError.slice(0, 300), at: Number(next) });
      await sleep(Math.max(config.pollMs, 5_000));
      continue;
    }
    await sleep(config.pollMs);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
