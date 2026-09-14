# Synthetic RWA Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and test the on-chain half of sub-project 1 from `docs/superpowers/specs/2026-09-14-rwa-launchpad-design.md`: synthetic RWA tokens sold from keeper-moved one-tick Uniswap v4 walls, with per-asset USDG redemption pots.

**Architecture:** `AssetRegistry` owns asset parameters, roles, bounds, pause and staleness, and deploys each `SynthToken`. `PriceWall` holds every synth's float as a one-tick v4 position (fee 0, tick spacing 1) and re-parks the empty pool at a new tick when the keeper moves price. `WallHook` stops anyone but the PriceWall from creating wall pools, adding liquidity, or selling synth. `RedemptionVault` buys synth back from an asset's own pot at the wall price, applying a stateless pro-rata haircut when the pot is short.

**Tech Stack:** Solidity 0.8.26 (via-IR, cancun), Foundry 1.8, Uniswap v4-core `59d3ecf` via v4-periphery `dce236d`, OpenZeppelin Contracts v5.4.0.

**Deviations from spec (intentional, recorded here):**
- `SynthToken` is a plain `new` ERC-20 rather than an EIP-1167 clone. Deployment on this L2 is cheap, and a constructor-minted token avoids initializer risk.
- Keeper bounds are stored as `maxMoveTicks` (1 tick ≈ 1 bp) instead of bps, so the contract compares ticks without doing square roots.
- The wall pool rejects every synth→USDG swap except the PriceWall's own. Holders exit only through `RedemptionVault`, which makes the pro-rata haircut fair and keeps all USDG in the pot accounting.

**Verified facts this plan relies on (checked 2026-09-14):**
- v4 PoolManager on Robinhood Chain: `0x8366a39CC670B4001A1121B8F6A443A643e40951`. USDG: `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`, **6 decimals**. The CREATE2 deployer `0x4e59…956C` exists.
- With zero liquidity in range, `PoolManager.swap(amountSpecified = -1, sqrtPriceLimitX96 = target)` moves the price to `target` at no cost. This is how the wall is re-parked.
- Hook return deltas are from the hook's perspective, and the caller receives `swapDelta - hookDelta` (`Hooks.sol` lines 285-315). Only relevant for sub-project 2.
- v4-core only compiles with via-IR when `optimizer_runs` is high. With 800 runs, `Pool.swap` hits "stack too deep", so this plan uses `44444444`, which matches v4-core.
- On this Windows machine `forge --fork-url https://rpc.mainnet.chain.robinhood.com` fails with connection resets while `cast`, `curl` and `node` succeed. Fork runs go through `script/rpc-proxy.mjs`.

## File Structure

```
contracts/
  foundry.toml, remappings.txt, .gitignore
  lib/v4-periphery (submodule @dce236d; its lib/v4-core @59d3ecf)
  lib/openzeppelin-contracts (submodule @v5.4.0)
  src/common/HookStub.sol            reverting IHooks base shared by all hooks
  src/libraries/PriceMath.sol        tick <-> human price (quote per base, 1e18)
  src/rwa/interfaces/IAssetRegistry.sol
  src/rwa/interfaces/IPriceWall.sol
  src/rwa/interfaces/IRedemptionVault.sol
  src/rwa/SynthToken.sol             fixed-supply ERC-20
  src/rwa/AssetRegistry.sol          params, roles, bounds, pause, staleness
  src/rwa/WallHook.sol               access guard for wall pools
  src/rwa/PriceWall.sol              one-tick wall positions, moves, harvest
  src/rwa/RedemptionVault.sol        per-asset pots, pro-rata redemption
  script/RobinhoodChain.sol          canonical chain addresses
  script/utils/HookMiner.sol         CREATE2 salt miner (from v4-periphery, MIT)
  script/DeployRwa.s.sol             deployment
  script/rpc-proxy.mjs               local RPC forwarder for fork runs
  test/utils/MockUSDG.sol, test/utils/RwaFixture.sol
  test/libraries/PriceMath.t.sol
  test/rwa/PriceWall.t.sol, AssetRegistry.t.sol, RedemptionVault.t.sol, RwaInvariant.t.sol
  test/fork/RwaFork.t.sol
```

All commands run from `contracts/` with Foundry on PATH (`export PATH="$HOME/.foundry/bin:$PATH"`).

### Task 1: Scaffold the Foundry project

**Files:**
- Create: `contracts/foundry.toml`
- Create: `contracts/remappings.txt`
- Create: `contracts/.gitignore`
- Create: `contracts/script/rpc-proxy.mjs`
- Create: `contracts/script/RobinhoodChain.sol`


Dependencies are git submodules pinned to exact commits. Initialise only the nested submodules we need: the recursive permit2 checkout fails on Windows with `'$GIT_DIR' too big`, and nothing here uses permit2.

```bash
mkdir -p contracts && cd contracts
git submodule add https://github.com/Uniswap/v4-periphery lib/v4-periphery
(cd lib/v4-periphery && git checkout dce236d && git submodule update --init lib/v4-core && cd lib/v4-core && git submodule update --init lib/forge-std lib/solmate lib/openzeppelin-contracts)
git submodule add https://github.com/OpenZeppelin/openzeppelin-contracts lib/openzeppelin-contracts
(cd lib/openzeppelin-contracts && git checkout v5.4.0)
```

- [ ] **Step 1: Write `foundry.toml`**

`contracts/foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.26"
evm_version = "cancun"
via_ir = true
optimizer = true
optimizer_runs = 44444444
bytecode_hash = "none"
fs_permissions = [{ access = "read", path = "./" }]

[profile.default.fuzz]
runs = 256

[profile.default.invariant]
runs = 32
depth = 48
fail_on_revert = false

[rpc_endpoints]
robinhood = "https://rpc.mainnet.chain.robinhood.com"

[lint]
lint_on_build = false
```

- [ ] **Step 2: Write `remappings.txt`**

`contracts/remappings.txt`:

```text
@uniswap/v4-core/=lib/v4-periphery/lib/v4-core/
@uniswap/v4-periphery/=lib/v4-periphery/
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
forge-std/=lib/v4-periphery/lib/v4-core/lib/forge-std/src/
solmate/=lib/v4-periphery/lib/v4-core/lib/solmate/
```

- [ ] **Step 3: Write `.gitignore`**

`contracts/.gitignore`:

```text
out/
cache/
broadcast/*/dry-run/
.env
```

- [ ] **Step 4: Write `rpc-proxy.mjs`**

`contracts/script/rpc-proxy.mjs`:

```js
// Local JSON-RPC forwarder. forge on Windows gets connection resets from the Robinhood RPC;
// point --fork-url at this proxy instead: node script/rpc-proxy.mjs
import http from "node:http";
const UP = process.env.UPSTREAM ?? "https://rpc.mainnet.chain.robinhood.com";
const PORT = Number(process.env.PORT ?? 8548);
http.createServer(async (req, res) => {
  let body = ""; for await (const c of req) body += c;
  try {
    const r = await fetch(UP, { method: "POST", headers: { "content-type": "application/json" }, body });
    const t = await r.text(); res.writeHead(r.status, { "content-type": "application/json" }); res.end(t);
  } catch (e) { res.writeHead(502); res.end(String(e)); }
}).listen(PORT, "127.0.0.1", () => console.log(`RPC proxy on http://127.0.0.1:${PORT} -> ${UP}`));
```

- [ ] **Step 5: Write `RobinhoodChain.sol`**

`contracts/script/RobinhoodChain.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @notice Canonical addresses on Robinhood Chain (chain id 4663), verified on-chain 2026-09-14.
library RobinhoodChain {
    uint256 internal constant CHAIN_ID = 4663;
    address internal constant POOL_MANAGER = 0x8366a39CC670B4001A1121B8F6A443A643e40951;
    address internal constant POSITION_MANAGER = 0x58daec3116aae6D93017bAAea7749052E8a04fA7;
    address internal constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    address internal constant USDG = 0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168;
    /// @notice Deterministic CREATE2 deployer proxy used by forge scripts.
    address internal constant CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;
}
```

- [ ] **Step 6: Verify**

Run: `forge build`
Expected: `Compiler run successful!` (nothing in src yet besides RobinhoodChain)

- [ ] **Step 7: Commit**

```bash
git add contracts/foundry.toml contracts/remappings.txt contracts/.gitignore contracts/script/rpc-proxy.mjs contracts/script/RobinhoodChain.sol .gitmodules contracts/lib
git commit -m "chore(contracts): scaffold foundry project with pinned v4 and OZ deps"
```

### Task 2: PriceMath library

**Files:**
- Create: `contracts/src/libraries/PriceMath.sol`
- Test: `contracts/test/libraries/PriceMath.t.sol`

- [ ] **Step 1: Write the test**

`contracts/test/libraries/PriceMath.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {PriceMath} from "../../src/libraries/PriceMath.sol";

contract PriceMathHarness {
    function tickAtPrice(uint256 price, bool baseIsToken0, uint256 scale) external pure returns (int24) {
        return PriceMath.tickAtPrice(price, baseIsToken0, scale);
    }
}

