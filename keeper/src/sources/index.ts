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

/** Skinport public item list. Uses the suggested price. */
const skinport: SourceAdapter = async (spec, ctx) => {
  const name = str(spec, "marketHashName");
  type Item = { market_hash_name: string; suggested_price: number | null; median_price: number | null };
  const items = await getJson<Item[]>(ctx, "https://api.skinport.com/v1/items?app_id=730&currency=USD");
  const item = items.find((i) => i.market_hash_name === name);
  const price = item?.suggested_price ?? item?.median_price;
  if (!price) throw new Error(`skinport ${name}: no price`);
  return [{ source: "skinport", price, observedAt: ctx.now(), raw: item }];
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
  economistBigMac,
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
