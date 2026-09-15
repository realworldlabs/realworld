import type { Observation, SourceAdapter, SourceContext, SourceSpec } from "./types.ts";

/** Periods each statistical adapter returns, so lagging sources still share a period with fresh ones. */
const HISTORY = 6;

async function getText(ctx: SourceContext, url: string, init?: RequestInit): Promise<string> {
  const res = await ctx.fetch(url, { ...init, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

async function getJson<T>(ctx: SourceContext, url: string, init?: RequestInit): Promise<T> {
  return JSON.parse(await getText(ctx, url, init)) as T;
}

function str(spec: SourceSpec, key: string): string {
  const v = spec[key];
  if (typeof v !== "string" || v.length === 0) throw new Error(`source ${spec.type} needs "${key}"`);
  return v;
}

/** "2026-08-01" -> "2026-08" (month), "2026-Q3" (quarter) or unchanged (day). */
export function normalizePeriod(date: string, granularity: string): string {
  const [y, m] = date.split("-");
  if (granularity === "month") return `${y}-${m}`;
  if (granularity === "quarter") return `${y}-Q${Math.floor((Number(m) - 1) / 3) + 1}`;
  return date;
}

/** FRED public CSV download (no API key). Skips "." (missing) rows. */
const fredCsv: SourceAdapter = async (spec, ctx) => {
  const series = str(spec, "series");
  const text = await getText(ctx, `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(series)}`);
  const rows = text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.split(","))
    .filter((r) => r[1] && r[1] !== ".");
  if (rows.length === 0) throw new Error(`fred ${series}: no data`);
  return rows.slice(-HISTORY).map((r) => ({
    source: `fred:${series}`,
    price: Number(r[1]),
    period: normalizePeriod(r[0]!, (spec.period as string) ?? "day"),
    observedAt: Date.parse(r[0]!),
    raw: r.join(","),
  }));
};

/** BLS public API v2 (keyless tier; BLS_API_KEY raises limits). */
const bls: SourceAdapter = async (spec, ctx) => {
  const series = str(spec, "series");
  type Resp = { status: string; Results: { series: { data: { year: string; period: string; value: string }[] }[] } };
  const key = ctx.env.BLS_API_KEY ? `?registrationkey=${ctx.env.BLS_API_KEY}` : "";
  const j = await getJson<Resp>(ctx, `https://api.bls.gov/publicAPI/v2/timeseries/data/${series}${key}`);
  if (j.status !== "REQUEST_SUCCEEDED") throw new Error(`bls ${series}: ${j.status}`);
  const data = (j.Results.series[0]?.data ?? []).filter((d) => /^M(0[1-9]|1[0-2])$/.test(d.period));
  if (data.length === 0) throw new Error(`bls ${series}: no data`);
  return data.slice(0, HISTORY).map((d) => {
    const month = d.period.slice(1);
    return {
      source: `bls:${series}`,
      price: Number(d.value),
      period: `${d.year}-${month}`,
      observedAt: Date.parse(`${d.year}-${month}-01`),
      raw: d,
    };
  });
};

/** New York Fed reference rates (effr, obfr unsecured; sofr secured). */
const nyfed: SourceAdapter = async (spec, ctx) => {
  const rate = str(spec, "rate");
  const group = rate === "sofr" ? "secured" : "unsecured";
  type Resp = { refRates: { effectiveDate: string; percentRate: number }[] };
  const j = await getJson<Resp>(ctx, `https://markets.newyorkfed.org/api/rates/${group}/${rate}/last/${HISTORY}.json`);
  if (j.refRates.length === 0) throw new Error(`nyfed ${rate}: no data`);
  return j.refRates.map((r) => ({
    source: `nyfed:${rate}`,
    price: r.percentRate,
    period: r.effectiveDate,
    observedAt: Date.parse(r.effectiveDate),
    raw: r,
  }));
};

/** Eurostat dissemination API. `query` must select a single series (all dimensions but time fixed). */
const eurostat: SourceAdapter = async (spec, ctx) => {
  const dataset = str(spec, "dataset");
  const query = str(spec, "query");
  type Resp = { value: Record<string, number>; dimension: { time: { category: { index: Record<string, number> } } } };
  const j = await getJson<Resp>(
    ctx,
    `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset}?${query}&lastTimePeriod=${HISTORY}&format=JSON`,
  );
  const obs: Observation[] = [];
  for (const [period, idx] of Object.entries(j.dimension.time.category.index)) {
    const value = j.value[String(idx)];
    if (value === undefined) continue;
    obs.push({ source: `eurostat:${dataset}`, price: value, period, observedAt: ctx.now(), raw: { period, value } });
  }
  if (obs.length === 0) throw new Error(`eurostat ${dataset}: no data`);
  return obs;
};

/** Steam Community Market median price (market source: no period). */
const steam: SourceAdapter = async (spec, ctx) => {
  const name = str(spec, "marketHashName");
  const appId = (spec.appId as number) ?? 730;
  type Resp = { success: boolean; median_price?: string; lowest_price?: string; volume?: string };
  const j = await getJson<Resp>(
    ctx,
    `https://steamcommunity.com/market/priceoverview/?appid=${appId}&currency=1&market_hash_name=${encodeURIComponent(name)}`,
  );
  const p = j.median_price ?? j.lowest_price;
  if (!j.success || !p) throw new Error(`steam ${name}: no price`);
  return [{ source: "steam", price: Number(p.replace(/[^0-9.]/g, "")), observedAt: ctx.now(), raw: j }];
};

/**
 * Skinport public item list. `field` picks the figure: "suggested_price" (Skinport's reference, default) or
 * "min_price" (lowest live listing, comparable with the lowest-ask figures of other cash markets).
 */
const skinport: SourceAdapter = async (spec, ctx) => {
  const name = str(spec, "marketHashName");
  const field = (spec.field as string) ?? "suggested_price";
  type Item = { market_hash_name: string; suggested_price: number | null; median_price: number | null; min_price: number | null };
  const items = await getJson<Item[]>(ctx, "https://api.skinport.com/v1/items?app_id=730&currency=USD");
  const item = items.find((i) => i.market_hash_name === name);
  const price = (item?.[field as keyof Item] as number | null | undefined) ?? item?.suggested_price ?? item?.median_price;
  if (!price) throw new Error(`skinport ${name}: no price`);
  return [{ source: "skinport", price, observedAt: ctx.now(), raw: item }];
};

/**
 * Lowest live ask on a CS2 cash market (buff163, csfloat) as republished by the CSGO Trader price feed.
 * The feed is a relay, not a market: the two figures come from different exchanges, but through one publisher.
 */
const csgotrader: SourceAdapter = async (spec, ctx) => {
  const name = str(spec, "marketHashName");
  const market = str(spec, "market");
  if (!["buff163", "csfloat"].includes(market)) throw new Error(`csgotrader: unsupported market ${market}`);
  type Entry = { price?: number; starting_at?: { price?: number } | number };
  const feed = await getJson<Record<string, Entry>>(ctx, `https://prices.csgotrader.app/latest/${market}.json`);
  const e = feed[name];
  const ask = typeof e?.starting_at === "number" ? e.starting_at : e?.starting_at?.price ?? e?.price;
  if (!(typeof ask === "number" && ask > 0)) throw new Error(`csgotrader ${market} ${name}: no price`);
  return [{ source: `csgotrader:${market}`, price: ask, observedAt: ctx.now(), raw: e }];
};

/** The Economist Big Mac index CSV (published twice a year). */
const economistBigMac: SourceAdapter = async (spec, ctx) => {
  const iso = str(spec, "iso");
  const text = await getText(
    ctx,
    "https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/output-data/big-mac-full-index.csv",
  );
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0]!.split(",");
  const iDate = header.indexOf("date");
  const iIso = header.indexOf("iso_a3");
  const iPrice = header.indexOf("dollar_price");
  const rows = lines
    .slice(1)
    .map((l) => l.split(","))
    .filter((r) => r[iIso] === iso);
  if (rows.length === 0) throw new Error(`economist ${iso}: no row`);
  return rows.slice(-HISTORY).map((row) => ({
    source: "economist:bigmac",
    price: Number(row[iPrice]),
    period: normalizePeriod(row[iDate]!, "month"),
    observedAt: Date.parse(row[iDate]!),
    raw: row.slice(0, 7),
  }));
};

/**
 * pokemonprice.com card page: the per-grade "fair" figure derived from recent eBay sales. Server-rendered, so the
 * summary list ("Raw | $163 | PSA9 | $1,075 | PSA10 | ...") is read from the HTML text. `grade` is "Raw", "PSA9",
 * "PSA10" and so on. eBay-derived and single-publisher: assets built on it must say so in their rules and metadata.
 */
export function parsePokemonPrice(html: string, grade: string): number {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " | ")
    .replace(/\s*\|\s*(\|\s*)+/g, " | ")
    .replace(/\s+/g, " ");
  const tail = text.slice(text.indexOf("Confidence:"));
  const want = grade.replace(/\s+/g, "").toUpperCase();
  for (const m of tail.matchAll(/\|\s*([A-Za-z]+ ?[0-9]*)\s*\|\s*\$([0-9,]+(?:\.[0-9]+)?)\s*(?=\|)/g)) {
    if (m[1]!.replace(/\s+/g, "").toUpperCase() === want) return Number(m[2]!.replace(/,/g, ""));
  }
  throw new Error(`pokemonprice: no ${grade} price`);
}

