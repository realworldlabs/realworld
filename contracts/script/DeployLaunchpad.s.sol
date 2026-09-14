// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IAssetRegistry} from "../src/rwa/interfaces/IAssetRegistry.sol";
import {LaunchHook} from "../src/launchpad/LaunchHook.sol";
import {LaunchFactory} from "../src/launchpad/LaunchFactory.sol";
import {LaunchTokenDeployer} from "../src/launchpad/LaunchTokenDeployer.sol";
import {FeeEscrow} from "../src/launchpad/FeeEscrow.sol";
import {BuybackVault} from "../src/launchpad/BuybackVault.sol";
import {LaunchLocker} from "../src/launchpad/LaunchLocker.sol";
import {LaunchRouter} from "../src/launchpad/LaunchRouter.sol";
import {HookMiner} from "./utils/HookMiner.sol";
import {RobinhoodChain} from "./RobinhoodChain.sol";

/// @notice Deploys the launchpad on top of an existing RWA registry and adds the default launch config.
/// @dev env: REGISTRY, OWNER, GUARDIAN, TREASURY. Example:
///      forge script script/DeployLaunchpad.s.sol --rpc-url robinhood --broadcast --account deployer
contract DeployLaunchpad is Script {
    uint256 internal constant LAUNCH_FEE = 0.0005 ether;
    uint256 internal constant BUYBACK_VESTING = 365 days;

    function run()
        external
        returns (LaunchHook hook, LaunchFactory factory, FeeEscrow escrow, BuybackVault buyback, LaunchLocker locker, LaunchRouter router)
    {
        IAssetRegistry registry = IAssetRegistry(vm.envAddress("REGISTRY"));
        address finalOwner = vm.envAddress("OWNER");
        address guardian = vm.envAddress("GUARDIAN");
        address treasury = vm.envAddress("TREASURY");
        IPoolManager manager = IPoolManager(RobinhoodChain.POOL_MANAGER);

        vm.startBroadcast();
        address deployer = msg.sender;

        uint160 flags = uint160(
            Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG
                | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
        );
        bytes memory args = abi.encode(manager, deployer);
        (address hookAddr, bytes32 salt) =
            HookMiner.find(RobinhoodChain.CREATE2_DEPLOYER, flags, type(LaunchHook).creationCode, args);
        hook = new LaunchHook{salt: salt}(manager, deployer);
        require(address(hook) == hookAddr, "hook address mismatch");

        LaunchTokenDeployer tokenDeployer = new LaunchTokenDeployer();
        factory = new LaunchFactory(
            deployer, manager, registry, RobinhoodChain.USDG, hook, tokenDeployer, treasury, guardian, LAUNCH_FEE
        );
        tokenDeployer.setFactory(address(factory));
        escrow = new FeeEscrow(manager, address(hook));
        buyback = new BuybackVault(manager, hook, factory, escrow, BUYBACK_VESTING);
        locker = new LaunchLocker(manager, address(factory));
        router = new LaunchRouter(manager, factory, registry, RobinhoodChain.USDG);

        hook.wire(address(factory), address(locker), escrow, buyback);
        factory.setLocker(locker);
        factory.setRouter(address(router));
        factory.addConfig(
            LaunchFactory.LaunchConfig({
                supply: 1_000_000_000e18,
                curveSupply: 714_285_714e18,
                curveWidthTicks: 25_000,
                tickSpacing: 200,
                startMarketCapUsd: 4_000e18,
                maxCreatorTaxBps: 500,
                enabled: true
            })
        );
        if (finalOwner != deployer) factory.transferOwnership(finalOwner);
        vm.stopBroadcast();

        console2.log("LaunchHook   ", address(hook));
        console2.log("LaunchFactory", address(factory));
        console2.log("TokenDeployer", address(tokenDeployer));
        console2.log("FeeEscrow    ", address(escrow));
        console2.log("BuybackVault ", address(buyback));
        console2.log("LaunchLocker ", address(locker));
        console2.log("LaunchRouter ", address(router));
    }
}
