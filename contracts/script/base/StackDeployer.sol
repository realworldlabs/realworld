// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {AssetRegistry} from "../../src/rwa/AssetRegistry.sol";
import {IAssetRegistry} from "../../src/rwa/interfaces/IAssetRegistry.sol";
import {WallHook} from "../../src/rwa/WallHook.sol";
import {PriceWall} from "../../src/rwa/PriceWall.sol";
import {LaunchHook} from "../../src/launchpad/LaunchHook.sol";
import {LaunchFactory} from "../../src/launchpad/LaunchFactory.sol";
import {LaunchTokenDeployer} from "../../src/launchpad/LaunchTokenDeployer.sol";
import {FeeEscrow} from "../../src/launchpad/FeeEscrow.sol";
import {BuybackVault} from "../../src/launchpad/BuybackVault.sol";
import {LaunchLocker} from "../../src/launchpad/LaunchLocker.sol";
import {LaunchRouter} from "../../src/launchpad/LaunchRouter.sol";
import {HookMiner} from "../utils/HookMiner.sol";
import {RobinhoodChain} from "../RobinhoodChain.sol";

/// @notice Shared deployment steps. Must run inside vm.startBroadcast(); the broadcaster owns everything it deploys.
abstract contract StackDeployer is Script {
    uint256 internal constant LAUNCH_FEE = 0.0005 ether;
    uint256 internal constant BUYBACK_VESTING = 365 days;

    struct RwaStack {
        AssetRegistry registry;
        WallHook wallHook;
        PriceWall priceWall;
    }

    struct LaunchStack {
        LaunchHook hook;
        LaunchTokenDeployer tokenDeployer;
        LaunchFactory factory;
        FeeEscrow escrow;
        BuybackVault buyback;
        LaunchLocker locker;
        LaunchRouter router;
    }

    function _deployRwa(IPoolManager manager, address usdg, address deployer, address guardian, address keeper, address treasury)
        internal
        returns (RwaStack memory s)
    {
        s.registry = new AssetRegistry(deployer, guardian, keeper, treasury);

        uint160 flags = uint160(Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.AFTER_SWAP_FLAG);
        (address hookAddr, bytes32 salt) = HookMiner.find(
            RobinhoodChain.CREATE2_DEPLOYER, flags, type(WallHook).creationCode, abi.encode(manager, s.registry)
        );
        s.wallHook = new WallHook{salt: salt}(manager, s.registry);
        require(address(s.wallHook) == hookAddr, "wall hook address mismatch");

        s.priceWall = new PriceWall(manager, s.registry, IHooks(address(s.wallHook)), usdg);
        s.registry.wire(address(s.priceWall));
    }

    function _deployLaunchpad(
        IPoolManager manager,
        address usdg,
        address deployer,
        IAssetRegistry registry,
        address guardian,
        address treasury
    ) internal returns (LaunchStack memory s) {
        uint160 flags = uint160(
            Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG
                | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
        );
        (address hookAddr, bytes32 salt) = HookMiner.find(
            RobinhoodChain.CREATE2_DEPLOYER, flags, type(LaunchHook).creationCode, abi.encode(manager, deployer)
        );
        s.hook = new LaunchHook{salt: salt}(manager, deployer);
        require(address(s.hook) == hookAddr, "launch hook address mismatch");

        s.tokenDeployer = new LaunchTokenDeployer();
        s.factory = new LaunchFactory(
            deployer, manager, registry, usdg, s.hook, s.tokenDeployer, treasury, guardian, LAUNCH_FEE
        );
        s.tokenDeployer.setFactory(address(s.factory));
        s.escrow = new FeeEscrow(manager, address(s.hook));
        s.buyback = new BuybackVault(manager, s.hook, s.factory, s.escrow, BUYBACK_VESTING);
        s.locker = new LaunchLocker(manager, address(s.factory));
        s.router = new LaunchRouter(manager, s.factory, registry, usdg);

        s.hook.wire(address(s.factory), address(s.locker), s.escrow, s.buyback);
        s.factory.setLocker(s.locker);
        s.factory.setRouter(address(s.router));
        s.factory.addConfig(
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
    }
}
