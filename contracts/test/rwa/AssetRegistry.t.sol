// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AssetRegistry} from "../../src/rwa/AssetRegistry.sol";
import {IAssetRegistry} from "../../src/rwa/interfaces/IAssetRegistry.sol";
import {RwaFixture} from "../utils/RwaFixture.sol";

contract AssetRegistryTest is RwaFixture {
    uint256 internal assetId;

    function usdgAt() internal pure override returns (address) {
        return address(uint160(0x1000000));
    }

    function setUp() public {
        setUpRwa();
        assetId = addAsset("sCSUS", 10e18);
    }

    function test_addAsset_recordsState() public view {
        assertEq(registry.assetCount(), 1);
        IAssetRegistry.AssetState memory s = registry.getState(assetId);
        assertTrue(s.token != address(0));
        assertTrue(s.launchesEnabled);
        assertFalse(s.paused);
        assertEq(s.lastUpdate, block.timestamp);
        (bool found, uint256 id) = registry.assetIdOf(s.token);
        assertTrue(found);
        assertEq(id, assetId);
        assertEq(registry.getConfig(assetId).symbol, "sCSUS");
    }

    function test_addAsset_onlyOwner() public {
        IAssetRegistry.AssetConfig memory c = macroConfig("sX");
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, address(this)));
        registry.addAsset(c, 0);
    }

    function test_addAsset_rejectsBadBounds() public {
        IAssetRegistry.AssetConfig memory c = macroConfig("sX");
        c.heartbeat = c.minUpdateInterval;
        vm.prank(owner);
        vm.expectRevert(AssetRegistry.InvalidConfig.selector);
        registry.addAsset(c, 0);
    }

    function test_wire_onlyOnce() public {
        vm.prank(owner);
        vm.expectRevert(AssetRegistry.AlreadyWired.selector);
        registry.wire(address(1));
    }

    function test_pause_guardianCanPauseButNotUnpause() public {
        vm.prank(guardian);
        registry.setPaused(assetId, true);
        assertFalse(registry.isLaunchable(assetId));

        vm.prank(guardian);
        vm.expectRevert(AssetRegistry.Unauthorized.selector);
        registry.setPaused(assetId, false);

        vm.prank(owner);
        registry.setPaused(assetId, false);
        assertTrue(registry.isLaunchable(assetId));
    }

    function test_pause_strangerCannotPause() public {
        vm.prank(alice);
        vm.expectRevert(AssetRegistry.Unauthorized.selector);
        registry.setPaused(assetId, true);
    }

    function test_staleness_blocksLaunchesAfterHeartbeat() public {
        assertFalse(registry.isStale(assetId));
        vm.warp(block.timestamp + 45 days + 1);
        assertTrue(registry.isStale(assetId));
        assertFalse(registry.isLaunchable(assetId));

        movePrice(assetId, registry.getState(assetId).tick + 10);
        assertFalse(registry.isStale(assetId));
        assertTrue(registry.isLaunchable(assetId));
    }

    function test_setLaunchesEnabled() public {
        vm.prank(owner);
        registry.setLaunchesEnabled(assetId, false);
        assertFalse(registry.isLaunchable(assetId));
    }

    function test_recordPriceUpdate_onlyPriceWall() public {
        vm.expectRevert(AssetRegistry.Unauthorized.selector);
        registry.recordPriceUpdate(assetId, 0);
    }

    function test_updateBounds() public {
        vm.prank(owner);
        registry.updateBounds(assetId, 2000, 1 hours, 48 hours);
        IAssetRegistry.AssetConfig memory c = registry.getConfig(assetId);
        assertEq(c.maxMoveTicks, 2000);
        assertEq(c.heartbeat, 48 hours);
    }

    function test_unknownAsset_reverts() public {
        vm.expectRevert(AssetRegistry.UnknownAsset.selector);
        registry.getState(99);
    }
}
