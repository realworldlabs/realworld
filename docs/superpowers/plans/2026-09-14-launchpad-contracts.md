# Launchpad Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and test sub-project 2 from `docs/superpowers/specs/2026-09-14-rwa-launchpad-design.md`: launching memecoins paired with a synthetic RWA (or USDG), trading them on a Uniswap v4 concentrated-liquidity curve, and graduating them into a permanently locked full-range position.

**Architecture:**
- `LaunchFactory` deploys a fixed-supply `LaunchToken` (through `LaunchTokenDeployer`), initialises a v4 pool (fee 0, tick spacing 200) with `LaunchHook`, places 714,285,714 tokens as a single-sided 25,000-tick curve, and runs the mandatory first buy.
- `LaunchHook` charges every fee in the pair asset (1% base, 70/30 creator/protocol, plus an optional creator tax) and mints the fees as ERC-6909 claims to `FeeEscrow` and `BuybackVault`.
- `migrate` removes a sold-out curve, re-parks the empty pool at the curve end, and hands pair plus reserve to `LaunchLocker`, which can only add liquidity. Surplus reserve is burned.
- `LaunchRouter` does one-transaction buys and sells in the pair or in USDG (via the synth's price wall and redemption vault), plus revert-based quotes.

**Tech Stack:** Solidity 0.8.26 (via-IR, cancun), Foundry, Uniswap v4-core `59d3ecf`, OpenZeppelin v5.4.0. Builds on the RWA contracts from `2026-09-14-synthetic-rwa-contracts.md`.

**Deviations from spec (intentional):**
- `LaunchToken.Socials` has twitter, telegram and website. Farcaster and discord are dropped (YAGNI).
- Buyback vesting is a single 365-day duration set on `BuybackVault`, not a field of `LaunchConfig`. The vault uses a weighted-start clock instead of per-batch schedules: O(1) storage, and a late batch cannot ride earlier progress.
- `executeBuyback` is restricted to the launch's fee recipient and owner-appointed operators, instead of being permissionless. A permissionless trigger can be sandwiched: pump, trigger buyback, dump.
- `LaunchRouter.buy` clamps input to `maxBuyInput`, the pair still needed to sell out the curve plus fees. The hook charges exact-input fees before the swap, so without the clamp an oversized buy would pay 1% on input the curve cannot absorb.
- Paying with native ETH is not in v1: the router accepts the pair or USDG. A USDG/ETH route needs an existing liquid pool, which is a follow-up.
- Token deployment lives in `LaunchTokenDeployer` to keep `LaunchFactory` under 24 KB (22.5 KB).
- `LaunchHook` takes its admin as a constructor argument. It is deployed through the CREATE2 proxy, which would otherwise be `msg.sender` and could never call `wire`.

**Key mechanics verified by the tests:**
- Fee sign convention: the hook always returns `+fee` in the pair currency. For exact input with the pair specified (buys) and exact output with the pair specified (sells) it charges in `beforeSwap`. Otherwise it charges in `afterSwap` on the unspecified delta. The trader's delta becomes `swapDelta - hookDelta`.
- Fees are `poolManager.mint`-ed as ERC-6909 claims inside the swap, so the PoolManager never needs a spare ERC-20 balance and nothing is transferred mid-swap.
- The start price snaps to the 200-tick grid, landing within about 2% of the $4,000 target market cap. The graduation price is 25,000 ticks (~12.18x) further.
- A sell-out plus migrate raises ~$10k in the pair and locks it with ~205M tokens at ~$48.7k market cap; ~81M reserve tokens are burned.

## File Structure

```
contracts/src/launchpad/
  interfaces/ILaunchpad.sol   IFeeEscrow, IBuybackVault, ILaunchLocker, ILaunchHook, ILaunchFactory
  LaunchToken.sol             fixed-supply ERC-20 + burnable + on-chain metadata
  LaunchTokenDeployer.sol     CREATE2 token deployment for the factory
  LaunchHook.sol              fee hook, access guard, curve-complete guard
  FeeEscrow.sol               pull-based fee balances backed by ERC-6909 claims
  BuybackVault.sol            buyback budgets, execution, vesting
  LaunchLocker.sol            add-only full-range liquidity at graduation
  LaunchFactory.sol           configs, launch, migrate, creator controls
  LaunchRouter.sol            buy/sell/launch via pair or USDG, quotes, curve clamp
contracts/script/DeployLaunchpad.s.sol, contracts/script/AddAsset.s.sol
contracts/test/utils/LaunchFixture.sol
contracts/test/launchpad/LaunchFactory.t.sol, LaunchRouter.t.sol
contracts/test/fork/LaunchpadFork.t.sol
```

All commands run from `contracts/` with `export PATH="$HOME/.foundry/bin:$PATH"`.

### Task 1: Launch token, deployer and interfaces

**Files:**
- Create: `contracts/src/launchpad/interfaces/ILaunchpad.sol`
- Create: `contracts/src/launchpad/LaunchToken.sol`
- Create: `contracts/src/launchpad/LaunchTokenDeployer.sol`


- [ ] **Step 1: Write `ILaunchpad.sol`**

`contracts/src/launchpad/interfaces/ILaunchpad.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

interface IFeeEscrow {
    function credit(address account, Currency currency, uint256 amount) external;
    function balanceOf(address account, Currency currency) external view returns (uint256);
    function claim(Currency currency, address to) external returns (uint256);
}

interface IBuybackVault {
    function notifyBudget(address token, uint256 amount) external;
}

interface ILaunchLocker {
    function lock(PoolKey calldata key, address token, uint256 amount0, uint256 amount1) external;
}

interface ILaunchHook {
    struct PoolInfo {
        address token;
        Currency pair;
        bool pairIsToken0;
        bool graduated;
        bool buybackEnabled;
        uint16 creatorTaxBps;
        uint16 buybackBps;
        address feeRecipient;
        /// @notice Sqrt price at which the curve is sold out.
        uint160 curveEndSqrtPriceX96;
    }

    function registerPool(PoolKey calldata key, PoolInfo calldata info) external;
    function setGraduated(PoolId id) external;
    function setCreatorSettings(PoolId id, address feeRecipient, bool buybackEnabled) external;
    function poolInfo(PoolId id) external view returns (PoolInfo memory);
    function isCurveComplete(PoolKey calldata key) external view returns (bool);
}

interface ILaunchFactory {
    function treasury() external view returns (address);
    function poolKeyOf(address token) external view returns (PoolKey memory);
    function feeRecipientOf(address token) external view returns (address);
    function isGraduated(address token) external view returns (bool);
}
```

- [ ] **Step 2: Write `LaunchToken.sol`**

`contracts/src/launchpad/LaunchToken.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/// @notice Fixed-supply launch token. No owner, no mint after construction, no transfer restrictions.
contract LaunchToken is ERC20, ERC20Burnable {
    struct Socials {
        string twitter;
        string telegram;
        string website;
    }

    string public logo;
    string public description;
    Socials private _socials;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory logo_,
        string memory description_,
        Socials memory socials_,
        uint256 supply,
        address to
    ) ERC20(name_, symbol_) {
        logo = logo_;
        description = description_;
        _socials = socials_;
        _mint(to, supply);
    }

    function socials() external view returns (Socials memory) {
        return _socials;
    }
}
```

- [ ] **Step 3: Write `LaunchTokenDeployer.sol`**

`contracts/src/launchpad/LaunchTokenDeployer.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {LaunchToken} from "./LaunchToken.sol";

/// @notice Deploys launch tokens with CREATE2 for the factory. Split out to keep the factory under the size limit.
contract LaunchTokenDeployer {
    address public immutable deployer;
    address public factory;

    error Unauthorized();
    error AlreadyWired();

    constructor() {
        deployer = msg.sender;
    }

    function setFactory(address factory_) external {
        if (msg.sender != deployer) revert Unauthorized();
        if (factory != address(0)) revert AlreadyWired();
        factory = factory_;
    }

    function deploy(
        bytes32 salt,
        string calldata name,
        string calldata symbol,
        string calldata logo,
        string calldata description,
        LaunchToken.Socials calldata socials,
        uint256 supply
    ) external returns (address) {
        if (msg.sender != factory) revert Unauthorized();
        return address(new LaunchToken{salt: salt}(name, symbol, logo, description, socials, supply, msg.sender));
    }
}
```

- [ ] **Step 4: Verify**

Run: `forge build`
Expected: `Compiler run successful!`

- [ ] **Step 5: Commit**

```bash
git add contracts/src/launchpad/interfaces/ILaunchpad.sol contracts/src/launchpad/LaunchToken.sol contracts/src/launchpad/LaunchTokenDeployer.sol
git commit -m "feat(contracts): add launch token, token deployer and launchpad interfaces"
```

### Task 2: Hook, escrow, buyback vault, locker, factory and router sources

**Files:**
- Create: `contracts/src/launchpad/LaunchHook.sol`
- Create: `contracts/src/launchpad/FeeEscrow.sol`
- Create: `contracts/src/launchpad/BuybackVault.sol`
- Create: `contracts/src/launchpad/LaunchLocker.sol`
- Create: `contracts/src/launchpad/LaunchFactory.sol`
- Create: `contracts/src/launchpad/LaunchRouter.sol`


These contracts reference each other (the hook credits the escrow and vault, the factory drives the hook and locker, the router wraps the factory), so they land together and compile before any launchpad test exists.

- [ ] **Step 1: Write `LaunchHook.sol`**

`contracts/src/launchpad/LaunchHook.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary, toBeforeSwapDelta} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {HookStub} from "../common/HookStub.sol";
import {IFeeEscrow, IBuybackVault, ILaunchHook, ILaunchFactory} from "./interfaces/ILaunchpad.sol";

/// @notice Singleton hook for launch pools. Pool LP fee is zero; this hook charges every fee in the pair asset.
/// @dev Fees are minted as PoolManager ERC-6909 claims to the escrow / buyback vault, so no ERC-20 transfer
///      happens inside a swap and the PoolManager never needs a spare balance.
contract LaunchHook is HookStub, ILaunchHook {
    using StateLibrary for IPoolManager;

    uint256 public constant BASE_FEE_BPS = 100; // 1%
    uint256 public constant PROTOCOL_SHARE_OF_BASE_BPS = 3_000; // 30% of the base fee
    uint256 private constant BPS = 10_000;
    bytes1 public constant PARK_FLAG = 0x01;

    address public immutable deployer;
    address public factory;
    address public locker;
    IFeeEscrow public escrow;
    IBuybackVault public buybackVault;

    mapping(PoolId => PoolInfo) private _pools;

    event FeeTaken(
        PoolId indexed id, address indexed token, uint256 protocolFee, uint256 creatorFee, uint256 buybackFee
    );

    error AlreadyWired();
    error Unauthorized();
    error UnknownPool();
    error CurveComplete();

    /// @param deployer_ The account allowed to call `wire` once. Passed explicitly because the hook is
    ///        deployed through the CREATE2 proxy, which would otherwise be msg.sender.
    constructor(IPoolManager poolManager_, address deployer_) HookStub(poolManager_) {
        deployer = deployer_;
    }

    function wire(address factory_, address locker_, IFeeEscrow escrow_, IBuybackVault buybackVault_) external {
        if (msg.sender != deployer) revert Unauthorized();
        if (factory != address(0)) revert AlreadyWired();
        factory = factory_;
        locker = locker_;
        escrow = escrow_;
        buybackVault = buybackVault_;
    }

    modifier onlyFactory() {
        if (msg.sender != factory) revert Unauthorized();
        _;
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory p) {
        p.beforeInitialize = true;
        p.beforeAddLiquidity = true;
        p.beforeSwap = true;
        p.afterSwap = true;
        p.beforeSwapReturnDelta = true;
        p.afterSwapReturnDelta = true;
    }

    // ---------- factory hooks ----------

    function registerPool(PoolKey calldata key, PoolInfo calldata info) external onlyFactory {
        _pools[key.toId()] = info;
    }

    function setGraduated(PoolId id) external onlyFactory {
        _pools[id].graduated = true;
    }

    function setCreatorSettings(PoolId id, address feeRecipient, bool buybackEnabled) external onlyFactory {
        PoolInfo storage p = _pools[id];
        p.feeRecipient = feeRecipient;
        p.buybackEnabled = buybackEnabled;
    }

    // ---------- views ----------

    function poolInfo(PoolId id) external view returns (PoolInfo memory) {
        return _pools[id];
    }

    function isCurveComplete(PoolKey calldata key) public view returns (bool) {
        PoolInfo storage p = _pools[key.toId()];
        if (p.token == address(0)) revert UnknownPool();
        return _curveComplete(key.toId(), p);
    }

    function _curveComplete(PoolId id, PoolInfo storage p) private view returns (bool) {
        (uint160 sqrtP,,,) = poolManager.getSlot0(id);
        // The launch token is bought when the pair flows in. Token as currency0 => price rises.
        return p.pairIsToken0 ? sqrtP <= p.curveEndSqrtPriceX96 : sqrtP >= p.curveEndSqrtPriceX96;
    }

    // ---------- pool callbacks ----------

    function beforeInitialize(address sender, PoolKey calldata, uint160)
        external
        view
        override
        onlyPoolManager
        returns (bytes4)
    {
        if (sender != factory) revert Unauthorized();
        return this.beforeInitialize.selector;
    }

    function beforeAddLiquidity(address sender, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        external
        view
        override
        onlyPoolManager
        returns (bytes4)
    {
        if (sender != factory && sender != locker) revert Unauthorized();
        return this.beforeAddLiquidity.selector;
    }

    function beforeSwap(address sender, PoolKey calldata key, SwapParams calldata params, bytes calldata hookData)
        external
        override
        onlyPoolManager
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        PoolId id = key.toId();
        PoolInfo storage p = _pools[id];
        if (p.token == address(0)) revert UnknownPool();
        if (_feeExempt(sender, hookData)) return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);

        bool buying = params.zeroForOne == p.pairIsToken0;
        if (buying && !p.graduated && _curveComplete(id, p)) revert CurveComplete();

        bool exactInput = params.amountSpecified < 0;
        bool specifiedIsToken0 = exactInput == params.zeroForOne;
        if (specifiedIsToken0 != p.pairIsToken0) return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);

        uint256 feeBps = BASE_FEE_BPS + p.creatorTaxBps;
        uint256 amount = exactInput ? uint256(-params.amountSpecified) : uint256(params.amountSpecified);
        // Exact input: fee is a share of what is spent. Exact output: gross up so the trader still receives `amount`.
        uint256 fee = exactInput ? amount * feeBps / BPS : amount * feeBps / (BPS - feeBps);
        if (fee == 0) return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);

        _collect(id, p, fee);
        return (this.beforeSwap.selector, toBeforeSwapDelta(int128(int256(fee)), 0), 0);
    }

    function afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) external override onlyPoolManager returns (bytes4, int128) {
        PoolId id = key.toId();
        PoolInfo storage p = _pools[id];
        if (_feeExempt(sender, hookData)) return (this.afterSwap.selector, 0);

        bool exactInput = params.amountSpecified < 0;
        bool specifiedIsToken0 = exactInput == params.zeroForOne;
        if (specifiedIsToken0 == p.pairIsToken0) return (this.afterSwap.selector, 0);

        int128 pairDelta = p.pairIsToken0 ? delta.amount0() : delta.amount1();
        uint256 amount = pairDelta < 0 ? uint256(uint128(-pairDelta)) : uint256(uint128(pairDelta));
        uint256 fee = amount * (BASE_FEE_BPS + p.creatorTaxBps) / BPS;
        if (fee == 0) return (this.afterSwap.selector, 0);

        _collect(id, p, fee);
        return (this.afterSwap.selector, int128(int256(fee)));
    }

    function _feeExempt(address sender, bytes calldata hookData) private view returns (bool) {
        if (sender == address(buybackVault)) return true;
        return sender == factory && hookData.length == 1 && hookData[0] == PARK_FLAG;
    }

    function _collect(PoolId id, PoolInfo storage p, uint256 fee) private {
        uint256 feeBps = BASE_FEE_BPS + p.creatorTaxBps;
        uint256 baseFee = fee * BASE_FEE_BPS / feeBps;
        uint256 protocolFee = baseFee * PROTOCOL_SHARE_OF_BASE_BPS / BPS;
        uint256 creatorTotal = fee - protocolFee;
        uint256 buybackFee = p.buybackEnabled ? creatorTotal * p.buybackBps / BPS : 0;
        uint256 creatorFee = creatorTotal - buybackFee;

        uint256 currencyId = p.pair.toId();
        poolManager.mint(address(escrow), currencyId, protocolFee + creatorFee);
        if (protocolFee > 0) escrow.credit(ILaunchFactory(factory).treasury(), p.pair, protocolFee);
        if (creatorFee > 0) escrow.credit(p.feeRecipient, p.pair, creatorFee);
        if (buybackFee > 0) {
            poolManager.mint(address(buybackVault), currencyId, buybackFee);
            buybackVault.notifyBudget(p.token, buybackFee);
        }
        emit FeeTaken(id, p.token, protocolFee, creatorFee, buybackFee);
    }
}
```

- [ ] **Step 2: Write `FeeEscrow.sol`**

`contracts/src/launchpad/FeeEscrow.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IUnlockCallback} from "@uniswap/v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {IFeeEscrow} from "./interfaces/ILaunchpad.sol";
import {LaunchHook} from "./LaunchHook.sol";

/// @notice Pull-based fee balances. Holds PoolManager ERC-6909 claims and converts them to tokens on claim.
contract FeeEscrow is IFeeEscrow, IUnlockCallback, ReentrancyGuardTransient {
    IPoolManager public immutable poolManager;
    address public immutable hook;

    mapping(address account => mapping(Currency currency => uint256)) private _balances;

    event Credited(address indexed account, Currency indexed currency, uint256 amount);
    event Claimed(address indexed account, Currency indexed currency, address to, uint256 amount);

    error Unauthorized();
    error NothingToClaim();

    constructor(IPoolManager poolManager_, address hook_) {
        poolManager = poolManager_;
        hook = hook_;
    }

    /// @dev The caller must already have delivered matching ERC-6909 claims to this contract.
    function credit(address account, Currency currency, uint256 amount) external {
        if (msg.sender != hook && msg.sender != address(LaunchHook(hook).buybackVault())) revert Unauthorized();
        _balances[account][currency] += amount;
        emit Credited(account, currency, amount);
    }

    function balanceOf(address account, Currency currency) external view returns (uint256) {
        return _balances[account][currency];
    }

    function claim(Currency currency, address to) external nonReentrant returns (uint256 amount) {
        amount = _balances[msg.sender][currency];
        if (amount == 0) revert NothingToClaim();
        _balances[msg.sender][currency] = 0;
        poolManager.unlock(abi.encode(currency, to, amount));
        emit Claimed(msg.sender, currency, to, amount);
    }

    function unlockCallback(bytes calldata data) external returns (bytes memory) {
        if (msg.sender != address(poolManager)) revert Unauthorized();
        (Currency currency, address to, uint256 amount) = abi.decode(data, (Currency, address, uint256));
        poolManager.burn(address(this), currency.toId(), amount);
        poolManager.take(currency, to, amount);
        return "";
    }
}
```

- [ ] **Step 3: Write `BuybackVault.sol`**

`contracts/src/launchpad/BuybackVault.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IUnlockCallback} from "@uniswap/v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IBuybackVault, IFeeEscrow, ILaunchFactory, ILaunchHook} from "./interfaces/ILaunchpad.sol";

/// @notice Spends each launch's buyback budget on its own token and vests the result linearly to the creator.
/// @dev Budgets are held as PoolManager ERC-6909 claims of the pair currency.
contract BuybackVault is IBuybackVault, IUnlockCallback, ReentrancyGuardTransient {
    using SafeERC20 for IERC20;
    using StateLibrary for IPoolManager;

    /// @notice Largest price move a single buyback may cause (~2%, 198 ticks).
    int24 public constant MAX_IMPACT_TICKS = 198;
    uint256 public immutable vestingDuration;

    IPoolManager public immutable poolManager;
    ILaunchHook public immutable hook;
    ILaunchFactory public immutable factory;
    IFeeEscrow public immutable escrow;

    /// @notice Unreleased principal vesting linearly from `start`; `released` counts releases since the last top-up.
    struct Vesting {
        uint128 principal;
        uint128 released;
        uint64 start;
    }

    /// @notice Addresses allowed to trigger buybacks besides each launch fee recipient. Set by the factory owner.
    mapping(address => bool) public isOperator;
    mapping(address token => uint256) public budget;
    mapping(address token => Vesting) public vesting;

    event OperatorSet(address indexed operator, bool allowed);
    event BudgetAdded(address indexed token, uint256 amount);
    event BuybackExecuted(address indexed token, uint256 pairSpent, uint256 tokensBought);
    event Released(address indexed token, address indexed to, uint256 amount);
    event BudgetFlushed(address indexed token, address indexed to, uint256 amount);

    error Unauthorized();
    error BuybackStillEnabled();

    constructor(IPoolManager poolManager_, ILaunchHook hook_, ILaunchFactory factory_, IFeeEscrow escrow_, uint256 vestingDuration_) {
        poolManager = poolManager_;
        hook = hook_;
        factory = factory_;
        escrow = escrow_;
        vestingDuration = vestingDuration_;
    }

    function setOperator(address operator, bool allowed) external {
        if (msg.sender != Ownable(address(factory)).owner()) revert Unauthorized();
        isOperator[operator] = allowed;
        emit OperatorSet(operator, allowed);
    }

    function notifyBudget(address token, uint256 amount) external {
        if (msg.sender != address(hook)) revert Unauthorized();
        budget[token] += amount;
        emit BudgetAdded(token, amount);
    }

    /// @notice Buys as much as the budget allows without moving price more than ~2%.
    /// @dev Restricted to the fee recipient and operators: an open trigger lets anyone pump the price,
    ///      fire the buyback into it and sell straight back.
    function executeBuyback(address token) external nonReentrant returns (uint256 spent, uint256 bought) {
        if (!isOperator[msg.sender] && msg.sender != factory.feeRecipientOf(token)) revert Unauthorized();
        uint256 b = budget[token];
        if (b == 0) return (0, 0);
        PoolKey memory key = factory.poolKeyOf(token);
        if (!factory.isGraduated(token) && hook.isCurveComplete(key)) return (0, 0);

        (spent, bought) = abi.decode(poolManager.unlock(abi.encode(key, token, b)), (uint256, uint256));
        if (spent == 0) return (0, 0);
        budget[token] = b - spent;
        _addVesting(token, bought);
        emit BuybackExecuted(token, spent, bought);
    }

    function unlockCallback(bytes calldata data) external returns (bytes memory) {
        if (msg.sender != address(poolManager)) revert Unauthorized();
        (PoolKey memory key, address token, uint256 amount) = abi.decode(data, (PoolKey, address, uint256));

        bool tokenIs0 = Currency.unwrap(key.currency0) == token;
        Currency pair = tokenIs0 ? key.currency1 : key.currency0;
        (, int24 tick,,) = poolManager.getSlot0(key.toId());
        // Buying the token: pair in. zeroForOne when the pair is currency0 (price falls).
        bool zeroForOne = !tokenIs0;
        int24 limitTick = zeroForOne ? tick - MAX_IMPACT_TICKS : tick + MAX_IMPACT_TICKS;
        if (limitTick < TickMath.MIN_TICK) limitTick = TickMath.MIN_TICK;
        if (limitTick > TickMath.MAX_TICK) limitTick = TickMath.MAX_TICK;

        BalanceDelta d = poolManager.swap(
            key,
            SwapParams({
                zeroForOne: zeroForOne,
                amountSpecified: -int256(amount),
                sqrtPriceLimitX96: TickMath.getSqrtPriceAtTick(limitTick)
            }),
            ""
        );
        int128 pairDelta = tokenIs0 ? d.amount1() : d.amount0();
        int128 tokenDelta = tokenIs0 ? d.amount0() : d.amount1();
        uint256 spent = uint256(uint128(-pairDelta));
        uint256 bought = uint256(uint128(tokenDelta));

        if (spent > 0) poolManager.burn(address(this), pair.toId(), spent);
        if (bought > 0) poolManager.take(Currency.wrap(token), address(this), bought);
        return abi.encode(spent, bought);
    }

    /// @notice Vested amount not yet released.
    function releasable(address token) public view returns (uint256) {
        Vesting memory v = vesting[token];
        if (v.principal == 0) return 0;
        uint256 elapsed = block.timestamp - v.start;
        uint256 vested = elapsed >= vestingDuration ? v.principal : uint256(v.principal) * elapsed / vestingDuration;
        return vested > v.released ? vested - v.released : 0;
    }

    /// @notice Permissionless. Sends vested tokens to the launch's current fee recipient.
    function release(address token) external nonReentrant returns (uint256 amount) {
        amount = releasable(token);
        if (amount == 0) return 0;
        vesting[token].released += uint128(amount);
        address to = factory.feeRecipientOf(token);
        IERC20(token).safeTransfer(to, amount);
        emit Released(token, to, amount);
    }

    /// @notice When buybacks are switched off, hands any unspent budget to the creator's escrow balance.
    function flushBudget(address token) external nonReentrant returns (uint256 amount) {
        PoolKey memory key = factory.poolKeyOf(token);
        ILaunchHook.PoolInfo memory info = hook.poolInfo(key.toId());
        if (info.buybackEnabled) revert BuybackStillEnabled();
        amount = budget[token];
        if (amount == 0) return 0;
        budget[token] = 0;
        poolManager.transfer(address(escrow), info.pair.toId(), amount);
        escrow.credit(info.feeRecipient, info.pair, amount);
        emit BudgetFlushed(token, info.feeRecipient, amount);
    }

    /// @dev Weighted start: a top-up restarts the schedule on the unreleased remainder plus the new batch, with the
    ///      start pulled forward in proportion to the batch size. A late large buyback therefore cannot ride on the
    ///      vesting progress of earlier ones, and earlier tokens are only delayed in proportion to the new batch.
    function _addVesting(address token, uint256 amount) private {
        Vesting storage v = vesting[token];
        uint256 remaining = uint256(v.principal) - v.released;
        if (remaining == 0) {
            v.start = uint64(block.timestamp);
        } else {
            v.start = uint64((uint256(v.start) * remaining + block.timestamp * amount) / (remaining + amount));
        }
        v.principal = uint128(remaining + amount);
        v.released = 0;
    }
}
```

- [ ] **Step 4: Write `LaunchLocker.sol`**

`contracts/src/launchpad/LaunchLocker.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IUnlockCallback} from "@uniswap/v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {ModifyLiquidityParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {LiquidityAmounts} from "@uniswap/v4-periphery/src/libraries/LiquidityAmounts.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ILaunchLocker, ILaunchFactory} from "./interfaces/ILaunchpad.sol";

/// @notice Permanent home of graduated liquidity. This contract can only ADD liquidity:
///         there is no code path that removes a position or moves tokens out, except burning the
///         launch token surplus and forwarding pair dust to the treasury in the same call.
contract LaunchLocker is ILaunchLocker, IUnlockCallback {
    using SafeERC20 for IERC20;
    using StateLibrary for IPoolManager;

    IPoolManager public immutable poolManager;
    address public immutable factory;

    event Locked(address indexed token, uint128 liquidity, uint256 tokenLocked, uint256 pairLocked, uint256 tokenBurned);

    error Unauthorized();

    constructor(IPoolManager poolManager_, address factory_) {
        poolManager = poolManager_;
        factory = factory_;
    }

    /// @param amount0 currency0 available (already transferred to this contract)
    /// @param amount1 currency1 available (already transferred to this contract)
    function lock(PoolKey calldata key, address token, uint256 amount0, uint256 amount1) external {
        if (msg.sender != factory) revert Unauthorized();
        (uint128 liquidity, uint256 used0, uint256 used1) =
            abi.decode(poolManager.unlock(abi.encode(key, amount0, amount1)), (uint128, uint256, uint256));

        bool tokenIs0 = Currency.unwrap(key.currency0) == token;
        uint256 tokenLeft = IERC20(token).balanceOf(address(this));
        if (tokenLeft > 0) ERC20Burnable(token).burn(tokenLeft);

        address pair = Currency.unwrap(tokenIs0 ? key.currency1 : key.currency0);
        uint256 pairLeft = IERC20(pair).balanceOf(address(this));
        if (pairLeft > 0) IERC20(pair).safeTransfer(ILaunchFactory(factory).treasury(), pairLeft);

        emit Locked(token, liquidity, tokenIs0 ? used0 : used1, tokenIs0 ? used1 : used0, tokenLeft);
    }

    function unlockCallback(bytes calldata data) external returns (bytes memory) {
        if (msg.sender != address(poolManager)) revert Unauthorized();
        (PoolKey memory key, uint256 amount0, uint256 amount1) = abi.decode(data, (PoolKey, uint256, uint256));

        (uint160 sqrtP,,,) = poolManager.getSlot0(key.toId());
        int24 lower = TickMath.minUsableTick(key.tickSpacing);
        int24 upper = TickMath.maxUsableTick(key.tickSpacing);
        uint128 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            sqrtP, TickMath.getSqrtPriceAtTick(lower), TickMath.getSqrtPriceAtTick(upper), amount0, amount1
        );
        if (liquidity == 0) return abi.encode(uint128(0), uint256(0), uint256(0));

        (BalanceDelta d,) =
            poolManager.modifyLiquidity(key, ModifyLiquidityParams(lower, upper, int256(uint256(liquidity)), 0), "");
        uint256 used0 = uint256(uint128(-d.amount0()));
        uint256 used1 = uint256(uint128(-d.amount1()));
        _pay(key.currency0, used0);
        _pay(key.currency1, used1);
        return abi.encode(liquidity, used0, used1);
    }

    function _pay(Currency currency, uint256 amount) private {
        if (amount == 0) return;
        poolManager.sync(currency);
        IERC20(Currency.unwrap(currency)).safeTransfer(address(poolManager), amount);
        poolManager.settle();
    }
}
```

- [ ] **Step 5: Write `LaunchFactory.sol`**

`contracts/src/launchpad/LaunchFactory.sol`:

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
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IAssetRegistry} from "../rwa/interfaces/IAssetRegistry.sol";
import {IPriceWall} from "../rwa/interfaces/IPriceWall.sol";
import {PriceMath} from "../libraries/PriceMath.sol";
import {LaunchToken} from "./LaunchToken.sol";
import {LaunchTokenDeployer} from "./LaunchTokenDeployer.sol";
import {ILaunchFactory, ILaunchHook, ILaunchLocker} from "./interfaces/ILaunchpad.sol";