contract PriceMathTest is Test {
    uint256 internal constant SCALE = 1e30; // 18-dec base, 6-dec quote
    PriceMathHarness internal h = new PriceMathHarness();

    function test_knownPrice_token0() public pure {
        // $10 per synth: raw ratio 1e-11, tick = floor(log_1.0001(1e-11)) = -253298
        int24 tick = PriceMath.tickAtPrice(10e18, true, SCALE);
        assertEq(tick, -253298);
        assertApproxEqRel(PriceMath.priceAtTick(tick, true, SCALE), 10e18, 1e14);
    }

    function test_knownPrice_token1() public pure {
        int24 tick = PriceMath.tickAtPrice(10e18, false, SCALE);
        assertApproxEqRel(PriceMath.priceAtTick(tick, false, SCALE), 10e18, 1e14);
    }

    function test_priceZero_reverts() public {
        vm.expectRevert(PriceMath.PriceZero.selector);
        h.tickAtPrice(0, true, SCALE);
    }

    /// @dev Round trip stays within one tick (1 bp) across realistic prices ($0.0001 .. $10M).
    function testFuzz_roundTrip(uint256 price, bool baseIsToken0) public pure {
        price = bound(price, 1e14, 1e25);
        int24 tick = PriceMath.tickAtPrice(price, baseIsToken0, SCALE);
        assertGt(tick, TickMath.MIN_TICK);
        assertLt(tick, TickMath.MAX_TICK);
        assertApproxEqRel(PriceMath.priceAtTick(tick, baseIsToken0, SCALE), price, 1.01e14);
    }
}
```

- [ ] **Step 2: Run it and confirm it fails to compile or fails**

Run: `forge test --match-path test/libraries/PriceMath.t.sol`
Expected: compile error: `PriceMath.sol` not found

- [ ] **Step 3: Write `PriceMath.sol`**

`contracts/src/libraries/PriceMath.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {FullMath} from "@uniswap/v4-core/src/libraries/FullMath.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @notice Converts between pool ticks and a human price: quote units (1e18-scaled) per one whole base token.
/// @dev `scale` = 10 ** (18 + baseDecimals - quoteDecimals). For an 18-dec synth priced in 6-dec USDG, scale = 1e30.
///      `baseIsToken0` says whether the priced asset is currency0 of the pool.
library PriceMath {
    uint256 internal constant Q96 = 1 << 96;
    uint256 internal constant Q192 = 1 << 192;

    error PriceZero();

    /// @notice Price (quote per base, 1e18) at a tick.
    function priceAtTick(int24 tick, bool baseIsToken0, uint256 scale) internal pure returns (uint256) {
        uint160 sqrtP = TickMath.getSqrtPriceAtTick(tick);
        return priceAtSqrtPrice(sqrtP, baseIsToken0, scale);
    }

    /// @notice Price (quote per base, 1e18) at a sqrt price.
    function priceAtSqrtPrice(uint160 sqrtP, bool baseIsToken0, uint256 scale) internal pure returns (uint256) {
        // priceQ96 = (token1 raw / token0 raw) * 2^96
        uint256 priceQ96 = FullMath.mulDiv(sqrtP, sqrtP, Q96);
        if (baseIsToken0) return FullMath.mulDiv(priceQ96, scale, Q96);
        return FullMath.mulDiv(Q96, scale, priceQ96);
    }

    /// @notice Greatest tick whose sqrt price is <= the sqrt price implied by `price`.
    function tickAtPrice(uint256 price, bool baseIsToken0, uint256 scale) internal pure returns (int24) {
        if (price == 0) revert PriceZero();
        // ratioX192 = (token1 raw / token0 raw) * 2^192
        uint256 ratioX192 = baseIsToken0 ? FullMath.mulDiv(price, Q192, scale) : FullMath.mulDiv(scale, Q192, price);
        uint160 sqrtP = uint160(Math.sqrt(ratioX192));
        return TickMath.getTickAtSqrtPrice(sqrtP);
    }
}
```

- [ ] **Step 4: Verify**

Run: `forge test --match-path test/libraries/PriceMath.t.sol`
Expected: 4 passed (including `testFuzz_roundTrip` 256 runs)

- [ ] **Step 5: Commit**

```bash
git add contracts/src/libraries/PriceMath.sol contracts/test/libraries/PriceMath.t.sol
git commit -m "feat(contracts): add PriceMath tick/price conversion"
```

### Task 3: Interfaces, SynthToken, HookStub, AssetRegistry

**Files:**
- Create: `contracts/src/rwa/interfaces/IAssetRegistry.sol`
- Create: `contracts/src/rwa/interfaces/IPriceWall.sol`
- Create: `contracts/src/rwa/interfaces/IRedemptionVault.sol`
- Create: `contracts/src/rwa/SynthToken.sol`
- Create: `contracts/src/common/HookStub.sol`
- Create: `contracts/src/rwa/AssetRegistry.sol`


These compile together because the registry deploys synths and calls `IPriceWall.initWall`. The behaviour tests arrive in Tasks 4-5, once the fixture can deploy the full stack.

- [ ] **Step 1: Write `IAssetRegistry.sol`**

`contracts/src/rwa/interfaces/IAssetRegistry.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IAssetRegistry {
    enum Category {
        MACRO,
        COLLECTIBLE
    }

    struct AssetConfig {
        string name;
        string symbol;
        Category category;
        string metadataURI;
        /// @notice Real-world units represented by one whole token, 1e18-scaled (1e15 = 1/1000 of a unit).
        uint256 unitScale;
        /// @notice Largest tick change per update (1 tick ~= 1 bp).
        uint24 maxMoveTicks;
        uint32 minUpdateInterval;
        uint32 heartbeat;
        uint256 wallSupply;
    }

    struct AssetState {
        address token;
        int24 tick;
        uint64 lastUpdate;
        bool paused;
        bool launchesEnabled;
    }

    function owner() external view returns (address);
    function guardian() external view returns (address);
    function keeper() external view returns (address);
    function treasury() external view returns (address);
    function priceWall() external view returns (address);
    function vault() external view returns (address);

    function assetCount() external view returns (uint256);
    function getConfig(uint256 assetId) external view returns (AssetConfig memory);
    function getState(uint256 assetId) external view returns (AssetState memory);
    /// @notice Returns (true, id) when `token` is a registered synth.
    function assetIdOf(address token) external view returns (bool found, uint256 assetId);
    function isStale(uint256 assetId) external view returns (bool);
    function isLaunchable(uint256 assetId) external view returns (bool);

    function recordPriceUpdate(uint256 assetId, int24 newTick) external;
}
```

- [ ] **Step 2: Write `IPriceWall.sol`**

`contracts/src/rwa/interfaces/IPriceWall.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";

interface IPriceWall {
    function initWall(uint256 assetId, address token, int24 startTick) external;
    function harvest(uint256 assetId) external;
    function poolKeyOf(uint256 assetId) external view returns (PoolKey memory);
    function synthIsToken0(uint256 assetId) external view returns (bool);
    /// @notice USDG (1e18-scaled USD) per whole synth at the current wall tick.
    function priceX18(uint256 assetId) external view returns (uint256);
    /// @notice Synth and USDG currently held in the wall position.
    function wallBalances(uint256 assetId) external view returns (uint256 synthAmount, uint256 usdgAmount);
}
```

- [ ] **Step 3: Write `IRedemptionVault.sol`**

`contracts/src/rwa/interfaces/IRedemptionVault.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IRedemptionVault {
    function creditPot(uint256 assetId, uint256 amount) external;
    function pot(uint256 assetId) external view returns (uint256);
    function quoteRedeem(uint256 assetId, uint256 amount)
        external
        view
        returns (uint256 gross, uint256 fee, uint256 out, uint256 ratioX18);
    function redeem(uint256 assetId, uint256 amount, uint256 minOut, address to) external returns (uint256 out);
}
```

- [ ] **Step 4: Write `SynthToken.sol`**

`contracts/src/rwa/SynthToken.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Fixed-supply synthetic RWA token. The whole supply is minted once, to the PriceWall.
contract SynthToken is ERC20 {
    constructor(string memory name_, string memory symbol_, uint256 supply, address to) ERC20(name_, symbol_) {
        _mint(to, supply);
    }
}
```

- [ ] **Step 5: Write `HookStub.sol`**

`contracts/src/common/HookStub.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";

/// @notice Minimal hook base: every callback reverts unless a child overrides it.
/// @dev Children must only enable permissions for callbacks they override.
abstract contract HookStub is IHooks {
    IPoolManager public immutable poolManager;

    error NotPoolManager();
    error HookNotImplemented();

    constructor(IPoolManager poolManager_) {
        poolManager = poolManager_;
        Hooks.validateHookPermissions(IHooks(address(this)), getHookPermissions());
    }

    modifier onlyPoolManager() {
        if (msg.sender != address(poolManager)) revert NotPoolManager();
        _;
    }

    function getHookPermissions() public pure virtual returns (Hooks.Permissions memory);

    function beforeInitialize(address, PoolKey calldata, uint160) external virtual returns (bytes4) {
        revert HookNotImplemented();
    }

    function afterInitialize(address, PoolKey calldata, uint160, int24) external virtual returns (bytes4) {
        revert HookNotImplemented();
    }

    function beforeAddLiquidity(address, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        external
        virtual
        returns (bytes4)
    {
        revert HookNotImplemented();
    }

    function afterAddLiquidity(
        address,
        PoolKey calldata,
        ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) external virtual returns (bytes4, BalanceDelta) {
        revert HookNotImplemented();
    }

    function beforeRemoveLiquidity(address, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        external
        virtual
        returns (bytes4)
    {
        revert HookNotImplemented();
    }

    function afterRemoveLiquidity(
        address,
        PoolKey calldata,
        ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) external virtual returns (bytes4, BalanceDelta) {
        revert HookNotImplemented();
    }

    function beforeSwap(address, PoolKey calldata, SwapParams calldata, bytes calldata)
        external
        virtual
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        revert HookNotImplemented();
    }

    function afterSwap(address, PoolKey calldata, SwapParams calldata, BalanceDelta, bytes calldata)
        external
        virtual
        returns (bytes4, int128)
    {
        revert HookNotImplemented();
    }

    function beforeDonate(address, PoolKey calldata, uint256, uint256, bytes calldata)
        external
        virtual
        returns (bytes4)
    {
        revert HookNotImplemented();
    }

    function afterDonate(address, PoolKey calldata, uint256, uint256, bytes calldata)
        external
        virtual
        returns (bytes4)
    {
        revert HookNotImplemented();
    }
}
```

- [ ] **Step 6: Write `AssetRegistry.sol`**

`contracts/src/rwa/AssetRegistry.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IAssetRegistry} from "./interfaces/IAssetRegistry.sol";
import {IPriceWall} from "./interfaces/IPriceWall.sol";
import {SynthToken} from "./SynthToken.sol";

