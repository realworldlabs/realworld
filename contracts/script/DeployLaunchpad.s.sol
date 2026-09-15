// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {console2} from "forge-std/Script.sol";
import {IAssetRegistry} from "../src/rwa/interfaces/IAssetRegistry.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {StackDeployer} from "./base/StackDeployer.sol";
import {RobinhoodChain} from "./RobinhoodChain.sol";

/// @notice Deploys the launchpad on top of an existing RWA registry and adds the default launch config.
///         Used to (re)deploy the launchpad alone; the RWA stack and its underlyings stay in place.
/// @dev env: REGISTRY, OWNER, GUARDIAN, TREASURY, KEEPER; DEPLOYMENTS_OUT (optional) is an existing deployments
///      JSON whose launchpad addresses are updated in place. Example:
///      forge script script/DeployLaunchpad.s.sol --rpc-url robinhood --broadcast --account deployer --slow
contract DeployLaunchpad is StackDeployer {
    function run() external returns (LaunchStack memory s) {
        address finalOwner = vm.envAddress("OWNER");
        vm.startBroadcast();
        s = _deployLaunchpad(
            IPoolManager(RobinhoodChain.POOL_MANAGER),
            RobinhoodChain.USDG,
            msg.sender,
            IAssetRegistry(vm.envAddress("REGISTRY")),
            vm.envAddress("GUARDIAN"),
            vm.envAddress("TREASURY")
        );
        s.buyback.setOperator(vm.envAddress("KEEPER"), true);
        if (finalOwner != msg.sender) s.factory.transferOwnership(finalOwner);
        vm.stopBroadcast();

        string memory out = vm.envOr("DEPLOYMENTS_OUT", string(""));
        if (bytes(out).length > 0) {
            vm.writeJson(vm.toString(address(s.hook)), out, ".launchHook");
            vm.writeJson(vm.toString(address(s.factory)), out, ".launchFactory");
            vm.writeJson(vm.toString(address(s.tokenDeployer)), out, ".launchTokenDeployer");
            vm.writeJson(vm.toString(address(s.escrow)), out, ".feeEscrow");
            vm.writeJson(vm.toString(address(s.buyback)), out, ".buybackVault");
            vm.writeJson(vm.toString(address(s.locker)), out, ".launchLocker");
            vm.writeJson(vm.toString(address(s.router)), out, ".launchRouter");
        }

        console2.log("LaunchHook   ", address(s.hook));
        console2.log("LaunchFactory", address(s.factory));
        console2.log("TokenDeployer", address(s.tokenDeployer));
        console2.log("FeeEscrow    ", address(s.escrow));
        console2.log("BuybackVault ", address(s.buyback));
        console2.log("LaunchLocker ", address(s.locker));
        console2.log("LaunchRouter ", address(s.router));
    }
}
