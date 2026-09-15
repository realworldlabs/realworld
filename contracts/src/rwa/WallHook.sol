// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {HookStub} from "../common/HookStub.sol";
import {IAssetRegistry} from "./interfaces/IAssetRegistry.sol";

/// @notice Guards synth/USDG wall pools: only the PriceWall may create pools or add liquidity.
///         Anyone may swap in either direction, so any router can buy a synth and sell it back.
///         Every swap is reported so the indexer can track the wall without watching the PoolManager.
contract WallHook is HookStub {
    using StateLibrary for IPoolManager;
    using PoolIdLibrary for PoolKey;

    IAssetRegistry public immutable registry;

    event WallSwap(uint256 indexed assetId, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96);

    error OnlyPriceWall();

    constructor(IPoolManager poolManager_, IAssetRegistry registry_) HookStub(poolManager_) {
        registry = registry_;
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory p) {
        p.beforeInitialize = true;
        p.beforeAddLiquidity = true;
        p.afterSwap = true;
    }

    function beforeInitialize(address sender, PoolKey calldata, uint160)
        external
        view
        override
        onlyPoolManager
        returns (bytes4)
    {
        if (sender != registry.priceWall()) revert OnlyPriceWall();
        return this.beforeInitialize.selector;
    }

    function beforeAddLiquidity(address sender, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        external
        view
        override
        onlyPoolManager
        returns (bytes4)
    {
        if (sender != registry.priceWall()) revert OnlyPriceWall();
        return this.beforeAddLiquidity.selector;
    }

    function afterSwap(address sender, PoolKey calldata key, SwapParams calldata, BalanceDelta delta, bytes calldata)
        external
        override
        onlyPoolManager
        returns (bytes4, int128)
    {
        (bool found, uint256 assetId) = registry.assetIdOf(Currency.unwrap(key.currency0));
        if (!found) (, assetId) = registry.assetIdOf(Currency.unwrap(key.currency1));
        (uint160 sqrtP,,,) = poolManager.getSlot0(key.toId());
        emit WallSwap(assetId, sender, delta.amount0(), delta.amount1(), sqrtP);
        return (this.afterSwap.selector, 0);
    }
}
