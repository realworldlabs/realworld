// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

interface IFeeEscrow {
    function credit(address account, Currency currency, uint256 amount) external;
    function balanceOf(address account, Currency currency) external view returns (uint256);
    function claim(Currency currency, address to) external returns (uint256);
}

interface IBuybackVault {
    function notifyBudget(address token, uint256 amount) external;
}

interface ILaunchLocker {
    function lock(PoolKey calldata key, address token, uint256 amount0, uint256 amount1) external;
}

interface ILaunchHook {
    struct PoolInfo {
        address token;
        Currency pair;
        bool pairIsToken0;
        bool graduated;
        bool buybackEnabled;
        uint16 creatorTaxBps;
        uint16 buybackBps;
        address feeRecipient;
        /// @notice Sqrt price at which the curve is sold out.
        uint160 curveEndSqrtPriceX96;
    }

    function registerPool(PoolKey calldata key, PoolInfo calldata info) external;
    function setGraduated(PoolId id) external;
    function setCreatorSettings(PoolId id, address feeRecipient, bool buybackEnabled) external;
    function poolInfo(PoolId id) external view returns (PoolInfo memory);
    function isCurveComplete(PoolKey calldata key) external view returns (bool);
}

interface ILaunchFactory {
    function treasury() external view returns (address);
    function poolKeyOf(address token) external view returns (PoolKey memory);
    function feeRecipientOf(address token) external view returns (address);
    function isGraduated(address token) external view returns (bool);
}