/// @notice Entry point for launching coins paired with a synthetic RWA (or USDG) and for graduating them.
contract LaunchFactory is ILaunchFactory, IUnlockCallback, Ownable2Step, ReentrancyGuardTransient {
    using SafeERC20 for IERC20;
    using StateLibrary for IPoolManager;

    struct LaunchConfig {
        uint256 supply;
        uint256 curveSupply;
        int24 curveWidthTicks;
        int24 tickSpacing;
        /// @notice USD market cap (1e18) at the first curve tick.
        uint256 startMarketCapUsd;
        uint16 maxCreatorTaxBps;
        bool enabled;
    }

    struct LaunchParams {
        string name;
        string symbol;
        string logo;
        string description;
        LaunchToken.Socials socials;
        /// @notice Creator of record. Must equal msg.sender unless the caller is the trusted router.
        address creator;
        address feeRecipient;
        uint16 creatorTaxBps;
        uint16 buybackBps;
        bytes32 salt;
    }

    struct Launch {
        PoolKey key;
        address creator;
        address feeRecipient;
        uint32 configId;
        bool tokenIsToken0;
        bool graduated;
        bool buybackEnabled;
        int24 curveLower;
        int24 curveUpper;
        uint128 curveLiquidity;
        uint256 reserve;
    }

    uint256 private constant BPS = 10_000;
    uint256 private constant ONE = 1e18;
    bytes1 private constant PARK_FLAG = 0x01;
    uint8 private constant ACTION_LAUNCH = 1;
    uint8 private constant ACTION_MIGRATE = 2;

    IPoolManager public immutable poolManager;
    IAssetRegistry public immutable registry;
    address public immutable usdg;
    ILaunchHook public immutable hook;
    LaunchTokenDeployer public immutable tokenDeployer;
    ILaunchLocker public locker;
    address public guardian;
    address public router;
    address public treasury;
    uint256 public launchFee;

    LaunchConfig[] private _configs;
    mapping(address token => Launch) private _launches;
    address[] public allTokens;

    event Launched(
        address indexed token,
        address indexed creator,
        address indexed pair,
        PoolId poolId,
        uint32 configId,
        uint16 creatorTaxBps,
        uint16 buybackBps,
        uint256 firstBuyPair,
        uint256 firstBuyTokens
    );
    event Migrated(address indexed token, uint256 pairAmount, uint256 tokenAmount);
    event CreatorSettingsUpdated(address indexed token, address feeRecipient, bool buybackEnabled);
    event ConfigAdded(uint256 indexed configId);
    event ConfigEnabled(uint256 indexed configId, bool enabled);

    error Unauthorized();
    error AlreadyWired();
    error ZeroAddress();
    error WrongLaunchFee();
    error ConfigDisabled();
    error ConfigMismatch();
    error InvalidConfig();
    error PairNotAllowed();
    error TaxTooHigh();
    error InvalidBuybackBps();
    error FirstBuyRequired();
    error SlippageExceeded();
    error UnknownLaunch();
    error AlreadyGraduated();
    error NotReadyToMigrate();

    constructor(
        address owner_,
        IPoolManager poolManager_,
        IAssetRegistry registry_,
        address usdg_,
        ILaunchHook hook_,
        LaunchTokenDeployer tokenDeployer_,
        address treasury_,
        address guardian_,
        uint256 launchFee_
    ) Ownable(owner_) {
        if (treasury_ == address(0) || guardian_ == address(0)) revert ZeroAddress();
        poolManager = poolManager_;
        registry = registry_;
        usdg = usdg_;
        hook = hook_;
        tokenDeployer = tokenDeployer_;
        treasury = treasury_;
        guardian = guardian_;
        launchFee = launchFee_;
    }

    // ---------- admin ----------

    function setLocker(ILaunchLocker locker_) external onlyOwner {
        if (address(locker) != address(0)) revert AlreadyWired();
        locker = locker_;
    }

    function setRouter(address router_) external onlyOwner {
        router = router_;
    }

    function setTreasury(address treasury_) external onlyOwner {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
    }

    function setGuardian(address guardian_) external onlyOwner {
        if (guardian_ == address(0)) revert ZeroAddress();
        guardian = guardian_;
    }

    function setLaunchFee(uint256 launchFee_) external onlyOwner {
        launchFee = launchFee_;
    }

    function addConfig(LaunchConfig calldata c) external onlyOwner returns (uint256 id) {
        if (
            c.curveSupply == 0 || c.curveSupply >= c.supply || c.tickSpacing <= 0 || c.curveWidthTicks <= 0
                || c.curveWidthTicks % c.tickSpacing != 0 || c.startMarketCapUsd == 0 || c.maxCreatorTaxBps > 900
        ) revert InvalidConfig();
        id = _configs.length;
        _configs.push(c);
        emit ConfigAdded(id);
    }

    function setConfigEnabled(uint256 id, bool enabled) external onlyOwner {
        _configs[id].enabled = enabled;
        emit ConfigEnabled(id, enabled);
    }

    // ---------- views ----------

    function configCount() external view returns (uint256) {
        return _configs.length;
    }

    function getConfig(uint256 id) external view returns (LaunchConfig memory) {
        return _configs[id];
    }

    function configHash(uint256 id) public view returns (bytes32) {
        return keccak256(abi.encode(_configs[id]));
    }

    function launchCount() external view returns (uint256) {
        return allTokens.length;
    }

    function getLaunch(address token) external view returns (Launch memory) {
        return _launches[token];
    }

    function poolKeyOf(address token) external view returns (PoolKey memory) {
        return _launches[token].key;
    }

    function feeRecipientOf(address token) external view returns (address) {
        return _launches[token].feeRecipient;
    }

    function isGraduated(address token) external view returns (bool) {
        return _launches[token].graduated;
    }

    /// @notice USD price (1e18) and decimals of an allowed pair asset. Reverts when the pair cannot be launched against.
    function pairQuote(address pair) public view returns (uint256 usdPrice, uint8 decimals) {
        if (pair == usdg) return (ONE, IERC20Metadata(usdg).decimals());
        (bool found, uint256 assetId) = registry.assetIdOf(pair);
        if (!found || !registry.isLaunchable(assetId)) revert PairNotAllowed();
        return (IPriceWall(registry.priceWall()).priceX18(assetId), 18);
    }

    function isReadyToMigrate(address token) public view returns (bool) {
        Launch storage l = _launches[token];
        if (l.key.tickSpacing == 0 || l.graduated) return false;
        return hook.isCurveComplete(l.key);
    }

    // ---------- launch ----------

    function launch(
        LaunchParams calldata p,
        uint32 configId,
        address pair,
        bytes32 expectedConfigHash,
        uint256 firstBuyPair,
        uint256 minFirstBuyTokens
    ) external payable nonReentrant returns (address token) {
        if (msg.value != launchFee) revert WrongLaunchFee();
        if (configId >= _configs.length) revert InvalidConfig();
        LaunchConfig memory c = _configs[configId];
        if (!c.enabled) revert ConfigDisabled();
        if (keccak256(abi.encode(c)) != expectedConfigHash) revert ConfigMismatch();
        if (p.creatorTaxBps > c.maxCreatorTaxBps) revert TaxTooHigh();
        if (p.buybackBps > BPS) revert InvalidBuybackBps();
        if (firstBuyPair == 0) revert FirstBuyRequired();
        address creator = msg.sender == router ? p.creator : msg.sender;
        if (creator == address(0)) revert ZeroAddress();
        address feeRecipient = p.feeRecipient == address(0) ? creator : p.feeRecipient;

        (uint256 pairUsd, uint8 pairDecimals) = pairQuote(pair);
        if (launchFee > 0) Address.sendValue(payable(treasury), msg.value);

        token = tokenDeployer.deploy(
            keccak256(abi.encode(creator, p.salt)), p.name, p.symbol, p.logo, p.description, p.socials, c.supply
        );

        Launch storage l = _launches[token];
        l.creator = creator;
        l.feeRecipient = feeRecipient;
        l.configId = configId;
        l.buybackEnabled = p.buybackBps > 0;
        _initCurve(l, c, token, pair, pairUsd, pairDecimals);

        hook.registerPool(
            l.key,
            ILaunchHook.PoolInfo({
                token: token,
                pair: Currency.wrap(pair),
                pairIsToken0: !l.tokenIsToken0,
                graduated: false,
                buybackEnabled: l.buybackEnabled,
                creatorTaxBps: p.creatorTaxBps,
                buybackBps: p.buybackBps,
                feeRecipient: feeRecipient,
                curveEndSqrtPriceX96: TickMath.getSqrtPriceAtTick(l.tokenIsToken0 ? l.curveUpper : l.curveLower)
            })
        );
        int24 startTick = l.tokenIsToken0 ? l.curveLower : l.curveUpper;
        poolManager.initialize(l.key, TickMath.getSqrtPriceAtTick(startTick));

        IERC20(pair).safeTransferFrom(msg.sender, address(this), firstBuyPair);
        (uint256 used, uint256 bought, uint256 curveTokens) = abi.decode(
            poolManager.unlock(abi.encode(ACTION_LAUNCH, token, c.curveSupply, firstBuyPair, creator)),
            (uint256, uint256, uint256)
        );
        if (bought < minFirstBuyTokens) revert SlippageExceeded();
        l.reserve = c.supply - curveTokens;
        if (used < firstBuyPair) IERC20(pair).safeTransfer(msg.sender, firstBuyPair - used);

        allTokens.push(token);
        emit Launched(token, creator, pair, l.key.toId(), configId, p.creatorTaxBps, p.buybackBps, used, bought);
    }

    function _initCurve(
        Launch storage l,
        LaunchConfig memory c,
        address token,
        address pair,
        uint256 pairUsd,
        uint8 pairDecimals
    ) private {
        bool tokenIs0 = token < pair;
        l.tokenIsToken0 = tokenIs0;
        l.key = PoolKey({
            currency0: Currency.wrap(tokenIs0 ? token : pair),
            currency1: Currency.wrap(tokenIs0 ? pair : token),
            fee: 0,
            tickSpacing: c.tickSpacing,
            hooks: IHooks(address(hook))
        });

        // Token price in pair units (1e18) at the start market cap.
        uint256 tokenUsd = c.startMarketCapUsd * ONE / c.supply;
        uint256 tokenInPair = tokenUsd * ONE / pairUsd;
        uint256 scale = 10 ** (36 - uint256(pairDecimals));
        int24 tick = _floor(PriceMath.tickAtPrice(tokenInPair, tokenIs0, scale), c.tickSpacing);

        // Token is bought by moving price up when it is currency0, down when it is currency1.
        (l.curveLower, l.curveUpper) = tokenIs0 ? (tick, tick + c.curveWidthTicks) : (tick - c.curveWidthTicks, tick);
        if (l.curveLower < TickMath.minUsableTick(c.tickSpacing) || l.curveUpper > TickMath.maxUsableTick(c.tickSpacing)) {
            revert InvalidConfig();
        }
        uint160 sqrtA = TickMath.getSqrtPriceAtTick(l.curveLower);
        uint160 sqrtB = TickMath.getSqrtPriceAtTick(l.curveUpper);
        l.curveLiquidity = tokenIs0
            ? LiquidityAmounts.getLiquidityForAmount0(sqrtA, sqrtB, c.curveSupply)
            : LiquidityAmounts.getLiquidityForAmount1(sqrtA, sqrtB, c.curveSupply);
    }

    // ---------- graduation ----------

    /// @notice Permissionless. Moves a sold-out curve into a permanently locked full-range position.
    function migrate(address token) external nonReentrant {
        Launch storage l = _launches[token];
        if (l.key.tickSpacing == 0) revert UnknownLaunch();
        if (l.graduated) revert AlreadyGraduated();
        if (!hook.isCurveComplete(l.key)) revert NotReadyToMigrate();

        l.graduated = true;
        hook.setGraduated(l.key.toId());
        (uint256 pairOut, uint256 tokenOut) =
            abi.decode(poolManager.unlock(abi.encode(ACTION_MIGRATE, token, uint256(0), uint256(0), address(0))), (uint256, uint256));

        uint256 tokenTotal = tokenOut + l.reserve;
        l.reserve = 0;
        IERC20(token).safeTransfer(address(locker), tokenTotal);
        (uint256 amount0, uint256 amount1) = l.tokenIsToken0 ? (tokenTotal, pairOut) : (pairOut, tokenTotal);
        locker.lock(l.key, token, amount0, amount1);
        emit Migrated(token, pairOut, tokenTotal);
    }

    // ---------- creator controls ----------

    function setFeeRecipient(address token, address feeRecipient) external {
        Launch storage l = _launches[token];
        if (msg.sender != l.feeRecipient && msg.sender != l.creator) revert Unauthorized();
        if (feeRecipient == address(0)) revert ZeroAddress();
        l.feeRecipient = feeRecipient;
        _pushCreatorSettings(token, l);
    }

    /// @notice Creator can switch buybacks on or off; the guardian can only switch them off.
    function setBuybackEnabled(address token, bool enabled) external {
        Launch storage l = _launches[token];
        if (l.key.tickSpacing == 0) revert UnknownLaunch();
        bool isCreator = msg.sender == l.creator || msg.sender == l.feeRecipient;
        if (!isCreator && !(msg.sender == guardian && !enabled)) revert Unauthorized();
        l.buybackEnabled = enabled;
        _pushCreatorSettings(token, l);
    }

    function _pushCreatorSettings(address token, Launch storage l) private {
        hook.setCreatorSettings(l.key.toId(), l.feeRecipient, l.buybackEnabled);
        emit CreatorSettingsUpdated(token, l.feeRecipient, l.buybackEnabled);
    }

    // ---------- pool manager callback ----------

    function unlockCallback(bytes calldata data) external returns (bytes memory) {
        if (msg.sender != address(poolManager)) revert Unauthorized();
        (uint8 action, address token, uint256 curveSupply, uint256 firstBuyPair, address creator) =
            abi.decode(data, (uint8, address, uint256, uint256, address));
        Launch storage l = _launches[token];
        return action == ACTION_LAUNCH ? _launchCallback(l, token, curveSupply, firstBuyPair, creator) : _migrateCallback(l, token);
    }

    function _launchCallback(Launch storage l, address token, uint256 curveSupply, uint256 firstBuyPair, address creator)
        private
        returns (bytes memory)
    {
        (BalanceDelta added,) = poolManager.modifyLiquidity(
            l.key, ModifyLiquidityParams(l.curveLower, l.curveUpper, int256(uint256(l.curveLiquidity)), 0), ""
        );
        uint256 curveTokens = uint256(uint128(-(l.tokenIsToken0 ? added.amount0() : added.amount1())));
        require(curveTokens <= curveSupply);

        // First buy: pair in, exact input. Pays the normal fees.
        BalanceDelta d = poolManager.swap(
            l.key,
            SwapParams({
                zeroForOne: !l.tokenIsToken0,
                amountSpecified: -int256(firstBuyPair),
                sqrtPriceLimitX96: TickMath.getSqrtPriceAtTick(l.tokenIsToken0 ? l.curveUpper : l.curveLower)
            }),
            ""
        );
        int128 pairSwap = l.tokenIsToken0 ? d.amount1() : d.amount0();
        int128 tokenSwap = l.tokenIsToken0 ? d.amount0() : d.amount1();
        uint256 used = uint256(uint128(-pairSwap));
        uint256 bought = uint256(uint128(tokenSwap));

        Currency tokenC = Currency.wrap(token);
        Currency pairC = l.tokenIsToken0 ? l.key.currency1 : l.key.currency0;
        _pay(tokenC, curveTokens);
        _pay(pairC, used);
        poolManager.take(tokenC, creator, bought);
        return abi.encode(used, bought, curveTokens);
    }

    function _migrateCallback(Launch storage l, address token) private returns (bytes memory) {
        (BalanceDelta removed,) = poolManager.modifyLiquidity(
            l.key, ModifyLiquidityParams(l.curveLower, l.curveUpper, -int256(uint256(l.curveLiquidity)), 0), ""
        );
        l.curveLiquidity = 0;

        // Re-park the now empty pool exactly at the curve's end price so the locked position opens there,
        // no matter how far a buyer pushed the price through the empty range above the curve.
        uint160 end = TickMath.getSqrtPriceAtTick(l.tokenIsToken0 ? l.curveUpper : l.curveLower);
        (uint160 current,,,) = poolManager.getSlot0(l.key.toId());
        if (current != end) {
            poolManager.swap(
                l.key, SwapParams({zeroForOne: end < current, amountSpecified: -1, sqrtPriceLimitX96: end}), abi.encodePacked(PARK_FLAG)
            );
        }

        uint256 tokenOut = uint256(uint128(l.tokenIsToken0 ? removed.amount0() : removed.amount1()));
        uint256 pairOut = uint256(uint128(l.tokenIsToken0 ? removed.amount1() : removed.amount0()));
        Currency pairC = l.tokenIsToken0 ? l.key.currency1 : l.key.currency0;
        if (tokenOut > 0) poolManager.take(Currency.wrap(token), address(this), tokenOut);
        if (pairOut > 0) poolManager.take(pairC, address(locker), pairOut);
        return abi.encode(pairOut, tokenOut);
    }

    function _pay(Currency currency, uint256 amount) private {
        if (amount == 0) return;
        poolManager.sync(currency);
        IERC20(Currency.unwrap(currency)).safeTransfer(address(poolManager), amount);
        poolManager.settle();
    }

    function _floor(int24 tick, int24 spacing) private pure returns (int24) {
        int24 q = tick / spacing;
        if (tick < 0 && tick % spacing != 0) q--;
        return q * spacing;
    }
}
```

- [ ] **Step 6: Write `LaunchRouter.sol`**

`contracts/src/launchpad/LaunchRouter.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IUnlockCallback} from "@uniswap/v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {TransientStateLibrary} from "@uniswap/v4-core/src/libraries/TransientStateLibrary.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {SqrtPriceMath} from "@uniswap/v4-core/src/libraries/SqrtPriceMath.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ILaunchHook} from "./interfaces/ILaunchpad.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {IAssetRegistry} from "../rwa/interfaces/IAssetRegistry.sol";
import {IPriceWall} from "../rwa/interfaces/IPriceWall.sol";
import {IRedemptionVault} from "../rwa/interfaces/IRedemptionVault.sol";
import {LaunchFactory} from "./LaunchFactory.sol";