/// @notice Source of truth for synthetic assets: parameters, keeper bounds, pause and staleness.
contract AssetRegistry is IAssetRegistry, Ownable2Step {
    address public guardian;
    address public keeper;
    address public treasury;
    address public priceWall;
    address public vault;

    AssetConfig[] private _configs;
    AssetState[] private _states;
    mapping(address token => uint256 idPlusOne) private _idPlusOne;

    event Wired(address priceWall, address vault);
    event AssetAdded(uint256 indexed assetId, address indexed token, string symbol, int24 startTick);
    event PriceRecorded(uint256 indexed assetId, int24 oldTick, int24 newTick);
    event PausedSet(uint256 indexed assetId, bool paused);
    event LaunchesEnabledSet(uint256 indexed assetId, bool enabled);
    event BoundsUpdated(uint256 indexed assetId, uint24 maxMoveTicks, uint32 minUpdateInterval, uint32 heartbeat);
    event GuardianSet(address guardian);
    event KeeperSet(address keeper);
    event TreasurySet(address treasury);

    error AlreadyWired();
    error NotWired();
    error ZeroAddress();
    error Unauthorized();
    error UnknownAsset();
    error InvalidConfig();
    error AssetPaused();
    error UpdateTooSoon();
    error MoveTooLarge();

    constructor(address owner_, address guardian_, address keeper_, address treasury_) Ownable(owner_) {
        if (guardian_ == address(0) || keeper_ == address(0) || treasury_ == address(0)) revert ZeroAddress();
        guardian = guardian_;
        keeper = keeper_;
        treasury = treasury_;
    }

    modifier knownAsset(uint256 assetId) {
        if (assetId >= _states.length) revert UnknownAsset();
        _;
    }

    // ---------- wiring & roles ----------

    function wire(address priceWall_, address vault_) external onlyOwner {
        if (priceWall != address(0)) revert AlreadyWired();
        if (priceWall_ == address(0) || vault_ == address(0)) revert ZeroAddress();
        priceWall = priceWall_;
        vault = vault_;
        emit Wired(priceWall_, vault_);
    }

    function owner() public view override(IAssetRegistry, Ownable) returns (address) {
        return Ownable.owner();
    }

    function setGuardian(address guardian_) external onlyOwner {
        if (guardian_ == address(0)) revert ZeroAddress();
        guardian = guardian_;
        emit GuardianSet(guardian_);
    }

    function setKeeper(address keeper_) external onlyOwner {
        if (keeper_ == address(0)) revert ZeroAddress();
        keeper = keeper_;
        emit KeeperSet(keeper_);
    }

    function setTreasury(address treasury_) external onlyOwner {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        emit TreasurySet(treasury_);
    }

    // ---------- assets ----------

    function addAsset(AssetConfig calldata config, int24 startTick) external onlyOwner returns (uint256 assetId) {
        if (priceWall == address(0)) revert NotWired();
        _validateBounds(config.maxMoveTicks, config.minUpdateInterval, config.heartbeat);
        if (config.wallSupply == 0 || config.unitScale == 0 || bytes(config.symbol).length == 0) {
            revert InvalidConfig();
        }

        assetId = _states.length;
        SynthToken token = new SynthToken(config.name, config.symbol, config.wallSupply, priceWall);

        _configs.push(config);
        _states.push(
            AssetState({
                token: address(token),
                tick: startTick,
                lastUpdate: uint64(block.timestamp),
                paused: false,
                launchesEnabled: true
            })
        );
        _idPlusOne[address(token)] = assetId + 1;

        IPriceWall(priceWall).initWall(assetId, address(token), startTick);
        emit AssetAdded(assetId, address(token), config.symbol, startTick);
    }

    function updateBounds(uint256 assetId, uint24 maxMoveTicks, uint32 minUpdateInterval, uint32 heartbeat)
        external
        onlyOwner
        knownAsset(assetId)
    {
        _validateBounds(maxMoveTicks, minUpdateInterval, heartbeat);
        AssetConfig storage c = _configs[assetId];
        c.maxMoveTicks = maxMoveTicks;
        c.minUpdateInterval = minUpdateInterval;
        c.heartbeat = heartbeat;
        emit BoundsUpdated(assetId, maxMoveTicks, minUpdateInterval, heartbeat);
    }

    /// @notice Guardian or owner may pause; only the owner may unpause.
    function setPaused(uint256 assetId, bool paused) external knownAsset(assetId) {
        if (paused) {
            if (msg.sender != guardian && msg.sender != owner()) revert Unauthorized();
        } else {
            if (msg.sender != owner()) revert Unauthorized();
        }
        _states[assetId].paused = paused;
        emit PausedSet(assetId, paused);
    }

    function setLaunchesEnabled(uint256 assetId, bool enabled) external onlyOwner knownAsset(assetId) {
        _states[assetId].launchesEnabled = enabled;
        emit LaunchesEnabledSet(assetId, enabled);
    }

    /// @notice Validates and records a keeper price move. Called by the PriceWall before it moves liquidity.
    function recordPriceUpdate(uint256 assetId, int24 newTick) external knownAsset(assetId) {
        if (msg.sender != priceWall) revert Unauthorized();
        AssetState storage s = _states[assetId];
        AssetConfig storage c = _configs[assetId];
        if (s.paused) revert AssetPaused();
        if (block.timestamp < uint256(s.lastUpdate) + c.minUpdateInterval) revert UpdateTooSoon();
        int256 diff = int256(newTick) - int256(s.tick);
        if (diff < 0) diff = -diff;
        if (uint256(diff) > c.maxMoveTicks) revert MoveTooLarge();

        emit PriceRecorded(assetId, s.tick, newTick);
        s.tick = newTick;
        s.lastUpdate = uint64(block.timestamp);
    }

    // ---------- views ----------

    function assetCount() external view returns (uint256) {
        return _states.length;
    }

    function getConfig(uint256 assetId) external view knownAsset(assetId) returns (AssetConfig memory) {
        return _configs[assetId];
    }

    function getState(uint256 assetId) external view knownAsset(assetId) returns (AssetState memory) {
        return _states[assetId];
    }

    function assetIdOf(address token) external view returns (bool found, uint256 assetId) {
        uint256 v = _idPlusOne[token];
        if (v == 0) return (false, 0);
        return (true, v - 1);
    }

    function isStale(uint256 assetId) public view knownAsset(assetId) returns (bool) {
        return block.timestamp > uint256(_states[assetId].lastUpdate) + _configs[assetId].heartbeat;
    }

    function isLaunchable(uint256 assetId) external view knownAsset(assetId) returns (bool) {
        AssetState storage s = _states[assetId];
        return s.launchesEnabled && !s.paused && !isStale(assetId);
    }

    function _validateBounds(uint24 maxMoveTicks, uint32 minUpdateInterval, uint32 heartbeat) private pure {
        if (maxMoveTicks == 0 || heartbeat == 0 || heartbeat <= minUpdateInterval) revert InvalidConfig();
    }
}
```

- [ ] **Step 7: Verify**

Run: `forge build`
Expected: `Compiler run successful!`

- [ ] **Step 8: Commit**

```bash
git add contracts/src/rwa/interfaces/IAssetRegistry.sol contracts/src/rwa/interfaces/IPriceWall.sol contracts/src/rwa/interfaces/IRedemptionVault.sol contracts/src/rwa/SynthToken.sol contracts/src/common/HookStub.sol contracts/src/rwa/AssetRegistry.sol
git commit -m "feat(contracts): add asset registry, synth token and hook base"
```

### Task 4: WallHook and PriceWall

**Files:**
- Create: `contracts/src/rwa/WallHook.sol`
- Create: `contracts/src/rwa/PriceWall.sol`
- Test: `contracts/test/utils/MockUSDG.sol`
- Test: `contracts/test/utils/RwaFixture.sol`
- Test: `contracts/test/rwa/PriceWall.t.sol`

The fixture also deploys `RedemptionVault`, because PriceWall credits swept USDG to it. Write the vault file from Task 6 Step 3 now so the fixture compiles; its tests come in Task 6.

Every suite runs twice, with USDG deployed at a very high and a very low address, so the synth is token0 in one run and token1 in the other.

- [ ] **Step 1: Write the test**

`contracts/test/utils/MockUSDG.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice 6-decimal stand-in for USDG in local tests.
contract MockUSDG is ERC20 {
    constructor() ERC20("Global Dollar", "USDG") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
```

- [ ] **Step 2: Write the test**

`contracts/test/utils/RwaFixture.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Deployers} from "@uniswap/v4-core/test/utils/Deployers.sol";
import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {MockUSDG} from "./MockUSDG.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AssetRegistry} from "../../src/rwa/AssetRegistry.sol";
import {IAssetRegistry} from "../../src/rwa/interfaces/IAssetRegistry.sol";
import {WallHook} from "../../src/rwa/WallHook.sol";
import {PriceWall} from "../../src/rwa/PriceWall.sol";
import {RedemptionVault} from "../../src/rwa/RedemptionVault.sol";
import {PriceMath} from "../../src/libraries/PriceMath.sol";

