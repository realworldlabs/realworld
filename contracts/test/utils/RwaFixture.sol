// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Deployers} from "@uniswap/v4-core/test/utils/Deployers.sol";
import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {MockUSDG} from "./MockUSDG.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AssetRegistry} from "../../src/rwa/AssetRegistry.sol";
import {IAssetRegistry} from "../../src/rwa/interfaces/IAssetRegistry.sol";
import {WallHook} from "../../src/rwa/WallHook.sol";
import {PriceWall} from "../../src/rwa/PriceWall.sol";
import {RedemptionVault} from "../../src/rwa/RedemptionVault.sol";
import {PriceMath} from "../../src/libraries/PriceMath.sol";

/// @notice Deploys a local PoolManager plus the full synthetic RWA stack.
/// @dev `usdgAt()` lets child tests place USDG at a low or high address to cover both token orderings.
abstract contract RwaFixture is Deployers {
    uint256 internal constant PRICE_SCALE = 1e30; // 18-dec synth priced in 6-dec USDG
    address internal constant WALL_HOOK_ADDRESS = address(
        uint160(Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG)
            | uint160(0x4444 << 144)
    );

    address internal owner = makeAddr("owner");
    address internal guardian = makeAddr("guardian");
    address internal keeper = makeAddr("keeper");
    address internal treasury = makeAddr("treasury");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    MockUSDG internal usdgToken;
    AssetRegistry internal registry;
    WallHook internal wallHook;
    PriceWall internal priceWall;
    RedemptionVault internal vault;

    function usdgAt() internal pure virtual returns (address);

    function setUpRwa() internal {
        deployFreshManagerAndRouters();

        deployCodeTo("MockUSDG.sol:MockUSDG", usdgAt());
        usdgToken = MockUSDG(usdgAt());

        registry = new AssetRegistry(owner, guardian, keeper, treasury);
        deployCodeTo("WallHook.sol:WallHook", abi.encode(manager, registry), WALL_HOOK_ADDRESS);
        wallHook = WallHook(WALL_HOOK_ADDRESS);
        priceWall = new PriceWall(manager, registry, IHooks(WALL_HOOK_ADDRESS), address(usdgToken));
        vault = new RedemptionVault(registry, address(usdgToken));

        vm.prank(owner);
        registry.wire(address(priceWall), address(vault));
    }

    function macroConfig(string memory symbol) internal pure returns (IAssetRegistry.AssetConfig memory c) {
        c.name = symbol;
        c.symbol = symbol;
        c.category = IAssetRegistry.Category.MACRO;
        c.metadataURI = "ipfs://meta";
        c.unitScale = 1e18;
        c.maxMoveTicks = 500;
        c.minUpdateInterval = 1 hours;
        c.heartbeat = 45 days;
        c.wallSupply = 1_000_000_000e18;
    }

    /// @notice Adds an asset whose wall opens at `priceX18` USD per synth.
    function addAsset(string memory symbol, uint256 priceX18) internal returns (uint256 assetId) {
        address predicted = vm.computeCreateAddress(address(registry), vm.getNonce(address(registry)));
        bool synthIs0 = predicted < address(usdgToken);
        int24 tick = PriceMath.tickAtPrice(priceX18, synthIs0, PRICE_SCALE);
        vm.prank(owner);
        assetId = registry.addAsset(macroConfig(symbol), tick);
    }

    function tickFor(uint256 assetId, uint256 priceX18) internal view returns (int24) {
        return PriceMath.tickAtPrice(priceX18, priceWall.synthIsToken0(assetId), PRICE_SCALE);
    }

    function synthOf(uint256 assetId) internal view returns (IERC20) {
        return IERC20(registry.getState(assetId).token);
    }

    /// @notice Buys synth from the wall with an exact USDG input.
    function buySynth(uint256 assetId, address buyer, uint256 usdgIn) internal returns (uint256 synthOut) {
        PoolKey memory key = priceWall.poolKeyOf(assetId);
        bool synthIs0 = priceWall.synthIsToken0(assetId);
        usdgToken.mint(buyer, usdgIn);
        IERC20 synth = synthOf(assetId);
        uint256 before = synth.balanceOf(buyer);

        vm.startPrank(buyer);
        usdgToken.approve(address(swapRouter), usdgIn);
        swapRouter.swap(
            key,
            SwapParams({
                zeroForOne: !synthIs0,
                amountSpecified: -int256(usdgIn),
                sqrtPriceLimitX96: synthIs0 ? MAX_PRICE_LIMIT : MIN_PRICE_LIMIT
            }),
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}),
            ""
        );
        vm.stopPrank();
        synthOut = synth.balanceOf(buyer) - before;
    }

    function movePrice(uint256 assetId, int24 newTick) internal {
        vm.prank(keeper);
        priceWall.movePrice(assetId, newTick, keccak256("sources"));
    }
}