/// @notice One-transaction trading for launch coins. Pays in the coin's pair or in USDG
///         (routed through the synth's price wall), and sells back to the pair or to USDG (via the vault).
contract LaunchRouter is IUnlockCallback, ReentrancyGuardTransient {
    using SafeERC20 for IERC20;

    IPoolManager public immutable poolManager;
    LaunchFactory public immutable factory;
    IAssetRegistry public immutable registry;
    address public immutable usdg;

    error Unauthorized();
    error DeadlineExpired();
    error SlippageExceeded();
    error UnsupportedPayment();
    error NotCreator();
    /// @dev Carries simulated results out of a reverted quote call.
    error QuoteResult(uint256 amountOut, uint256 pairAmount);

    struct Hop {
        PoolKey key;
        bool zeroForOne;
    }

    constructor(IPoolManager poolManager_, LaunchFactory factory_, IAssetRegistry registry_, address usdg_) {
        poolManager = poolManager_;
        factory = factory_;
        registry = registry_;
        usdg = usdg_;
    }

    modifier checkDeadline(uint256 deadline) {
        if (block.timestamp > deadline) revert DeadlineExpired();
        _;
    }

    // ---------- trading ----------

    /// @param payWith The coin's pair asset, or USDG when the pair is a synth.
    function buy(address token, address payWith, uint256 amountIn, uint256 minTokensOut, address recipient, uint256 deadline)
        external
        nonReentrant
        checkDeadline(deadline)
        returns (uint256 tokensOut)
    {
        Hop[] memory hops = _buyHops(token, payWith);
        amountIn = Math.min(amountIn, maxBuyInput(token, payWith));
        IERC20(payWith).safeTransferFrom(msg.sender, address(this), amountIn);
        (tokensOut,) = _execute(hops, amountIn, Currency.wrap(payWith), Currency.wrap(token), recipient, false);
        if (tokensOut < minTokensOut) revert SlippageExceeded();
        _refund(payWith, msg.sender);
    }

    /// @param receiveAsset The coin's pair asset, or USDG when the pair is a synth (redeemed through the vault).
    function sell(address token, uint256 amountIn, address receiveAsset, uint256 minOut, address recipient, uint256 deadline)
        external
        nonReentrant
        checkDeadline(deadline)
        returns (uint256 amountOut)
    {
        address pair = _pairOf(token);
        IERC20(token).safeTransferFrom(msg.sender, address(this), amountIn);
        Hop[] memory hops = new Hop[](1);
        hops[0] = _hop(factory.poolKeyOf(token), token);

        if (receiveAsset == pair) {
            (amountOut,) = _execute(hops, amountIn, Currency.wrap(token), Currency.wrap(pair), recipient, false);
        } else if (receiveAsset == usdg) {
            (uint256 synthOut,) = _execute(hops, amountIn, Currency.wrap(token), Currency.wrap(pair), address(this), false);
            amountOut = _redeem(pair, synthOut, recipient);
        } else {
            revert UnsupportedPayment();
        }
        if (amountOut < minOut) revert SlippageExceeded();
        _refund(token, msg.sender);
    }

    /// @notice Launch through the router so the first buy can be paid in USDG. `p.creator` must be the caller.
    function launch(
        LaunchFactory.LaunchParams calldata p,
        uint32 configId,
        address pair,
        bytes32 expectedConfigHash,
        address payWith,
        uint256 amountIn,
        uint256 minFirstBuyTokens
    ) external payable nonReentrant returns (address token) {
        if (p.creator != msg.sender) revert NotCreator();
        IERC20(payWith).safeTransferFrom(msg.sender, address(this), amountIn);

        uint256 pairAmount = amountIn;
        if (payWith != pair) {
            if (payWith != usdg) revert UnsupportedPayment();
            Hop[] memory hops = new Hop[](1);
            hops[0] = _wallHop(pair);
            (pairAmount,) = _execute(hops, amountIn, Currency.wrap(usdg), Currency.wrap(pair), address(this), false);
        }
        IERC20(pair).forceApprove(address(factory), pairAmount);
        token = factory.launch{value: msg.value}(p, configId, pair, expectedConfigHash, pairAmount, minFirstBuyTokens);

        _refund(pair, msg.sender);
        if (payWith != pair) _refund(payWith, msg.sender);
    }

    // ---------- quotes (call with eth_call; they revert internally and never move funds) ----------

    /// @dev Inputs above maxBuyInput are clamped exactly as buy does.
    function quoteBuy(address token, address payWith, uint256 amountIn) external returns (uint256 tokensOut) {
        Hop[] memory hops = _buyHops(token, payWith);
        amountIn = Math.min(amountIn, maxBuyInput(token, payWith));
        try this.simulate(hops, amountIn, Currency.wrap(payWith), Currency.wrap(token)) {}
        catch (bytes memory reason) {
            (tokensOut,) = _decodeQuote(reason);
        }
    }

    /// @return amountOut Proceeds in `receiveAsset`.
    /// @return pairAmount Proceeds in the pair before any redemption.
    function quoteSell(address token, uint256 amountIn, address receiveAsset)
        external
        returns (uint256 amountOut, uint256 pairAmount)
    {
        address pair = _pairOf(token);
        Hop[] memory hops = new Hop[](1);
        hops[0] = _hop(factory.poolKeyOf(token), token);
        try this.simulate(hops, amountIn, Currency.wrap(token), Currency.wrap(pair)) {}
        catch (bytes memory reason) {
            (pairAmount,) = _decodeQuote(reason);
        }
        if (receiveAsset == pair) return (pairAmount, pairAmount);
        if (receiveAsset != usdg) revert UnsupportedPayment();
        (, uint256 assetId) = registry.assetIdOf(pair);
        (,, amountOut,) = IRedemptionVault(registry.vault()).quoteRedeem(assetId, pairAmount);
    }

    /// @notice Largest input (in payWith) a buy can use before the curve sells out, fees included.
    ///         Anything above it would pay the trading fee on input the curve cannot absorb.
    ///         Graduated coins have no cap.
    function maxBuyInput(address token, address payWith) public view returns (uint256) {
        LaunchFactory.Launch memory l = factory.getLaunch(token);
        if (l.key.tickSpacing == 0) revert UnsupportedPayment();
        if (l.graduated) return type(uint256).max;

        (uint160 sqrtP,,,) = StateLibrary.getSlot0(poolManager, l.key.toId());
        uint160 sqrtEnd = TickMath.getSqrtPriceAtTick(l.tokenIsToken0 ? l.curveUpper : l.curveLower);
        uint256 pairNeeded;
        if (l.tokenIsToken0) {
            if (sqrtP >= sqrtEnd) return 0;
            pairNeeded = SqrtPriceMath.getAmount1Delta(sqrtP, sqrtEnd, l.curveLiquidity, true);
        } else {
            if (sqrtP <= sqrtEnd) return 0;
            pairNeeded = SqrtPriceMath.getAmount0Delta(sqrtEnd, sqrtP, l.curveLiquidity, true);
        }
        uint256 feeBps = 100 + ILaunchHook(address(factory.hook())).poolInfo(l.key.toId()).creatorTaxBps;
        uint256 gross = Math.mulDiv(pairNeeded, 10_000, 10_000 - feeBps, Math.Rounding.Ceil) + 1;

        address pair = _pairOf(token);
        if (payWith == pair) return gross;
        (, uint256 assetId) = registry.assetIdOf(pair);
        uint256 price = IPriceWall(registry.priceWall()).priceX18(assetId);
        // USDG for gross synth at the wall, plus 1 bp for the one-tick wall width.
        return Math.mulDiv(gross, price * 10_001 / 10_000, 1e30, Math.Rounding.Ceil) + 1;
    }

    /// @dev Only callable by this contract, from the quote functions.
    function simulate(Hop[] memory hops, uint256 amountIn, Currency input, Currency output) external {
        if (msg.sender != address(this)) revert Unauthorized();
        // The callback reverts with QuoteResult before settling anything.
        poolManager.unlock(abi.encode(hops, amountIn, input, output, address(0), true));
    }

    // ---------- internals ----------

    function _execute(Hop[] memory hops, uint256 amountIn, Currency input, Currency output, address recipient, bool quoteOnly)
        private
        returns (uint256 out, uint256 mid)
    {
        (out, mid) = abi.decode(
            poolManager.unlock(abi.encode(hops, amountIn, input, output, recipient, quoteOnly)), (uint256, uint256)
        );
    }

    function unlockCallback(bytes calldata data) external returns (bytes memory) {
        if (msg.sender != address(poolManager)) revert Unauthorized();
        (Hop[] memory hops, uint256 amountIn, Currency input, Currency output, address recipient, bool quoteOnly) =
            abi.decode(data, (Hop[], uint256, Currency, Currency, address, bool));

        uint256 amount = amountIn;
        uint256 firstOut;
        for (uint256 i; i < hops.length; ++i) {
            Hop memory h = hops[i];
            BalanceDelta d = poolManager.swap(
                h.key,
                SwapParams({
                    zeroForOne: h.zeroForOne,
                    amountSpecified: -int256(amount),
                    sqrtPriceLimitX96: h.zeroForOne ? TickMath.MIN_SQRT_PRICE + 1 : TickMath.MAX_SQRT_PRICE - 1
                }),
                ""
            );
            amount = uint256(uint128(h.zeroForOne ? d.amount1() : d.amount0()));
            if (i == 0) firstOut = amount;
        }
        if (quoteOnly) revert QuoteResult(amount, firstOut);

        // A swap that sells out a curve stops consuming input at the curve end, so settle the real deltas
        // rather than the nominal amounts. Unused input stays in the router and is refunded to the payer.
        _settleDelta(input, address(this));
        if (hops.length > 1) {
            Hop memory h0 = hops[0];
            _settleDelta(h0.zeroForOne ? h0.key.currency1 : h0.key.currency0, recipient);
        }
        poolManager.take(output, recipient, amount);
        return abi.encode(amount, firstOut);
    }

    /// @dev Pays what this contract owes in `currency`, or takes any unspent credit to `to`.
    function _settleDelta(Currency currency, address to) private {
        int256 delta = TransientStateLibrary.currencyDelta(poolManager, address(this), currency);
        if (delta < 0) {
            poolManager.sync(currency);
            IERC20(Currency.unwrap(currency)).safeTransfer(address(poolManager), uint256(-delta));
            poolManager.settle();
        } else if (delta > 0) {
            poolManager.take(currency, to, uint256(delta));
        }
    }

    function _refund(address asset, address to) private {
        uint256 bal = IERC20(asset).balanceOf(address(this));
        if (bal > 0) IERC20(asset).safeTransfer(to, bal);
    }

    function _buyHops(address token, address payWith) private view returns (Hop[] memory hops) {
        address pair = _pairOf(token);
        if (payWith == pair) {
            hops = new Hop[](1);
            hops[0] = _hopInto(factory.poolKeyOf(token), token);
        } else if (payWith == usdg) {
            hops = new Hop[](2);
            hops[0] = _wallHop(pair);
            hops[1] = _hopInto(factory.poolKeyOf(token), token);
        } else {
            revert UnsupportedPayment();
        }
    }

    function _wallHop(address synth) private view returns (Hop memory) {
        (bool found, uint256 assetId) = registry.assetIdOf(synth);
        if (!found) revert UnsupportedPayment();
        PoolKey memory key = IPriceWall(registry.priceWall()).poolKeyOf(assetId);
        return _hopInto(key, synth);
    }

    /// @dev Swap that ends holding `target`.
    function _hopInto(PoolKey memory key, address target) private pure returns (Hop memory) {
        return Hop({key: key, zeroForOne: Currency.unwrap(key.currency1) == target});
    }

    /// @dev Swap that spends `source`.
    function _hop(PoolKey memory key, address source) private pure returns (Hop memory) {
        return Hop({key: key, zeroForOne: Currency.unwrap(key.currency0) == source});
    }

    function _pairOf(address token) private view returns (address) {
        PoolKey memory key = factory.poolKeyOf(token);
        if (key.tickSpacing == 0) revert UnsupportedPayment();
        return Currency.unwrap(key.currency0) == token ? Currency.unwrap(key.currency1) : Currency.unwrap(key.currency0);
    }

    function _redeem(address synth, uint256 amount, address recipient) private returns (uint256) {
        (bool found, uint256 assetId) = registry.assetIdOf(synth);
        if (!found) revert UnsupportedPayment();
        IRedemptionVault vault = IRedemptionVault(registry.vault());
        IERC20(synth).forceApprove(address(vault), amount);
        return vault.redeem(assetId, amount, 0, recipient);
    }

    function _decodeQuote(bytes memory reason) private pure returns (uint256 out, uint256 mid) {
        if (reason.length != 68 || bytes4(reason) != QuoteResult.selector) {
            assembly ("memory-safe") {
                revert(add(reason, 32), mload(reason))
            }
        }
        assembly ("memory-safe") {
            out := mload(add(reason, 36))
            mid := mload(add(reason, 68))
        }
    }

    receive() external payable {}
}
```

- [ ] **Step 7: Verify**

Run: `forge build --sizes`
Expected: compiles; `LaunchFactory` runtime ~22,515 B (under 24,576), `LaunchRouter` ~16 KB

- [ ] **Step 8: Commit**

```bash
git add contracts/src/launchpad/LaunchHook.sol contracts/src/launchpad/FeeEscrow.sol contracts/src/launchpad/BuybackVault.sol contracts/src/launchpad/LaunchLocker.sol contracts/src/launchpad/LaunchFactory.sol contracts/src/launchpad/LaunchRouter.sol
git commit -m "feat(contracts): add launch hook, factory, escrow, buyback vault, locker and router"
```

### Task 3: Launch fixture and factory behaviour

**Files:**

- Test: `contracts/test/utils/LaunchFixture.sol`
- Test: `contracts/test/launchpad/LaunchFactory.t.sol`

- [ ] **Step 1: Write the test**

`contracts/test/utils/LaunchFixture.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LaunchFactory} from "../../src/launchpad/LaunchFactory.sol";
import {LaunchHook} from "../../src/launchpad/LaunchHook.sol";
import {LaunchToken} from "../../src/launchpad/LaunchToken.sol";
import {LaunchTokenDeployer} from "../../src/launchpad/LaunchTokenDeployer.sol";
import {LaunchLocker} from "../../src/launchpad/LaunchLocker.sol";
import {FeeEscrow} from "../../src/launchpad/FeeEscrow.sol";
import {BuybackVault} from "../../src/launchpad/BuybackVault.sol";
import {LaunchRouter} from "../../src/launchpad/LaunchRouter.sol";
import {ILaunchHook} from "../../src/launchpad/interfaces/ILaunchpad.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {PriceMath} from "../../src/libraries/PriceMath.sol";
import {RwaFixture} from "./RwaFixture.sol";

