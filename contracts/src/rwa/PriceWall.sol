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
import {PriceMath} from "../libraries/PriceMath.sol";

/// @notice A two-sided, one-tick market for each synth in Uniswap v4, priced in USDG.
///         The synth float is offered at the wall tick and every USDG ever paid for it bids one tick below,
///         so holders can always sell back into the money that bought in. The keeper moves both sides together.
contract PriceWall is IPriceWall, IUnlockCallback, ReentrancyGuardTransient {
    using SafeERC20 for IERC20;
    using StateLibrary for IPoolManager;

    struct Wall {
        PoolKey key;
        bool synthIsToken0;
        /// @dev The wall price. Synth is offered at this tick; USDG bids in the tick just below it.
        int24 tick;
        uint128 synthLiquidity;
        uint128 usdgLiquidity;
    }

    IPoolManager public immutable poolManager;
    IAssetRegistry public immutable registry;
    IHooks public immutable hook;
    Currency public immutable usdg;
    /// @dev 10 ** (18 + 18 - usdgDecimals)
    uint256 public immutable priceScale;

    mapping(uint256 assetId => Wall) private _walls;

    event WallReset(uint256 indexed assetId, int24 tick, uint128 synthLiquidity, uint128 usdgLiquidity);
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
        w.tick = startTick;

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

    /// @notice Re-parks the pool at the wall tick and re-deposits any idle synth or USDG. Permissionless.
    function rebalance(uint256 assetId) external nonReentrant {
        if (_walls[assetId].key.tickSpacing == 0) revert NoWall();
        _reset(assetId, registry.getState(assetId).tick);
    }

    function _reset(uint256 assetId, int24 tick) private {
        poolManager.unlock(abi.encode(assetId, tick));
        Wall storage w = _walls[assetId];
        emit WallReset(assetId, tick, w.synthLiquidity, w.usdgLiquidity);
    }

    function unlockCallback(bytes calldata data) external returns (bytes memory) {
        if (msg.sender != address(poolManager)) revert NotPoolManager();
        (uint256 assetId, int24 tick) = abi.decode(data, (uint256, int24));
        Wall storage w = _walls[assetId];

        int256 net0;
        int256 net1;

        // 1. Pull both sides of the existing wall.
        if (w.synthLiquidity > 0) {
            (int24 lower, int24 upper) = _synthRange(w.synthIsToken0, w.tick);
            (BalanceDelta d,) =
                poolManager.modifyLiquidity(w.key, ModifyLiquidityParams(lower, upper, -int256(uint256(w.synthLiquidity)), 0), "");
            net0 += d.amount0();
            net1 += d.amount1();
            w.synthLiquidity = 0;
        }
        if (w.usdgLiquidity > 0) {
            (int24 lower, int24 upper) = _usdgRange(w.synthIsToken0, w.tick);
            (BalanceDelta d,) =
                poolManager.modifyLiquidity(w.key, ModifyLiquidityParams(lower, upper, -int256(uint256(w.usdgLiquidity)), 0), "");
            net0 += d.amount0();
            net1 += d.amount1();
            w.usdgLiquidity = 0;
        }

        // 2. Park the (now empty) pool exactly at the wall tick.
        uint160 target = TickMath.getSqrtPriceAtTick(tick);
        (uint160 current,,,) = poolManager.getSlot0(w.key.toId());
        if (current != target) {
            poolManager.swap(w.key, SwapParams({zeroForOne: target < current, amountSpecified: -1, sqrtPriceLimitX96: target}), "");
        }

        // 3. Offer every synth this contract controls at the wall tick.
        (int256 synthNet, int256 usdgNet) = w.synthIsToken0 ? (net0, net1) : (net1, net0);
        {
            (int24 lower, int24 upper) = _synthRange(w.synthIsToken0, tick);
            uint256 synthAvailable = IERC20(_synth(w)).balanceOf(address(this)) + uint256(_positive(synthNet));
            uint160 sqrtA = TickMath.getSqrtPriceAtTick(lower);
            uint160 sqrtB = TickMath.getSqrtPriceAtTick(upper);
            uint128 liq = w.synthIsToken0
                ? LiquidityAmounts.getLiquidityForAmount0(sqrtA, sqrtB, synthAvailable)
                : LiquidityAmounts.getLiquidityForAmount1(sqrtA, sqrtB, synthAvailable);
            if (liq > 0) {
                (BalanceDelta d,) = poolManager.modifyLiquidity(w.key, ModifyLiquidityParams(lower, upper, int256(uint256(liq)), 0), "");
                net0 += d.amount0();
                net1 += d.amount1();
            }
            w.synthLiquidity = liq;
        }

        // 4. Bid every USDG this contract controls one tick below, so the float can always be sold back.
        {
            (int24 lower, int24 upper) = _usdgRange(w.synthIsToken0, tick);
            uint256 usdgAvailable = IERC20(Currency.unwrap(usdg)).balanceOf(address(this)) + uint256(_positive(usdgNet));
            uint160 sqrtA = TickMath.getSqrtPriceAtTick(lower);
            uint160 sqrtB = TickMath.getSqrtPriceAtTick(upper);
            uint128 liq = w.synthIsToken0
                ? LiquidityAmounts.getLiquidityForAmount1(sqrtA, sqrtB, usdgAvailable)
                : LiquidityAmounts.getLiquidityForAmount0(sqrtA, sqrtB, usdgAvailable);
            if (liq > 0) {
                (BalanceDelta d,) = poolManager.modifyLiquidity(w.key, ModifyLiquidityParams(lower, upper, int256(uint256(liq)), 0), "");
                net0 += d.amount0();
                net1 += d.amount1();
            }
            w.usdgLiquidity = liq;
        }
        w.tick = tick;

        // 5. Settle: both sides stay with this contract between resets.
        (synthNet, usdgNet) = w.synthIsToken0 ? (net0, net1) : (net1, net0);
        _settle(Currency.wrap(_synth(w)), synthNet);
        _settle(usdg, usdgNet);
        return "";
    }

    function _settle(Currency currency, int256 net) private {
        if (net > 0) {
            poolManager.take(currency, address(this), uint256(net));
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
        return PriceMath.priceAtTick(w.tick, w.synthIsToken0, priceScale);
    }

    /// @notice Synth still on offer and USDG still bidding, at the current pool price.
    /// @dev Either position can hold either token once trades have moved the price through it, so both are summed.
    function wallBalances(uint256 assetId) external view returns (uint256 synthAmount, uint256 usdgAmount) {
        Wall storage w = _walls[assetId];
        if (w.key.tickSpacing == 0) return (0, 0);
        (uint160 sqrtP,,,) = poolManager.getSlot0(w.key.toId());
        uint256 sum0;
        uint256 sum1;
        if (w.synthLiquidity > 0) {
            (int24 lower, int24 upper) = _synthRange(w.synthIsToken0, w.tick);
            (uint256 a0, uint256 a1) = _amounts(sqrtP, lower, upper, w.synthLiquidity);
            sum0 += a0;
            sum1 += a1;
        }
        if (w.usdgLiquidity > 0) {
            (int24 lower, int24 upper) = _usdgRange(w.synthIsToken0, w.tick);
            (uint256 a0, uint256 a1) = _amounts(sqrtP, lower, upper, w.usdgLiquidity);
            sum0 += a0;
            sum1 += a1;
        }
        return w.synthIsToken0 ? (sum0, sum1) : (sum1, sum0);
    }

    // ---------- internals ----------

    /// @dev Synth sits on the side of the wall tick where it is held when the price is at the tick.
    function _synthRange(bool synthIs0, int24 tick) private pure returns (int24 lower, int24 upper) {
        return synthIs0 ? (tick, tick + 1) : (tick - 1, tick);
    }

    function _usdgRange(bool synthIs0, int24 tick) private pure returns (int24 lower, int24 upper) {
        return synthIs0 ? (tick - 1, tick) : (tick, tick + 1);
    }

    function _amounts(uint160 sqrtP, int24 lower, int24 upper, uint128 liquidity) private pure returns (uint256 a0, uint256 a1) {
        uint160 sqrtA = TickMath.getSqrtPriceAtTick(lower);
        uint160 sqrtB = TickMath.getSqrtPriceAtTick(upper);
        if (sqrtP < sqrtA) sqrtP = sqrtA;
        if (sqrtP > sqrtB) sqrtP = sqrtB;
        a0 = SqrtPriceMath.getAmount0Delta(sqrtP, sqrtB, liquidity, false);
        a1 = SqrtPriceMath.getAmount1Delta(sqrtA, sqrtP, liquidity, false);
    }

    function _synth(Wall storage w) private view returns (address) {
        return Currency.unwrap(w.synthIsToken0 ? w.key.currency0 : w.key.currency1);
    }

    function _positive(int256 x) private pure returns (int256) {
        return x > 0 ? x : int256(0);
    }

    /// @dev Both neighbouring ticks must be usable.
    function _checkTick(int24 tick) private pure {
        if (tick <= TickMath.MIN_TICK + 1 || tick >= TickMath.MAX_TICK - 1) revert TickOutOfRange();
    }
}
