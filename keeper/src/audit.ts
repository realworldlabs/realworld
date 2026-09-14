import { keccak256, toHex } from "viem";
import fs from "node:fs/promises";
import path from "node:path";
import type { Observation } from "./sources/types.ts";

export interface AuditRecord {
  assetId: number;
  symbol: string;
  price: number;
  period?: string;
  observations: Pick<Observation, "source" | "price" | "period" | "observedAt" | "raw">[];
  createdAt: number;
}

/** JSON with object keys sorted recursively, so the same record always hashes the same. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.keys(v as Record<string, unknown>)
        .sort()
        .map((k) => [k, sortKeys((v as Record<string, unknown>)[k])]),
    );
  }
  return v;
}

export function hashRecord(record: AuditRecord): `0x${string}` {
  return keccak256(toHex(canonicalJson(record)));
}

export interface AuditSink {
  store(record: AuditRecord, hash: `0x${string}`): Promise<string>;
}

/** Writes records to a local directory named by hash. */
export function fileSink(dir: string): AuditSink {
  return {
    async store(record, hash) {
      await fs.mkdir(dir, { recursive: true });
      const file = path.join(dir, `${hash}.json`);
      await fs.writeFile(file, canonicalJson(record));
      return file;
    },
  };
}

/** Pins records to IPFS through Pinata, falling back to nothing else: failures surface to the caller. */
export function pinataSink(jwt: string, fetcher: typeof fetch = fetch): AuditSink {
  return {
    async store(record, hash) {
      const res = await fetcher("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ pinataContent: JSON.parse(canonicalJson(record)), pinataMetadata: { name: hash } }),
      });
      if (!res.ok) throw new Error(`pinata ${res.status}: ${await res.text()}`);
      const { IpfsHash } = (await res.json()) as { IpfsHash: string };
      return `ipfs://${IpfsHash}`;
    },
  };
}