/// @notice RWA stack plus the full launchpad, with helpers to launch and trade.
abstract contract LaunchFixture is RwaFixture {
    uint256 internal constant LAUNCH_FEE = 0.0005 ether;
    address internal constant LAUNCH_HOOK_ADDRESS = address(
        uint160(
            Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG
                | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
        ) | uint160(0x7777 << 144)
    );

    address internal creator = makeAddr("creator");
    address internal launchTreasury = makeAddr("launchTreasury");

    LaunchHook internal launchHook;
    LaunchFactory internal factory;
    FeeEscrow internal escrow;
    BuybackVault internal buyback;
    LaunchLocker internal locker;
    LaunchRouter internal router;
    uint32 internal configId;

    function setUpLaunchpad() internal {
        setUpRwa();
        deployCodeTo("LaunchHook.sol:LaunchHook", abi.encode(manager, address(this)), LAUNCH_HOOK_ADDRESS);
        launchHook = LaunchHook(LAUNCH_HOOK_ADDRESS);

        LaunchTokenDeployer tokenDeployer = new LaunchTokenDeployer();
        factory = new LaunchFactory(
            owner, manager, registry, address(usdgToken), launchHook, tokenDeployer, launchTreasury, guardian, LAUNCH_FEE
        );
        tokenDeployer.setFactory(address(factory));
        escrow = new FeeEscrow(manager, address(launchHook));
        buyback = new BuybackVault(manager, launchHook, factory, escrow, 365 days);
        locker = new LaunchLocker(manager, address(factory));

        launchHook.wire(address(factory), address(locker), escrow, buyback);
        router = new LaunchRouter(manager, factory, registry, address(usdgToken));
        vm.startPrank(owner);
        factory.setLocker(locker);
        factory.setRouter(address(router));
        configId = uint32(factory.addConfig(defaultLaunchConfig()));
        vm.stopPrank();

        vm.deal(creator, 10 ether);
    }

    function defaultLaunchConfig() internal pure returns (LaunchFactory.LaunchConfig memory c) {
        c.supply = 1_000_000_000e18;
        c.curveSupply = 714_285_714e18;
        c.curveWidthTicks = 25_000;
        c.tickSpacing = 200;
        c.startMarketCapUsd = 4_000e18;
        c.maxCreatorTaxBps = 500;
        c.enabled = true;
    }

    function launchParams(string memory symbol, uint16 taxBps, uint16 buybackBps)
        internal
        view
        returns (LaunchFactory.LaunchParams memory p)
    {
        p.name = symbol;
        p.symbol = symbol;
        p.logo = "ipfs://logo";
        p.description = "a coin";
        p.creator = creator;
        p.creatorTaxBps = taxBps;
        p.buybackBps = buybackBps;
        p.salt = keccak256(bytes(symbol));
    }

    /// @notice Creator launches against `pair`, first buy paid in `pair`. Mints/buys the pair as needed.
    function launchAgainst(address pair, LaunchFactory.LaunchParams memory p, uint256 firstBuy)
        internal
        returns (address token)
    {
        fundPair(pair, creator, firstBuy);
        vm.startPrank(creator);
        IERC20(pair).approve(address(factory), firstBuy);
        token = factory.launch{value: LAUNCH_FEE}(p, configId, pair, factory.configHash(configId), firstBuy, 0);
        vm.stopPrank();
    }

    /// @notice Gives `who` `amount` of a pair asset: mints USDG, or buys synth from its wall.
    function fundPair(address pair, address who, uint256 amount) internal {
        if (pair == address(usdgToken)) {
            usdgToken.mint(who, amount);
            return;
        }
        (, uint256 assetId) = registry.assetIdOf(pair);
        uint256 price = priceWall.priceX18(assetId);
        // buy a little extra to cover rounding, then send the surplus away
        uint256 usdgIn = amount * price / 1e30 + 10e6;
        buySynth(assetId, who, usdgIn);
        uint256 extra = IERC20(pair).balanceOf(who) - amount;
        vm.prank(who);
        IERC20(pair).transfer(address(0xdead), extra);
    }

    function pairOfLaunch(address token) internal view returns (Currency) {
        PoolKey memory key = factory.poolKeyOf(token);
        return Currency.unwrap(key.currency0) == token ? key.currency1 : key.currency0;
    }

    function swapLaunch(address token, address trader, bool buy, int256 amountSpecified)
        internal
        returns (int256 pairChange, int256 tokenChange)
    {
        PoolKey memory key = factory.poolKeyOf(token);
        bool tokenIs0 = Currency.unwrap(key.currency0) == token;
        IERC20 pair = IERC20(Currency.unwrap(pairOfLaunch(token)));
        bool zeroForOne = buy ? !tokenIs0 : tokenIs0;

        uint256 pairBefore = pair.balanceOf(trader);
        uint256 tokenBefore = IERC20(token).balanceOf(trader);
        vm.startPrank(trader);
        pair.approve(address(swapRouter), type(uint256).max);
        IERC20(token).approve(address(swapRouter), type(uint256).max);
        swapRouter.swap(
            key,
            SwapParams({
                zeroForOne: zeroForOne,
                amountSpecified: amountSpecified,
                sqrtPriceLimitX96: zeroForOne ? MIN_PRICE_LIMIT : MAX_PRICE_LIMIT
            }),
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}),
            ""
        );
        vm.stopPrank();
        pairChange = int256(pair.balanceOf(trader)) - int256(pairBefore);
        tokenChange = int256(IERC20(token).balanceOf(trader)) - int256(tokenBefore);
    }

    /// @notice Current USD price (1e18) of a launch token.
    function tokenPriceUsd(address token) internal view returns (uint256) {
        PoolKey memory key = factory.poolKeyOf(token);
        (uint160 sqrtP,,,) = StateLibrary.getSlot0(manager, key.toId());
        bool tokenIs0 = Currency.unwrap(key.currency0) == token;
        (uint256 pairUsd, uint8 dec) = factory.pairQuote(Currency.unwrap(pairOfLaunch(token)));
        uint256 inPair = PriceMath.priceAtSqrtPrice(sqrtP, tokenIs0, 10 ** (36 - uint256(dec)));
        return inPair * pairUsd / 1e18;
    }
}
```

- [ ] **Step 2: Write the test**

`contracts/test/launchpad/LaunchFactory.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {ModifyLiquidityParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LaunchFactory} from "../../src/launchpad/LaunchFactory.sol";
import {LaunchToken} from "../../src/launchpad/LaunchToken.sol";
import {BuybackVault} from "../../src/launchpad/BuybackVault.sol";
import {ILaunchHook} from "../../src/launchpad/interfaces/ILaunchpad.sol";
import {LaunchFixture} from "../utils/LaunchFixture.sol";

