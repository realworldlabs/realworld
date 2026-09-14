# RealWorld

A memecoin launchpad on Robinhood Chain where every coin is paired with a **synthetic real-world asset**: US inflation, euro-area house prices, the Fed funds rate, CS2 skins, trading cards, a Big Mac. Coins are bought with, priced in and pay creators in their underlying, and graduate into Uniswap v4 liquidity locked against it.

Design: [`docs/superpowers/specs/2026-09-14-rwa-launchpad-design.md`](docs/superpowers/specs/2026-09-14-rwa-launchpad-design.md) · Plans: [`docs/superpowers/plans/`](docs/superpowers/plans/)

## Repository

| Path | What | Stack |
|---|---|---|
| `contracts/` | Synthetic RWA stack (registry, price walls, redemption vault) and launchpad (factory, fee hook, escrow, buybacks, locker, router) | Solidity 0.8.26, Foundry, Uniswap v4 |
| `keeper/` | Moves price walls from agreeing real-world sources; graduates sold-out curves; runs buybacks | TypeScript, viem |
| `indexer/` | Indexes assets, launches, trades, candles, holders and fees; REST API | viem + drizzle (Postgres/PGlite) + Hono |
| `web/` | The trading app | Next.js 16, wagmi, RainbowKit, lightweight-charts |
| `packages/abi` | Contract ABIs generated from the Foundry build (`pnpm abi`) | |

## How it fits together

```
 real-world sources ──> keeper ──movePrice──> PriceWall (one-tick sell wall per synth) <──buy synth── USDG
                            │                        │ swept USDG
                            │                        v
                            │                 RedemptionVault (per-asset pot, pro-rata haircut) <──redeem── synth holders
                            │
                            ├─migrate────> LaunchFactory ──> v4 pool (curve) ──graduate──> LaunchLocker (add-only)
                            └─buyback────> BuybackVault         │ every swap
                                                                v
                                                          LaunchHook ──fees in the underlying──> FeeEscrow (claims)
 web ──trades/launches──> LaunchRouter (USDG ⇄ synth ⇄ coin in one tx)
 web <──data── indexer <──events── chain
```

## Local devnet

Requires Node 22+, pnpm, and Foundry (`~/.foundry/bin`).

```bash
pnpm install
(cd contracts && forge build) && pnpm abi
bash contracts/script/devnet.sh                          # anvil on :8545 with the stack, 3 underlyings, 4 coins, trades
(cd indexer && pnpm start)                               # API on :42069 (PGlite in indexer/.data)
cp web/.env.example web/.env.local                       # set NEXT_PUBLIC_DEVNET=true and local URLs
pnpm --filter @rwa/web dev                               # app on :3100; the unlocked anvil account connects automatically
```

Run the keeper against the devnet (live source data, local chain):

```bash
cd keeper
CHAIN_ID=31337 RPC_URL=http://127.0.0.1:8545 KEEPER_PRIVATE_KEY=<anvil key 0> \
REGISTRY=<assetRegistry> PRICE_WALL=<priceWall> FACTORY=<launchFactory> BUYBACK_VAULT=<buybackVault> \
ASSETS_FILE=assets.devnet.json node src/main.ts --once
```

## Tests

```bash
cd contracts && forge test                                        # 128 unit/fuzz/invariant tests
node script/rpc-proxy.mjs & forge test --match-path "test/fork/*" --fork-url http://127.0.0.1:8548   # live Robinhood Chain
pnpm -r test                                                      # keeper, indexer, web
pnpm --filter @rwa/web build
```

On Windows, `forge` gets connection resets from the public Robinhood RPC while `cast`/`curl` work; `contracts/script/rpc-proxy.mjs` forwards requests for fork runs.

## Mainnet deployment

Step-by-step runbook (Indonesian): [`docs/DEPLOY.md`](docs/DEPLOY.md). In short:


1. `pnpm --filter @rwa/keeper seed` writes opening prices from live, agreed sources to `contracts/deploy/initial-assets.json`.
2. `forge script script/DeployMainnet.s.sol` deploys everything, adds those underlyings, makes the keeper a buyback operator, hands ownership to `OWNER` (which must `acceptOwnership`) and writes `contracts/deployments/mainnet.json`.
3. Indexer and keeper run on Railway (`indexer/railway.json`, `keeper/railway.json`); the web app on Vercel with root directory `web`.

**Before real money:** an external audit of `contracts/src`; owner and guardian multisigs; a dedicated keeper key with alerting (`ALERT_WEBHOOK`); second sources for single-source assets (Big Mac, Case-Shiller) via `attested` feeds or paid APIs (`PRICECHARTING_TOKEN` for cards); a WalletConnect project id; legal review of offering synthetic exposure to these assets.
