// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IUnlockCallback} from "@uniswap/v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {IFeeEscrow} from "./interfaces/ILaunchpad.sol";
import {LaunchHook} from "./LaunchHook.sol";

/// @notice Pull-based fee balances. Holds PoolManager ERC-6909 claims and converts them to tokens on claim.
contract FeeEscrow is IFeeEscrow, IUnlockCallback, ReentrancyGuardTransient {
    IPoolManager public immutable poolManager;
    address public immutable hook;

    mapping(address account => mapping(Currency currency => uint256)) private _balances;

    event Credited(address indexed account, Currency indexed currency, uint256 amount);
    event Claimed(address indexed account, Currency indexed currency, address to, uint256 amount);

    error Unauthorized();
    error NothingToClaim();

    constructor(IPoolManager poolManager_, address hook_) {
        poolManager = poolManager_;
        hook = hook_;
    }

    /// @dev The caller must already have delivered matching ERC-6909 claims to this contract.
    function credit(address account, Currency currency, uint256 amount) external {
        if (msg.sender != hook && msg.sender != address(LaunchHook(hook).buybackVault())) revert Unauthorized();
        _balances[account][currency] += amount;
        emit Credited(account, currency, amount);
    }

    function balanceOf(address account, Currency currency) external view returns (uint256) {
        return _balances[account][currency];
    }

    function claim(Currency currency, address to) external nonReentrant returns (uint256 amount) {
        amount = _balances[msg.sender][currency];
        if (amount == 0) revert NothingToClaim();
        _balances[msg.sender][currency] = 0;
        poolManager.unlock(abi.encode(currency, to, amount));
        emit Claimed(msg.sender, currency, to, amount);
    }

    function unlockCallback(bytes calldata data) external returns (bytes memory) {
        if (msg.sender != address(poolManager)) revert Unauthorized();
        (Currency currency, address to, uint256 amount) = abi.decode(data, (Currency, address, uint256));
        poolManager.burn(address(this), currency.toId(), amount);
        poolManager.take(currency, to, amount);
        return "";
    }
}
