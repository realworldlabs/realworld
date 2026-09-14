// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {AssetRegistry} from "../src/rwa/AssetRegistry.sol";
import {IAssetRegistry} from "../src/rwa/interfaces/IAssetRegistry.sol";
import {PriceMath} from "../src/libraries/PriceMath.sol";
import {RobinhoodChain} from "./RobinhoodChain.sol";

/// @notice Adds one synthetic asset. Must be broadcast by the registry owner.
/// @dev env: REGISTRY, NAME, SYMBOL, CATEGORY (0 macro, 1 collectible), METADATA_URI, UNIT_SCALE,
///      PRICE_USD_X18 (opening price per token, 1e18), WALL_SUPPLY.
///      Bounds default by category: macro +-500 ticks / 1h / 45d, collectible +-2000 ticks / 1h / 48h.
contract AddAsset is Script {
    function run() external returns (uint256 assetId) {
        AssetRegistry registry = AssetRegistry(vm.envAddress("REGISTRY"));
        IAssetRegistry.Category category = IAssetRegistry.Category(vm.envUint("CATEGORY"));

        IAssetRegistry.AssetConfig memory c;
        c.name = vm.envString("NAME");
        c.symbol = vm.envString("SYMBOL");
        c.category = category;
        c.metadataURI = vm.envString("METADATA_URI");
        c.unitScale = vm.envUint("UNIT_SCALE");
        c.wallSupply = vm.envUint("WALL_SUPPLY");
        c.minUpdateInterval = 1 hours;
        if (category == IAssetRegistry.Category.MACRO) {
            c.maxMoveTicks = 500;
            c.heartbeat = 45 days;
        } else {
            c.maxMoveTicks = 2_000;
            c.heartbeat = 48 hours;
        }

        // The synth address decides token ordering; predict it from the registry's CREATE nonce.
        address predicted = vm.computeCreateAddress(address(registry), vm.getNonce(address(registry)));
        int24 tick = PriceMath.tickAtPrice(vm.envUint("PRICE_USD_X18"), predicted < RobinhoodChain.USDG, 1e30);

        vm.startBroadcast();
        assetId = registry.addAsset(c, tick);
        vm.stopBroadcast();
        console2.log("assetId", assetId);
        console2.log("token  ", registry.getState(assetId).token);
    }
}