abstract contract LaunchFactoryTestBase is LaunchFixture {
    using StateLibrary for *;

    address internal token;
    Currency internal usdgC;

    function setUp() public {
        setUpLaunchpad();
        usdgC = Currency.wrap(address(usdgToken));
        token = launchAgainst(address(usdgToken), launchParams("MEME", 0, 0), 10e6);
    }

    // ---------- launch ----------

    function test_launch_opensAtStartMarketCap() public view {
        // $4,000 start market cap over 1B supply => $0.000004. The start tick snaps to the 200-tick grid (<=2%).
        assertApproxEqRel(tokenPriceUsd(token), 4e12, 2.5e16);
        assertEq(factory.launchCount(), 1);
        assertEq(IERC20(token).totalSupply(), 1_000_000_000e18);
        LaunchFactory.Launch memory l = factory.getLaunch(token);
        assertEq(l.creator, creator);
        assertEq(l.feeRecipient, creator);
        assertApproxEqRel(l.reserve, 285_714_286e18, 1e12);
    }

    function test_launch_firstBuyGoesToCreatorAndPaysFees() public view {
        // 9.9 USDG after fee at ~$0.000004
        assertApproxEqRel(IERC20(token).balanceOf(creator), 2_475_000e18, 2.5e16);
        assertEq(escrow.balanceOf(launchTreasury, usdgC), 30_000); // 0.3% of 10 USDG
        assertEq(escrow.balanceOf(creator, usdgC), 70_000); // 0.7%
        assertEq(launchTreasury.balance, LAUNCH_FEE);
    }

    function test_launch_storesMetadata() public view {
        LaunchToken t = LaunchToken(token);
        assertEq(t.symbol(), "MEME");
        assertEq(t.logo(), "ipfs://logo");
        assertEq(t.description(), "a coin");
    }

    function test_launch_withSynthPair() public {
        uint256 assetId = addAsset("sCSUS", 330e18);
        address synth = registry.getState(assetId).token;
        address t = launchAgainst(synth, launchParams("HOUSE", 200, 0), 0.03e18); // ~$10 of synth
        assertApproxEqRel(tokenPriceUsd(t), 4e12, 2.5e16);
        // 3% total fee (1% base + 2% tax), paid in the synth
        uint256 fee = 0.03e18 * 300 / 10_000;
        uint256 protocol = (fee * 100 / 300) * 3_000 / 10_000;
        assertEq(escrow.balanceOf(launchTreasury, Currency.wrap(synth)), protocol);
        assertEq(escrow.balanceOf(creator, Currency.wrap(synth)), fee - protocol);
    }

    function test_launch_revertsWrongFee() public {
        usdgToken.mint(creator, 10e6);
        vm.startPrank(creator);
        usdgToken.approve(address(factory), 10e6);
        LaunchFactory.LaunchParams memory p = launchParams("X", 0, 0);
        bytes32 h = factory.configHash(configId);
        vm.expectRevert(LaunchFactory.WrongLaunchFee.selector);
        factory.launch{value: 0}(p, configId, address(usdgToken), h, 10e6, 0);
        vm.stopPrank();
    }

    function test_launch_revertsConfigMismatch() public {
        LaunchFactory.LaunchParams memory p = launchParams("X", 0, 0);
        vm.prank(creator);
        vm.expectRevert(LaunchFactory.ConfigMismatch.selector);
        factory.launch{value: LAUNCH_FEE}(p, configId, address(usdgToken), bytes32(uint256(1)), 10e6, 0);
    }

    function test_launch_revertsTaxTooHigh() public {
        LaunchFactory.LaunchParams memory p = launchParams("X", 501, 0);
        bytes32 h = factory.configHash(configId);
        vm.prank(creator);
        vm.expectRevert(LaunchFactory.TaxTooHigh.selector);
        factory.launch{value: LAUNCH_FEE}(p, configId, address(usdgToken), h, 10e6, 0);
    }

    function test_launch_revertsUnknownPair() public {
        LaunchFactory.LaunchParams memory p = launchParams("X", 0, 0);
        bytes32 h = factory.configHash(configId);
        vm.prank(creator);
        vm.expectRevert(LaunchFactory.PairNotAllowed.selector);
        factory.launch{value: LAUNCH_FEE}(p, configId, address(0xbeef), h, 10e6, 0);
    }

    function test_launch_revertsPausedSynth() public {
        uint256 assetId = addAsset("sCSUS", 330e18);
        address synth = registry.getState(assetId).token;
        vm.prank(guardian);
        registry.setPaused(assetId, true);
        LaunchFactory.LaunchParams memory p = launchParams("X", 0, 0);
        bytes32 h = factory.configHash(configId);
        vm.prank(creator);
        vm.expectRevert(LaunchFactory.PairNotAllowed.selector);
        factory.launch{value: LAUNCH_FEE}(p, configId, synth, h, 1e18, 0);
    }

    function test_launch_revertsWithoutFirstBuy() public {
        LaunchFactory.LaunchParams memory p = launchParams("X", 0, 0);
        bytes32 h = factory.configHash(configId);
        vm.prank(creator);
        vm.expectRevert(LaunchFactory.FirstBuyRequired.selector);
        factory.launch{value: LAUNCH_FEE}(p, configId, address(usdgToken), h, 0, 0);
    }

    // ---------- trading & fees ----------

    function test_buyExactInput_chargesOnePercent() public {
        usdgToken.mint(alice, 1_000e6);
        uint256 treasuryBefore = escrow.balanceOf(launchTreasury, usdgC);
        (int256 pairChange, int256 tokenChange) = swapLaunch(token, alice, true, -1_000e6);
        assertEq(pairChange, -1_000e6);
        assertGt(tokenChange, 0);
        assertEq(escrow.balanceOf(launchTreasury, usdgC) - treasuryBefore, 3e6);
    }

    function test_buyExactOutput_chargesOnSpend() public {
        usdgToken.mint(alice, 1_000e6);
        uint256 treasuryBefore = escrow.balanceOf(launchTreasury, usdgC);
        (int256 pairChange, int256 tokenChange) = swapLaunch(token, alice, true, int256(1_000_000e18));
        assertEq(tokenChange, 1_000_000e18);
        uint256 spent = uint256(-pairChange);
        uint256 protocol = escrow.balanceOf(launchTreasury, usdgC) - treasuryBefore;
        // protocol gets 0.3% of the pre-fee spend: spend = x * 1.01
        assertApproxEqRel(protocol, spent * 30 / 10_100, 1e15);
    }

    function test_sellExactInput_chargesOnProceeds() public {
        usdgToken.mint(alice, 1_000e6);
        (, int256 bought) = swapLaunch(token, alice, true, -1_000e6);
        uint256 treasuryBefore = escrow.balanceOf(launchTreasury, usdgC);
        (int256 pairChange,) = swapLaunch(token, alice, false, -bought);
        uint256 received = uint256(pairChange);
        // round trip loses ~2% to fees
        assertApproxEqRel(received, 980e6, 2e15);
        uint256 protocol = escrow.balanceOf(launchTreasury, usdgC) - treasuryBefore;
        assertApproxEqRel(protocol, received * 30 / 9_900, 1e15);
    }

    function test_sellExactOutput_traderReceivesExactAmount() public {
        usdgToken.mint(alice, 1_000e6);
        swapLaunch(token, alice, true, -1_000e6);
        (int256 pairChange, int256 tokenChange) = swapLaunch(token, alice, false, int256(500e6));
        assertEq(pairChange, 500e6);
        assertLt(tokenChange, 0);
    }

    function test_creatorClaimsFees() public {
        usdgToken.mint(alice, 1_000e6);
        swapLaunch(token, alice, true, -1_000e6);
        uint256 owed = escrow.balanceOf(creator, usdgC);
        assertEq(owed, 70_000 + 7e6);
        vm.prank(creator);
        escrow.claim(usdgC, creator);
        assertEq(usdgToken.balanceOf(creator), owed);
        assertEq(escrow.balanceOf(creator, usdgC), 0);
    }

    function test_thirdPartyLiquidity_reverts() public {
        PoolKey memory key = factory.poolKeyOf(token);
        vm.expectRevert();
        modifyLiquidityRouter.modifyLiquidity(key, ModifyLiquidityParams(-887000, 887000, 1e18, 0), "");
    }

    // ---------- graduation ----------

    function _sellOutCurve() internal {
        usdgToken.mint(bob, 20_000e6);
        swapLaunch(token, bob, true, -20_000e6);
        assertTrue(factory.isReadyToMigrate(token));
    }

    function test_migrate_revertsBeforeCurveSellsOut() public {
        vm.expectRevert(LaunchFactory.NotReadyToMigrate.selector);
        factory.migrate(token);
    }

    function test_curveComplete_blocksBuysButNotSells() public {
        _sellOutCurve();
        usdgToken.mint(alice, 10e6);
        vm.expectRevert();
        this.externalSwap(token, alice, true, -10e6);

        uint256 bobTokens = IERC20(token).balanceOf(bob);
        (int256 pairChange,) = swapLaunch(token, bob, false, -int256(bobTokens / 10));
        assertGt(pairChange, 0);
    }

    function externalSwap(address t, address trader, bool buy, int256 amount) external {
        swapLaunch(t, trader, buy, amount);
    }

    function test_migrate_locksLiquidityAtCurveEndPrice() public {
        _sellOutCurve();
        uint256 raised = usdgToken.balanceOf(address(manager));
        factory.migrate(token);

        assertTrue(factory.isGraduated(token));
        assertFalse(factory.isReadyToMigrate(token));
        // Curve end is 25,000 ticks (~12.18x) above the start: ~$0.0000487
        assertApproxEqRel(tokenPriceUsd(token), 48.7e12, 2e16);
        // Surplus reserve was burned
        assertLt(IERC20(token).totalSupply(), 1_000_000_000e18);
        assertEq(IERC20(token).balanceOf(address(locker)), 0);
        assertEq(IERC20(token).balanceOf(address(factory)), 0);
        // All raised USDG stays in the PoolManager (locked position), dust aside
        assertApproxEqRel(usdgToken.balanceOf(address(manager)), raised, 1e15);

        vm.expectRevert(LaunchFactory.AlreadyGraduated.selector);
        factory.migrate(token);
    }

    function test_afterMigrate_tradingContinuesWithFees() public {
        _sellOutCurve();
        factory.migrate(token);
        usdgToken.mint(alice, 100e6);
        uint256 before = escrow.balanceOf(launchTreasury, usdgC);
        (, int256 tokenChange) = swapLaunch(token, alice, true, -100e6);
        assertGt(tokenChange, 0);
        assertEq(escrow.balanceOf(launchTreasury, usdgC) - before, 0.3e6);
    }

    // ---------- creator controls & buyback ----------

    function test_setFeeRecipient_redirectsFutureFees() public {
        address newRecipient = makeAddr("dao");
        vm.prank(creator);
        factory.setFeeRecipient(token, newRecipient);
        usdgToken.mint(alice, 100e6);
        swapLaunch(token, alice, true, -100e6);
        assertEq(escrow.balanceOf(newRecipient, usdgC), 0.7e6);
    }

    function test_setFeeRecipient_onlyCreator() public {
        vm.prank(alice);
        vm.expectRevert(LaunchFactory.Unauthorized.selector);
        factory.setFeeRecipient(token, alice);
    }

    function test_guardianCanOnlyDisableBuyback() public {
        vm.prank(guardian);
        vm.expectRevert(LaunchFactory.Unauthorized.selector);
        factory.setBuybackEnabled(token, true);
        vm.prank(guardian);
        factory.setBuybackEnabled(token, false);
    }

    function test_buyback_spendsBudgetAndVests() public {
        address t = launchAgainst(address(usdgToken), launchParams("BB", 0, 5_000), 10e6);
        usdgToken.mint(alice, 1_000e6);
        swapLaunch(t, alice, true, -1_000e6);
        // 50% of the creator's 0.7% on 1,010 USDG of volume
        assertEq(buyback.budget(t), 3_535_000);

        vm.expectRevert(BuybackVault.Unauthorized.selector);
        buyback.executeBuyback(t);
        vm.prank(creator);
        (uint256 spent, uint256 bought) = buyback.executeBuyback(t);
        assertEq(spent, 3_535_000);
        assertGt(bought, 0);
        assertEq(buyback.budget(t), 0);
        assertEq(buyback.releasable(t), 0);

        vm.warp(block.timestamp + 365 days / 2);
        assertApproxEqRel(buyback.releasable(t), bought / 2, 1e15);
        uint256 released = buyback.release(t);
        assertEq(IERC20(t).balanceOf(creator) > released, true);

        vm.warp(block.timestamp + 365 days);
        buyback.release(t);
        assertEq(IERC20(t).balanceOf(address(buyback)), 0);
    }

    function test_buyback_operatorCanTrigger() public {
        address t = launchAgainst(address(usdgToken), launchParams("OP", 0, 10_000), 10e6);
        address operator = makeAddr("operator");
        vm.expectRevert(BuybackVault.Unauthorized.selector);
        buyback.setOperator(operator, true);
        vm.prank(owner);
        buyback.setOperator(operator, true);
        vm.prank(operator);
        (uint256 spent,) = buyback.executeBuyback(t);
        assertGt(spent, 0);
    }

    function test_flushBudget_afterDisablingBuyback() public {
        address t = launchAgainst(address(usdgToken), launchParams("BB", 0, 10_000), 10e6);
        uint256 budget = buyback.budget(t);
        assertGt(budget, 0);
        vm.prank(creator);
        factory.setBuybackEnabled(t, false);
        uint256 before = escrow.balanceOf(creator, usdgC);
        buyback.flushBudget(t);
        assertEq(escrow.balanceOf(creator, usdgC) - before, budget);
        vm.prank(creator);
        escrow.claim(usdgC, creator);
    }
}

