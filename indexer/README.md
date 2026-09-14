# RWA launchpad indexer

[Ponder](https://ponder.sh) 0.17 indexer for the synthetic RWA stack and the launchpad, plus a small REST API.

It reads contract addresses and the start block from a deployments JSON (`DEPLOYMENTS_FILE`, default `../contracts/deployments/devnet.json`).

It indexes:

- **Assets:** `AssetRegistry` and `PriceWall` for asset metadata, wall ticks, USD prices and keeper audit hashes; `RedemptionVault` for pots and redemptions.
- **Launches:** `LaunchFactory` for launches, graduations and creator settings. The creator's first buy comes from the `Launched` event, because its swap is emitted before the pool is known.
- **Trades:** `PoolManager.Swap`, filtered to our pools, for trades, 1m/5m/1h/1d candles, volume, market cap and curve progress.
- **Holders:** `Transfer` on every launch token (Ponder factory pattern) for balances. Holder counts exclude protocol contracts.
- **Fees:** `FeeEscrow` and `BuybackVault` for claimable fees and buybacks.

## Run

```bash
# local: start the devnet first (contracts/script/devnet.sh)
pnpm start -- --schema devnet            # API on http://127.0.0.1:42069
# production
PONDER_RPC_URL=https://rpc.mainnet.chain.robinhood.com \
DEPLOYMENTS_FILE=../contracts/deployments/mainnet.json \
DATABASE_URL=postgres://... pnpm start -- --schema rwa_v1
```

## API

| Route | Description |
|---|---|
| `GET /stats` | coin count, graduated count, total volume, asset count |
| `GET /coins?sort=mcap\|new\|volume\|trades\|progress&assetId=&category=&graduated=&creator=&q=&limit=&offset=` | coin list with asset and holder count |
| `GET /coins/:token` | coin detail, top holders, buybacks |
| `GET /coins/:token/trades?limit=` | recent trades |
| `GET /coins/:token/candles?interval=60\|300\|3600\|86400&from=&to=` | OHLC in USD |
| `GET /assets`, `GET /assets/:id` | assets, price history, redemptions |
| `GET /portfolio/:address` | holdings, claimable fees, created coins, trades |
| `/graphql` | Ponder GraphQL over all tables |

`asset.pot` counts USDG already swept into the vault. USDG still sitting in a wall position shows up after the next harvest or price move; read `RedemptionVault.quoteRedeem` for the live redemption ratio.