/// @notice Deploys a local PoolManager plus the full synthetic RWA stack.
/// @dev `usdgAt()` lets child tests place USDG at a low or high address to cover both token orderings.
abstract contract RwaFixture is Deployers {
    uint256 internal constant PRICE_SCALE = 1e30; // 18-dec synth priced in 6-dec USDG
    address internal constant WALL_HOOK_ADDRESS = address(
        uint160(Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG)
            | uint160(0x4444 << 144)
    );

    address internal owner = makeAddr("owner");
    address internal guardian = makeAddr("guardian");
    address internal keeper = makeAddr("keeper");
    address internal treasury = makeAddr("treasury");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    MockUSDG internal usdgToken;
    AssetRegistry internal registry;
    WallHook internal wallHook;
    PriceWall internal priceWall;
    RedemptionVault internal vault;

    function usdgAt() internal pure virtual returns (address);

    function setUpRwa() internal {
        deployFreshManagerAndRouters();

        deployCodeTo("MockUSDG.sol:MockUSDG", usdgAt());
        usdgToken = MockUSDG(usdgAt());

        registry = new AssetRegistry(owner, guardian, keeper, treasury);
        deployCodeTo("WallHook.sol:WallHook", abi.encode(manager, registry), WALL_HOOK_ADDRESS);
        wallHook = WallHook(WALL_HOOK_ADDRESS);
        priceWall = new PriceWall(manager, registry, IHooks(WALL_HOOK_ADDRESS), address(usdgToken));
        vault = new RedemptionVault(registry, address(usdgToken));

        vm.prank(owner);
        registry.wire(address(priceWall), address(vault));
    }

    function macroConfig(string memory symbol) internal pure returns (IAssetRegistry.AssetConfig memory c) {
        c.name = symbol;
        c.symbol = symbol;
        c.category = IAssetRegistry.Category.MACRO;
        c.metadataURI = "ipfs://meta";
        c.unitScale = 1e18;
        c.maxMoveTicks = 500;
        c.minUpdateInterval = 1 hours;
        c.heartbeat = 45 days;
        c.wallSupply = 1_000_000_000e18;
    }

    /// @notice Adds an asset whose wall opens at `priceX18` USD per synth.
    function addAsset(string memory symbol, uint256 priceX18) internal returns (uint256 assetId) {
        address predicted = vm.computeCreateAddress(address(registry), vm.getNonce(address(registry)));
        bool synthIs0 = predicted < address(usdgToken);
        int24 tick = PriceMath.tickAtPrice(priceX18, synthIs0, PRICE_SCALE);
        vm.prank(owner);
        assetId = registry.addAsset(macroConfig(symbol), tick);
    }

    function tickFor(uint256 assetId, uint256 priceX18) internal view returns (int24) {
        return PriceMath.tickAtPrice(priceX18, priceWall.synthIsToken0(assetId), PRICE_SCALE);
    }

    function synthOf(uint256 assetId) internal view returns (IERC20) {
        return IERC20(registry.getState(assetId).token);
    }

    /// @notice Buys synth from the wall with an exact USDG input.
    function buySynth(uint256 assetId, address buyer, uint256 usdgIn) internal returns (uint256 synthOut) {
        PoolKey memory key = priceWall.poolKeyOf(assetId);
        bool synthIs0 = priceWall.synthIsToken0(assetId);
        usdgToken.mint(buyer, usdgIn);
        IERC20 synth = synthOf(assetId);
        uint256 before = synth.balanceOf(buyer);

        vm.startPrank(buyer);
        usdgToken.approve(address(swapRouter), usdgIn);
        swapRouter.swap(
            key,
            SwapParams({
                zeroForOne: !synthIs0,
                amountSpecified: -int256(usdgIn),
                sqrtPriceLimitX96: synthIs0 ? MAX_PRICE_LIMIT : MIN_PRICE_LIMIT
            }),
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}),
            ""
        );
        vm.stopPrank();
        synthOut = synth.balanceOf(buyer) - before;
    }

    function movePrice(uint256 assetId, int24 newTick) internal {
        vm.prank(keeper);
        priceWall.movePrice(assetId, newTick, keccak256("sources"));
    }
}
```

- [ ] **Step 3: Write the test**

`contracts/test/rwa/PriceWall.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {SwapParams, ModifyLiquidityParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {AssetRegistry} from "../../src/rwa/AssetRegistry.sol";
import {PriceWall} from "../../src/rwa/PriceWall.sol";
import {RwaFixture} from "../utils/RwaFixture.sol";

abstract contract PriceWallTestBase is RwaFixture {
    uint256 internal assetId;

    function setUp() public {
        setUpRwa();
        assetId = addAsset("sCSUS", 10e18); // $10 per synth
    }

    function test_addAsset_depositsWholeSupplyAtPrice() public view {
        (uint256 synthInWall, uint256 usdgInWall) = priceWall.wallBalances(assetId);
        assertApproxEqRel(synthInWall, 1_000_000_000e18, 1e12); // within 0.0001%
        assertEq(usdgInWall, 0);
        assertApproxEqRel(priceWall.priceX18(assetId), 10e18, 2e14); // within 0.02%
    }

    function test_buySynth_fillsAtWallPrice() public {
        uint256 out = buySynth(assetId, alice, 1_000e6);
        assertApproxEqRel(out, 100e18, 3e14); // $1000 / $10, within 0.03%
        (, uint256 usdgInWall) = priceWall.wallBalances(assetId);
        assertApproxEqAbs(usdgInWall, 1_000e6, 2);
    }

    function test_sellSynth_reverts() public {
        uint256 out = buySynth(assetId, alice, 1_000e6);
        PoolKey memory key = priceWall.poolKeyOf(assetId);
        bool synthIs0 = priceWall.synthIsToken0(assetId);
        vm.startPrank(alice);
        synthOf(assetId).approve(address(swapRouter), out);
        vm.expectRevert();
        swapRouter.swap(
            key,
            SwapParams({
                zeroForOne: synthIs0,
                amountSpecified: -int256(out),
                sqrtPriceLimitX96: synthIs0 ? MIN_PRICE_LIMIT : MAX_PRICE_LIMIT
            }),
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}),
            ""
        );
        vm.stopPrank();
    }

    function test_thirdPartyLiquidity_reverts() public {
        PoolKey memory key = priceWall.poolKeyOf(assetId);
        vm.expectRevert();
        modifyLiquidityRouter.modifyLiquidity(key, ModifyLiquidityParams(-100, 100, 1e18, 0), "");
    }

    function test_movePrice_up_sweepsUsdgAndReprices() public {
        buySynth(assetId, alice, 1_000e6);
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, tickFor(assetId, 10.4e18));

        assertApproxEqAbs(vault.pot(assetId), 1_000e6, 2);
        assertApproxEqAbs(usdgToken.balanceOf(address(vault)), 1_000e6, 2);
        assertApproxEqRel(priceWall.priceX18(assetId), 10.4e18, 2e14);

        uint256 out = buySynth(assetId, bob, 1_040e6);
        assertApproxEqRel(out, 100e18, 3e14);
    }

    function test_movePrice_down_reprices() public {
        buySynth(assetId, alice, 1_000e6);
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, tickFor(assetId, 9.6e18));
        assertApproxEqRel(priceWall.priceX18(assetId), 9.6e18, 2e14);
        uint256 out = buySynth(assetId, bob, 960e6);
        assertApproxEqRel(out, 100e18, 3e14);
    }

    function test_movePrice_revertsForNonKeeper() public {
        int24 t = tickFor(assetId, 10.1e18);
        vm.warp(block.timestamp + 1 hours);
        vm.expectRevert(PriceWall.Unauthorized.selector);
        priceWall.movePrice(assetId, t, bytes32(0));
    }

    function test_movePrice_revertsTooSoon() public {
        int24 t = tickFor(assetId, 10.1e18);
        vm.prank(keeper);
        vm.expectRevert(AssetRegistry.UpdateTooSoon.selector);
        priceWall.movePrice(assetId, t, bytes32(0));
    }

    function test_movePrice_revertsTooLarge() public {
        int24 t = tickFor(assetId, 11e18); // ~953 ticks > 500
        vm.warp(block.timestamp + 1 hours);
        vm.prank(keeper);
        vm.expectRevert(AssetRegistry.MoveTooLarge.selector);
        priceWall.movePrice(assetId, t, bytes32(0));
    }

    function test_movePrice_revertsWhenPaused() public {
        vm.prank(guardian);
        registry.setPaused(assetId, true);
        int24 t = tickFor(assetId, 10.1e18);
        vm.warp(block.timestamp + 1 hours);
        vm.prank(keeper);
        vm.expectRevert(AssetRegistry.AssetPaused.selector);
        priceWall.movePrice(assetId, t, bytes32(0));
    }

    function test_harvest_sweepsWithoutMovingPrice() public {
        buySynth(assetId, alice, 500e6);
        uint256 priceBefore = priceWall.priceX18(assetId);
        priceWall.harvest(assetId);
        assertApproxEqAbs(vault.pot(assetId), 500e6, 2);
        assertEq(priceWall.priceX18(assetId), priceBefore);
        (, uint256 usdgInWall) = priceWall.wallBalances(assetId);
        assertEq(usdgInWall, 0);
    }
}

contract PriceWallSynthToken0Test is PriceWallTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(type(uint160).max - 0xffff);
    }

    function test_orientation() public view {
        assertTrue(priceWall.synthIsToken0(assetId));
    }
}

contract PriceWallSynthToken1Test is PriceWallTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(uint160(0x1000000));
    }

    function test_orientation() public view {
        assertFalse(priceWall.synthIsToken0(assetId));
    }
}
```

- [ ] **Step 4: Run it and confirm it fails to compile or fails**

Run: `forge test --match-path test/rwa/PriceWall.t.sol`
Expected: compile error: `WallHook.sol` / `PriceWall.sol` / `RedemptionVault.sol` not found

- [ ] **Step 5: Write `WallHook.sol`**

`contracts/src/rwa/WallHook.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {HookStub} from "../common/HookStub.sol";
import {IAssetRegistry} from "./interfaces/IAssetRegistry.sol";

