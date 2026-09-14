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
