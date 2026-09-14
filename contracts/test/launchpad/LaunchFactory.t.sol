// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {ModifyLiquidityParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Vm} from "forge-std/Vm.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LaunchFactory} from "../../src/launchpad/LaunchFactory.sol";
import {LaunchToken} from "../../src/launchpad/LaunchToken.sol";
import {BuybackVault} from "../../src/launchpad/BuybackVault.sol";
import {ILaunchHook} from "../../src/launchpad/interfaces/ILaunchpad.sol";
import {LaunchFixture} from "../utils/LaunchFixture.sol";

abstract contract LaunchFactoryTestBase is LaunchFixture {
    using StateLibrary for *;

    address internal token;
    Currency internal usdgC;

    function setUp() public {
        setUpLaunchpad();
        usdgC = Currency.wrap(address(usdgToken));
        token = launchAgainst(address(usdgToken), launchParams("MEME", 0, 0), 10e6);
    }

    // ---------- launch ----------

    function test_launch_opensAtStartMarketCap() public view {
        // $4,000 start market cap over 1B supply => $0.000004. The start tick snaps to the 200-tick grid (<=2%).
        assertApproxEqRel(tokenPriceUsd(token), 4e12, 2.5e16);
        assertEq(factory.launchCount(), 1);
        assertEq(IERC20(token).totalSupply(), 1_000_000_000e18);
        LaunchFactory.Launch memory l = factory.getLaunch(token);
        assertEq(l.creator, creator);
        assertEq(l.feeRecipient, creator);
        assertApproxEqRel(l.reserve, 285_714_286e18, 1e12);
    }

    function test_launch_firstBuyGoesToCreatorAndPaysFees() public view {
        // 9.9 USDG after fee at ~$0.000004
        assertApproxEqRel(IERC20(token).balanceOf(creator), 2_475_000e18, 2.5e16);
        assertEq(escrow.balanceOf(launchTreasury, usdgC), 30_000); // 0.3% of 10 USDG
        assertEq(escrow.balanceOf(creator, usdgC), 70_000); // 0.7%
        assertEq(launchTreasury.balance, LAUNCH_FEE);
    }

    function test_launch_storesMetadata() public view {
        LaunchToken t = LaunchToken(token);
        assertEq(t.symbol(), "MEME");
        assertEq(t.logo(), "ipfs://logo");
        assertEq(t.description(), "a coin");
    }

    function test_launch_withSynthPair() public {
        uint256 assetId = addAsset("sCSUS", 330e18);
        address synth = registry.getState(assetId).token;
        address t = launchAgainst(synth, launchParams("HOUSE", 200, 0), 0.03e18); // ~$10 of synth
        assertApproxEqRel(tokenPriceUsd(t), 4e12, 2.5e16);
        // 3% total fee (1% base + 2% tax), paid in the synth
        uint256 fee = 0.03e18 * 300 / 10_000;
        uint256 protocol = (fee * 100 / 300) * 3_000 / 10_000;
        assertEq(escrow.balanceOf(launchTreasury, Currency.wrap(synth)), protocol);
        assertEq(escrow.balanceOf(creator, Currency.wrap(synth)), fee - protocol);
    }

    function test_launch_revertsWrongFee() public {
        usdgToken.mint(creator, 10e6);
        vm.startPrank(creator);
        usdgToken.approve(address(factory), 10e6);
        LaunchFactory.LaunchParams memory p = launchParams("X", 0, 0);
        bytes32 h = factory.configHash(configId);
        vm.expectRevert(LaunchFactory.WrongLaunchFee.selector);
        factory.launch{value: 0}(p, configId, address(usdgToken), h, 10e6, 0);
        vm.stopPrank();
    }

    function test_launch_revertsConfigMismatch() public {
        LaunchFactory.LaunchParams memory p = launchParams("X", 0, 0);
        vm.prank(creator);
        vm.expectRevert(LaunchFactory.ConfigMismatch.selector);
        factory.launch{value: LAUNCH_FEE}(p, configId, address(usdgToken), bytes32(uint256(1)), 10e6, 0);
    }

    function test_launch_revertsTaxTooHigh() public {
        LaunchFactory.LaunchParams memory p = launchParams("X", 501, 0);
        bytes32 h = factory.configHash(configId);
        vm.prank(creator);
        vm.expectRevert(LaunchFactory.TaxTooHigh.selector);
        factory.launch{value: LAUNCH_FEE}(p, configId, address(usdgToken), h, 10e6, 0);
    }

    function test_launch_revertsUnknownPair() public {
        LaunchFactory.LaunchParams memory p = launchParams("X", 0, 0);
        bytes32 h = factory.configHash(configId);
        vm.prank(creator);
        vm.expectRevert(LaunchFactory.PairNotAllowed.selector);
        factory.launch{value: LAUNCH_FEE}(p, configId, address(0xbeef), h, 10e6, 0);
    }

    function test_launch_revertsPausedSynth() public {
        uint256 assetId = addAsset("sCSUS", 330e18);
        address synth = registry.getState(assetId).token;
        vm.prank(guardian);
        registry.setPaused(assetId, true);
        LaunchFactory.LaunchParams memory p = launchParams("X", 0, 0);
        bytes32 h = factory.configHash(configId);
        vm.prank(creator);
        vm.expectRevert(LaunchFactory.PairNotAllowed.selector);
        factory.launch{value: LAUNCH_FEE}(p, configId, synth, h, 1e18, 0);
    }

    function test_launch_revertsWithoutFirstBuy() public {
        LaunchFactory.LaunchParams memory p = launchParams("X", 0, 0);
        bytes32 h = factory.configHash(configId);
        vm.prank(creator);
        vm.expectRevert(LaunchFactory.FirstBuyRequired.selector);
        factory.launch{value: LAUNCH_FEE}(p, configId, address(usdgToken), h, 0, 0);
    }

    // ---------- trading & fees ----------

    function test_buyExactInput_chargesOnePercent() public {
        usdgToken.mint(alice, 1_000e6);
        uint256 treasuryBefore = escrow.balanceOf(launchTreasury, usdgC);
        (int256 pairChange, int256 tokenChange) = swapLaunch(token, alice, true, -1_000e6);
        assertEq(pairChange, -1_000e6);
        assertGt(tokenChange, 0);
        assertEq(escrow.balanceOf(launchTreasury, usdgC) - treasuryBefore, 3e6);
    }

    function test_swap_emitsTraded() public {
        usdgToken.mint(alice, 100e6);
        PoolKey memory key = factory.poolKeyOf(token);
        vm.recordLogs();
        swapLaunch(token, alice, true, -100e6);
        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 sig = keccak256("Traded(bytes32,address,int128,int128,uint160)");
        bool found;
        for (uint256 i; i < logs.length; ++i) {
            if (logs[i].emitter != address(launchHook) || logs[i].topics[0] != sig) continue;
            found = true;
            assertEq(logs[i].topics[1], PoolId.unwrap(key.toId()));
            assertEq(address(uint160(uint256(logs[i].topics[2]))), token);
            (int128 a0, int128 a1, uint160 sqrtP) = abi.decode(logs[i].data, (int128, int128, uint160));
            int128 pairDelta = Currency.unwrap(key.currency0) == token ? a1 : a0;
            // Trader paid the pair net of the hook fee (1% of 100 USDG).
            assertEq(pairDelta, -99e6);
            (uint160 poolSqrtP,,,) = StateLibrary.getSlot0(manager, key.toId());
            assertEq(sqrtP, poolSqrtP);
        }
        assertTrue(found);
    }

    function test_buyExactOutput_chargesOnSpend() public {
        usdgToken.mint(alice, 1_000e6);
        uint256 treasuryBefore = escrow.balanceOf(launchTreasury, usdgC);
        (int256 pairChange, int256 tokenChange) = swapLaunch(token, alice, true, int256(1_000_000e18));
        assertEq(tokenChange, 1_000_000e18);
        uint256 spent = uint256(-pairChange);
        uint256 protocol = escrow.balanceOf(launchTreasury, usdgC) - treasuryBefore;
        // protocol gets 0.3% of the pre-fee spend: spend = x * 1.01
        assertApproxEqRel(protocol, spent * 30 / 10_100, 1e15);
    }

    function test_sellExactInput_chargesOnProceeds() public {
        usdgToken.mint(alice, 1_000e6);
        (, int256 bought) = swapLaunch(token, alice, true, -1_000e6);
        uint256 treasuryBefore = escrow.balanceOf(launchTreasury, usdgC);
        (int256 pairChange,) = swapLaunch(token, alice, false, -bought);
        uint256 received = uint256(pairChange);
        // round trip loses ~2% to fees
        assertApproxEqRel(received, 980e6, 2e15);
        uint256 protocol = escrow.balanceOf(launchTreasury, usdgC) - treasuryBefore;
        assertApproxEqRel(protocol, received * 30 / 9_900, 1e15);
    }

    function test_sellExactOutput_traderReceivesExactAmount() public {
        usdgToken.mint(alice, 1_000e6);
        swapLaunch(token, alice, true, -1_000e6);
        (int256 pairChange, int256 tokenChange) = swapLaunch(token, alice, false, int256(500e6));
        assertEq(pairChange, 500e6);
        assertLt(tokenChange, 0);
    }

    function test_creatorClaimsFees() public {
        usdgToken.mint(alice, 1_000e6);
        swapLaunch(token, alice, true, -1_000e6);
        uint256 owed = escrow.balanceOf(creator, usdgC);
        assertEq(owed, 70_000 + 7e6);
        vm.prank(creator);
        escrow.claim(usdgC, creator);
        assertEq(usdgToken.balanceOf(creator), owed);
        assertEq(escrow.balanceOf(creator, usdgC), 0);
    }

    function test_thirdPartyLiquidity_reverts() public {
        PoolKey memory key = factory.poolKeyOf(token);
        vm.expectRevert();
        modifyLiquidityRouter.modifyLiquidity(key, ModifyLiquidityParams(-887000, 887000, 1e18, 0), "");
    }

    // ---------- graduation ----------

    function _sellOutCurve() internal {
        usdgToken.mint(bob, 20_000e6);
        swapLaunch(token, bob, true, -20_000e6);
        assertTrue(factory.isReadyToMigrate(token));
    }

    function test_migrate_revertsBeforeCurveSellsOut() public {
        vm.expectRevert(LaunchFactory.NotReadyToMigrate.selector);
        factory.migrate(token);
    }

    function test_curveComplete_blocksBuysButNotSells() public {
        _sellOutCurve();
        usdgToken.mint(alice, 10e6);
        vm.expectRevert();
        this.externalSwap(token, alice, true, -10e6);

        uint256 bobTokens = IERC20(token).balanceOf(bob);
        (int256 pairChange,) = swapLaunch(token, bob, false, -int256(bobTokens / 10));
        assertGt(pairChange, 0);
    }

    function externalSwap(address t, address trader, bool buy, int256 amount) external {
        swapLaunch(t, trader, buy, amount);
    }

    function test_migrate_locksLiquidityAtCurveEndPrice() public {
        _sellOutCurve();
        uint256 raised = usdgToken.balanceOf(address(manager));
        factory.migrate(token);

        assertTrue(factory.isGraduated(token));
        assertFalse(factory.isReadyToMigrate(token));
        // Curve end is 25,000 ticks (~12.18x) above the start: ~$0.0000487
        assertApproxEqRel(tokenPriceUsd(token), 48.7e12, 2e16);
        // Surplus reserve was burned
        assertLt(IERC20(token).totalSupply(), 1_000_000_000e18);
        assertEq(IERC20(token).balanceOf(address(locker)), 0);
        assertEq(IERC20(token).balanceOf(address(factory)), 0);
        // All raised USDG stays in the PoolManager (locked position), dust aside
        assertApproxEqRel(usdgToken.balanceOf(address(manager)), raised, 1e15);

        vm.expectRevert(LaunchFactory.AlreadyGraduated.selector);
        factory.migrate(token);
    }

    function test_afterMigrate_tradingContinuesWithFees() public {
        _sellOutCurve();
        factory.migrate(token);
        usdgToken.mint(alice, 100e6);
        uint256 before = escrow.balanceOf(launchTreasury, usdgC);
        (, int256 tokenChange) = swapLaunch(token, alice, true, -100e6);
        assertGt(tokenChange, 0);
        assertEq(escrow.balanceOf(launchTreasury, usdgC) - before, 0.3e6);
    }

    // ---------- creator controls & buyback ----------

    function test_setFeeRecipient_redirectsFutureFees() public {
        address newRecipient = makeAddr("dao");
        vm.prank(creator);
        factory.setFeeRecipient(token, newRecipient);
        usdgToken.mint(alice, 100e6);
        swapLaunch(token, alice, true, -100e6);
        assertEq(escrow.balanceOf(newRecipient, usdgC), 0.7e6);
    }

    function test_setFeeRecipient_onlyCreator() public {
        vm.prank(alice);
        vm.expectRevert(LaunchFactory.Unauthorized.selector);
        factory.setFeeRecipient(token, alice);
    }

    function test_guardianCanOnlyDisableBuyback() public {
        vm.prank(guardian);
        vm.expectRevert(LaunchFactory.Unauthorized.selector);
        factory.setBuybackEnabled(token, true);
        vm.prank(guardian);
        factory.setBuybackEnabled(token, false);
    }

    function test_buyback_spendsBudgetAndVests() public {
        address t = launchAgainst(address(usdgToken), launchParams("BB", 0, 5_000), 10e6);
        usdgToken.mint(alice, 1_000e6);
        swapLaunch(t, alice, true, -1_000e6);
        // 50% of the creator's 0.7% on 1,010 USDG of volume
        assertEq(buyback.budget(t), 3_535_000);

        vm.expectRevert(BuybackVault.Unauthorized.selector);
        buyback.executeBuyback(t);
        vm.prank(creator);
        (uint256 spent, uint256 bought) = buyback.executeBuyback(t);
        assertEq(spent, 3_535_000);
        assertGt(bought, 0);
        assertEq(buyback.budget(t), 0);
        assertEq(buyback.releasable(t), 0);

        vm.warp(block.timestamp + 365 days / 2);
        assertApproxEqRel(buyback.releasable(t), bought / 2, 1e15);
        uint256 released = buyback.release(t);
        assertEq(IERC20(t).balanceOf(creator) > released, true);

        vm.warp(block.timestamp + 365 days);
        buyback.release(t);
        assertEq(IERC20(t).balanceOf(address(buyback)), 0);
    }

    function test_buyback_operatorCanTrigger() public {
        address t = launchAgainst(address(usdgToken), launchParams("OP", 0, 10_000), 10e6);
        address operator = makeAddr("operator");
        vm.expectRevert(BuybackVault.Unauthorized.selector);
        buyback.setOperator(operator, true);
        vm.prank(owner);
        buyback.setOperator(operator, true);
        vm.prank(operator);
        (uint256 spent,) = buyback.executeBuyback(t);
        assertGt(spent, 0);
    }

    function test_flushBudget_afterDisablingBuyback() public {
        address t = launchAgainst(address(usdgToken), launchParams("BB", 0, 10_000), 10e6);
        uint256 budget = buyback.budget(t);
        assertGt(budget, 0);
        vm.prank(creator);
        factory.setBuybackEnabled(t, false);
        uint256 before = escrow.balanceOf(creator, usdgC);
        buyback.flushBudget(t);
        assertEq(escrow.balanceOf(creator, usdgC) - before, budget);
        vm.prank(creator);
        escrow.claim(usdgC, creator);
    }
}

contract LaunchFactoryTokenIs0Test is LaunchFactoryTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(type(uint160).max - 0xffff);
    }

    function test_orientation() public view {
        assertEq(Currency.unwrap(factory.poolKeyOf(token).currency0), token);
    }
}

contract LaunchFactoryTokenIs1Test is LaunchFactoryTestBase {
    function usdgAt() internal pure override returns (address) {
        return address(uint160(0x1000000));
    }

    function test_orientation() public view {
        assertEq(Currency.unwrap(factory.poolKeyOf(token).currency1), token);
    }
}