/// @notice Guards synth/USDG wall pools: only the PriceWall may create pools or add liquidity,
///         and only the PriceWall may swap synth -> USDG. Everyone else can only buy synth.
contract WallHook is HookStub {
    IAssetRegistry public immutable registry;

    error OnlyPriceWall();
    error SellThroughVault();

    constructor(IPoolManager poolManager_, IAssetRegistry registry_) HookStub(poolManager_) {
        registry = registry_;
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory p) {
        p.beforeInitialize = true;
        p.beforeAddLiquidity = true;
        p.beforeSwap = true;
    }

    function beforeInitialize(address sender, PoolKey calldata, uint160)
        external
        view
        override
        onlyPoolManager
        returns (bytes4)
    {
        if (sender != registry.priceWall()) revert OnlyPriceWall();
        return this.beforeInitialize.selector;
    }

    function beforeAddLiquidity(address sender, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        external
        view
        override
        onlyPoolManager
        returns (bytes4)
    {
        if (sender != registry.priceWall()) revert OnlyPriceWall();
        return this.beforeAddLiquidity.selector;
    }

    function beforeSwap(address sender, PoolKey calldata key, SwapParams calldata params, bytes calldata)
        external
        view
        override
        onlyPoolManager
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        if (sender != registry.priceWall()) {
            (bool synthIs0,) = registry.assetIdOf(Currency.unwrap(key.currency0));
            // zeroForOne sends currency0 in: that is a sell when currency0 is the synth.
            if (params.zeroForOne == synthIs0) revert SellThroughVault();
        }
        return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }
}
```

- [ ] **Step 6: Write `PriceWall.sol`**

`contracts/src/rwa/PriceWall.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IUnlockCallback} from "@uniswap/v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {LiquidityAmounts} from "@uniswap/v4-periphery/src/libraries/LiquidityAmounts.sol";
import {SqrtPriceMath} from "@uniswap/v4-core/src/libraries/SqrtPriceMath.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {IAssetRegistry} from "./interfaces/IAssetRegistry.sol";
import {IPriceWall} from "./interfaces/IPriceWall.sol";
import {IRedemptionVault} from "./interfaces/IRedemptionVault.sol";
import {PriceMath} from "../libraries/PriceMath.sol";

/// @notice Holds each synth's entire float as a one-tick Uniswap v4 position priced in USDG.
///         The keeper moves the wall; USDG raised by the wall is swept into the RedemptionVault.
contract PriceWall is IPriceWall, IUnlockCallback, ReentrancyGuardTransient {
    using SafeERC20 for IERC20;
    using StateLibrary for IPoolManager;

    struct Wall {
        PoolKey key;
        bool synthIsToken0;
        int24 tickLower;
        int24 tickUpper;
        uint128 liquidity;
    }

    IPoolManager public immutable poolManager;
    IAssetRegistry public immutable registry;
    IHooks public immutable hook;
    Currency public immutable usdg;
    /// @dev 10 ** (18 + 18 - usdgDecimals)
    uint256 public immutable priceScale;

    mapping(uint256 assetId => Wall) private _walls;

    event WallReset(uint256 indexed assetId, int24 tick, uint128 liquidity, uint256 usdgSwept);
    event PriceMoved(uint256 indexed assetId, int24 newTick, bytes32 sourcesHash);

    error Unauthorized();
    error NotPoolManager();
    error WallExists();
    error NoWall();
    error TickOutOfRange();

    constructor(IPoolManager poolManager_, IAssetRegistry registry_, IHooks hook_, address usdg_) {
        poolManager = poolManager_;
        registry = registry_;
        hook = hook_;
        usdg = Currency.wrap(usdg_);
        priceScale = 10 ** (36 - uint256(IERC20Metadata(usdg_).decimals()));
    }

    // ---------- mutations ----------

    function initWall(uint256 assetId, address token, int24 startTick) external {
        if (msg.sender != address(registry)) revert Unauthorized();
        Wall storage w = _walls[assetId];
        if (w.key.tickSpacing != 0) revert WallExists();
        _checkTick(startTick);

        bool synthIs0 = token < Currency.unwrap(usdg);
        w.synthIsToken0 = synthIs0;
        w.key = PoolKey({
            currency0: synthIs0 ? Currency.wrap(token) : usdg,
            currency1: synthIs0 ? usdg : Currency.wrap(token),
            fee: 0,
            tickSpacing: 1,
            hooks: hook
        });

        poolManager.initialize(w.key, TickMath.getSqrtPriceAtTick(startTick));
        _reset(assetId, startTick);
    }

    /// @notice Keeper-only price move. Bounds are enforced by the registry.
    function movePrice(uint256 assetId, int24 newTick, bytes32 sourcesHash) external nonReentrant {
        if (msg.sender != registry.keeper()) revert Unauthorized();
        _checkTick(newTick);
        registry.recordPriceUpdate(assetId, newTick);
        _reset(assetId, newTick);
        emit PriceMoved(assetId, newTick, sourcesHash);
    }

    /// @notice Sweeps raised USDG into the vault and re-deposits idle synth at the current tick. Permissionless.
    function harvest(uint256 assetId) external nonReentrant {
        if (_walls[assetId].key.tickSpacing == 0) revert NoWall();
        _reset(assetId, registry.getState(assetId).tick);
    }

    function _reset(uint256 assetId, int24 tick) private {
        uint256 swept = abi.decode(poolManager.unlock(abi.encode(assetId, tick)), (uint256));
        if (swept > 0) IRedemptionVault(registry.vault()).creditPot(assetId, swept);
        emit WallReset(assetId, tick, _walls[assetId].liquidity, swept);
    }

    function unlockCallback(bytes calldata data) external returns (bytes memory) {
        if (msg.sender != address(poolManager)) revert NotPoolManager();
        (uint256 assetId, int24 tick) = abi.decode(data, (uint256, int24));
        Wall storage w = _walls[assetId];

        int256 net0;
        int256 net1;

        // 1. Pull the existing wall.
        if (w.liquidity > 0) {
            (BalanceDelta d,) = poolManager.modifyLiquidity(
                w.key, ModifyLiquidityParams(w.tickLower, w.tickUpper, -int256(uint256(w.liquidity)), 0), ""
            );
            net0 += d.amount0();
            net1 += d.amount1();
            w.liquidity = 0;
        }

        // 2. Park the (now empty) pool at the wall tick.
        uint160 target = TickMath.getSqrtPriceAtTick(tick);
        (uint160 current,,,) = poolManager.getSlot0(w.key.toId());
        if (current != target) {
            poolManager.swap(w.key, SwapParams({zeroForOne: target < current, amountSpecified: -1, sqrtPriceLimitX96: target}), "");
        }

        // 3. Re-deposit every synth this contract controls as a one-tick sell wall.
        (int24 lower, int24 upper) = w.synthIsToken0 ? (tick, tick + 1) : (tick - 1, tick);
        uint256 synthAvailable = IERC20(_synth(w)).balanceOf(address(this))
            + uint256(w.synthIsToken0 ? _positive(net0) : _positive(net1));
        uint160 sqrtA = TickMath.getSqrtPriceAtTick(lower);
        uint160 sqrtB = TickMath.getSqrtPriceAtTick(upper);
        uint128 liq = w.synthIsToken0
            ? LiquidityAmounts.getLiquidityForAmount0(sqrtA, sqrtB, synthAvailable)
            : LiquidityAmounts.getLiquidityForAmount1(sqrtA, sqrtB, synthAvailable);
        if (liq > 0) {
            (BalanceDelta d,) = poolManager.modifyLiquidity(
                w.key, ModifyLiquidityParams(lower, upper, int256(uint256(liq)), 0), ""
            );
            net0 += d.amount0();
            net1 += d.amount1();
        }
        w.tickLower = lower;
        w.tickUpper = upper;
        w.liquidity = liq;

        // 4. Settle: synth stays here, USDG goes to the vault.
        (int256 synthNet, int256 usdgNet) = w.synthIsToken0 ? (net0, net1) : (net1, net0);
        _settle(Currency.wrap(_synth(w)), synthNet, address(this));
        _settle(usdg, usdgNet, registry.vault());
        return abi.encode(usdgNet > 0 ? uint256(usdgNet) : 0);
    }

    function _settle(Currency currency, int256 net, address takeTo) private {
        if (net > 0) {
            poolManager.take(currency, takeTo, uint256(net));
        } else if (net < 0) {
            poolManager.sync(currency);
            IERC20(Currency.unwrap(currency)).safeTransfer(address(poolManager), uint256(-net));
            poolManager.settle();
        }
    }

    // ---------- views ----------

    function poolKeyOf(uint256 assetId) external view returns (PoolKey memory) {
        return _walls[assetId].key;
    }

    function synthIsToken0(uint256 assetId) external view returns (bool) {
        return _walls[assetId].synthIsToken0;
    }

    function priceX18(uint256 assetId) external view returns (uint256) {
        Wall storage w = _walls[assetId];
        if (w.key.tickSpacing == 0) revert NoWall();
        int24 tick = w.synthIsToken0 ? w.tickLower : w.tickUpper;
        return PriceMath.priceAtTick(tick, w.synthIsToken0, priceScale);
    }

    function wallBalances(uint256 assetId) external view returns (uint256 synthAmount, uint256 usdgAmount) {
        Wall storage w = _walls[assetId];
        if (w.liquidity == 0) return (0, 0);
        (uint160 sqrtP,,,) = poolManager.getSlot0(w.key.toId());
        uint160 sqrtA = TickMath.getSqrtPriceAtTick(w.tickLower);
        uint160 sqrtB = TickMath.getSqrtPriceAtTick(w.tickUpper);
        if (sqrtP < sqrtA) sqrtP = sqrtA;
        if (sqrtP > sqrtB) sqrtP = sqrtB;
        uint256 a0 = SqrtPriceMath.getAmount0Delta(sqrtP, sqrtB, w.liquidity, false);
        uint256 a1 = SqrtPriceMath.getAmount1Delta(sqrtA, sqrtP, w.liquidity, false);
        return w.synthIsToken0 ? (a0, a1) : (a1, a0);
    }

    function _synth(Wall storage w) private view returns (address) {
        return Currency.unwrap(w.synthIsToken0 ? w.key.currency0 : w.key.currency1);
    }

    function _positive(int256 x) private pure returns (int256) {
        return x > 0 ? x : int256(0);
    }

    function _checkTick(int24 tick) private pure {
        if (tick <= TickMath.MIN_TICK || tick >= TickMath.MAX_TICK) revert TickOutOfRange();
    }
}
```

- [ ] **Step 7: Verify**

Run: `forge test --match-path test/rwa/PriceWall.t.sol`
Expected: 24 passed (12 per orientation)

- [ ] **Step 8: Commit**

```bash
git add contracts/src/rwa/WallHook.sol contracts/src/rwa/PriceWall.sol contracts/test/utils/MockUSDG.sol contracts/test/utils/RwaFixture.sol contracts/test/rwa/PriceWall.t.sol contracts/src/rwa/RedemptionVault.sol
git commit -m "feat(contracts): add PriceWall one-tick wall and WallHook guard"
```

### Task 5: AssetRegistry behaviour tests

**Files:**

- Test: `contracts/test/rwa/AssetRegistry.t.sol`

- [ ] **Step 1: Write the test**

`contracts/test/rwa/AssetRegistry.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AssetRegistry} from "../../src/rwa/AssetRegistry.sol";
import {IAssetRegistry} from "../../src/rwa/interfaces/IAssetRegistry.sol";
import {RwaFixture} from "../utils/RwaFixture.sol";

