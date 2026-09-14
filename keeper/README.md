# RWA keeper

Off-chain service that keeps synthetic RWA price walls honest and runs launchpad housekeeping.

Each loop (`INTERVAL_SEC`):

1. **Price updates.** For every asset in `assets.json` it fetches all sources and keeps the latest reporting period that at least two independent sources share. It then checks the spread (0.5% for macro, 10% for collectibles) and plans a tick move: skip inside the 25-tick deadband, step by at most the on-chain `maxMoveTicks`. It stores the audit record (IPFS or local file) and calls `PriceWall.movePrice` with its keccak hash.
2. **Graduations.** Calls `LaunchFactory.migrate` for every coin whose curve has sold out.
3. **Buybacks.** Calls `BuybackVault.executeBuyback` where the budget exceeds `BUYBACK_MIN_BUDGET`. The keeper must be an operator.

Sources that fail or disagree never move the price; they raise alerts instead.

```bash
pnpm install
cp .env.example .env   # fill in addresses and key
pnpm probe             # live source check, no chain access
pnpm once              # one full loop
pnpm start             # run forever
pnpm test
```

Source adapters: `fredCsv`, `bls`, `nyfed`, `eurostat`, `steam` (use `"scale": 0.87` to net out its ~15% seller fee), `skinport`, `economistBigMac`, `pricecharting` (token), and `attested` (operator-published JSON for assets with a single public source).
