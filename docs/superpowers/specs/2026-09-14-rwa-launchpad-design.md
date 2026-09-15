# RWA Launchpad — Design Spec

Date: 2026-09-14
Status: Draft for review

## 1. Summary

A memecoin launchpad on Robinhood Chain (chain id 4663) where every coin is paired with, priced in, and pays its fees in a **synthetic real-world asset**: house price indices, inflation, interest rates, trading cards, CS2 skins, and similar. It is inspired by pairex.market, which does the same for world currencies, and uses the pons v2 design as a reference for launch mechanics.

The project is global: no country-specific assets or branding.

### Why our own contracts

The pons v2 factory (`0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e`) only accepts pair tokens its owner approved (`approvedPairTokens(address)`). USDG is approved; self-minted synthetic tokens are not, as verified on-chain on 2026-09-14. pons already offers ~65 approved tokenized stocks and ETFs, so our differentiator is RWA that does not exist on-chain. Pairex solved the same problem with its own launchpad contracts (`0x46d3eb4eddf076bb44cf7164fa6568c93a603816`, `0x252beDA55e63604a872681f7700A867093d5DcAf`), and we take the same route.

### Sub-projects (built in this order; each gets its own implementation plan)

1. Synthetic RWA system (contracts + keeper)
2. Launchpad (factory, hook, graduation, fees, router)
3. Indexer & API
4. Frontend

## 2. Chain & shared infrastructure

| Item | Value |
|---|---|
| Chain | Robinhood Chain, id 4663, native ETH |
| RPC | `https://rpc.mainnet.chain.robinhood.com` (times out on wide `eth_getLogs`; backfill in chunks) |
| Uniswap v4 PoolManager | `0x8366a39cc670b4001a1121b8f6a443a643e40951` |
| Uniswap v4 PositionManager | `0x58daec3116aae6d93017baaea7749052e8a04fa7` |
| Permit2 | `0x000000000022D473030F116dDEE9F6B43aC78BA3` |
| Base dollar | USDG `0x5fc5360d0400a0fd4f2af552add042d716f1d168` |
| Explorer | robinhoodchain.blockscout.com |

Tooling: Solidity + Foundry, TypeScript + viem for off-chain services.

Admin model: one **owner multisig** and one **guardian multisig**. The guardian can only pause. See section 5 for what admin can and cannot do.

## 3. Sub-project 1 — Synthetic RWA system

### 3.1 Model

> **Revised 2026-09-15:** the RedemptionVault was removed. The wall is now two-sided: USDG paid for a synth stays in the wall as a bid one tick below the offer, so anyone can sell synth back to USDG through any router (third-party terminals no longer see a "100% sell tax"). Backing is first-come when a price rise leaves the wall short. Sections below that mention the vault, pots or the pro-rata haircut describe the original design.

Each asset is an ERC-20 whose full supply is minted once and placed into a Uniswap v4 synth/USDG position exactly **one tick wide**. A one-tick position is a flat wall: buyers get the synth at a single price. A keeper moves the wall when the real-world price changes. Sellers redeem synth for USDG from that asset's own pot. The protocol never owes more than a pot holds, and one asset can never drain another.

### 3.2 Contracts

| Contract | Responsibility |
|---|---|
| `AssetRegistry` | Asset list and per-asset parameters (below). Owner adds assets without redeploying. |
| `SynthToken` | Minimal ERC-20 implementation, deployed per asset as an EIP-1167 clone. No mint after creation, no owner. |
| `PriceWall` | Owns every wall position. `movePrice(assetId, newTick, sourcesHash)` is callable only by the keeper and only within bounds. |
| `WallHook` | v4 hook on synth/USDG pools that rejects liquidity from anyone except `PriceWall`, so third-party LPs can't distort the wall. |
| `RedemptionVault` | Holds each asset's USDG pot and handles `redeem(assetId, amount, minOut)`. |

Per-asset parameters in `AssetRegistry`:

- `symbol`, `name`, `category` (`MACRO` or `COLLECTIBLE`), `metadataURI` (sources and methodology)
- `unitScale`: how many real units one token represents. For example, 1 `sCHARIZARD` = 1/1000 of the card, which keeps token prices readable.
- `maxMoveBps`: largest allowed price change per update
- `minUpdateInterval`: shortest time allowed between updates
- `heartbeat`: after this much time without an update, the price counts as stale
- `wallSupply`: tokens minted into the wall
- `launchesEnabled`: whether new coins may pair with this asset