contract LaunchFactoryTokenIs0Test is LaunchFactoryTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(type(uint160).max - 0xffff);
    }

    function test_orientation() public view {
        assertEq(Currency.unwrap(factory.poolKeyOf(token).currency0), token);
    }
}

contract LaunchFactoryTokenIs1Test is LaunchFactoryTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(uint160(0x1000000));
    }

    function test_orientation() public view {
        assertEq(Currency.unwrap(factory.poolKeyOf(token).currency1), token);
    }
}
```

- [ ] **Step 3: Verify**

Run: `forge test --match-path test/launchpad/LaunchFactory.t.sol`
Expected: 54 passed (27 per token ordering)

- [ ] **Step 4: Commit**

```bash
git add contracts/test/utils/LaunchFixture.sol contracts/test/launchpad/LaunchFactory.t.sol
git commit -m "test(contracts): cover launch, fees, graduation, creator controls and buybacks"
```

### Task 4: Router behaviour

**Files:**

- Test: `contracts/test/launchpad/LaunchRouter.t.sol`

- [ ] **Step 1: Write the test**

`contracts/test/launchpad/LaunchRouter.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LaunchFactory} from "../../src/launchpad/LaunchFactory.sol";
import {LaunchRouter} from "../../src/launchpad/LaunchRouter.sol";
import {LaunchFixture} from "../utils/LaunchFixture.sol";

