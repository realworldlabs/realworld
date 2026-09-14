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
