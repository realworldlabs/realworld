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