const pokemonprice: SourceAdapter = async (spec, ctx) => {
  const slug = str(spec, "slug");
  const grade = (spec.grade as string) ?? "PSA10";
  const html = await getText(ctx, `https://www.pokemonprice.com/${slug}`, {
    headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36" },
  });
  return [{ source: `pokemonprice:${grade}`, price: parsePokemonPrice(html, grade), observedAt: ctx.now(), raw: { slug, grade } }];
};

/**
 * Auto.dev listings API (AUTODEV_KEY; free tier 1,000 calls a month, 20 rows a page). One call per reading: the
 * median asking price of the most recently updated priced listings for a make/model/year, optionally bounded by
 * mileage so the sample stays comparable. Single publisher: assets on it must say so in their rules and metadata.
 */
export function medianOf(values: number[]): number {
  const v = [...values].sort((a, b) => a - b);
  if (v.length === 0) throw new Error("median of nothing");
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid]! : (v[mid - 1]! + v[mid]!) / 2;
}

const autodev: SourceAdapter = async (spec, ctx) => {
  const make = str(spec, "make");
  const model = str(spec, "model");
  const year = str(spec, "year");
  const key = ctx.env.AUTODEV_KEY;
  if (!key) throw new Error("autodev: AUTODEV_KEY not set");
  const q = new URLSearchParams({ "vehicle.make": make, "vehicle.model": model, "vehicle.year": year, limit: "20", select: "retailListing.price,retailListing.miles" });
  if (typeof spec.miles === "string") q.set("retailListing.miles", spec.miles);
  if (typeof spec.trim === "string") q.set("vehicle.trim", spec.trim);
  type Resp = { data?: Record<string, unknown>[] };
  const j = await getJson<Resp>(ctx, `https://api.auto.dev/listings?${q}`, { headers: { authorization: `Bearer ${key}` } });
  const prices = (j.data ?? []).map((r) => Number(r["retailListing.price"])).filter((p) => Number.isFinite(p) && p > 500);
  if (prices.length < 5) throw new Error(`autodev ${year} ${make} ${model}: only ${prices.length} priced listings`);
  return [{ source: "autodev", price: medianOf(prices), observedAt: ctx.now(), raw: { make, model, year, sample: prices.length, prices } }];
};

