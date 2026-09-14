// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {HookStub} from "../common/HookStub.sol";
import {IAssetRegistry} from "./interfaces/IAssetRegistry.sol";

/// @notice Guards synth/USDG wall pools: only the PriceWall may create pools or add liquidity,
///         and only the PriceWall may swap synth -> USDG. Everyone else can only buy synth.
contract WallHook is HookStub {
    IAssetRegistry public immutable registry;

    error OnlyPriceWall();
    error SellThroughVault();

    constructor(IPoolManager poolManager_, IAssetRegistry registry_) HookStub(poolManager_) {
        registry = registry_;
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory p) {
        p.beforeInitialize = true;
        p.beforeAddLiquidity = true;
        p.beforeSwap = true;
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

    function beforeSwap(address sender, PoolKey calldata key, SwapParams calldata params, bytes calldata)
        external
        view
        override
        onlyPoolManager
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        if (sender != registry.priceWall()) {
            (bool synthIs0,) = registry.assetIdOf(Currency.unwrap(key.currency0));
            // zeroForOne sends currency0 in: that is a sell when currency0 is the synth.
            if (params.zeroForOne == synthIs0) revert SellThroughVault();
        }
        return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }
}