Default bounds by category:

| Category | `maxMoveBps` | `minUpdateInterval` | `heartbeat` | Source agreement threshold (off-chain) |
|---|---|---|---|---|
| MACRO | 500 (±5%) | 1 hour | 45 days | 0.5% |
| COLLECTIBLE | 2000 (±20%) | 1 hour | 48 hours | 10% |

### 3.3 Flows

**Buy synth:** a normal v4 swap USDG → synth against the wall. The USDG stays in the wall position.

**Sell synth at the wall:** a v4 swap synth → USDG fills against whatever USDG the current wall position holds, at the wall price.

**Move price (keeper):**
1. `PriceWall` checks the caller is the keeper, the asset isn't paused, `minUpdateInterval` has passed, and `|newPrice/oldPrice − 1| ≤ maxMoveBps`.
2. It withdraws the wall position and sends the USDG to the asset's pot in `RedemptionVault`.
3. It re-adds all remaining synth as a one-tick position at `newTick`.
4. It emits `PriceMoved(assetId, oldTick, newTick, sourcesHash, timestamp)`.

A change larger than `maxMoveBps` must be applied as several updates, each respecting `minUpdateInterval`.

**Redeem (sell to vault):** `redeem` pays `amount × wallPrice × ratio`, where `ratio = min(1, pot / liability)` and `liability = circulatingSynth × wallPrice`. Circulating synth is supply outside the wall and vault. The payout is minus a redemption fee (default 0.3%, sent to protocol). Redeemed synth goes back into the wall at the next move. The haircut is pro-rata and stateless, so there is no queue and no first-come advantage. The call reverts if the payout is below `minOut`.

**Staleness:** if `block.timestamp − lastUpdate > heartbeat`, the asset is stale. `LaunchFactory` refuses new launches paired with it. Trading, redemption, and existing coins keep working.

**Pause:** the guardian can pause an asset's `movePrice` and new launches. Swaps and redemptions are not pausable, so users can always exit.

### 3.4 Keeper service (off-chain, TypeScript)

- Runs one adapter per source. Each adapter returns `{price, observedAt, rawRef}`.
- Uses at least 2 independent sources per asset. Collectibles take the median over recent sales and drop outliers more than 3 MAD from the median.
- Submits only when sources agree within the category threshold, the price changed by more than a deadband (default 0.25%), and on-chain bounds allow it. When a single update can't cover the change, it steps toward the target.
- `sourcesHash` = keccak of the canonical JSON of source observations. The JSON is pinned to IPFS for auditability.
- Alerts when sources disagree, when an asset nears `heartbeat`, or when a transaction fails.

### 3.5 Initial asset candidates

All assets are added through `AssetRegistry`, so this list can change without redeploying.

| Symbol | Asset | Sources |
|---|---|---|
| `sCSUS` | S&P CoreLogic Case-Shiller U.S. National Home Price Index | FRED, S&P Dow Jones Indices |
| `sUSCPI` | U.S. CPI-U index | FRED, BLS |
| `sEUHPI` | Euro area House Price Index | Eurostat, ECB Data Portal |
| `sFEDFUNDS` | Effective Fed Funds Rate (price = rate value) | FRED, NY Fed |
| `sCHARIZARD` | Base Set Charizard PSA 10 (scaled) | PriceCharting, eBay sold listings |
| `sREDLINE` | AK-47 Redline (Field-Tested) | CSFloat, Steam Community Market |
| `sBIGMAC` | U.S. Big Mac price | The Economist Big Mac Index, menu price sampling |

### 3.6 Disclosed risks

- A sharp price rise can leave a pot short, and redemptions then take a pro-rata haircut.
- Keeper trust: a single operator, bounded by on-chain limits and a public audit trail.
- Macro data is published monthly with a 1–2 month lag.
- Collectible prices can be manipulated through wash sales, reduced but not eliminated by medians and multiple sources.

## 4. Sub-project 2 — Launchpad

### 4.1 Contracts

