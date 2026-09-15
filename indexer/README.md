# RWA launchpad indexer

Lightweight event indexer for the synthetic RWA stack and the launchpad, plus a small REST API. It is built for RPCs with tight limits (QuickNode Discover allows 5-block `eth_getLogs` spans and ~15 requests/s): one ranged `eth_getLogs` call per chunk over the known contract addresses, no per-block polling, and immutable contract reads at the latest block only.

It reads contract addresses and the start block from a deployments JSON (`DEPLOYMENTS_FILE`, default `../contracts/deployments/devnet.json`).

It indexes:

- **Assets:** `AssetRegistry` and `PriceWall` for asset metadata, wall ticks, USD prices and keeper audit hashes; `WallHook.WallSwap` and `PriceWall.WallReset` to refresh what each wall holds.
- **Launches:** `LaunchFactory` for launches, graduations and creator settings. The creator's first buy comes from the `Launched` event, because its swap is emitted before the pool is known.
- **Trades:** `LaunchHook.Traded` for trades, 1m/5m/1h/1d candles, volume, market cap and curve progress.
- **Holders:** `Transfer` on every launch token (addresses discovered from `Launched`) for balances. Holder counts exclude protocol contracts.
- **Fees:** `FeeEscrow` and `BuybackVault` for claimable fees and buybacks.

## Run

```bash
# local: start the devnet first (contracts/script/devnet.sh); data lives in .data/pglite
pnpm start                                # API on http://127.0.0.1:42069
# production
RPC_URL=https://<your-rpc>,https://<fallback-rpc> \
LOG_RANGE=5 \
DEPLOYMENTS_FILE=../contracts/deployments/mainnet.json \
DATABASE_URL=postgres://... pnpm start
```

| Variable | Default | Meaning |
|---|---|---|
| `RPC_URL` | `http://127.0.0.1:8545` | comma-separated JSON-RPC URLs; requests fall back across them |
| `LOG_RANGE` | `5` | largest `eth_getLogs` block span the RPC allows |
| `SYNC_CONCURRENCY` | `4` | parallel `eth_getLogs` calls during backfill |
| `POLL_MS` | `6000` | poll interval once caught up |
| `CONFIRMATIONS` | `2` | blocks behind the head to index |
| `DATABASE_URL` | — | Postgres; without it a local PGlite database is used |
| `PORT` | `42069` | API port |
| `PINATA_JWT` | — | enables `POST /upload` (coin images pinned to IPFS) |
| `FEATURED_TOKEN` | — | the RealWorld token, launched on pons v2; polled for `GET /featured` |
| `FEATURED_POLL_MS` | `60000` | how often the featured token is re-read |
| `PONS_FACTORY`, `PONS_HOOK` | pons v2 mainnet | override only if pons redeploys |

`GET /ready` returns 200 once the initial backfill reaches the chain head; `GET /health` always returns the sync status.

## API

| Route | Description |
|---|---|
| `GET /stats` | coin count, graduated count, total volume, asset count, last indexed block |
| `GET /coins?sort=mcap\|new\|volume\|trades\|progress&assetId=&category=&graduated=&creator=&q=&limit=&offset=` | coin list with asset and holder count |
| `GET /coins/:token` | coin detail, top holders, buybacks |
| `GET /coins/:token/trades?limit=` | recent trades |
| `GET /coins/:token/candles?interval=60\|300\|3600\|86400&from=&to=` | OHLC in USD |
| `GET /assets`, `GET /assets/:id` | assets, price history, redemptions |
| `GET /portfolio/:address` | holdings, claimable fees, created coins, trades |
| `GET /featured` | the RealWorld token (pons v2): phase, price in its pair and USD, market cap, graduation progress, 24h change, sparkline; 404 when unset |

Addresses in responses are lowercase.

`asset.pot` is the USDG bidding in the wall and `asset.wallSynth` the synth still on offer, both re-read from `PriceWall.wallBalances` after every wall swap or reset. A redeployed registry (different `assetRegistry` in the deployments file) clears all indexed rows and restarts the sync.
