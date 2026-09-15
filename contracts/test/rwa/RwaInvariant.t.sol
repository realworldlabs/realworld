// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {RwaFixture} from "../utils/RwaFixture.sol";

/// @notice Random buys, sells, price moves and rebalances against one asset.
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

    function sell(uint256 actorSeed, uint256 fraction) external {
        fraction = bound(fraction, 1, 100);
        f.doSell(actors[actorSeed % actors.length], fraction);
    }

    function move(int256 tickDelta) external {
        tickDelta = bound(tickDelta, -500, 500);
        f.doMove(int24(tickDelta));
    }

    function rebalance() external {
        f.doRebalance();
    }
}

contract RwaFixtureHarness is RwaFixture {
    uint256 public assetId;
    uint256 public usdgIn;
    uint256 public usdgOut;
    uint256 public ops;

    function usdgAt() internal pure override returns (address) {
        return address(uint160(0x1000000));
    }

    function init() external {
        setUpRwa();
        assetId = addAsset("sCSUS", 10e18);
    }

    function doBuy(address who, uint256 amount) external {
        uint256 before = usdgToken.balanceOf(who);
        buySynth(assetId, who, amount);
        usdgIn += amount - (usdgToken.balanceOf(who) - before);
        ops++;
    }

    function doSell(address who, uint256 fraction) external {
        uint256 amount = synthOf(assetId).balanceOf(who) * fraction / 100;
        if (amount == 0) return;
        usdgOut += sellSynth(assetId, who, amount);
        ops++;
    }

    function doMove(int24 tickDelta) external {
        vm.warp(block.timestamp + 1 hours);
        movePrice(assetId, registry.getState(assetId).tick + tickDelta);
        ops++;
    }

    function doRebalance() external {
        priceWall.rebalance(assetId);
        ops++;
    }

    function wallUsdg() external view returns (uint256) {
        (, uint256 u) = priceWall.wallBalances(assetId);
        return u + usdgToken.balanceOf(address(priceWall));
    }

    function synthSupplyAccounted() external view returns (bool) {
        return synthOf(assetId).totalSupply() == 1_000_000_000e18;
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

    /// @dev Every USDG paid in is still bidding in the wall until a seller takes it: nothing leaks, nothing is minted.
    function invariant_wallHoldsExactlyWhatWasPaidIn() public view {
        assertApproxEqAbs(f.wallUsdg(), f.usdgIn() - f.usdgOut(), 4 * (f.ops() + 1));
    }

    function invariant_supplyNeverChanges() public view {
        assertTrue(f.synthSupplyAccounted());
    }
}
