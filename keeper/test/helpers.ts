import fs from "node:fs";
import path from "node:path";
import type { Logger, Level } from "../src/alerts.ts";
import type { Fetcher, SourceContext } from "../src/sources/types.ts";

const FIXTURES = path.join(import.meta.dirname, "fixtures");

/** Serves recorded responses: the first rule whose substring appears in the URL wins. */
export function fixtureFetch(rules: [string, string][]): Fetcher {
  return async (url) => {
    const rule = rules.find(([needle]) => url.includes(needle));
    if (!rule) return new Response("not found", { status: 404 });
    return new Response(fs.readFileSync(path.join(FIXTURES, rule[1]), "utf8"), { status: 200 });
  };
}

export const ALL_FIXTURES: [string, string][] = [
  ["api.bls.gov", "bls-cpi.json"],
  ["fredgraph.csv?id=CPIAUCNS", "fred-cpi.csv"],
  ["fredgraph.csv?id=EFFR", "fred-effr.csv"],
  ["fredgraph.csv?id=QXMN628BIS", "fred-bis-euro.csv"],
  ["newyorkfed.org", "nyfed-effr.json"],
  ["eurostat", "eurostat-hpi.json"],
  ["steamcommunity.com", "steam-redline.json"],
  ["skinport.com", "skinport-redline.json"],
  ["big-mac", "economist-bigmac.csv"],
];

export function ctx(fetch: Fetcher, now = Date.parse("2026-09-14T12:00:00Z")): SourceContext {
  return { fetch, env: {}, now: () => now };
}

export function memoryLogger(): Logger & { lines: { level: Level; message: string; data?: Record<string, unknown> }[] } {
  const lines: { level: Level; message: string; data?: Record<string, unknown> }[] = [];
  return { lines, log: (level, message, data) => lines.push({ level, message, data }) };
}