abstract contract LaunchRouterTestBase is LaunchFixture {
    uint256 internal assetId;
    address internal synth;
    address internal token;

    function setUp() public {
        setUpLaunchpad();
        assetId = addAsset("sCHARIZARD", 420e18);
        synth = registry.getState(assetId).token;

        // Creator launches a synth-paired coin paying 10 USDG through the router.
        usdgToken.mint(creator, 10e6);
        LaunchFactory.LaunchParams memory p = launchParams("PIKA", 100, 0);
        vm.startPrank(creator);
        usdgToken.approve(address(router), 10e6);
        token = router.launch{value: LAUNCH_FEE}(
            p, configId, synth, factory.configHash(configId), address(usdgToken), 10e6, 0
        );
        vm.stopPrank();
    }

    function test_launchViaRouter_paysInUsdg() public view {
        assertEq(factory.getLaunch(token).creator, creator);
        assertGt(IERC20(token).balanceOf(creator), 2_000_000e18);
        assertEq(usdgToken.balanceOf(creator), 0);
        assertEq(IERC20(synth).balanceOf(address(router)), 0);
        assertApproxEqRel(tokenPriceUsd(token), 4e12, 2.5e16);
    }

    function test_launchViaRouter_rejectsSpoofedCreator() public {
        LaunchFactory.LaunchParams memory p = launchParams("FAKE", 0, 0);
        usdgToken.mint(alice, 10e6);
        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        usdgToken.approve(address(router), 10e6);
        bytes32 h = factory.configHash(configId);
        vm.expectRevert(LaunchRouter.NotCreator.selector);
        router.launch{value: LAUNCH_FEE}(p, configId, synth, h, address(usdgToken), 10e6, 0);
        vm.stopPrank();
    }

    function test_buyWithUsdg_matchesQuote() public {
        uint256 quoted = router.quoteBuy(token, address(usdgToken), 500e6);
        usdgToken.mint(alice, 500e6);
        vm.startPrank(alice);
        usdgToken.approve(address(router), 500e6);
        uint256 out = router.buy(token, address(usdgToken), 500e6, quoted, alice, block.timestamp);
        vm.stopPrank();
        assertEq(out, quoted);
        assertEq(IERC20(token).balanceOf(alice), out);
        // 490 USDG after 2% fees buys 122.5M tokens at the opening price; the curve climbs as it fills,
        // so a 500 USDG order on a $4k market cap gets roughly 12% fewer.
        assertLt(out, 122_500_000e18);
        assertGt(out, 100_000_000e18);
    }

    function test_buyWithPair() public {
        fundPair(synth, alice, 1e18);
        vm.startPrank(alice);
        IERC20(synth).approve(address(router), 1e18);
        uint256 out = router.buy(token, synth, 1e18, 0, alice, block.timestamp);
        vm.stopPrank();
        assertGt(out, 0);
        assertEq(IERC20(synth).balanceOf(alice), 0);
    }

    function test_sellForUsdg_redeemsThroughVault() public {
        usdgToken.mint(alice, 500e6);
        vm.startPrank(alice);
        usdgToken.approve(address(router), 500e6);
        uint256 bought = router.buy(token, address(usdgToken), 500e6, 0, alice, block.timestamp);
        (uint256 quotedUsdg,) = router.quoteSell(token, bought, address(usdgToken));
        IERC20(token).approve(address(router), bought);
        uint256 out = router.sell(token, bought, address(usdgToken), quotedUsdg, alice, block.timestamp);
        vm.stopPrank();
        assertEq(out, quotedUsdg);
        // two 2% trade fees and a 0.3% redemption fee
        assertApproxEqRel(out, 478e6, 1e16);
        assertEq(usdgToken.balanceOf(alice), out);
    }

    function test_sellForPair() public {
        usdgToken.mint(alice, 100e6);
        vm.startPrank(alice);
        usdgToken.approve(address(router), 100e6);
        uint256 bought = router.buy(token, address(usdgToken), 100e6, 0, alice, block.timestamp);
        IERC20(token).approve(address(router), bought);
        uint256 out = router.sell(token, bought, synth, 0, alice, block.timestamp);
        vm.stopPrank();
        assertEq(IERC20(synth).balanceOf(alice), out);
    }

    function test_buy_revertsOnSlippage() public {
        uint256 quoted = router.quoteBuy(token, address(usdgToken), 100e6);
        usdgToken.mint(alice, 100e6);
        vm.startPrank(alice);
        usdgToken.approve(address(router), 100e6);
        vm.expectRevert(LaunchRouter.SlippageExceeded.selector);
        router.buy(token, address(usdgToken), 100e6, quoted + 1, alice, block.timestamp);
        vm.stopPrank();
    }

    function test_buy_revertsAfterDeadline() public {
        vm.warp(1000);
        vm.expectRevert(LaunchRouter.DeadlineExpired.selector);
        router.buy(token, address(usdgToken), 1, 0, alice, block.timestamp - 1);
    }

    function test_buy_sellingOutCurveRefundsUnusedInput() public {
        uint256 pairIn = 100e18; // ~$42k of synth: far more than the curve can absorb
        fundPair(synth, bob, pairIn);
        vm.startPrank(bob);
        IERC20(synth).approve(address(router), pairIn);
        uint256 cap = router.maxBuyInput(token, synth);
        uint256 treasuryBefore = escrow.balanceOf(launchTreasury, Currency.wrap(synth));
        router.buy(token, synth, pairIn, 0, bob, block.timestamp);
        vm.stopPrank();
        assertTrue(factory.isReadyToMigrate(token));
        // Only the capped input was pulled, and fees were charged on that alone (2% total, protocol 0.3%).
        assertApproxEqAbs(IERC20(synth).balanceOf(bob), pairIn - cap, 2); // the cap carries a 1-2 wei rounding margin that is refunded
        uint256 protocolFee = escrow.balanceOf(launchTreasury, Currency.wrap(synth)) - treasuryBefore;
        assertApproxEqRel(protocolFee, cap * 30 / 10_000, 1e15);
        assertEq(IERC20(synth).balanceOf(address(router)), 0);
        factory.migrate(token);
        assertTrue(factory.isGraduated(token));
    }

    function test_maxBuyInput_usdgRouteSellsOutCurve() public {
        uint256 cap = router.maxBuyInput(token, address(usdgToken));
        // ~$10k raised on the curve plus 2% fees
        assertApproxEqRel(cap, 10_150e6, 3e16);
        usdgToken.mint(alice, cap * 2);
        vm.startPrank(alice);
        usdgToken.approve(address(router), cap * 2);
        router.buy(token, address(usdgToken), cap * 2, 0, alice, block.timestamp);
        vm.stopPrank();
        assertTrue(factory.isReadyToMigrate(token));
        assertEq(usdgToken.balanceOf(alice), cap);
        assertEq(router.maxBuyInput(token, address(usdgToken)), 0);
    }

    /// @dev Escrow ERC-6909 claims always equal the sum of credited balances.
    function testFuzz_escrowSolvent(uint96 buyUsdg, uint8 sellPct) public {
        buyUsdg = uint96(bound(buyUsdg, 1e6, 5_000e6));
        sellPct = uint8(bound(sellPct, 1, 100));
        usdgToken.mint(alice, buyUsdg);
        vm.startPrank(alice);
        usdgToken.approve(address(router), buyUsdg);
        uint256 bought = router.buy(token, address(usdgToken), buyUsdg, 0, alice, block.timestamp);
        uint256 toSell = bought * sellPct / 100;
        IERC20(token).approve(address(router), toSell);
        router.sell(token, toSell, synth, 0, alice, block.timestamp);
        vm.stopPrank();

        Currency c = Currency.wrap(synth);
        uint256 credited = escrow.balanceOf(creator, c) + escrow.balanceOf(launchTreasury, c);
        assertEq(manager.balanceOf(address(escrow), c.toId()), credited);
    }
}

contract LaunchRouterLowUsdgTest is LaunchRouterTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(uint160(0x1000000));
    }
}

contract LaunchRouterHighUsdgTest is LaunchRouterTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(type(uint160).max - 0xffff);
    }
}
```

- [ ] **Step 2: Verify**

Run: `forge test --match-path test/launchpad/LaunchRouter.t.sol`
Expected: 22 passed (11 per USDG placement), including `testFuzz_escrowSolvent` 256 runs

- [ ] **Step 3: Commit**

```bash
git add contracts/test/launchpad/LaunchRouter.t.sol
git commit -m "test(contracts): cover router routes, quotes, curve clamp and escrow solvency"
```

### Task 5: End-to-end fork test

**Files:**

- Test: `contracts/test/fork/LaunchpadFork.t.sol`

- [ ] **Step 1: Write the test**

`contracts/test/fork/LaunchpadFork.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AssetRegistry} from "../../src/rwa/AssetRegistry.sol";
import {IAssetRegistry} from "../../src/rwa/interfaces/IAssetRegistry.sol";
import {PriceWall} from "../../src/rwa/PriceWall.sol";
import {RedemptionVault} from "../../src/rwa/RedemptionVault.sol";
import {PriceMath} from "../../src/libraries/PriceMath.sol";
import {LaunchHook} from "../../src/launchpad/LaunchHook.sol";
import {LaunchFactory} from "../../src/launchpad/LaunchFactory.sol";
import {LaunchTokenDeployer} from "../../src/launchpad/LaunchTokenDeployer.sol";
import {FeeEscrow} from "../../src/launchpad/FeeEscrow.sol";
import {BuybackVault} from "../../src/launchpad/BuybackVault.sol";
import {LaunchLocker} from "../../src/launchpad/LaunchLocker.sol";
import {LaunchRouter} from "../../src/launchpad/LaunchRouter.sol";
import {RobinhoodChain} from "../../script/RobinhoodChain.sol";