| Contract | Responsibility |
|---|---|
| `LaunchFactory` | `launch(params, configId, pairAsset)` payable. Deploys the token, initializes the v4 pool, places the curve position, and executes the optional first buy. Launch fee 0.0005 ETH. Accepts only `AssetRegistry` assets that are enabled and not stale, plus USDG. Also exposes `migrate(token)`. |
| `LaunchToken` | Fixed supply of 1,000,000,000 (18 decimals). No owner, mint, blacklist, or transfer tax. On-chain `logo`, `description`, `socials`. |
| `LaunchHook` | Singleton v4 hook for all launch pools. The pool LP fee is 0; the hook charges all fees in the pair asset. On a buy the fee comes off the input (`beforeSwap` delta); on a sell it comes off the output (`afterSwap` delta). It rejects third-party liquidity. The hook address is mined with CREATE2 for the required permission flags. |
| `FeeEscrow` | Pull-based claimable balances per `(recipient, asset)`. |
| `BuybackVault` | Accrues each coin's buyback budget, runs `executeBuyback(token)`, and holds bought tokens with linear vesting. |
| `LaunchLocker` | Receives the graduated full-range position NFT. Has no withdraw function. |
| `LaunchRouter` | Single-transaction entry for buy, sell, and launch-with-first-buy, paying in ETH, USDG, or the pair synth. It routes ETH → USDG → synth (wall) → coin, and the reverse. Enforces slippage and deadline. |

### 4.2 LaunchConfig

Configs are stored in an append-only list and snapshotted into each launch. Default config 0:

- supply 1,000,000,000
- curve allocation 714,285,714; reserve 285,714,286
- curve width 25,000 ticks (~12.2x from start to graduation price)
- `startMarketCapUsd` $4,000: at launch the factory converts this to a start tick using the pair asset's current wall price (USDG = $1), so every coin opens at the same USD market cap regardless of pair
- `maxCreatorTaxBps` 500
- `buybackVesting` 365 days

### 4.3 Fees

| Component | Rate | Goes to |
|---|---|---|
| Base fee | 1% | 70% creator, 30% protocol |
| Creator tax | 0–5%, fixed at launch | creator |
| Buyback share | 0–100% of the creator's portion (base 70% + tax), set at launch | `BuybackVault` for that coin |

All fees are denominated in the pair asset. Rates are the same on the curve and after graduation.

**Buyback:** `executeBuyback(token)` is permissionless. It spends the accrued pair asset buying the coin, with max price impact of 2% per call. When the impact would be higher, it buys the largest compliant amount; when even that is zero, the budget is credited to the creator in `FeeEscrow`. Bought tokens vest linearly to the creator's fee recipient over 365 days, with each buyback batch on its own schedule. The creator or anyone can call `release(token)`.

**Creator controls after launch:** change the fee recipient, and turn buyback on or off (only the creator can turn it on; the guardian can turn it off). Nothing else is mutable.

### 4.4 Lifecycle

1. **Launch:** the creator pays the launch fee plus an optional first buy (in USDG or the pair synth through the router; zero opens the curve untouched). The whole supply is minted to the factory; the curve allocation becomes a single-sided position across the curve range; the reserve stays in the factory, earmarked for the token.
2. **Trade on curve:** a normal v4 pool that aggregators can see from block 1.
3. **Ready to graduate:** the current price is above the curve range, meaning the curve position is fully converted to the pair asset.
4. **Migrate:** `migrate(token)` is permissionless, and a keeper calls it automatically. It succeeds only if the price is above the range at call time; otherwise it reverts and the coin stays on the curve. It removes the curve position, then adds the pair asset raised plus the reserve as a full-range position in **the same pool** at the current price. Reserve that doesn't fit at that price is burned. The position NFT is sent to `LaunchLocker`. It emits `Migrated`.

### 4.5 Errors & safety

- Custom errors for each revert reason: `AssetNotAllowed`, `AssetStale`, `ConfigDisabled`, `TaxTooHigh`, `NotReadyToMigrate`, `SlippageExceeded`, `DeadlineExpired`, `Unauthorized`.
- Reentrancy guards on factory, router, vault, and escrow. Hooks never make external calls to untrusted tokens.
- `launch` takes an `expectedConfigHash`. If the owner edits the config between the user's read and the launch, the launch reverts.

## 5. Admin powers

| Owner multisig can | Guardian can | Nobody can |
|---|---|---|
| Add assets, set bounds for new updates, enable/disable launches per asset, append/disable launch configs, set protocol fee recipient and keeper address | Pause wall moves and new launches per asset, turn off a coin's buyback | Withdraw locked liquidity, move escrow balances, change an existing coin's pair/tax/config, mint launch tokens or synth, pause swaps or redemptions |

## 6. Sub-project 3 — Indexer & API