contract AssetRegistryTest is RwaFixture {
    uint256 internal assetId;

    function usdgAt() internal pure override returns (address) {
        return address(uint160(0x1000000));
    }

    function setUp() public {
        setUpRwa();
        assetId = addAsset("sCSUS", 10e18);
    }

    function test_addAsset_recordsState() public view {
        assertEq(registry.assetCount(), 1);
        IAssetRegistry.AssetState memory s = registry.getState(assetId);
        assertTrue(s.token != address(0));
        assertTrue(s.launchesEnabled);
        assertFalse(s.paused);
        assertEq(s.lastUpdate, block.timestamp);
        (bool found, uint256 id) = registry.assetIdOf(s.token);
        assertTrue(found);
        assertEq(id, assetId);
        assertEq(registry.getConfig(assetId).symbol, "sCSUS");
    }

    function test_addAsset_onlyOwner() public {
        IAssetRegistry.AssetConfig memory c = macroConfig("sX");
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, address(this)));
        registry.addAsset(c, 0);
    }

    function test_addAsset_rejectsBadBounds() public {
        IAssetRegistry.AssetConfig memory c = macroConfig("sX");
        c.heartbeat = c.minUpdateInterval;
        vm.prank(owner);
        vm.expectRevert(AssetRegistry.InvalidConfig.selector);
        registry.addAsset(c, 0);
    }

    function test_wire_onlyOnce() public {
        vm.prank(owner);
        vm.expectRevert(AssetRegistry.AlreadyWired.selector);
        registry.wire(address(1), address(2));
    }

    function test_pause_guardianCanPauseButNotUnpause() public {
        vm.prank(guardian);
        registry.setPaused(assetId, true);
        assertFalse(registry.isLaunchable(assetId));

        vm.prank(guardian);
        vm.expectRevert(AssetRegistry.Unauthorized.selector);
        registry.setPaused(assetId, false);

        vm.prank(owner);
        registry.setPaused(assetId, false);
        assertTrue(registry.isLaunchable(assetId));
    }

    function test_pause_strangerCannotPause() public {
        vm.prank(alice);
        vm.expectRevert(AssetRegistry.Unauthorized.selector);
        registry.setPaused(assetId, true);
    }

    function test_staleness_blocksLaunchesAfterHeartbeat() public {
        assertFalse(registry.isStale(assetId));
        vm.warp(block.timestamp + 45 days + 1);
        assertTrue(registry.isStale(assetId));
        assertFalse(registry.isLaunchable(assetId));

        movePrice(assetId, registry.getState(assetId).tick + 10);
        assertFalse(registry.isStale(assetId));
        assertTrue(registry.isLaunchable(assetId));
    }

    function test_setLaunchesEnabled() public {
        vm.prank(owner);
        registry.setLaunchesEnabled(assetId, false);
        assertFalse(registry.isLaunchable(assetId));
    }

    function test_recordPriceUpdate_onlyPriceWall() public {
        vm.expectRevert(AssetRegistry.Unauthorized.selector);
        registry.recordPriceUpdate(assetId, 0);
    }

    function test_updateBounds() public {
        vm.prank(owner);
        registry.updateBounds(assetId, 2000, 1 hours, 48 hours);
        IAssetRegistry.AssetConfig memory c = registry.getConfig(assetId);
        assertEq(c.maxMoveTicks, 2000);
        assertEq(c.heartbeat, 48 hours);
    }

    function test_unknownAsset_reverts() public {
        vm.expectRevert(AssetRegistry.UnknownAsset.selector);
        registry.getState(99);
    }
}
```

- [ ] **Step 2: Verify**

Run: `forge test --match-path test/rwa/AssetRegistry.t.sol`
Expected: 11 passed

- [ ] **Step 3: Commit**

```bash
git add contracts/test/rwa/AssetRegistry.t.sol
git commit -m "test(contracts): cover registry roles, bounds, pause and staleness"
```

### Task 6: RedemptionVault

**Files:**
- Create: `contracts/src/rwa/RedemptionVault.sol`
- Test: `contracts/test/rwa/RedemptionVault.t.sol`

- [ ] **Step 1: Write the test**

`contracts/test/rwa/RedemptionVault.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {RedemptionVault} from "../../src/rwa/RedemptionVault.sol";
import {RwaFixture} from "../utils/RwaFixture.sol";

abstract contract RedemptionVaultTestBase is RwaFixture {
    uint256 internal assetId;

    function setUp() public {
        setUpRwa();
        assetId = addAsset("sCSUS", 10e18);
    }

    function _redeemAll(address who) internal returns (uint256 out) {
        IERC20 synth = synthOf(assetId);
        uint256 bal = synth.balanceOf(who);
        vm.startPrank(who);
        synth.approve(address(vault), bal);
        out = vault.redeem(assetId, bal, 0, who);
        vm.stopPrank();
    }

    function test_redeem_fullValueWhenPotCovers() public {
        buySynth(assetId, alice, 1_000e6);
        uint256 out = _redeemAll(alice);
        // 1000 USDG back minus 0.3% fee, allowing wall rounding
        assertApproxEqRel(out, 997e6, 5e14);
        assertApproxEqRel(usdgToken.balanceOf(treasury), 3e6, 5e14);
        // redeemed synth returns to the wall
        assertEq(synthOf(assetId).balanceOf(alice), 0);
    }

    function test_redeem_haircutAfterPriceRise() public {
        buySynth(assetId, alice, 1_000e6);
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, tickFor(assetId, 10.45e18)); // +4.5%

        (, , , uint256 ratio) = vault.quoteRedeem(assetId, 1e18);
        assertApproxEqRel(ratio, uint256(1e18) * 1000 / 1045, 1e15);

        uint256 out = _redeemAll(alice);
        // Pot is only 1000 USDG: she gets the whole pot minus the fee.
        assertApproxEqRel(out, 997e6, 1e15);
        assertLe(usdgToken.balanceOf(address(vault)), 2);
    }

    function test_redeem_proRataBetweenHolders() public {
        buySynth(assetId, alice, 1_000e6);
        buySynth(assetId, bob, 1_000e6);
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, tickFor(assetId, 10.45e18));

        uint256 outAlice = _redeemAll(alice);
        uint256 outBob = _redeemAll(bob);
        // Both take the same haircut regardless of order.
        assertApproxEqRel(outAlice, outBob, 1e15);
        assertApproxEqRel(outAlice + outBob, 1_994e6, 1e15);
    }

    function test_redeem_fullValueAfterPriceFall() public {
        buySynth(assetId, alice, 1_000e6);
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, tickFor(assetId, 9.6e18));
        uint256 out = _redeemAll(alice);
        assertApproxEqRel(out, 960e6 * 997 / 1000, 1e15);
        // Surplus stays in the pot for later holders.
        assertApproxEqRel(vault.pot(assetId), 40e6, 1e16);
    }

    function test_redeem_revertsBelowMinOut() public {
        buySynth(assetId, alice, 1_000e6);
        IERC20 synth = synthOf(assetId);
        uint256 bal = synth.balanceOf(alice);
        vm.startPrank(alice);
        synth.approve(address(vault), bal);
        vm.expectRevert(RedemptionVault.InsufficientOutput.selector);
        vault.redeem(assetId, bal, 1_000e6, alice);
        vm.stopPrank();
    }

    function test_creditPot_onlyPriceWall() public {
        vm.expectRevert(RedemptionVault.Unauthorized.selector);
        vault.creditPot(assetId, 1);
    }
}

contract RedemptionVaultSynthToken0Test is RedemptionVaultTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(type(uint160).max - 0xffff);
    }
}

contract RedemptionVaultSynthToken1Test is RedemptionVaultTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(uint160(0x1000000));
    }
}
```

- [ ] **Step 2: Run it and confirm it fails to compile or fails**

Run: `forge test --match-path test/rwa/RedemptionVault.t.sol`
Expected: tests fail if the vault is missing the haircut (for example `test_redeem_proRataBetweenHolders` pays Alice in full and Bob underflows)

- [ ] **Step 3: Write `RedemptionVault.sol`**

`contracts/src/rwa/RedemptionVault.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IAssetRegistry} from "./interfaces/IAssetRegistry.sol";
import {IPriceWall} from "./interfaces/IPriceWall.sol";
import {IRedemptionVault} from "./interfaces/IRedemptionVault.sol";

