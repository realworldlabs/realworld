// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LaunchFactory} from "../../src/launchpad/LaunchFactory.sol";
import {LaunchRouter} from "../../src/launchpad/LaunchRouter.sol";
import {LaunchFixture} from "../utils/LaunchFixture.sol";

abstract contract LaunchRouterTestBase is LaunchFixture {
    uint256 internal assetId;
    address internal synth;
    address internal token;

    function setUp() public {
        setUpLaunchpad();
        assetId = addAsset("sCHARIZARD", 420e18);
        synth = registry.getState(assetId).token;

        // Creator launches a synth-paired coin paying 10 USDG through the router.
        usdgToken.mint(creator, 10e6);
        LaunchFactory.LaunchParams memory p = launchParams("PIKA", 100, 0);
        vm.startPrank(creator);
        usdgToken.approve(address(router), 10e6);
        token = router.launch{value: LAUNCH_FEE}(
            p, configId, synth, factory.configHash(configId), address(usdgToken), 10e6, 0
        );
        vm.stopPrank();
    }

    function test_launchViaRouter_paysInUsdg() public view {
        assertEq(factory.getLaunch(token).creator, creator);
        assertGt(IERC20(token).balanceOf(creator), 2_000_000e18);
        assertEq(usdgToken.balanceOf(creator), 0);
        assertEq(IERC20(synth).balanceOf(address(router)), 0);
        assertApproxEqRel(tokenPriceUsd(token), 4e12, 2.5e16);
    }

    function test_launchViaRouter_withoutFirstBuy() public {
        LaunchFactory.LaunchParams memory p = launchParams("ZERO", 0, 0);
        bytes32 h = factory.configHash(configId);
        vm.prank(creator);
        address t = router.launch{value: LAUNCH_FEE}(p, configId, synth, h, address(usdgToken), 0, 0);
        assertEq(factory.getLaunch(t).creator, creator);
        assertEq(IERC20(t).balanceOf(creator), 0);
        assertApproxEqRel(tokenPriceUsd(t), 4e12, 2.5e16);
        assertEq(IERC20(synth).balanceOf(address(router)), 0);
    }

    function test_launchViaRouter_rejectsSpoofedCreator() public {
        LaunchFactory.LaunchParams memory p = launchParams("FAKE", 0, 0);
        usdgToken.mint(alice, 10e6);
        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        usdgToken.approve(address(router), 10e6);
        bytes32 h = factory.configHash(configId);
        vm.expectRevert(LaunchRouter.NotCreator.selector);
        router.launch{value: LAUNCH_FEE}(p, configId, synth, h, address(usdgToken), 10e6, 0);
        vm.stopPrank();
    }

    function test_buyWithUsdg_matchesQuote() public {
        uint256 quoted = router.quoteBuy(token, address(usdgToken), 500e6);
        usdgToken.mint(alice, 500e6);
        vm.startPrank(alice);
        usdgToken.approve(address(router), 500e6);
        uint256 out = router.buy(token, address(usdgToken), 500e6, quoted, alice, block.timestamp);
        vm.stopPrank();
        assertEq(out, quoted);
        assertEq(IERC20(token).balanceOf(alice), out);
        // 490 USDG after 2% fees buys 122.5M tokens at the opening price; the curve climbs as it fills,
        // so a 500 USDG order on a $4k market cap gets roughly 12% fewer.
        assertLt(out, 122_500_000e18);
        assertGt(out, 100_000_000e18);
    }

    function test_buyWithPair() public {
        fundPair(synth, alice, 1e18);
        vm.startPrank(alice);
        IERC20(synth).approve(address(router), 1e18);
        uint256 out = router.buy(token, synth, 1e18, 0, alice, block.timestamp);
        vm.stopPrank();
        assertGt(out, 0);
        assertEq(IERC20(synth).balanceOf(alice), 0);
    }

    function test_sellForUsdg_throughWall() public {
        usdgToken.mint(alice, 500e6);
        vm.startPrank(alice);
        usdgToken.approve(address(router), 500e6);
        uint256 bought = router.buy(token, address(usdgToken), 500e6, 0, alice, block.timestamp);
        (uint256 quotedUsdg, uint256 quotedSynth) = router.quoteSell(token, bought, address(usdgToken));
        IERC20(token).approve(address(router), bought);
        uint256 out = router.sell(token, bought, address(usdgToken), quotedUsdg, alice, block.timestamp);
        vm.stopPrank();
        assertEq(out, quotedUsdg);
        assertGt(quotedSynth, 0);
        // two 2% trade fees, then the wall's one-tick spread
        assertApproxEqRel(out, 480e6, 1e16);
        assertEq(usdgToken.balanceOf(alice), out);
        assertEq(IERC20(synth).balanceOf(alice), 0);
    }

    function test_swapWall_roundTrip() public {
        usdgToken.mint(alice, 1_000e6);
        vm.startPrank(alice);
        usdgToken.approve(address(router), 1_000e6);
        uint256 quotedSynth = router.quoteWall(synth, false, 1_000e6);
        uint256 synthOut = router.swapWall(synth, false, 1_000e6, quotedSynth, alice, block.timestamp);
        assertEq(synthOut, quotedSynth);
        assertApproxEqRel(synthOut, uint256(1_000e18) / 420, 3e14);

        IERC20(synth).approve(address(router), synthOut);
        uint256 quotedUsdg = router.quoteWall(synth, true, synthOut);
        uint256 usdgOut = router.swapWall(synth, true, synthOut, quotedUsdg, alice, block.timestamp);
        vm.stopPrank();
        assertEq(usdgOut, quotedUsdg);
        assertApproxEqRel(usdgOut, 1_000e6, 5e14);
    }

    function test_sellForPair() public {
        usdgToken.mint(alice, 100e6);
        vm.startPrank(alice);
        usdgToken.approve(address(router), 100e6);
        uint256 bought = router.buy(token, address(usdgToken), 100e6, 0, alice, block.timestamp);
        IERC20(token).approve(address(router), bought);
        uint256 out = router.sell(token, bought, synth, 0, alice, block.timestamp);
        vm.stopPrank();
        assertEq(IERC20(synth).balanceOf(alice), out);
    }

    function test_buy_revertsOnSlippage() public {
        uint256 quoted = router.quoteBuy(token, address(usdgToken), 100e6);
        usdgToken.mint(alice, 100e6);
        vm.startPrank(alice);
        usdgToken.approve(address(router), 100e6);
        vm.expectRevert(LaunchRouter.SlippageExceeded.selector);
        router.buy(token, address(usdgToken), 100e6, quoted + 1, alice, block.timestamp);
        vm.stopPrank();
    }

    function test_buy_revertsAfterDeadline() public {
        vm.warp(1000);
        vm.expectRevert(LaunchRouter.DeadlineExpired.selector);
        router.buy(token, address(usdgToken), 1, 0, alice, block.timestamp - 1);
    }

    function test_buy_sellingOutCurveRefundsUnusedInput() public {
        uint256 pairIn = 100e18; // ~$42k of synth: far more than the curve can absorb
        fundPair(synth, bob, pairIn);
        vm.startPrank(bob);
        IERC20(synth).approve(address(router), pairIn);
        uint256 cap = router.maxBuyInput(token, synth);
        uint256 treasuryBefore = escrow.balanceOf(launchTreasury, Currency.wrap(synth));
        router.buy(token, synth, pairIn, 0, bob, block.timestamp);
        vm.stopPrank();
        assertTrue(factory.isReadyToMigrate(token));
        // The buy stops exactly at the curve end instead of running through the empty range above it.
        assertEq(_sqrtPrice(token), _curveEndSqrtPrice(token));
        // Only the capped input was pulled, and fees were charged on that alone (2% total, protocol 0.3%).
        assertApproxEqAbs(IERC20(synth).balanceOf(bob), pairIn - cap, 2); // the cap carries a 1-2 wei rounding margin that is refunded
        uint256 protocolFee = escrow.balanceOf(launchTreasury, Currency.wrap(synth)) - treasuryBefore;
        assertApproxEqRel(protocolFee, cap * 30 / 10_000, 1e15);
        assertEq(IERC20(synth).balanceOf(address(router)), 0);
        factory.migrate(token);
        assertTrue(factory.isGraduated(token));
    }

    function test_maxBuyInput_usdgRouteSellsOutCurve() public {
        uint256 cap = router.maxBuyInput(token, address(usdgToken));
        // ~$10k raised on the curve plus 2% fees
        assertApproxEqRel(cap, 10_150e6, 3e16);
        usdgToken.mint(alice, cap * 2);
        vm.startPrank(alice);
        usdgToken.approve(address(router), cap * 2);
        router.buy(token, address(usdgToken), cap * 2, 0, alice, block.timestamp);
        vm.stopPrank();
        assertTrue(factory.isReadyToMigrate(token));
        assertEq(usdgToken.balanceOf(alice), cap);
        assertEq(router.maxBuyInput(token, address(usdgToken)), 0);
    }

    function _sqrtPrice(address t) internal view returns (uint160 sqrtP) {
        (sqrtP,,,) = StateLibrary.getSlot0(manager, factory.poolKeyOf(t).toId());
    }

    function _curveEndSqrtPrice(address t) internal view returns (uint160) {
        LaunchFactory.Launch memory l = factory.getLaunch(t);
        return TickMath.getSqrtPriceAtTick(l.tokenIsToken0 ? l.curveUpper : l.curveLower);
    }

    /// @dev Escrow ERC-6909 claims always equal the sum of credited balances.
    function testFuzz_escrowSolvent(uint96 buyUsdg, uint8 sellPct) public {
        buyUsdg = uint96(bound(buyUsdg, 1e6, 5_000e6));
        sellPct = uint8(bound(sellPct, 1, 100));
        usdgToken.mint(alice, buyUsdg);
        vm.startPrank(alice);
        usdgToken.approve(address(router), buyUsdg);
        uint256 bought = router.buy(token, address(usdgToken), buyUsdg, 0, alice, block.timestamp);
        uint256 toSell = bought * sellPct / 100;
        IERC20(token).approve(address(router), toSell);
        router.sell(token, toSell, synth, 0, alice, block.timestamp);
        vm.stopPrank();

        Currency c = Currency.wrap(synth);
        uint256 credited = escrow.balanceOf(creator, c) + escrow.balanceOf(launchTreasury, c);
        assertEq(manager.balanceOf(address(escrow), c.toId()), credited);
    }
}

contract LaunchRouterLowUsdgTest is LaunchRouterTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(uint160(0x1000000));
    }
}

contract LaunchRouterHighUsdgTest is LaunchRouterTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(type(uint160).max - 0xffff);
    }
}
