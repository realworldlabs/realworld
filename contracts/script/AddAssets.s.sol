// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {AssetRegistry} from "../src/rwa/AssetRegistry.sol";
import {IAssetRegistry} from "../src/rwa/interfaces/IAssetRegistry.sol";
import {PriceMath} from "../src/libraries/PriceMath.sol";
import {RobinhoodChain} from "./RobinhoodChain.sol";

/// @notice Adds every asset in a seed file that the registry does not have yet (by position), so a keeper
///         asset list can grow without a redeploy. Must be broadcast by the registry owner.
/// @dev env: REGISTRY, ASSETS_FILE (keeper seed output, same format as deploy/initial-assets.json).
///      forge script script/AddAssets.s.sol --rpc-url robinhood --account deployer --broadcast --slow
contract AddAssets is Script {
    uint24 internal constant MACRO_MAX_MOVE_TICKS = 500;
    uint24 internal constant COLLECTIBLE_MAX_MOVE_TICKS = 2_000;
    uint32 internal constant MIN_UPDATE_INTERVAL = 1 hours;
    uint32 internal constant MACRO_HEARTBEAT = 45 days;
    uint32 internal constant COLLECTIBLE_HEARTBEAT = 48 hours;
    uint256 internal constant WALL_SUPPLY = 1_000_000_000e18;

    function run() external {
        AssetRegistry registry = AssetRegistry(vm.envAddress("REGISTRY"));
        string memory assets = vm.readFile(vm.envString("ASSETS_FILE"));
        uint256 existing = registry.assetCount();

        vm.startBroadcast();
        for (uint256 i; vm.keyExistsJson(assets, string.concat(".assets[", vm.toString(i), "]")); ++i) {
            string memory k = string.concat(".assets[", vm.toString(i), "]");
            string memory symbol = vm.parseJsonString(assets, string.concat(k, ".symbol"));
            if (i < existing) {
                // Already on-chain: the seed file must still list it in the same position.
                require(
                    keccak256(bytes(registry.getConfig(i).symbol)) == keccak256(bytes(symbol)),
                    string.concat("asset order mismatch at ", vm.toString(i))
                );
                continue;
            }
            IAssetRegistry.AssetConfig memory c;
            c.name = vm.parseJsonString(assets, string.concat(k, ".name"));
            c.symbol = symbol;
            c.category = IAssetRegistry.Category(vm.parseJsonUint(assets, string.concat(k, ".category")));
            c.metadataURI = vm.parseJsonString(assets, string.concat(k, ".metadataURI"));
            c.unitScale = vm.parseUint(vm.parseJsonString(assets, string.concat(k, ".unitScale")));
            c.minUpdateInterval = MIN_UPDATE_INTERVAL;
            c.wallSupply = WALL_SUPPLY;
            bool isMacro = c.category == IAssetRegistry.Category.MACRO;
            c.maxMoveTicks = isMacro ? MACRO_MAX_MOVE_TICKS : COLLECTIBLE_MAX_MOVE_TICKS;
            c.heartbeat = isMacro ? MACRO_HEARTBEAT : COLLECTIBLE_HEARTBEAT;
            uint256 priceX18 = vm.parseUint(vm.parseJsonString(assets, string.concat(k, ".priceX18")));

            address predicted = vm.computeCreateAddress(address(registry), vm.getNonce(address(registry)));
            uint256 id = registry.addAsset(c, PriceMath.tickAtPrice(priceX18, predicted < RobinhoodChain.USDG, 1e30));
            require(id == i, "asset id must match its position in the assets file");
            console2.log(symbol, "added as asset", id);
        }
        vm.stopBroadcast();
        console2.log("assets now", registry.assetCount());
    }
}
