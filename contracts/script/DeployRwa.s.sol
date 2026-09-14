// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {AssetRegistry} from "../src/rwa/AssetRegistry.sol";
import {WallHook} from "../src/rwa/WallHook.sol";
import {PriceWall} from "../src/rwa/PriceWall.sol";
import {RedemptionVault} from "../src/rwa/RedemptionVault.sol";
import {HookMiner} from "./utils/HookMiner.sol";
import {RobinhoodChain} from "./RobinhoodChain.sol";

/// @notice Deploys the synthetic RWA stack. The broadcaster owns the registry until `OWNER` accepts ownership.
/// @dev env: GUARDIAN, KEEPER, TREASURY, OWNER. Example:
///      forge script script/DeployRwa.s.sol --rpc-url robinhood --broadcast --account deployer
contract DeployRwa is Script {
    function run() external returns (AssetRegistry registry, WallHook hook, PriceWall priceWall, RedemptionVault vault) {
        address guardian = vm.envAddress("GUARDIAN");
        address keeper = vm.envAddress("KEEPER");
        address treasury = vm.envAddress("TREASURY");
        address finalOwner = vm.envAddress("OWNER");
        IPoolManager manager = IPoolManager(RobinhoodChain.POOL_MANAGER);

        vm.startBroadcast();
        address deployer = msg.sender;

        registry = new AssetRegistry(deployer, guardian, keeper, treasury);

        uint160 flags = uint160(Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG);
        bytes memory args = abi.encode(manager, registry);
        (address hookAddr, bytes32 salt) =
            HookMiner.find(RobinhoodChain.CREATE2_DEPLOYER, flags, type(WallHook).creationCode, args);
        hook = new WallHook{salt: salt}(manager, registry);
        require(address(hook) == hookAddr, "hook address mismatch");

        priceWall = new PriceWall(manager, registry, IHooks(address(hook)), RobinhoodChain.USDG);
        vault = new RedemptionVault(registry, RobinhoodChain.USDG);
        registry.wire(address(priceWall), address(vault));

        if (finalOwner != deployer) registry.transferOwnership(finalOwner);
        vm.stopBroadcast();

        console2.log("AssetRegistry  ", address(registry));
        console2.log("WallHook       ", address(hook));
        console2.log("PriceWall      ", address(priceWall));
        console2.log("RedemptionVault", address(vault));
    }
}
