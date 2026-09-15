import { Hono } from "hono";
import { cors } from "hono/cors";
import { and, asc, count, desc, eq, gt, gte, ilike, inArray, lte, notInArray, or, sql } from "drizzle-orm";
import { isAddress, type Address } from "viem";
import { config, deployments } from "./config.ts";
import type { Db } from "./db.ts";
import * as schema from "./schema.ts";
import { status } from "./sync.ts";

/** Protocol contracts hold curve, reserve and vesting balances; they are not holders. */
const PROTOCOL: string[] = [
  deployments.poolManager,
  deployments.launchFactory,
  deployments.launchLocker,
  deployments.buybackVault,
  deployments.launchRouter,
  deployments.feeEscrow,
  "0x000000000000000000000000000000000000dEaD",
]
  .filter((v): v is Address => typeof v === "string")
  .map((v) => v.toLowerCase());

/** Read-only chain access plus raw transaction submission; nothing that touches node state or logs. */
const RPC_METHODS = new Set([
  "eth_chainId",
  "net_version",
  "eth_blockNumber",
  "eth_call",
  "eth_estimateGas",
  "eth_gasPrice",
  "eth_maxPriorityFeePerGas",
  "eth_feeHistory",
  "eth_getBalance",
  "eth_getCode",
  "eth_getTransactionCount",
  "eth_getBlockByNumber",
  "eth_getBlockByHash",
  "eth_getTransactionByHash",
  "eth_getTransactionReceipt",
  "eth_sendRawTransaction",
]);

const HOUR = 3_600;
const DAY = 86_400;

/** Every address is stored lowercase, so lookups normalise the same way. */
const lc = (a: string) => a.toLowerCase();
const int = (v: string | undefined, def: number, max = 500) => Math.min(max, Math.max(0, Number.parseInt(v ?? "", 10) || def));

function replaceBigInts(v: unknown): unknown {
  if (typeof v === "bigint") return v.toString();
  if (Array.isArray(v)) return v.map(replaceBigInts);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, replaceBigInts(x)]));
  return v;
}

