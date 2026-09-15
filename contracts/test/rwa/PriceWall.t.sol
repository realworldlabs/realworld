// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {ModifyLiquidityParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
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

    /// @dev The USDG that bought in bids one tick below the offer, so a sale gets the wall price minus ~1 bp.
    function test_sellSynth_returnsUsdgAtWallPrice() public {
        uint256 bought = buySynth(assetId, alice, 1_000e6);
        uint256 out = sellSynth(assetId, alice, bought);
        assertApproxEqRel(out, 1_000e6, 5e14);
        assertEq(synthOf(assetId).balanceOf(alice), 0);
        (uint256 synthInWall, uint256 usdgInWall) = priceWall.wallBalances(assetId);
        assertLe(usdgInWall, 2);
        assertApproxEqRel(synthInWall, 1_000_000_000e18, 1e12);
    }

    function test_sellSynth_anyoneCanSellWhatTheyHold() public {
        uint256 bought = buySynth(assetId, alice, 500e6);
        vm.startPrank(alice);
        synthOf(assetId).transfer(bob, bought);
        vm.stopPrank();
        uint256 out = sellSynth(assetId, bob, bought);
        assertApproxEqRel(out, 500e6, 5e14);
    }

    function test_sellSynth_stopsWhenWallUsdgRunsOut() public {
        uint256 aliceSynth = buySynth(assetId, alice, 1_000e6);
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, tickFor(assetId, 10.4e18)); // worth $1,040 now, only $1,000 bid

        uint256 out = sellSynth(assetId, alice, aliceSynth);
        assertApproxEqAbs(out, 1_000e6, 2);
        // The unsold remainder stays with her and can be sold once someone else buys in.
        uint256 left = synthOf(assetId).balanceOf(alice);
        assertGt(left, 3e18);
        assertLt(left, 4.5e18);

        buySynth(assetId, bob, 100e6);
        uint256 out2 = sellSynth(assetId, alice, left);
        assertApproxEqRel(out2, left * 104 / 10 / 1e12, 1e15); // $10.40 per synth, 6-dec USDG
    }

    function test_thirdPartyLiquidity_reverts() public {
        PoolKey memory key = priceWall.poolKeyOf(assetId);
        vm.expectRevert();
        modifyLiquidityRouter.modifyLiquidity(key, ModifyLiquidityParams(-100, 100, 1e18, 0), "");
    }

    function test_movePrice_up_keepsUsdgInWallAndReprices() public {
        buySynth(assetId, alice, 1_000e6);
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, tickFor(assetId, 10.4e18));

        (, uint256 usdgInWall) = priceWall.wallBalances(assetId);
        assertApproxEqAbs(usdgInWall, 1_000e6, 4);
        assertApproxEqRel(priceWall.priceX18(assetId), 10.4e18, 2e14);

        uint256 out = buySynth(assetId, bob, 1_040e6);
        assertApproxEqRel(out, 100e18, 3e14);
        // Sales now fill at the new price.
        uint256 usdgOut = sellSynth(assetId, bob, 50e18);
        assertApproxEqRel(usdgOut, 520e6, 5e14);
    }

    function test_movePrice_down_reprices() public {
        buySynth(assetId, alice, 1_000e6);
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, tickFor(assetId, 9.6e18));
        assertApproxEqRel(priceWall.priceX18(assetId), 9.6e18, 2e14);
        uint256 out = buySynth(assetId, bob, 960e6);
        assertApproxEqRel(out, 100e18, 3e14);
        // Alice's 100 synth now fetch $960; the surplus $40 keeps bidding.
        uint256 usdgOut = sellSynth(assetId, alice, synthOf(assetId).balanceOf(alice));
        assertApproxEqRel(usdgOut, 960e6, 5e14);
        (, uint256 usdgInWall) = priceWall.wallBalances(assetId);
        assertApproxEqRel(usdgInWall, 1_000e6, 1e15);
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

    function test_rebalance_keepsPriceAndBalances() public {
        buySynth(assetId, alice, 500e6);
        uint256 priceBefore = priceWall.priceX18(assetId);
        (uint256 synthBefore, uint256 usdgBefore) = priceWall.wallBalances(assetId);
        priceWall.rebalance(assetId);
        assertEq(priceWall.priceX18(assetId), priceBefore);
        (uint256 synthAfter, uint256 usdgAfter) = priceWall.wallBalances(assetId);
        assertApproxEqAbs(usdgAfter, usdgBefore, 2);
        assertApproxEqRel(synthAfter, synthBefore, 1e12);
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
