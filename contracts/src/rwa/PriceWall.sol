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
