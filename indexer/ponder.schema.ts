import { index, onchainTable, primaryKey, relations } from "ponder";

/** Synthetic RWA assets and their current wall state. */
export const asset = onchainTable("asset", (t) => ({
  assetId: t.integer().primaryKey(),
  token: t.hex().notNull(),
  symbol: t.text().notNull(),
  name: t.text().notNull(),
  category: t.text().notNull(), // MACRO | COLLECTIBLE
  metadataUri: t.text().notNull(),
  poolId: t.hex().notNull(),
  synthIsToken0: t.boolean().notNull(),
  tick: t.integer().notNull(),
  priceUsd: t.doublePrecision().notNull(),
  lastUpdate: t.integer().notNull(),
  paused: t.boolean().notNull(),
  pot: t.bigint().notNull(),
  launches: t.integer().notNull(),
}));

export const assetPrice = onchainTable(
  "asset_price",
  (t) => ({
    id: t.text().primaryKey(),
    assetId: t.integer().notNull(),
    tick: t.integer().notNull(),
    priceUsd: t.doublePrecision().notNull(),
    sourcesHash: t.hex().notNull(),
    timestamp: t.integer().notNull(),
    txHash: t.hex().notNull(),
  }),
  (table) => ({ assetIdx: index().on(table.assetId, table.timestamp) }),
);

/** Launched coins. */
export const coin = onchainTable(
  "coin",
  (t) => ({
    token: t.hex().primaryKey(),
    name: t.text().notNull(),
    symbol: t.text().notNull(),
    logo: t.text().notNull(),
    description: t.text().notNull(),
    creator: t.hex().notNull(),
    feeRecipient: t.hex().notNull(),
    pair: t.hex().notNull(),
    /** null when paired with USDG directly */
    assetId: t.integer(),
    poolId: t.hex().notNull(),
    tokenIsToken0: t.boolean().notNull(),
    creatorTaxBps: t.integer().notNull(),
    buybackBps: t.integer().notNull(),
    buybackEnabled: t.boolean().notNull(),
    curveEndSqrtPriceX96: t.bigint().notNull(),
    curveStartSqrtPriceX96: t.bigint().notNull(),
    createdAt: t.integer().notNull(),
    graduated: t.boolean().notNull(),
    graduatedAt: t.integer(),
    sqrtPriceX96: t.bigint().notNull(),
    priceInPair: t.doublePrecision().notNull(),
    priceUsd: t.doublePrecision().notNull(),
    marketCapUsd: t.doublePrecision().notNull(),
    curveProgress: t.doublePrecision().notNull(),
    volumeUsd: t.doublePrecision().notNull(),
    trades: t.integer().notNull(),
    lastTradeAt: t.integer().notNull(),
  }),
  (table) => ({
    createdIdx: index().on(table.createdAt),
    mcapIdx: index().on(table.marketCapUsd),
    assetIdx: index().on(table.assetId),
    creatorIdx: index().on(table.creator),
  }),
);

export const trade = onchainTable(
  "trade",
  (t) => ({
    id: t.text().primaryKey(),
    token: t.hex().notNull(),
    trader: t.hex().notNull(),
    side: t.text().notNull(), // buy | sell
    tokenAmount: t.bigint().notNull(),
    pairAmount: t.bigint().notNull(),
    priceInPair: t.doublePrecision().notNull(),
    priceUsd: t.doublePrecision().notNull(),
    valueUsd: t.doublePrecision().notNull(),
    timestamp: t.integer().notNull(),
    txHash: t.hex().notNull(),
  }),
  (table) => ({
    tokenIdx: index().on(table.token, table.timestamp),
    traderIdx: index().on(table.trader),
  }),
);

export const candle = onchainTable(
  "candle",
  (t) => ({
    token: t.hex().notNull(),
    interval: t.integer().notNull(), // seconds
    bucket: t.integer().notNull(), // bucket start, unix seconds
    open: t.doublePrecision().notNull(),
    high: t.doublePrecision().notNull(),
    low: t.doublePrecision().notNull(),
    close: t.doublePrecision().notNull(),
    volumeUsd: t.doublePrecision().notNull(),
    trades: t.integer().notNull(),
  }),
  (table) => ({ pk: primaryKey({ columns: [table.token, table.interval, table.bucket] }) }),
);

export const holder = onchainTable(
  "holder",
  (t) => ({
    token: t.hex().notNull(),
    account: t.hex().notNull(),
    balance: t.bigint().notNull(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.token, table.account] }),
    accountIdx: index().on(table.account),
  }),
);

export const feeBalance = onchainTable(
  "fee_balance",
  (t) => ({
    account: t.hex().notNull(),
    currency: t.hex().notNull(),
    credited: t.bigint().notNull(),
    claimed: t.bigint().notNull(),
  }),
  (table) => ({ pk: primaryKey({ columns: [table.account, table.currency] }) }),
);

export const buyback = onchainTable("buyback", (t) => ({
  id: t.text().primaryKey(),
  token: t.hex().notNull(),
  pairSpent: t.bigint().notNull(),
  tokensBought: t.bigint().notNull(),
  timestamp: t.integer().notNull(),
}));

export const redemption = onchainTable("redemption", (t) => ({
  id: t.text().primaryKey(),
  assetId: t.integer().notNull(),
  account: t.hex().notNull(),
  synthIn: t.bigint().notNull(),
  usdgOut: t.bigint().notNull(),
  fee: t.bigint().notNull(),
  timestamp: t.integer().notNull(),
}));

export const coinRelations = relations(coin, ({ one, many }) => ({
  asset: one(asset, { fields: [coin.assetId], references: [asset.assetId] }),
  trades: many(trade),
}));

export const tradeRelations = relations(trade, ({ one }) => ({
  coin: one(coin, { fields: [trade.token], references: [coin.token] }),
}));