/// @notice Buys synth back for USDG out of that asset's own pot, at the wall price,
///         with a pro-rata haircut when the pot cannot cover every holder.
contract RedemptionVault is IRedemptionVault, ReentrancyGuardTransient {
    using SafeERC20 for IERC20;

    uint256 public constant REDEEM_FEE_BPS = 30;
    uint256 private constant BPS = 10_000;
    uint256 private constant ONE = 1e18;

    IAssetRegistry public immutable registry;
    IERC20 public immutable usdg;
    /// @dev 10 ** (36 - usdgDecimals): converts synth(1e18) * price(1e18) into USDG units.
    uint256 private immutable _valueDivisor;

    mapping(uint256 assetId => uint256) public pot;

    event PotCredited(uint256 indexed assetId, uint256 amount);
    event Redeemed(
        uint256 indexed assetId, address indexed from, address indexed to, uint256 synthIn, uint256 usdgOut, uint256 fee
    );

    error Unauthorized();
    error ZeroAmount();
    error InsufficientOutput();

    constructor(IAssetRegistry registry_, address usdg_) {
        registry = registry_;
        usdg = IERC20(usdg_);
        _valueDivisor = 10 ** (36 - uint256(IERC20Metadata(usdg_).decimals()));
    }

    function creditPot(uint256 assetId, uint256 amount) external {
        if (msg.sender != registry.priceWall()) revert Unauthorized();
        pot[assetId] += amount;
        emit PotCredited(assetId, amount);
    }

    function quoteRedeem(uint256 assetId, uint256 amount)
        public
        view
        returns (uint256 gross, uint256 fee, uint256 out, uint256 ratioX18)
    {
        IPriceWall wall = IPriceWall(registry.priceWall());
        address token = registry.getState(assetId).token;
        uint256 price = wall.priceX18(assetId);
        (uint256 wallSynth, uint256 wallUsdg) = wall.wallBalances(assetId);

        uint256 circulating = IERC20(token).totalSupply() - IERC20(token).balanceOf(address(wall)) - wallSynth;
        uint256 liability = Math.mulDiv(circulating, price, _valueDivisor);
        uint256 potTotal = pot[assetId] + wallUsdg;
        uint256 value = Math.mulDiv(amount, price, _valueDivisor);

        if (liability == 0 || potTotal >= liability) {
            ratioX18 = ONE;
            gross = value;
        } else {
            ratioX18 = Math.mulDiv(potTotal, ONE, liability);
            gross = Math.mulDiv(value, potTotal, liability);
        }
        fee = Math.mulDiv(gross, REDEEM_FEE_BPS, BPS);
        out = gross - fee;
    }

    function redeem(uint256 assetId, uint256 amount, uint256 minOut, address to)
        external
        nonReentrant
        returns (uint256 out)
    {
        if (amount == 0) revert ZeroAmount();
        uint256 gross;
        uint256 fee;
        (gross,,,) = quoteRedeem(assetId, amount);

        IPriceWall wall = IPriceWall(registry.priceWall());
        if (gross > pot[assetId]) wall.harvest(assetId);
        // The view estimate of wall USDG can differ from the swept amount by rounding.
        if (gross > pot[assetId]) gross = pot[assetId];
        fee = Math.mulDiv(gross, REDEEM_FEE_BPS, BPS);
        out = gross - fee;
        if (out < minOut || out == 0) revert InsufficientOutput();
        pot[assetId] -= gross;

        IERC20(registry.getState(assetId).token).safeTransferFrom(msg.sender, address(wall), amount);
        if (fee > 0) usdg.safeTransfer(registry.treasury(), fee);
        usdg.safeTransfer(to, out);
        emit Redeemed(assetId, msg.sender, to, amount, out, fee);
    }
}
```

- [ ] **Step 4: Verify**

Run: `forge test --match-path test/rwa/RedemptionVault.t.sol`
Expected: 12 passed (6 per orientation)

- [ ] **Step 5: Commit**

```bash
git add contracts/src/rwa/RedemptionVault.sol contracts/test/rwa/RedemptionVault.t.sol
git commit -m "feat(contracts): add RedemptionVault with pro-rata haircut"
```

### Task 7: Solvency invariant

**Files:**

- Test: `contracts/test/rwa/RwaInvariant.t.sol`

- [ ] **Step 1: Write the test**

`contracts/test/rwa/RwaInvariant.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {RwaFixture} from "../utils/RwaFixture.sol";

/// @notice Random buys, price moves, harvests and redemptions against one asset.
contract RwaHandler is Test {
    RwaFixtureHarness internal f;
    address[] internal actors;

    constructor(RwaFixtureHarness f_) {
        f = f_;
        actors.push(makeAddr("h1"));
        actors.push(makeAddr("h2"));
        actors.push(makeAddr("h3"));
    }

    function buy(uint256 actorSeed, uint256 usdgIn) external {
        usdgIn = bound(usdgIn, 1e6, 50_000e6);
        f.doBuy(actors[actorSeed % actors.length], usdgIn);
    }

    function move(int256 tickDelta) external {
        tickDelta = bound(tickDelta, -500, 500);
        f.doMove(int24(tickDelta));
    }

    function harvest() external {
        f.doHarvest();
    }

    function redeem(uint256 actorSeed, uint256 fraction) external {
        fraction = bound(fraction, 1, 100);
        f.doRedeem(actors[actorSeed % actors.length], fraction);
    }
}

contract RwaFixtureHarness is RwaFixture {
    uint256 public assetId;

    function usdgAt() internal pure override returns (address) {
        return address(uint160(0x1000000));
    }

    function init() external {
        setUpRwa();
        assetId = addAsset("sCSUS", 10e18);
    }

    function doBuy(address who, uint256 usdgIn) external {
        buySynth(assetId, who, usdgIn);
    }

    function doMove(int24 tickDelta) external {
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, registry.getState(assetId).tick + tickDelta);
    }

    function doHarvest() external {
        priceWall.harvest(assetId);
    }

    function doRedeem(address who, uint256 fraction) external {
        IERC20 synth = synthOf(assetId);
        uint256 amount = synth.balanceOf(who) * fraction / 100;
        if (amount == 0) return;
        vm.startPrank(who);
        synth.approve(address(vault), amount);
        try vault.redeem(assetId, amount, 0, who) {} catch {}
        vm.stopPrank();
    }

    function vaultUsdg() external view returns (uint256) {
        return usdgToken.balanceOf(address(vault));
    }

    function potOf() external view returns (uint256) {
        return vault.pot(assetId);
    }

    function synthSupplyAccounted() external view returns (bool) {
        IERC20 synth = synthOf(assetId);
        return synth.totalSupply() == 1_000_000_000e18;
    }
}

contract RwaInvariantTest is Test {
    RwaFixtureHarness internal f;
    RwaHandler internal handler;

    function setUp() public {
        f = new RwaFixtureHarness();
        f.init();
        handler = new RwaHandler(f);
        targetContract(address(handler));
    }

    /// @dev The vault holds exactly what its pots say: nobody can be paid out of another asset's money.
    function invariant_vaultBalanceMatchesPot() public view {
        assertEq(f.vaultUsdg(), f.potOf());
    }

    function invariant_supplyNeverChanges() public view {
        assertTrue(f.synthSupplyAccounted());
    }
}
```

- [ ] **Step 2: Verify**

Run: `forge test --match-path test/rwa/RwaInvariant.t.sol`
Expected: `invariant_vaultBalanceMatchesPot` and `invariant_supplyNeverChanges` pass (32 runs x 48 depth, 0 reverts)

- [ ] **Step 3: Commit**

```bash
git add contracts/test/rwa/RwaInvariant.t.sol
git commit -m "test(contracts): add vault solvency invariant"
```

### Task 8: Fork test on Robinhood Chain

**Files:**

- Test: `contracts/test/fork/RwaFork.t.sol`

- [ ] **Step 1: Write the test**

`contracts/test/fork/RwaFork.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AssetRegistry} from "../../src/rwa/AssetRegistry.sol";
import {IAssetRegistry} from "../../src/rwa/interfaces/IAssetRegistry.sol";
import {WallHook} from "../../src/rwa/WallHook.sol";
import {PriceWall} from "../../src/rwa/PriceWall.sol";
import {RedemptionVault} from "../../src/rwa/RedemptionVault.sol";
import {PriceMath} from "../../src/libraries/PriceMath.sol";
import {RobinhoodChain} from "../../script/RobinhoodChain.sol";

