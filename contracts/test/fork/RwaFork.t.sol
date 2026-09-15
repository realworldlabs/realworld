// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AssetRegistry} from "../../src/rwa/AssetRegistry.sol";
import {IAssetRegistry} from "../../src/rwa/interfaces/IAssetRegistry.sol";
import {WallHook} from "../../src/rwa/WallHook.sol";
import {PriceWall} from "../../src/rwa/PriceWall.sol";
import {PriceMath} from "../../src/libraries/PriceMath.sol";
import {RobinhoodChain} from "../../script/RobinhoodChain.sol";

/// @notice Runs the RWA stack against the live Robinhood Chain PoolManager and USDG.
/// @dev Run with: forge test --match-path test/fork/RwaFork.t.sol --fork-url robinhood
contract RwaForkTest is Test {
    IPoolManager internal manager = IPoolManager(RobinhoodChain.POOL_MANAGER);
    IERC20 internal usdg = IERC20(RobinhoodChain.USDG);

    AssetRegistry internal registry;
    PriceWall internal priceWall;
    PoolSwapTest internal swapRouter;

    address internal owner = makeAddr("owner");
    address internal keeper = makeAddr("keeper");
    address internal alice = makeAddr("alice");

    function setUp() public {
        vm.skip(block.chainid != RobinhoodChain.CHAIN_ID);

        registry = new AssetRegistry(owner, makeAddr("guardian"), keeper, makeAddr("treasury"));
        address hookAddr = address(
            uint160(Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.AFTER_SWAP_FLAG)
                | uint160(0x5555 << 144)
        );
        deployCodeTo("WallHook.sol:WallHook", abi.encode(manager, registry), hookAddr);
        priceWall = new PriceWall(manager, registry, IHooks(hookAddr), address(usdg));
        vm.prank(owner);
        registry.wire(address(priceWall));
        swapRouter = new PoolSwapTest(manager);
    }

    function test_fork_buyMoveSell() public {
        IAssetRegistry.AssetConfig memory c;
        c.name = "Case-Shiller US National";
        c.symbol = "sCSUS";
        c.metadataURI = "ipfs://meta";
        c.unitScale = 1e18;
        c.maxMoveTicks = 500;
        c.minUpdateInterval = 1 hours;
        c.heartbeat = 45 days;
        c.wallSupply = 1_000_000_000e18;

        address predicted = vm.computeCreateAddress(address(registry), vm.getNonce(address(registry)));
        int24 tick = PriceMath.tickAtPrice(330e18, predicted < address(usdg), 1e30);
        vm.prank(owner);
        uint256 id = registry.addAsset(c, tick);
        assertApproxEqRel(priceWall.priceX18(id), 330e18, 2e14);

        // Buy $3,300 of synth with real USDG.
        deal(address(usdg), alice, 3_300e6);
        PoolKey memory key = priceWall.poolKeyOf(id);
        bool synthIs0 = priceWall.synthIsToken0(id);
        vm.startPrank(alice);
        usdg.approve(address(swapRouter), type(uint256).max);
        swapRouter.swap(
            key,
            SwapParams(!synthIs0, -int256(3_300e6), synthIs0 ? TickMath.MAX_SQRT_PRICE - 1 : TickMath.MIN_SQRT_PRICE + 1),
            PoolSwapTest.TestSettings(false, false),
            ""
        );
        vm.stopPrank();
        IERC20 synth = IERC20(registry.getState(id).token);
        assertApproxEqRel(synth.balanceOf(alice), 10e18, 3e14);

        vm.warp(block.timestamp + 1 hours);
        vm.prank(keeper);
        priceWall.movePrice(id, PriceMath.tickAtPrice(320e18, synthIs0, 1e30), keccak256("fork"));
        (, uint256 usdgInWall) = priceWall.wallBalances(id);
        assertApproxEqAbs(usdgInWall, 3_300e6, 4);

        // Sell everything back through a plain v4 router, as any terminal would.
        vm.startPrank(alice);
        synth.approve(address(swapRouter), type(uint256).max);
        swapRouter.swap(
            key,
            SwapParams(synthIs0, -int256(synth.balanceOf(alice)), synthIs0 ? TickMath.MIN_SQRT_PRICE + 1 : TickMath.MAX_SQRT_PRICE - 1),
            PoolSwapTest.TestSettings(false, false),
            ""
        );
        vm.stopPrank();
        assertApproxEqRel(usdg.balanceOf(alice), 3_200e6, 1e15);
    }
}
