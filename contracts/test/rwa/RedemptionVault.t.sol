// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {RedemptionVault} from "../../src/rwa/RedemptionVault.sol";
import {RwaFixture} from "../utils/RwaFixture.sol";

abstract contract RedemptionVaultTestBase is RwaFixture {
    uint256 internal assetId;

    function setUp() public {
        setUpRwa();
        assetId = addAsset("sCSUS", 10e18);
    }

    function _redeemAll(address who) internal returns (uint256 out) {
        IERC20 synth = synthOf(assetId);
        uint256 bal = synth.balanceOf(who);
        vm.startPrank(who);
        synth.approve(address(vault), bal);
        out = vault.redeem(assetId, bal, 0, who);
        vm.stopPrank();
    }

    function test_redeem_fullValueWhenPotCovers() public {
        buySynth(assetId, alice, 1_000e6);
        uint256 out = _redeemAll(alice);
        // 1000 USDG back minus 0.3% fee, allowing wall rounding
        assertApproxEqRel(out, 997e6, 5e14);
        assertApproxEqRel(usdgToken.balanceOf(treasury), 3e6, 5e14);
        // redeemed synth returns to the wall
        assertEq(synthOf(assetId).balanceOf(alice), 0);
    }

    function test_redeem_haircutAfterPriceRise() public {
        buySynth(assetId, alice, 1_000e6);
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, tickFor(assetId, 10.45e18)); // +4.5%

        (, , , uint256 ratio) = vault.quoteRedeem(assetId, 1e18);
        assertApproxEqRel(ratio, uint256(1e18) * 1000 / 1045, 1e15);

        uint256 out = _redeemAll(alice);
        // Pot is only 1000 USDG: she gets the whole pot minus the fee.
        assertApproxEqRel(out, 997e6, 1e15);
        assertLe(usdgToken.balanceOf(address(vault)), 2);
    }

    function test_redeem_proRataBetweenHolders() public {
        buySynth(assetId, alice, 1_000e6);
        buySynth(assetId, bob, 1_000e6);
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, tickFor(assetId, 10.45e18));

        uint256 outAlice = _redeemAll(alice);
        uint256 outBob = _redeemAll(bob);
        // Both take the same haircut regardless of order.
        assertApproxEqRel(outAlice, outBob, 1e15);
        assertApproxEqRel(outAlice + outBob, 1_994e6, 1e15);
    }

    function test_redeem_fullValueAfterPriceFall() public {
        buySynth(assetId, alice, 1_000e6);
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, tickFor(assetId, 9.6e18));
        uint256 out = _redeemAll(alice);
        assertApproxEqRel(out, 960e6 * 997 / 1000, 1e15);
        // Surplus stays in the pot for later holders.
        assertApproxEqRel(vault.pot(assetId), 40e6, 1e16);
    }

    function test_redeem_revertsBelowMinOut() public {
        buySynth(assetId, alice, 1_000e6);
        IERC20 synth = synthOf(assetId);
        uint256 bal = synth.balanceOf(alice);
        vm.startPrank(alice);
        synth.approve(address(vault), bal);
        vm.expectRevert(RedemptionVault.InsufficientOutput.selector);
        vault.redeem(assetId, bal, 1_000e6, alice);
        vm.stopPrank();
    }

    function test_creditPot_onlyPriceWall() public {
        vm.expectRevert(RedemptionVault.Unauthorized.selector);
        vault.creditPot(assetId, 1);
    }
}

contract RedemptionVaultSynthToken0Test is RedemptionVaultTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(type(uint160).max - 0xffff);
    }
}

contract RedemptionVaultSynthToken1Test is RedemptionVaultTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(uint160(0x1000000));
    }
}
