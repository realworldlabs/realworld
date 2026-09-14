// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {console2} from "forge-std/Script.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IAssetRegistry} from "../src/rwa/interfaces/IAssetRegistry.sol";
import {PriceMath} from "../src/libraries/PriceMath.sol";
import {StackDeployer} from "./base/StackDeployer.sol";
import {RobinhoodChain} from "./RobinhoodChain.sol";

/// @notice One-shot production deployment on Robinhood Chain: RWA stack, launchpad, initial underlyings,
///         keeper wiring, ownership hand-off, and deployments/mainnet.json for the indexer and web app.
/// @dev env:
///        OWNER     multisig that will own the registry and factory (must call acceptOwnership afterwards)
///        GUARDIAN  multisig that can pause assets and switch off buybacks
///        KEEPER    keeper hot wallet (moves prices, runs graduations and buybacks)
///        TREASURY  receives protocol fees, launch fees and redemption fees
///        ASSETS_FILE (optional) defaults to deploy/initial-assets.json, produced by the keeper seed script (keeper/src/seed.ts)
///      Simulate:  forge script script/DeployMainnet.s.sol --fork-url <rpc> --sender <deployer>
///      Broadcast: forge script script/DeployMainnet.s.sol --rpc-url robinhood --account deployer --broadcast --slow
contract DeployMainnet is StackDeployer {
    uint24 internal constant MACRO_MAX_MOVE_TICKS = 500; // ~5%
    uint24 internal constant COLLECTIBLE_MAX_MOVE_TICKS = 2_000; // ~20%
    uint32 internal constant MIN_UPDATE_INTERVAL = 1 hours;
    uint32 internal constant MACRO_HEARTBEAT = 45 days;
    uint32 internal constant COLLECTIBLE_HEARTBEAT = 48 hours;
    uint256 internal constant WALL_SUPPLY = 1_000_000_000e18;

    function run() external {
        require(block.chainid == RobinhoodChain.CHAIN_ID, "not Robinhood Chain");
        address owner = vm.envAddress("OWNER");
        address guardian = vm.envAddress("GUARDIAN");
        address keeper = vm.envAddress("KEEPER");
        address treasury = vm.envAddress("TREASURY");
        string memory assets = vm.readFile(vm.envOr("ASSETS_FILE", string("deploy/initial-assets.json")));
        IPoolManager manager = IPoolManager(RobinhoodChain.POOL_MANAGER);
        uint256 startBlock = block.number;

        vm.startBroadcast();
        address deployer = msg.sender;
        RwaStack memory rwa = _deployRwa(manager, RobinhoodChain.USDG, deployer, guardian, keeper, treasury);
        LaunchStack memory lp = _deployLaunchpad(manager, RobinhoodChain.USDG, deployer, rwa.registry, guardian, treasury);
        lp.buyback.setOperator(keeper, true);

        for (uint256 i; vm.keyExistsJson(assets, string.concat(".assets[", vm.toString(i), "]")); ++i) {
            _addAsset(rwa, assets, i);
        }

        if (owner != deployer) {
            rwa.registry.transferOwnership(owner);
            lp.factory.transferOwnership(owner);
        }
        vm.stopBroadcast();

        string memory j = "mainnet";
        vm.serializeUint(j, "chainId", block.chainid);
        vm.serializeUint(j, "startBlock", startBlock);
        vm.serializeAddress(j, "poolManager", RobinhoodChain.POOL_MANAGER);
        vm.serializeAddress(j, "usdg", RobinhoodChain.USDG);
        vm.serializeAddress(j, "assetRegistry", address(rwa.registry));
        vm.serializeAddress(j, "wallHook", address(rwa.wallHook));
        vm.serializeAddress(j, "priceWall", address(rwa.priceWall));
        vm.serializeAddress(j, "redemptionVault", address(rwa.vault));
        vm.serializeAddress(j, "launchHook", address(lp.hook));
        vm.serializeAddress(j, "launchFactory", address(lp.factory));
        vm.serializeAddress(j, "launchTokenDeployer", address(lp.tokenDeployer));
        vm.serializeAddress(j, "feeEscrow", address(lp.escrow));
        vm.serializeAddress(j, "buybackVault", address(lp.buyback));
        vm.serializeAddress(j, "launchLocker", address(lp.locker));
        string memory out = vm.serializeAddress(j, "launchRouter", address(lp.router));
        vm.writeJson(out, vm.envOr("DEPLOYMENTS_OUT", string("deployments/mainnet.json")));

        console2.log("AssetRegistry  ", address(rwa.registry));
        console2.log("PriceWall      ", address(rwa.priceWall));
        console2.log("LaunchFactory  ", address(lp.factory));
        console2.log("LaunchRouter   ", address(lp.router));
        console2.log("assets added   ", rwa.registry.assetCount());
        if (owner != deployer) console2.log("NEXT: OWNER must call acceptOwnership() on AssetRegistry and LaunchFactory");
    }

    function _addAsset(RwaStack memory rwa, string memory json, uint256 i) internal {
        string memory k = string.concat(".assets[", vm.toString(i), "]");
        IAssetRegistry.AssetConfig memory c;
        c.name = vm.parseJsonString(json, string.concat(k, ".name"));
        c.symbol = vm.parseJsonString(json, string.concat(k, ".symbol"));
        c.category = IAssetRegistry.Category(vm.parseJsonUint(json, string.concat(k, ".category")));
        c.metadataURI = vm.parseJsonString(json, string.concat(k, ".metadataURI"));
        c.unitScale = vm.parseUint(vm.parseJsonString(json, string.concat(k, ".unitScale")));
        c.minUpdateInterval = MIN_UPDATE_INTERVAL;
        c.wallSupply = WALL_SUPPLY;
        bool isMacro = c.category == IAssetRegistry.Category.MACRO;
        c.maxMoveTicks = isMacro ? MACRO_MAX_MOVE_TICKS : COLLECTIBLE_MAX_MOVE_TICKS;
        c.heartbeat = isMacro ? MACRO_HEARTBEAT : COLLECTIBLE_HEARTBEAT;
        uint256 priceX18 = vm.parseUint(vm.parseJsonString(json, string.concat(k, ".priceX18")));

        // The synth address decides token ordering in its wall pool; predict it from the registry nonce.
        address predicted = vm.computeCreateAddress(address(rwa.registry), vm.getNonce(address(rwa.registry)));
        uint256 id = rwa.registry.addAsset(c, PriceMath.tickAtPrice(priceX18, predicted < RobinhoodChain.USDG, 1e30));
        require(id == i, "asset id must match its position in the assets file");
        console2.log(c.symbol, "added as asset", id);
    }
}