/** PriceCharting product API (paid token). Prices are in cents. */
const pricecharting: SourceAdapter = async (spec, ctx) => {
  const id = str(spec, "id");
  const field = (spec.field as string) ?? "manual-only-price";
  const token = ctx.env.PRICECHARTING_TOKEN;
  if (!token) throw new Error("pricecharting: PRICECHARTING_TOKEN not set");
  const j = await getJson<Record<string, unknown>>(ctx, `https://www.pricecharting.com/api/product?t=${token}&id=${id}`);
  const cents = Number(j[field]);
  if (!(cents > 0)) throw new Error(`pricecharting ${id}: no ${field}`);
  return [{ source: "pricecharting", price: cents / 100, observedAt: ctx.now(), raw: { id, field, cents } }];
};

/**
 * Operator-attested JSON `{ "price": number, "period"?: string, "updatedAt": ISO string }`.
 * For assets with only one public source. Shows up as `attested:<host>` in the audit record.
 */
const attested: SourceAdapter = async (spec, ctx) => {
  const url = str(spec, "url");
  const j = await getJson<{ price: number; period?: string; updatedAt: string }>(ctx, url);
  return [{ source: `attested:${new URL(url).host}`, price: j.price, period: j.period, observedAt: Date.parse(j.updatedAt), raw: j }];
};

export const ADAPTERS: Record<string, SourceAdapter> = {
  fredCsv,
  bls,
  nyfed,
  eurostat,
  steam,
  skinport,
  csgotrader,
  economistBigMac,
  pokemonprice,
  autodev,
  pricecharting,
  attested,
};

export async function collect(
  specs: SourceSpec[],
  ctx: SourceContext,
): Promise<{ observations: Observation[]; errors: string[] }> {
  const results = await Promise.allSettled(
    specs.map((s) => {
      const adapter = ADAPTERS[s.type];
      if (!adapter) return Promise.reject(new Error(`unknown source type ${s.type}`));
      return adapter(s, ctx);
    }),
  );
  const observations: Observation[] = [];
  const errors: string[] = [];
  results.forEach((r, i) => {
    if (r.status !== "fulfilled") {
      errors.push(String(r.reason?.message ?? r.reason));
      return;
    }
    // Optional per-source normalisation, e.g. Steam prices carry a ~15% seller fee premium over cash markets.
    const scale = typeof specs[i]!.scale === "number" ? (specs[i]!.scale as number) : 1;
    observations.push(...r.value.map((o) => (scale === 1 ? o : { ...o, price: o.price * scale })));
  });
  return { observations, errors };
}