/// @notice End-to-end on a Robinhood Chain fork: synth asset, synth-paired launch paid in USDG, trading, sell-out, graduation.
/// @dev forge test --match-path test/fork/LaunchpadFork.t.sol --fork-url http://127.0.0.1:8548
contract LaunchpadForkTest is Test {
    IPoolManager internal manager = IPoolManager(RobinhoodChain.POOL_MANAGER);
    IERC20 internal usdg = IERC20(RobinhoodChain.USDG);
    address internal owner = makeAddr("owner");
    address internal keeper = makeAddr("keeper");
    address internal creator = makeAddr("creator");
    address internal trader = makeAddr("trader");
    address internal treasury = makeAddr("treasury");

    AssetRegistry internal registry;
    LaunchFactory internal factory;
    LaunchRouter internal router;

    function setUp() public {
        vm.skip(block.chainid != RobinhoodChain.CHAIN_ID);

        registry = new AssetRegistry(owner, makeAddr("guardian"), keeper, treasury);
        address wallHook = address(
            uint160(Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG)
                | uint160(0x5555 << 144)
        );
        deployCodeTo("WallHook.sol:WallHook", abi.encode(manager, registry), wallHook);
        PriceWall priceWall = new PriceWall(manager, registry, IHooks(wallHook), address(usdg));
        RedemptionVault vault = new RedemptionVault(registry, address(usdg));
        vm.prank(owner);
        registry.wire(address(priceWall), address(vault));

        address hookAddr = address(
            uint160(
                Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG
                    | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
            ) | uint160(0x6666 << 144)
        );
        deployCodeTo("LaunchHook.sol:LaunchHook", abi.encode(manager, address(this)), hookAddr);
        LaunchHook hook = LaunchHook(hookAddr);
        LaunchTokenDeployer tokenDeployer = new LaunchTokenDeployer();
        factory = new LaunchFactory(
            owner, manager, registry, address(usdg), hook, tokenDeployer, treasury, makeAddr("guardian"), 0.0005 ether
        );
        tokenDeployer.setFactory(address(factory));
        FeeEscrow escrow = new FeeEscrow(manager, hookAddr);
        BuybackVault buyback = new BuybackVault(manager, hook, factory, escrow, 365 days);
        LaunchLocker locker = new LaunchLocker(manager, address(factory));
        router = new LaunchRouter(manager, factory, registry, address(usdg));
        hook.wire(address(factory), address(locker), escrow, buyback);

        vm.startPrank(owner);
        factory.setLocker(locker);
        factory.setRouter(address(router));
        factory.addConfig(
            LaunchFactory.LaunchConfig(1_000_000_000e18, 714_285_714e18, 25_000, 200, 4_000e18, 500, true)
        );
        vm.stopPrank();
    }

    function test_fork_launchTradeGraduate() public {
        IAssetRegistry.AssetConfig memory c;
        c.name = "Big Mac US";
        c.symbol = "sBIGMAC";
        c.category = IAssetRegistry.Category.COLLECTIBLE;
        c.metadataURI = "ipfs://bigmac";
        c.unitScale = 1e18;
        c.maxMoveTicks = 2_000;
        c.minUpdateInterval = 1 hours;
        c.heartbeat = 48 hours;
        c.wallSupply = 1_000_000_000e18;
        address predicted = vm.computeCreateAddress(address(registry), vm.getNonce(address(registry)));
        int24 tick = PriceMath.tickAtPrice(5.69e18, predicted < address(usdg), 1e30);
        vm.prank(owner);
        uint256 assetId = registry.addAsset(c, tick);
        address synth = registry.getState(assetId).token;

        // Launch paid in real USDG through the router.
        LaunchFactory.LaunchParams memory p;
        p.name = "Burger Coin";
        p.symbol = "BURGER";
        p.logo = "ipfs://burger";
        p.creator = creator;
        p.creatorTaxBps = 100;
        p.buybackBps = 2_000;
        p.salt = keccak256("burger");
        deal(address(usdg), creator, 25e6);
        vm.deal(creator, 1 ether);
        vm.startPrank(creator);
        usdg.approve(address(router), 25e6);
        address token = router.launch{value: 0.0005 ether}(
            p, 0, synth, factory.configHash(0), address(usdg), 25e6, 0
        );
        vm.stopPrank();
        assertGt(IERC20(token).balanceOf(creator), 0);

        // A whale sells out the curve with USDG, then anyone graduates it.
        deal(address(usdg), trader, 30_000e6);
        vm.startPrank(trader);
        usdg.approve(address(router), type(uint256).max);
        uint256 bought = router.buy(token, address(usdg), 30_000e6, 0, trader, block.timestamp);
        vm.stopPrank();
        assertGt(bought, 600_000_000e18);
        assertTrue(factory.isReadyToMigrate(token));
        factory.migrate(token);
        assertTrue(factory.isGraduated(token));

        // Post-graduation sell straight back to USDG via the vault.
        vm.startPrank(trader);
        IERC20(token).approve(address(router), bought / 10);
        uint256 usdgOut = router.sell(token, bought / 10, address(usdg), 0, trader, block.timestamp);
        vm.stopPrank();
        assertGt(usdgOut, 0);
    }
}
```

- [ ] **Step 2: Verify**

Run: `node script/rpc-proxy.mjs &  then  forge test --match-path test/fork/LaunchpadFork.t.sol --fork-url http://127.0.0.1:8548`
Expected: `test_fork_launchTradeGraduate` passes against live PoolManager and USDG

- [ ] **Step 3: Commit**

```bash
git add contracts/test/fork/LaunchpadFork.t.sol
git commit -m "test(contracts): fork-test launch, sell-out and graduation on Robinhood Chain"
```

### Task 6: Deployment scripts

**Files:**
- Create: `contracts/script/DeployLaunchpad.s.sol`
- Create: `contracts/script/AddAsset.s.sol`


- [ ] **Step 1: Write `DeployLaunchpad.s.sol`**

`contracts/script/DeployLaunchpad.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IAssetRegistry} from "../src/rwa/interfaces/IAssetRegistry.sol";
import {LaunchHook} from "../src/launchpad/LaunchHook.sol";
import {LaunchFactory} from "../src/launchpad/LaunchFactory.sol";
import {LaunchTokenDeployer} from "../src/launchpad/LaunchTokenDeployer.sol";
import {FeeEscrow} from "../src/launchpad/FeeEscrow.sol";
import {BuybackVault} from "../src/launchpad/BuybackVault.sol";
import {LaunchLocker} from "../src/launchpad/LaunchLocker.sol";
import {LaunchRouter} from "../src/launchpad/LaunchRouter.sol";
import {HookMiner} from "./utils/HookMiner.sol";
import {RobinhoodChain} from "./RobinhoodChain.sol";

/// @notice Deploys the launchpad on top of an existing RWA registry and adds the default launch config.
/// @dev env: REGISTRY, OWNER, GUARDIAN, TREASURY. Example:
///      forge script script/DeployLaunchpad.s.sol --rpc-url robinhood --broadcast --account deployer
contract DeployLaunchpad is Script {
    uint256 internal constant LAUNCH_FEE = 0.0005 ether;
    uint256 internal constant BUYBACK_VESTING = 365 days;

    function run()
        external
        returns (LaunchHook hook, LaunchFactory factory, FeeEscrow escrow, BuybackVault buyback, LaunchLocker locker, LaunchRouter router)
    {
        IAssetRegistry registry = IAssetRegistry(vm.envAddress("REGISTRY"));
        address finalOwner = vm.envAddress("OWNER");
        address guardian = vm.envAddress("GUARDIAN");
        address treasury = vm.envAddress("TREASURY");
        IPoolManager manager = IPoolManager(RobinhoodChain.POOL_MANAGER);

        vm.startBroadcast();
        address deployer = msg.sender;

        uint160 flags = uint160(
            Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG
                | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
        );
        bytes memory args = abi.encode(manager, deployer);
        (address hookAddr, bytes32 salt) =
            HookMiner.find(RobinhoodChain.CREATE2_DEPLOYER, flags, type(LaunchHook).creationCode, args);
        hook = new LaunchHook{salt: salt}(manager, deployer);
        require(address(hook) == hookAddr, "hook address mismatch");

        LaunchTokenDeployer tokenDeployer = new LaunchTokenDeployer();
        factory = new LaunchFactory(
            deployer, manager, registry, RobinhoodChain.USDG, hook, tokenDeployer, treasury, guardian, LAUNCH_FEE
        );
        tokenDeployer.setFactory(address(factory));
        escrow = new FeeEscrow(manager, address(hook));
        buyback = new BuybackVault(manager, hook, factory, escrow, BUYBACK_VESTING);
        locker = new LaunchLocker(manager, address(factory));
        router = new LaunchRouter(manager, factory, registry, RobinhoodChain.USDG);

        hook.wire(address(factory), address(locker), escrow, buyback);
        factory.setLocker(locker);
        factory.setRouter(address(router));
        factory.addConfig(
            LaunchFactory.LaunchConfig({
                supply: 1_000_000_000e18,
                curveSupply: 714_285_714e18,
                curveWidthTicks: 25_000,
                tickSpacing: 200,
                startMarketCapUsd: 4_000e18,
                maxCreatorTaxBps: 500,
                enabled: true
            })
        );
        if (finalOwner != deployer) factory.transferOwnership(finalOwner);
        vm.stopBroadcast();

        console2.log("LaunchHook   ", address(hook));
        console2.log("LaunchFactory", address(factory));
        console2.log("TokenDeployer", address(tokenDeployer));
        console2.log("FeeEscrow    ", address(escrow));
        console2.log("BuybackVault ", address(buyback));
        console2.log("LaunchLocker ", address(locker));
        console2.log("LaunchRouter ", address(router));
    }
}
```

- [ ] **Step 2: Write `AddAsset.s.sol`**

`contracts/script/AddAsset.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {AssetRegistry} from "../src/rwa/AssetRegistry.sol";
import {IAssetRegistry} from "../src/rwa/interfaces/IAssetRegistry.sol";
import {PriceMath} from "../src/libraries/PriceMath.sol";
import {RobinhoodChain} from "./RobinhoodChain.sol";

/// @notice Adds one synthetic asset. Must be broadcast by the registry owner.
/// @dev env: REGISTRY, NAME, SYMBOL, CATEGORY (0 macro, 1 collectible), METADATA_URI, UNIT_SCALE,
///      PRICE_USD_X18 (opening price per token, 1e18), WALL_SUPPLY.
///      Bounds default by category: macro +-500 ticks / 1h / 45d, collectible +-2000 ticks / 1h / 48h.
contract AddAsset is Script {
    function run() external returns (uint256 assetId) {
        AssetRegistry registry = AssetRegistry(vm.envAddress("REGISTRY"));
        IAssetRegistry.Category category = IAssetRegistry.Category(vm.envUint("CATEGORY"));

        IAssetRegistry.AssetConfig memory c;
        c.name = vm.envString("NAME");
        c.symbol = vm.envString("SYMBOL");
        c.category = category;
        c.metadataURI = vm.envString("METADATA_URI");
        c.unitScale = vm.envUint("UNIT_SCALE");
        c.wallSupply = vm.envUint("WALL_SUPPLY");
        c.minUpdateInterval = 1 hours;
        if (category == IAssetRegistry.Category.MACRO) {
            c.maxMoveTicks = 500;
            c.heartbeat = 45 days;
        } else {
            c.maxMoveTicks = 2_000;
            c.heartbeat = 48 hours;
        }

        // The synth address decides token ordering; predict it from the registry's CREATE nonce.
        address predicted = vm.computeCreateAddress(address(registry), vm.getNonce(address(registry)));
        int24 tick = PriceMath.tickAtPrice(vm.envUint("PRICE_USD_X18"), predicted < RobinhoodChain.USDG, 1e30);

        vm.startBroadcast();
        assetId = registry.addAsset(c, tick);
        vm.stopBroadcast();
        console2.log("assetId", assetId);
        console2.log("token  ", registry.getState(assetId).token);
    }
}
```

- [ ] **Step 3: Verify**

Run: `REGISTRY=0x000000000000000000000000000000000000bEEF GUARDIAN=0x000000000000000000000000000000000000dEaD TREASURY=0x000000000000000000000000000000000000cafE OWNER=0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38 forge script script/DeployLaunchpad.s.sol --fork-url http://127.0.0.1:8548 --sender 0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38`
Expected: `SIMULATION COMPLETE`, ~20.3M gas, ~0.0029 ETH

- [ ] **Step 4: Commit**

```bash
git add contracts/script/DeployLaunchpad.s.sol contracts/script/AddAsset.s.sol
git commit -m "feat(contracts): add launchpad deployment and add-asset scripts"
```

## Spec coverage (self-review)

| Spec section | Covered by |
|---|---|
| 4.1 LaunchFactory launch: fee, allowed pairs, stale/paused rejection, first buy | Task 3 (`test_launch_*`) |
| 4.1 LaunchToken fixed supply, metadata, no owner | Tasks 1, 3 (`test_launch_storesMetadata`) |
| 4.1 LaunchHook fees in pair asset, third-party liquidity blocked | Task 3 (`test_buy*`, `test_sell*`, `test_thirdPartyLiquidity_reverts`) |
| 4.1 FeeEscrow pull claims | Task 3 (`test_creatorClaimsFees`), Task 4 (`testFuzz_escrowSolvent`) |
| 4.1 LaunchLocker add-only | Task 2 (no removal code), Task 3 (`test_migrate_locksLiquidityAtCurveEndPrice`) |
| 4.1 LaunchRouter pay in USDG or pair | Task 4 |
| 4.2 LaunchConfig and expectedConfigHash | Task 3 (`test_launch_revertsConfigMismatch`) |
| 4.3 Fees 1% base, 70/30, creator tax <= 5%, buyback share, vesting | Task 3 (fee and buyback tests) |
| 4.3 Creator controls: fee recipient, buyback on/off; guardian off only | Task 3 |
| 4.4 Lifecycle: curve, sell-out blocks buys not sells, permissionless migrate, burn surplus | Task 3 |
| 4.5 Custom errors, reentrancy guards | Tasks 2-4 |
| 8 Fork tests against live PoolManager/USDG | Task 5 |
| Deployment | Task 6 |
