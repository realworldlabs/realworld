import { sql } from "drizzle-orm";
import { boolean, customType, doublePrecision, index, integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

/** Token amounts exceed int8, so they live in numeric(78) and come back as bigint. */
const big = customType<{ data: bigint; driverData: string }>({
  dataType: () => "numeric(78,0)",
  toDriver: (v) => v.toString(),
  fromDriver: (v) => BigInt(v),
});

export const syncState = pgTable("sync_state", {
  key: text("key").primaryKey(),
  lastBlock: integer("last_block").notNull(),
});

/** Synthetic RWA assets and their current wall state. */
export const asset = pgTable("asset", {
  assetId: integer("asset_id").primaryKey(),
  token: text("token").notNull(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // MACRO | COLLECTIBLE
  metadataUri: text("metadata_uri").notNull(),
  poolId: text("pool_id").notNull(),
  synthIsToken0: boolean("synth_is_token0").notNull(),
  tick: integer("tick").notNull(),
  priceUsd: doublePrecision("price_usd").notNull(),
  lastUpdate: integer("last_update").notNull(),
  paused: boolean("paused").notNull(),
  pot: big("pot").notNull(),
  launches: integer("launches").notNull(),
});

export const assetPrice = pgTable(
  "asset_price",
  {
    id: text("id").primaryKey(),
    assetId: integer("asset_id").notNull(),
    tick: integer("tick").notNull(),
    priceUsd: doublePrecision("price_usd").notNull(),
    sourcesHash: text("sources_hash").notNull(),
    timestamp: integer("timestamp").notNull(),
    txHash: text("tx_hash").notNull(),
  },
  (t) => [index("asset_price_asset_idx").on(t.assetId, t.timestamp)],
);

/** Launched coins. */
export const coin = pgTable(
  "coin",
  {
    token: text("token").primaryKey(),
    name: text("name").notNull(),
    symbol: text("symbol").notNull(),
    logo: text("logo").notNull(),
    description: text("description").notNull(),
    creator: text("creator").notNull(),
    feeRecipient: text("fee_recipient").notNull(),
    pair: text("pair").notNull(),
    /** null when paired with USDG directly */
    assetId: integer("asset_id"),
    poolId: text("pool_id").notNull(),
    tokenIsToken0: boolean("token_is_token0").notNull(),
    creatorTaxBps: integer("creator_tax_bps").notNull(),
    buybackBps: integer("buyback_bps").notNull(),
    buybackEnabled: boolean("buyback_enabled").notNull(),
    curveEndSqrtPriceX96: big("curve_end_sqrt_price_x96").notNull(),
    curveStartSqrtPriceX96: big("curve_start_sqrt_price_x96").notNull(),
    createdAt: integer("created_at").notNull(),
    graduated: boolean("graduated").notNull(),
    graduatedAt: integer("graduated_at"),
    sqrtPriceX96: big("sqrt_price_x96").notNull(),
    priceInPair: doublePrecision("price_in_pair").notNull(),
    priceUsd: doublePrecision("price_usd").notNull(),
    marketCapUsd: doublePrecision("market_cap_usd").notNull(),
    curveProgress: doublePrecision("curve_progress").notNull(),
    volumeUsd: doublePrecision("volume_usd").notNull(),
    trades: integer("trades").notNull(),
    lastTradeAt: integer("last_trade_at").notNull(),
  },
  (t) => [
    index("coin_created_idx").on(t.createdAt),
    index("coin_mcap_idx").on(t.marketCapUsd),
    index("coin_asset_idx").on(t.assetId),
    index("coin_creator_idx").on(t.creator),
  ],
);

export const trade = pgTable(
  "trade",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull(),
    trader: text("trader").notNull(),
    side: text("side").notNull(), // buy | sell
    tokenAmount: big("token_amount").notNull(),
    pairAmount: big("pair_amount").notNull(),
    priceInPair: doublePrecision("price_in_pair").notNull(),
    priceUsd: doublePrecision("price_usd").notNull(),
    valueUsd: doublePrecision("value_usd").notNull(),
    timestamp: integer("timestamp").notNull(),
    txHash: text("tx_hash").notNull(),
  },
  (t) => [index("trade_token_idx").on(t.token, t.timestamp), index("trade_trader_idx").on(t.trader)],
);

export const candle = pgTable(
  "candle",
  {
    token: text("token").notNull(),
    interval: integer("interval").notNull(), // seconds
    bucket: integer("bucket").notNull(), // bucket start, unix seconds
    open: doublePrecision("open").notNull(),
    high: doublePrecision("high").notNull(),
    low: doublePrecision("low").notNull(),
    close: doublePrecision("close").notNull(),
    volumeUsd: doublePrecision("volume_usd").notNull(),
    trades: integer("trades").notNull(),
  },
  (t) => [primaryKey({ columns: [t.token, t.interval, t.bucket] })],
);

export const holder = pgTable(
  "holder",
  {
    token: text("token").notNull(),
    account: text("account").notNull(),
    balance: big("balance").notNull(),
  },
  (t) => [primaryKey({ columns: [t.token, t.account] }), index("holder_account_idx").on(t.account)],
);

export const feeBalance = pgTable(
  "fee_balance",
  {
    account: text("account").notNull(),
    currency: text("currency").notNull(),
    credited: big("credited").notNull(),
    claimed: big("claimed").notNull(),
  },
  (t) => [primaryKey({ columns: [t.account, t.currency] })],
);

export const buyback = pgTable("buyback", {
  id: text("id").primaryKey(),
  token: text("token").notNull(),
  pairSpent: big("pair_spent").notNull(),
  tokensBought: big("tokens_bought").notNull(),
  timestamp: integer("timestamp").notNull(),
});

export const redemption = pgTable("redemption", {
  id: text("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  account: text("account").notNull(),
  synthIn: big("synth_in").notNull(),
  usdgOut: big("usdg_out").notNull(),
  fee: big("fee").notNull(),
  timestamp: integer("timestamp").notNull(),
});

/** Idempotent DDL, kept next to the table definitions so the two cannot drift silently. */
export const DDL = [
  sql`create table if not exists sync_state (key text primary key, last_block integer not null)`,
  sql`create table if not exists asset (asset_id integer primary key, token text not null, symbol text not null, name text not null, category text not null, metadata_uri text not null, pool_id text not null, synth_is_token0 boolean not null, tick integer not null, price_usd double precision not null, last_update integer not null, paused boolean not null, pot numeric(78,0) not null, launches integer not null)`,
  sql`create table if not exists asset_price (id text primary key, asset_id integer not null, tick integer not null, price_usd double precision not null, sources_hash text not null, timestamp integer not null, tx_hash text not null)`,
  sql`create index if not exists asset_price_asset_idx on asset_price (asset_id, timestamp)`,
  sql`create table if not exists coin (token text primary key, name text not null, symbol text not null, logo text not null, description text not null, creator text not null, fee_recipient text not null, pair text not null, asset_id integer, pool_id text not null, token_is_token0 boolean not null, creator_tax_bps integer not null, buyback_bps integer not null, buyback_enabled boolean not null, curve_end_sqrt_price_x96 numeric(78,0) not null, curve_start_sqrt_price_x96 numeric(78,0) not null, created_at integer not null, graduated boolean not null, graduated_at integer, sqrt_price_x96 numeric(78,0) not null, price_in_pair double precision not null, price_usd double precision not null, market_cap_usd double precision not null, curve_progress double precision not null, volume_usd double precision not null, trades integer not null, last_trade_at integer not null)`,
  sql`create index if not exists coin_created_idx on coin (created_at)`,
  sql`create index if not exists coin_mcap_idx on coin (market_cap_usd)`,
  sql`create index if not exists coin_asset_idx on coin (asset_id)`,
  sql`create index if not exists coin_creator_idx on coin (creator)`,
  sql`create table if not exists trade (id text primary key, token text not null, trader text not null, side text not null, token_amount numeric(78,0) not null, pair_amount numeric(78,0) not null, price_in_pair double precision not null, price_usd double precision not null, value_usd double precision not null, timestamp integer not null, tx_hash text not null)`,
  sql`create index if not exists trade_token_idx on trade (token, timestamp)`,
  sql`create index if not exists trade_trader_idx on trade (trader)`,
  sql`create table if not exists candle (token text not null, interval integer not null, bucket integer not null, open double precision not null, high double precision not null, low double precision not null, close double precision not null, volume_usd double precision not null, trades integer not null, primary key (token, interval, bucket))`,
  sql`create table if not exists holder (token text not null, account text not null, balance numeric(78,0) not null, primary key (token, account))`,
  sql`create index if not exists holder_account_idx on holder (account)`,
  sql`create table if not exists fee_balance (account text not null, currency text not null, credited numeric(78,0) not null, claimed numeric(78,0) not null, primary key (account, currency))`,
  sql`create table if not exists buyback (id text primary key, token text not null, pair_spent numeric(78,0) not null, tokens_bought numeric(78,0) not null, timestamp integer not null)`,
  sql`create table if not exists redemption (id text primary key, asset_id integer not null, account text not null, synth_in numeric(78,0) not null, usdg_out numeric(78,0) not null, fee numeric(78,0) not null, timestamp integer not null)`,
];
