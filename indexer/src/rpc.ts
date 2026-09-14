import { createPublicClient, fallback, http, type Address, type Log, type PublicClient } from "viem";
import { config } from "./config.ts";

/** One client over all configured URLs: viem's fallback transport rotates on errors and rate limits. */
export const client: PublicClient = createPublicClient({
  transport: fallback(
    config.rpcUrls.map((u) => http(u, { timeout: 20_000, retryCount: 3, retryDelay: 750, batch: false })),
    { rank: false, retryCount: 2 },
  ),
});

export type RawLog = Log<bigint, number, false>;

/** Fetches logs for `addresses` over an inclusive block span no wider than the RPC allows, in parallel chunks. */
export async function getLogsChunked(addresses: Address[], fromBlock: bigint, toBlock: bigint): Promise<RawLog[]> {
  const range = BigInt(config.logRange);
  const spans: [bigint, bigint][] = [];
  for (let a = fromBlock; a <= toBlock; a += range) spans.push([a, a + range - 1n < toBlock ? a + range - 1n : toBlock]);

  const out: RawLog[] = [];
  for (let i = 0; i < spans.length; i += config.concurrency) {
    const batch = spans.slice(i, i + config.concurrency);
    const results = await Promise.all(
      batch.map(([f, t]) => client.getLogs({ address: addresses, fromBlock: f, toBlock: t }) as Promise<RawLog[]>),
    );
    for (const r of results) out.push(...r);
  }
  return out;
}

const blockTimes = new Map<bigint, number>();
export async function blockTimestamp(blockNumber: bigint): Promise<number> {
  const cached = blockTimes.get(blockNumber);
  if (cached !== undefined) return cached;
  const block = await client.getBlock({ blockNumber });
  const ts = Number(block.timestamp);
  if (blockTimes.size > 5_000) blockTimes.clear();
  blockTimes.set(blockNumber, ts);
  return ts;
}

const txSenders = new Map<string, Address>();
export async function txSender(hash: `0x${string}`): Promise<Address> {
  const cached = txSenders.get(hash);
  if (cached) return cached;
  const tx = await client.getTransaction({ hash });
  if (txSenders.size > 5_000) txSenders.clear();
  txSenders.set(hash, tx.from);
  return tx.from;
}
