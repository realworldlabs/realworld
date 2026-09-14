// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {RwaFixture} from "../utils/RwaFixture.sol";

/// @notice Random buys, price moves, harvests and redemptions against one asset.
contract RwaHandler is Test {
    RwaFixtureHarness internal f;
    address[] internal actors;

    constructor(RwaFixtureHarness f_) {
        f = f_;
        actors.push(makeAddr("h1"));
        actors.push(makeAddr("h2"));
        actors.push(makeAddr("h3"));
    }

    function buy(uint256 actorSeed, uint256 usdgIn) external {
        usdgIn = bound(usdgIn, 1e6, 50_000e6);
        f.doBuy(actors[actorSeed % actors.length], usdgIn);
    }

    function move(int256 tickDelta) external {
        tickDelta = bound(tickDelta, -500, 500);
        f.doMove(int24(tickDelta));
    }

    function harvest() external {
        f.doHarvest();
    }

    function redeem(uint256 actorSeed, uint256 fraction) external {
        fraction = bound(fraction, 1, 100);
        f.doRedeem(actors[actorSeed % actors.length], fraction);
    }
}

contract RwaFixtureHarness is RwaFixture {
    uint256 public assetId;

    function usdgAt() internal pure override returns (address) {
        return address(uint160(0x1000000));
    }

    function init() external {
        setUpRwa();
        assetId = addAsset("sCSUS", 10e18);
    }

    function doBuy(address who, uint256 usdgIn) external {
        buySynth(assetId, who, usdgIn);
    }

    function doMove(int24 tickDelta) external {
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, registry.getState(assetId).tick + tickDelta);
    }

    function doHarvest() external {
        priceWall.harvest(assetId);
    }

    function doRedeem(address who, uint256 fraction) external {
        IERC20 synth = synthOf(assetId);
        uint256 amount = synth.balanceOf(who) * fraction / 100;
        if (amount == 0) return;
        vm.startPrank(who);
        synth.approve(address(vault), amount);
        try vault.redeem(assetId, amount, 0, who) {} catch {}
        vm.stopPrank();
    }

    function vaultUsdg() external view returns (uint256) {
        return usdgToken.balanceOf(address(vault));
    }

    function potOf() external view returns (uint256) {
        return vault.pot(assetId);
    }

    function synthSupplyAccounted() external view returns (bool) {
        IERC20 synth = synthOf(assetId);
        return synth.totalSupply() == 1_000_000_000e18;
    }
}

contract RwaInvariantTest is Test {
    RwaFixtureHarness internal f;
    RwaHandler internal handler;

    function setUp() public {
        f = new RwaFixtureHarness();
        f.init();
        handler = new RwaHandler(f);
        targetContract(address(handler));
    }

    /// @dev The vault holds exactly what its pots say: nobody can be paid out of another asset's money.
    function invariant_vaultBalanceMatchesPot() public view {
        assertEq(f.vaultUsdg(), f.potOf());
    }

    function invariant_supplyNeverChanges() public view {
        assertTrue(f.synthSupplyAccounted());
    }
}
