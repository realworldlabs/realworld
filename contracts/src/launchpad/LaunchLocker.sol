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
