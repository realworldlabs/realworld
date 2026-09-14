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