- **Stack:** Ponder + Postgres, single service.
- **Indexed:** `LaunchFactory.Launched`, `LaunchFactory.Migrated`, `PoolManager.Swap` filtered to our hook pools, `LaunchHook.FeeTaken`, `FeeEscrow.Claimed`, `BuybackVault.BuybackExecuted` and `Released`, `PriceWall.PriceMoved`, `RedemptionVault.Redeemed`, `LaunchToken.Transfer` (holders).
- **Pricing:** coin price in the pair asset comes from `sqrtPriceX96` and token ordering. USD = pair price × wall price of the synth (USDG ≈ $1). Market cap is reported in both the pair asset and USD.
- **Read API:** coins (filter by asset/category, sort by market cap, newest, or volume), coin detail, candles (1m/5m/1h/1d), trades, holders, wallet portfolio, claimable fees and vesting, assets (price, history, sources, pot health = pot/liability, staleness).

## 7. Sub-project 4 — Frontend

- **Stack:** Next.js (App Router), wagmi + viem, RainbowKit, lightweight-charts. Images go to IPFS.
- **Pages:**
  - Explore: filter by category and asset.
  - Launch: name, ticker, image, pair asset, creator tax, buyback share, first buy paid in ETH, USDG, or synth.
  - Coin: chart in pair asset or USD, buy/sell via router, curve progress, trades, holders, "Migrate" button when ready.
  - Assets: price, sources, last update, pot health, haircut risk.
  - Portfolio.
  - Earnings: claims and vesting.
  - Docs.
- **UX safety:** simulate every transaction before signing, show stale/paused banners, set default slippage from quoted price impact, and warn clearly on pot haircut before redeeming.

## 8. Testing strategy

- Foundry unit tests per contract, and fuzz tests on fee math, wall moves, redemption ratio, and curve/migration math.
- Invariant tests:
  - The vault never pays out more than an asset's pot.
  - Escrow total liabilities equal escrow token balances.
  - Locked positions are never withdrawable.
  - Launch token supply is constant except burns.
- Fork tests against the real PoolManager and USDG on Robinhood Chain.
- Keeper: adapter unit tests with recorded fixtures, and an agreement/deadband/stepping simulation against a local anvil fork.
- Indexer: replay against a fork with scripted launches and trades; compare API prices to on-chain `slot0`.
- An external audit before mainnet for sub-projects 1 and 2.

## 9. Out of scope for v1

Snipe tax, holder fees (burn/claim share), community takeover flow, migration of external coins, multi-signer oracle committee, and third-party oracle feeds.

## 10. Implementation status (2026-09-14)

All four sub-projects are implemented and tested locally; nothing is deployed to mainnet.

| Sub-project | Where | Verification |
|---|---|---|
| 1. Synthetic RWA | `contracts/src/rwa`, `keeper/` | 52 contract tests incl. solvency invariant; fork test on live PoolManager/USDG; keeper moved a wall on the devnet from live Steam/Skinport prices |
| 2. Launchpad | `contracts/src/launchpad` | 76 contract tests incl. escrow-solvency fuzz; fork test of launch → sell-out → graduation → sell to USDG |
| 3. Indexer | `indexer/` | replayed the devnet; API values cross-checked against contract state |
| 4. Frontend | `web/` | buy, launch and fee claim exercised end to end in the browser against the devnet; production build passes |

### Deviations from this spec

- **SynthToken** is a plain ERC-20, not an EIP-1167 clone. **Keeper bounds** are stored in ticks (`maxMoveTicks`), not bps.
- **Wall pools reject synth → USDG swaps** from anyone but the PriceWall; holders exit only through the vault, which keeps the pro-rata haircut fair.
- **Socials** are twitter, telegram and website only.
- **Buyback vesting** is one 365-day duration on the vault with a weighted-start clock, rather than per-config, per-batch schedules.
- **`executeBuyback`** is limited to the fee recipient and owner-appointed operators, because a permissionless trigger can be sandwiched.
- **`LaunchRouter.buy`** clamps input to what the curve can still absorb and stops at the curve end price. Otherwise oversized buys paid fees on unused input and pushed the empty pool to absurd prices.
- **Native ETH payment** is not in v1; the router takes USDG or the underlying.
- **Initial assets** with two verified keyless sources: US CPI (BLS + FRED), Fed funds (NY Fed + FRED), euro-area HPI (Eurostat + BIS via FRED), AK-47 Redline (Steam ×0.87 + Skinport). Case-Shiller, Big Mac and Charizard need an attested or paid second source.
- **Macro agreement** is checked on the latest reporting period shared by both sources, because statistics mirrors can lag by months.
