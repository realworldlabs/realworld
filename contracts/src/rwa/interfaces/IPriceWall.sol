// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";

interface IPriceWall {
    function initWall(uint256 assetId, address token, int24 startTick) external;
    function harvest(uint256 assetId) external;
    function poolKeyOf(uint256 assetId) external view returns (PoolKey memory);
    function synthIsToken0(uint256 assetId) external view returns (bool);
    /// @notice USDG (1e18-scaled USD) per whole synth at the current wall tick.
    function priceX18(uint256 assetId) external view returns (uint256);
    /// @notice Synth and USDG currently held in the wall position.
    function wallBalances(uint256 assetId) external view returns (uint256 synthAmount, uint256 usdgAmount);
}