export function createApi(db: Db) {
  const app = new Hono();
  app.use("*", cors());
  const json = (c: { json: (v: any, status?: any) => Response }, v: unknown) => c.json(replaceBigInts(v));

  async function holderCounts(tokens: string[]): Promise<Map<string, number>> {
    if (tokens.length === 0) return new Map();
    const rows = await db
      .select({ token: schema.holder.token, n: count() })
      .from(schema.holder)
      .where(and(inArray(schema.holder.token, tokens), gt(schema.holder.balance, 0n), notInArray(schema.holder.account, PROTOCOL)))
      .groupBy(schema.holder.token);
    return new Map(rows.map((r) => [r.token, Number(r.n)]));
  }

  // ---------------------------------------------------------------- rpc proxy

  // The web app reads the chain through here: the public Robinhood RPC is rate-limited and flaky from browsers,
  // and the paid RPC key must not ship in the bundle. Wallets still send transactions through their own RPC.
  app.post("/rpc", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }, 400);
    }
    const calls = Array.isArray(body) ? body : [body];
    if (calls.length > 20) return c.json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "batch too large" } }, 400);
    for (const call of calls) {
      const method = (call as { method?: unknown })?.method;
      if (typeof method !== "string" || !RPC_METHODS.has(method)) {
        return c.json({ jsonrpc: "2.0", id: (call as { id?: unknown })?.id ?? null, error: { code: -32601, message: "method not allowed" } }, 403);
      }
    }
    const upstream = await fetch(config.rpcUrls[0]!, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    return c.body(await upstream.text(), upstream.status as 200, { "content-type": "application/json" });
  });

  // ---------------------------------------------------------------- health

  app.get("/health", (c) => c.json({ ok: true, ...status }));
  app.get("/ready", (c) => (status.ready ? c.json(status) : c.json(status, 503)));

  // ---------------------------------------------------------------- 24h aggregates

  /** 24h change, 24h volume and an hourly sparkline per coin, from the 1h candles. */
  async function stats24(tokens: string[]): Promise<Map<string, { change24h: number | null; volume24h: number; spark: number[] }>> {
    const out = new Map<string, { change24h: number | null; volume24h: number; spark: number[] }>();
    if (tokens.length === 0) return out;
    const cutoff = Math.floor(Date.now() / 1000) - DAY;
    const recent = await db
      .select({ token: schema.candle.token, bucket: schema.candle.bucket, open: schema.candle.open, close: schema.candle.close, volumeUsd: schema.candle.volumeUsd })
      .from(schema.candle)
      .where(and(inArray(schema.candle.token, tokens), eq(schema.candle.interval, HOUR), gte(schema.candle.bucket, cutoff - HOUR)))
      .orderBy(asc(schema.candle.bucket));
    // Price a day ago: the close of the last hourly bar at or before the cutoff.
    const base = (await db.execute(
      sql`select distinct on (token) token, close from candle where interval = ${HOUR} and bucket <= ${cutoff} and token in (${sql.join(
        tokens.map((t) => sql`${t}`),
        sql`, `,
      )}) order by token, bucket desc`,
    )) as { rows: { token: string; close: number }[] };
    const baseline = new Map(base.rows.map((r) => [r.token, Number(r.close)]));

    for (const t of tokens) out.set(t, { change24h: null, volume24h: 0, spark: [] });
    for (const r of recent) {
      const s = out.get(r.token)!;
      s.spark.push(r.close);
      if (r.bucket >= cutoff) s.volume24h += r.volumeUsd;
    }
    for (const t of tokens) {
      const s = out.get(t)!;
      const b = baseline.get(t) ?? (recent.find((r) => r.token === t)?.open ?? null);
      const last = s.spark.at(-1);
      if (b !== null && b > 0 && last !== undefined) s.change24h = last / b - 1;
    }
    return out;
  }

  /** Recent wall moves per asset plus the 24h change against the move history. */
  async function assetHistory(ids: number[]): Promise<Map<number, { change24h: number | null; history: { t: number; p: number }[] }>> {
    const out = new Map<number, { change24h: number | null; history: { t: number; p: number }[] }>();
    if (ids.length === 0) return out;
    const cutoff = Math.floor(Date.now() / 1000) - DAY;
    const rows = await db
      .select({ assetId: schema.assetPrice.assetId, timestamp: schema.assetPrice.timestamp, priceUsd: schema.assetPrice.priceUsd })
      .from(schema.assetPrice)
      .where(inArray(schema.assetPrice.assetId, ids))
      .orderBy(asc(schema.assetPrice.timestamp));
    for (const id of ids) out.set(id, { change24h: null, history: [] });
    for (const r of rows) out.get(r.assetId)!.history.push({ t: r.timestamp, p: r.priceUsd });
    for (const id of ids) {
      const s = out.get(id)!;
      const before = s.history.filter((h) => h.t <= cutoff).at(-1) ?? s.history[0];
      const last = s.history.at(-1);
      if (before && last && before.p > 0) s.change24h = last.p / before.p - 1;
      s.history = s.history.slice(-40);
    }
    return out;
  }

  // ---------------------------------------------------------------- stats

  app.get("/stats", async (c) => {
    const [coins] = await db
      .select({
        coins: count(),
        graduated: sql<number>`(count(*) filter (where ${schema.coin.graduated}))::int`,
        volumeUsd: sql<number>`coalesce(sum(${schema.coin.volumeUsd}), 0)`,
      })
      .from(schema.coin);
    const [assets] = await db.select({ assets: count() }).from(schema.asset);
    const cutoff = Math.floor(Date.now() / 1000) - DAY;
    const [day] = await db
      .select({ volume24h: sql<number>`coalesce(sum(${schema.candle.volumeUsd}), 0)`, trades24h: sql<number>`coalesce(sum(${schema.candle.trades}), 0)::int` })
      .from(schema.candle)
      .where(and(eq(schema.candle.interval, HOUR), gte(schema.candle.bucket, cutoff)));
    const [launches] = await db.select({ launches24h: count() }).from(schema.coin).where(gte(schema.coin.createdAt, cutoff));
    return json(c, { ...coins, ...assets, ...day, ...launches, lastBlock: status.lastBlock, headBlock: status.headBlock });
  });

  /** Latest trades across every coin, for the board's tape. */
  app.get("/trades", async (c) => {
    const rows = await db
      .select({ trade: schema.trade, symbol: schema.coin.symbol, logo: schema.coin.logo, assetId: schema.coin.assetId })
      .from(schema.trade)
      .innerJoin(schema.coin, eq(schema.trade.token, schema.coin.token))
      .orderBy(desc(schema.trade.timestamp), desc(schema.trade.id))
      .limit(int(c.req.query("limit"), 30, 100));
    return json(c, rows.map((r) => ({ ...r.trade, symbol: r.symbol, logo: r.logo, assetId: r.assetId })));
  });

  // ---------------------------------------------------------------- coins

  app.get("/coins", async (c) => {
    const q = c.req.query();
    const sort = q.sort ?? "mcap";
    const orderBy =
      sort === "new"
        ? desc(schema.coin.createdAt)
        : sort === "volume"
          ? desc(schema.coin.volumeUsd)
          : sort === "trades"
            ? desc(schema.coin.lastTradeAt)
            : sort === "progress"
              ? desc(schema.coin.curveProgress)
              : desc(schema.coin.marketCapUsd);

    const filters = [];
    if (q.assetId === "usdg") filters.push(sql`${schema.coin.assetId} is null`);
    else if (q.assetId !== undefined) filters.push(eq(schema.coin.assetId, int(q.assetId, 0, 1e9)));
    if (q.category) filters.push(eq(schema.asset.category, q.category.toUpperCase()));
    if (q.graduated === "true") filters.push(eq(schema.coin.graduated, true));
    if (q.graduated === "false") filters.push(eq(schema.coin.graduated, false));
    if (q.creator && isAddress(q.creator)) filters.push(eq(schema.coin.creator, lc(q.creator)));
    if (q.q) filters.push(or(ilike(schema.coin.name, `%${q.q}%`), ilike(schema.coin.symbol, `%${q.q}%`)));

    const limit = int(q.limit, 50, 100);
    const offset = int(q.offset, 0, 1e9);
    const where = filters.length ? and(...filters) : undefined;

    const rows = await db
      .select({ coin: schema.coin, asset: schema.asset })
      .from(schema.coin)
      .leftJoin(schema.asset, eq(schema.coin.assetId, schema.asset.assetId))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const [total] = await db
      .select({ n: count() })
      .from(schema.coin)
      .leftJoin(schema.asset, eq(schema.coin.assetId, schema.asset.assetId))
      .where(where);
    const tokens = rows.map((r) => r.coin.token);
    const [holders, day] = await Promise.all([holderCounts(tokens), stats24(tokens)]);

    return json(c, {
      total: Number(total?.n ?? 0),
      items: rows.map((r) => ({ ...r.coin, asset: r.asset, holders: holders.get(r.coin.token) ?? 0, ...day.get(r.coin.token)! })),
    });
  });

  app.get("/coins/:token", async (c) => {
    const token = c.req.param("token");
    if (!isAddress(token)) return c.json({ error: "bad address" }, 400);
    const addr = lc(token);
    const [row] = await db
      .select({ coin: schema.coin, asset: schema.asset })
      .from(schema.coin)
      .leftJoin(schema.asset, eq(schema.coin.assetId, schema.asset.assetId))
      .where(eq(schema.coin.token, addr));
    if (!row) return c.json({ error: "not found" }, 404);

    const topHolders = await db
      .select({ account: schema.holder.account, balance: schema.holder.balance })
      .from(schema.holder)
      .where(and(eq(schema.holder.token, addr), gt(schema.holder.balance, 0n), notInArray(schema.holder.account, PROTOCOL)))
      .orderBy(desc(schema.holder.balance))
      .limit(20);
    const buybacks = await db.select().from(schema.buyback).where(eq(schema.buyback.token, addr)).orderBy(desc(schema.buyback.timestamp)).limit(20);
    const [holders, day] = await Promise.all([holderCounts([addr]), stats24([addr])]);

    return json(c, { ...row.coin, asset: row.asset, holders: holders.get(addr) ?? 0, ...day.get(addr)!, topHolders, buybacks });
  });

  app.get("/coins/:token/trades", async (c) => {
    const token = c.req.param("token");
    if (!isAddress(token)) return c.json({ error: "bad address" }, 400);
    const rows = await db
      .select()
      .from(schema.trade)
      .where(eq(schema.trade.token, lc(token)))
      .orderBy(desc(schema.trade.timestamp))
      .limit(int(c.req.query("limit"), 50, 200));
    return json(c, rows);
  });

  app.get("/coins/:token/candles", async (c) => {
    const token = c.req.param("token");
    if (!isAddress(token)) return c.json({ error: "bad address" }, 400);
    const interval = int(c.req.query("interval"), 300, 86400);
    const from = int(c.req.query("from"), 0, 2 ** 31);
    const to = int(c.req.query("to"), 2 ** 31 - 1, 2 ** 31);
    const rows = await db
      .select()
      .from(schema.candle)
      .where(and(eq(schema.candle.token, lc(token)), eq(schema.candle.interval, interval), gte(schema.candle.bucket, from), lte(schema.candle.bucket, to)))
      .orderBy(asc(schema.candle.bucket))
      .limit(2000);
    return json(c, rows);
  });

  // ---------------------------------------------------------------- assets

  app.get("/assets", async (c) => {
    const rows = await db.select().from(schema.asset).orderBy(asc(schema.asset.assetId));
    const hist = await assetHistory(rows.map((r) => r.assetId));
    return json(c, rows.map((r) => ({ ...r, ...hist.get(r.assetId)! })));
  });

  app.get("/assets/:id", async (c) => {
    const id = int(c.req.param("id"), -1, 1e9);
    const [row] = await db.select().from(schema.asset).where(eq(schema.asset.assetId, id));
    if (!row) return c.json({ error: "not found" }, 404);
    const hist = (await assetHistory([id])).get(id)!;
    const prices = await db
      .select()
      .from(schema.assetPrice)
      .where(eq(schema.assetPrice.assetId, id))
      .orderBy(desc(schema.assetPrice.timestamp))
      .limit(int(c.req.query("limit"), 100, 1000));
    return json(c, { ...row, ...hist, prices });
  });

  // ---------------------------------------------------------------- accounts

  app.get("/portfolio/:address", async (c) => {
    const address = c.req.param("address");
    if (!isAddress(address)) return c.json({ error: "bad address" }, 400);
    const account = lc(address);
    const holdings = await db
      .select({ balance: schema.holder.balance, coin: schema.coin, asset: schema.asset })
      .from(schema.holder)
      .innerJoin(schema.coin, eq(schema.holder.token, schema.coin.token))
      .leftJoin(schema.asset, eq(schema.coin.assetId, schema.asset.assetId))
      .where(and(eq(schema.holder.account, account), gt(schema.holder.balance, 0n)))
      .orderBy(desc(schema.coin.marketCapUsd));
    const fees = await db.select().from(schema.feeBalance).where(eq(schema.feeBalance.account, account));
    const created = await db.select().from(schema.coin).where(eq(schema.coin.creator, account)).orderBy(desc(schema.coin.createdAt));
    const trades = await db.select().from(schema.trade).where(eq(schema.trade.trader, account)).orderBy(desc(schema.trade.timestamp)).limit(50);

    return json(c, {
      holdings: holdings.map((h) => ({
        balance: h.balance,
        coin: { ...h.coin, asset: h.asset },
        valueUsd: (Number(h.balance) / 1e18) * h.coin.priceUsd,
      })),
      fees: fees.map((f) => ({ ...f, claimable: f.credited - f.claimed })),
      created,
      trades,
    });
  });

  return app;
}
