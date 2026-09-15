// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {console2} from "forge-std/Script.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {StackDeployer} from "./base/StackDeployer.sol";
import {RobinhoodChain} from "./RobinhoodChain.sol";

/// @notice Deploys the synthetic RWA stack. The broadcaster owns the registry until `OWNER` accepts ownership.
/// @dev env: GUARDIAN, KEEPER, TREASURY, OWNER. Example:
///      forge script script/DeployRwa.s.sol --rpc-url robinhood --broadcast --account deployer
contract DeployRwa is StackDeployer {
    function run() external returns (RwaStack memory s) {
        address finalOwner = vm.envAddress("OWNER");
        vm.startBroadcast();
        s = _deployRwa(
            IPoolManager(RobinhoodChain.POOL_MANAGER),
            RobinhoodChain.USDG,
            msg.sender,
            vm.envAddress("GUARDIAN"),
            vm.envAddress("KEEPER"),
            vm.envAddress("TREASURY")
        );
        if (finalOwner != msg.sender) s.registry.transferOwnership(finalOwner);
        vm.stopBroadcast();

        console2.log("AssetRegistry  ", address(s.registry));
        console2.log("WallHook       ", address(s.wallHook));
        console2.log("PriceWall      ", address(s.priceWall));
    }
}
