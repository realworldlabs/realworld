import { Hono } from "hono";
import { cors } from "hono/cors";
import { and, asc, count, desc, eq, gt, gte, ilike, inArray, lte, notInArray, or, sql } from "drizzle-orm";
import { isAddress, type Address } from "viem";
import { deployments } from "./config.ts";
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

  // ---------------------------------------------------------------- health

  app.get("/health", (c) => c.json({ ok: true, ...status }));
  app.get("/ready", (c) => (status.ready ? c.json(status) : c.json(status, 503)));

  // ---------------------------------------------------------------- stats

  app.get("/stats", async (c) => {
    const [coins] = await db
      .select({
        coins: count(),
        graduated: sql<number>`count(*) filter (where ${schema.coin.graduated})`,
        volumeUsd: sql<number>`coalesce(sum(${schema.coin.volumeUsd}), 0)`,
      })
      .from(schema.coin);
    const [assets] = await db.select({ assets: count() }).from(schema.asset);
    return json(c, { ...coins, ...assets, lastBlock: status.lastBlock });
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
    const holders = await holderCounts(rows.map((r) => r.coin.token));

    return json(c, {
      total: Number(total?.n ?? 0),
      items: rows.map((r) => ({ ...r.coin, asset: r.asset, holders: holders.get(r.coin.token) ?? 0 })),
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
    const holders = await holderCounts([addr]);

    return json(c, { ...row.coin, asset: row.asset, holders: holders.get(addr) ?? 0, topHolders, buybacks });
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
    return json(c, rows);
  });

  app.get("/assets/:id", async (c) => {
    const id = int(c.req.param("id"), -1, 1e9);
    const [row] = await db.select().from(schema.asset).where(eq(schema.asset.assetId, id));
    if (!row) return c.json({ error: "not found" }, 404);
    const prices = await db
      .select()
      .from(schema.assetPrice)
      .where(eq(schema.assetPrice.assetId, id))
      .orderBy(desc(schema.assetPrice.timestamp))
      .limit(int(c.req.query("limit"), 100, 1000));
    const redemptions = await db.select().from(schema.redemption).where(eq(schema.redemption.assetId, id)).orderBy(desc(schema.redemption.timestamp)).limit(20);
    return json(c, { ...row, prices, redemptions });
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
