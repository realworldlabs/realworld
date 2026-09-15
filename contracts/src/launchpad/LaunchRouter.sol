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
        /// @dev 0 means no limit. Buys on an active curve stop exactly at the curve end.
        uint160 sqrtPriceLimitX96;
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
    ///         `amountIn` may be zero for a launch without a first buy.
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
        if (payWith != pair && payWith != usdg) revert UnsupportedPayment();

        uint256 pairAmount = amountIn;
        if (amountIn > 0) {
            IERC20(payWith).safeTransferFrom(msg.sender, address(this), amountIn);
            if (payWith != pair) {
                Hop[] memory hops = new Hop[](1);
                hops[0] = _wallHop(pair);
                (pairAmount,) = _execute(hops, amountIn, Currency.wrap(usdg), Currency.wrap(pair), address(this), false);
            }
            IERC20(pair).forceApprove(address(factory), pairAmount);
        }
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
                    sqrtPriceLimitX96: h.sqrtPriceLimitX96 != 0
                        ? h.sqrtPriceLimitX96
                        : (h.zeroForOne ? TickMath.MIN_SQRT_PRICE + 1 : TickMath.MAX_SQRT_PRICE - 1)
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
            hops[0] = _curveBuyHop(token);
        } else if (payWith == usdg) {
            hops = new Hop[](2);
            hops[0] = _wallHop(pair);
            hops[1] = _curveBuyHop(token);
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

    /// @dev Buy hop into a launch pool. While the curve is active the price limit is the curve end:
    ///      otherwise a rounding remainder would drag the price through the empty range above the curve.
    function _curveBuyHop(address token) private view returns (Hop memory h) {
        LaunchFactory.Launch memory l = factory.getLaunch(token);
        h = _hopInto(l.key, token);
        if (!l.graduated) h.sqrtPriceLimitX96 = TickMath.getSqrtPriceAtTick(l.tokenIsToken0 ? l.curveUpper : l.curveLower);
    }

    /// @dev Swap that ends holding `target`.
    function _hopInto(PoolKey memory key, address target) private pure returns (Hop memory) {
        return Hop({key: key, zeroForOne: Currency.unwrap(key.currency1) == target, sqrtPriceLimitX96: 0});
    }

    /// @dev Swap that spends `source`.
    function _hop(PoolKey memory key, address source) private pure returns (Hop memory) {
        return Hop({key: key, zeroForOne: Currency.unwrap(key.currency0) == source, sqrtPriceLimitX96: 0});
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