/// @notice Runs the RWA stack against the live Robinhood Chain PoolManager and USDG.
/// @dev Run with: forge test --match-path test/fork/RwaFork.t.sol --fork-url robinhood
contract RwaForkTest is Test {
    IPoolManager internal manager = IPoolManager(RobinhoodChain.POOL_MANAGER);
    IERC20 internal usdg = IERC20(RobinhoodChain.USDG);

    AssetRegistry internal registry;
    PriceWall internal priceWall;
    RedemptionVault internal vault;
    PoolSwapTest internal swapRouter;

    address internal owner = makeAddr("owner");
    address internal keeper = makeAddr("keeper");
    address internal alice = makeAddr("alice");

    function setUp() public {
        vm.skip(block.chainid != RobinhoodChain.CHAIN_ID);

        registry = new AssetRegistry(owner, makeAddr("guardian"), keeper, makeAddr("treasury"));
        address hookAddr = address(
            uint160(Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG)
                | uint160(0x5555 << 144)
        );
        deployCodeTo("WallHook.sol:WallHook", abi.encode(manager, registry), hookAddr);
        priceWall = new PriceWall(manager, registry, IHooks(hookAddr), address(usdg));
        vault = new RedemptionVault(registry, address(usdg));
        vm.prank(owner);
        registry.wire(address(priceWall), address(vault));
        swapRouter = new PoolSwapTest(manager);
    }

    function test_fork_buyMoveRedeem() public {
        IAssetRegistry.AssetConfig memory c;
        c.name = "Case-Shiller US National";
        c.symbol = "sCSUS";
        c.metadataURI = "ipfs://meta";
        c.unitScale = 1e18;
        c.maxMoveTicks = 500;
        c.minUpdateInterval = 1 hours;
        c.heartbeat = 45 days;
        c.wallSupply = 1_000_000_000e18;

        address predicted = vm.computeCreateAddress(address(registry), vm.getNonce(address(registry)));
        int24 tick = PriceMath.tickAtPrice(330e18, predicted < address(usdg), 1e30);
        vm.prank(owner);
        uint256 id = registry.addAsset(c, tick);
        assertApproxEqRel(priceWall.priceX18(id), 330e18, 2e14);

        // Buy $3,300 of synth with real USDG.
        deal(address(usdg), alice, 3_300e6);
        PoolKey memory key = priceWall.poolKeyOf(id);
        bool synthIs0 = priceWall.synthIsToken0(id);
        vm.startPrank(alice);
        usdg.approve(address(swapRouter), type(uint256).max);
        swapRouter.swap(
            key,
            SwapParams(!synthIs0, -int256(3_300e6), synthIs0 ? TickMath.MAX_SQRT_PRICE - 1 : TickMath.MIN_SQRT_PRICE + 1),
            PoolSwapTest.TestSettings(false, false),
            ""
        );
        vm.stopPrank();
        IERC20 synth = IERC20(registry.getState(id).token);
        assertApproxEqRel(synth.balanceOf(alice), 10e18, 3e14);

        vm.warp(block.timestamp + 1 hours);
        vm.prank(keeper);
        priceWall.movePrice(id, PriceMath.tickAtPrice(320e18, synthIs0, 1e30), keccak256("fork"));
        assertApproxEqAbs(vault.pot(id), 3_300e6, 2);

        vm.startPrank(alice);
        synth.approve(address(vault), type(uint256).max);
        uint256 out = vault.redeem(id, synth.balanceOf(alice), 0, alice);
        vm.stopPrank();
        assertApproxEqRel(out, 3_200e6 * 997 / 1000, 1e15);
    }
}
```

- [ ] **Step 2: Verify**

Run: `node script/rpc-proxy.mjs &  then  forge test --match-path test/fork/RwaFork.t.sol --fork-url http://127.0.0.1:8548`
Expected: `test_fork_buyMoveRedeem` passes (takes ~90 s). Without `--fork-url` the test is skipped because of the chain-id check.

- [ ] **Step 3: Commit**

```bash
git add contracts/test/fork/RwaFork.t.sol
git commit -m "test(contracts): fork-test RWA stack against live PoolManager and USDG"
```

### Task 9: Deployment script

**Files:**
- Create: `contracts/script/utils/HookMiner.sol`
- Create: `contracts/script/DeployRwa.s.sol`


- [ ] **Step 1: Write `HookMiner.sol`**

`contracts/script/utils/HookMiner.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";

/// @title HookMiner
/// @notice a minimal library for mining hook addresses
library HookMiner {
    // mask to slice out the bottom 14 bit of the address
    uint160 constant FLAG_MASK = Hooks.ALL_HOOK_MASK; // 0000 ... 0000 0011 1111 1111 1111

    // Maximum number of iterations to find a salt, avoid infinite loops or MemoryOOG
    // (arbitrarily set)
    uint256 constant MAX_LOOP = 160_444;

    /// @notice Find a salt that produces a hook address with the desired `flags`
    /// @param deployer The address that will deploy the hook. In `forge test`, this will be the test contract `address(this)` or the pranking address
    /// In `forge script`, this should be `0x4e59b44847b379578588920cA78FbF26c0B4956C` (CREATE2 Deployer Proxy)
    /// @param flags The desired flags for the hook address. Example `uint160(Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG | ...)`
    /// @param creationCode The creation code of a hook contract. Example: `type(Counter).creationCode`
    /// @param constructorArgs The encoded constructor arguments of a hook contract. Example: `abi.encode(address(manager))`
    /// @return (hookAddress, salt) The hook deploys to `hookAddress` when using `salt` with the syntax: `new Hook{salt: salt}(<constructor arguments>)`
    function find(address deployer, uint160 flags, bytes memory creationCode, bytes memory constructorArgs)
        internal
        view
        returns (address, bytes32)
    {
        flags = flags & FLAG_MASK; // mask for only the bottom 14 bits
        bytes memory creationCodeWithArgs = abi.encodePacked(creationCode, constructorArgs);

        address hookAddress;
        for (uint256 salt; salt < MAX_LOOP; salt++) {
            hookAddress = computeAddress(deployer, salt, creationCodeWithArgs);

            // if the hook's bottom 14 bits match the desired flags AND the address does not have bytecode, we found a match
            if (uint160(hookAddress) & FLAG_MASK == flags && hookAddress.code.length == 0) {
                return (hookAddress, bytes32(salt));
            }
        }
        revert("HookMiner: could not find salt");
    }

    /// @notice Precompute a contract address deployed via CREATE2
    /// @param deployer The address that will deploy the hook. In `forge test`, this will be the test contract `address(this)` or the pranking address
    /// In `forge script`, this should be `0x4e59b44847b379578588920cA78FbF26c0B4956C` (CREATE2 Deployer Proxy)
    /// @param salt The salt used to deploy the hook
    /// @param creationCodeWithArgs The creation code of a hook contract, with encoded constructor arguments appended. Example: `abi.encodePacked(type(Counter).creationCode, abi.encode(constructorArg1, constructorArg2))`
    function computeAddress(address deployer, uint256 salt, bytes memory creationCodeWithArgs)
        internal
        pure
        returns (address hookAddress)
    {
        return address(
            uint160(uint256(keccak256(abi.encodePacked(bytes1(0xFF), deployer, salt, keccak256(creationCodeWithArgs)))))
        );
    }
}
```

- [ ] **Step 2: Write `DeployRwa.s.sol`**

`contracts/script/DeployRwa.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {AssetRegistry} from "../src/rwa/AssetRegistry.sol";
import {WallHook} from "../src/rwa/WallHook.sol";
import {PriceWall} from "../src/rwa/PriceWall.sol";
import {RedemptionVault} from "../src/rwa/RedemptionVault.sol";
import {HookMiner} from "./utils/HookMiner.sol";
import {RobinhoodChain} from "./RobinhoodChain.sol";

/// @notice Deploys the synthetic RWA stack. The broadcaster owns the registry until `OWNER` accepts ownership.
/// @dev env: GUARDIAN, KEEPER, TREASURY, OWNER. Example:
///      forge script script/DeployRwa.s.sol --rpc-url robinhood --broadcast --account deployer
contract DeployRwa is Script {
    function run() external returns (AssetRegistry registry, WallHook hook, PriceWall priceWall, RedemptionVault vault) {
        address guardian = vm.envAddress("GUARDIAN");
        address keeper = vm.envAddress("KEEPER");
        address treasury = vm.envAddress("TREASURY");
        address finalOwner = vm.envAddress("OWNER");
        IPoolManager manager = IPoolManager(RobinhoodChain.POOL_MANAGER);

        vm.startBroadcast();
        address deployer = msg.sender;

        registry = new AssetRegistry(deployer, guardian, keeper, treasury);

        uint160 flags = uint160(Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG);
        bytes memory args = abi.encode(manager, registry);
        (address hookAddr, bytes32 salt) =
            HookMiner.find(RobinhoodChain.CREATE2_DEPLOYER, flags, type(WallHook).creationCode, args);
        hook = new WallHook{salt: salt}(manager, registry);
        require(address(hook) == hookAddr, "hook address mismatch");

        priceWall = new PriceWall(manager, registry, IHooks(address(hook)), RobinhoodChain.USDG);
        vault = new RedemptionVault(registry, RobinhoodChain.USDG);
        registry.wire(address(priceWall), address(vault));

        if (finalOwner != deployer) registry.transferOwnership(finalOwner);
        vm.stopBroadcast();

        console2.log("AssetRegistry  ", address(registry));
        console2.log("WallHook       ", address(hook));
        console2.log("PriceWall      ", address(priceWall));
        console2.log("RedemptionVault", address(vault));
    }
}
```

- [ ] **Step 3: Verify**

Run: `GUARDIAN=0x000000000000000000000000000000000000dEaD KEEPER=0x000000000000000000000000000000000000bEEF TREASURY=0x000000000000000000000000000000000000cafE OWNER=0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38 forge script script/DeployRwa.s.sol --fork-url http://127.0.0.1:8548 --sender 0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38`
Expected: `SIMULATION COMPLETE`, ~9.3M gas, ~0.0013 ETH

- [ ] **Step 4: Commit**

```bash
git add contracts/script/utils/HookMiner.sol contracts/script/DeployRwa.s.sol
git commit -m "feat(contracts): add RWA deployment script with mined hook address"
```

## Spec coverage (self-review)

| Spec section | Covered by |
|---|---|
| 3.2 AssetRegistry params, category, unitScale, bounds, launchesEnabled | Tasks 3, 5 |
| 3.2 SynthToken | Task 3 |
| 3.2 WallHook third-party liquidity block | Task 4 (`test_thirdPartyLiquidity_reverts`) |
| 3.3 Buy synth at wall | Task 4 (`test_buySynth_fillsAtWallPrice`) |
| 3.3 Move price: bounds, sweep USDG, re-park | Task 4 (move up/down, too soon/too large/paused) |
| 3.3 Redeem with pro-rata haircut, fee, minOut | Task 6 |
| 3.3 Staleness blocks launches, not trading | Task 5 (`test_staleness_blocksLaunchesAfterHeartbeat`) |
| 3.3 Guardian pause, owner unpause; swaps/redemptions never pausable | Tasks 4, 5 (no pause checks on swap/redeem paths) |
| 5 Admin powers | Tasks 3, 5 |
| 8 Invariants: vault never pays more than pot, supply constant | Task 7 |
| 8 Fork tests against real PoolManager/USDG | Task 8 |
| Deploy with mined hook address | Task 9 |
| 3.4 Keeper service | Separate plan: `2026-09-14-rwa-keeper.md` |
