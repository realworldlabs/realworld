// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AssetRegistry} from "../../src/rwa/AssetRegistry.sol";
import {IAssetRegistry} from "../../src/rwa/interfaces/IAssetRegistry.sol";
import {PriceWall} from "../../src/rwa/PriceWall.sol";
import {PriceMath} from "../../src/libraries/PriceMath.sol";
import {LaunchHook} from "../../src/launchpad/LaunchHook.sol";
import {LaunchFactory} from "../../src/launchpad/LaunchFactory.sol";
import {LaunchTokenDeployer} from "../../src/launchpad/LaunchTokenDeployer.sol";
import {FeeEscrow} from "../../src/launchpad/FeeEscrow.sol";
import {BuybackVault} from "../../src/launchpad/BuybackVault.sol";
import {LaunchLocker} from "../../src/launchpad/LaunchLocker.sol";
import {LaunchRouter} from "../../src/launchpad/LaunchRouter.sol";
import {RobinhoodChain} from "../../script/RobinhoodChain.sol";

/// @notice End-to-end on a Robinhood Chain fork: synth asset, synth-paired launch paid in USDG, trading, sell-out, graduation.
/// @dev forge test --match-path test/fork/LaunchpadFork.t.sol --fork-url http://127.0.0.1:8548
contract LaunchpadForkTest is Test {
    IPoolManager internal manager = IPoolManager(RobinhoodChain.POOL_MANAGER);
    IERC20 internal usdg = IERC20(RobinhoodChain.USDG);
    address internal owner = makeAddr("owner");
    address internal keeper = makeAddr("keeper");
    address internal creator = makeAddr("creator");
    address internal trader = makeAddr("trader");
    address internal treasury = makeAddr("treasury");

    AssetRegistry internal registry;
    LaunchFactory internal factory;
    LaunchRouter internal router;

    function setUp() public {
        vm.skip(block.chainid != RobinhoodChain.CHAIN_ID);

        registry = new AssetRegistry(owner, makeAddr("guardian"), keeper, treasury);
        address wallHook = address(
            uint160(Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.AFTER_SWAP_FLAG)
                | uint160(0x5555 << 144)
        );
        deployCodeTo("WallHook.sol:WallHook", abi.encode(manager, registry), wallHook);
        PriceWall priceWall = new PriceWall(manager, registry, IHooks(wallHook), address(usdg));
        vm.prank(owner);
        registry.wire(address(priceWall));

        address hookAddr = address(
            uint160(
                Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG
                    | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
            ) | uint160(0x6666 << 144)
        );
        deployCodeTo("LaunchHook.sol:LaunchHook", abi.encode(manager, address(this)), hookAddr);
        LaunchHook hook = LaunchHook(hookAddr);
        LaunchTokenDeployer tokenDeployer = new LaunchTokenDeployer();
        factory = new LaunchFactory(
            owner, manager, registry, address(usdg), hook, tokenDeployer, treasury, makeAddr("guardian"), 0.0005 ether
        );
        tokenDeployer.setFactory(address(factory));
        FeeEscrow escrow = new FeeEscrow(manager, hookAddr);
        BuybackVault buyback = new BuybackVault(manager, hook, factory, escrow, 365 days);
        LaunchLocker locker = new LaunchLocker(manager, address(factory));
        router = new LaunchRouter(manager, factory, registry, address(usdg));
        hook.wire(address(factory), address(locker), escrow, buyback);

        vm.startPrank(owner);
        factory.setLocker(locker);
        factory.setRouter(address(router));
        factory.addConfig(
            LaunchFactory.LaunchConfig(1_000_000_000e18, 714_285_714e18, 25_000, 200, 4_000e18, 500, true)
        );
        vm.stopPrank();
    }

    function test_fork_launchTradeGraduate() public {
        IAssetRegistry.AssetConfig memory c;
        c.name = "Big Mac US";
        c.symbol = "sBIGMAC";
        c.category = IAssetRegistry.Category.COLLECTIBLE;
        c.metadataURI = "ipfs://bigmac";
        c.unitScale = 1e18;
        c.maxMoveTicks = 2_000;
        c.minUpdateInterval = 1 hours;
        c.heartbeat = 48 hours;
        c.wallSupply = 1_000_000_000e18;
        address predicted = vm.computeCreateAddress(address(registry), vm.getNonce(address(registry)));
        int24 tick = PriceMath.tickAtPrice(5.69e18, predicted < address(usdg), 1e30);
        vm.prank(owner);
        uint256 assetId = registry.addAsset(c, tick);
        address synth = registry.getState(assetId).token;

        // Launch paid in real USDG through the router.
        LaunchFactory.LaunchParams memory p;
        p.name = "Burger Coin";
        p.symbol = "BURGER";
        p.logo = "ipfs://burger";
        p.creator = creator;
        p.creatorTaxBps = 100;
        p.buybackBps = 2_000;
        p.salt = keccak256("burger");
        deal(address(usdg), creator, 25e6);
        vm.deal(creator, 1 ether);
        vm.startPrank(creator);
        usdg.approve(address(router), 25e6);
        address token = router.launch{value: 0.0005 ether}(
            p, 0, synth, factory.configHash(0), address(usdg), 25e6, 0
        );
        vm.stopPrank();
        assertGt(IERC20(token).balanceOf(creator), 0);

        // A whale sells out the curve with USDG, then anyone graduates it.
        deal(address(usdg), trader, 30_000e6);
        vm.startPrank(trader);
        usdg.approve(address(router), type(uint256).max);
        uint256 bought = router.buy(token, address(usdg), 30_000e6, 0, trader, block.timestamp);
        vm.stopPrank();
        assertGt(bought, 600_000_000e18);
        assertTrue(factory.isReadyToMigrate(token));
        factory.migrate(token);
        assertTrue(factory.isGraduated(token));

        // Post-graduation sell straight back to USDG through the synth's wall.
        vm.startPrank(trader);
        IERC20(token).approve(address(router), bought / 10);
        uint256 usdgOut = router.sell(token, bought / 10, address(usdg), 0, trader, block.timestamp);
        vm.stopPrank();
        assertGt(usdgOut, 0);
    }
}
