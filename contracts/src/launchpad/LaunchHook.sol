// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary, toBeforeSwapDelta} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {HookStub} from "../common/HookStub.sol";
import {IFeeEscrow, IBuybackVault, ILaunchHook, ILaunchFactory} from "./interfaces/ILaunchpad.sol";

/// @notice Singleton hook for launch pools. Pool LP fee is zero; this hook charges every fee in the pair asset.
/// @dev Fees are minted as PoolManager ERC-6909 claims to the escrow / buyback vault, so no ERC-20 transfer
///      happens inside a swap and the PoolManager never needs a spare balance.
contract LaunchHook is HookStub, ILaunchHook {
    using StateLibrary for IPoolManager;

    uint256 public constant BASE_FEE_BPS = 100; // 1%
    uint256 public constant PROTOCOL_SHARE_OF_BASE_BPS = 3_000; // 30% of the base fee
    uint256 private constant BPS = 10_000;
    bytes1 public constant PARK_FLAG = 0x01;

    address public immutable deployer;
    address public factory;
    address public locker;
    IFeeEscrow public escrow;
    IBuybackVault public buybackVault;

    mapping(PoolId => PoolInfo) private _pools;

    event FeeTaken(
        PoolId indexed id, address indexed token, uint256 protocolFee, uint256 creatorFee, uint256 buybackFee
    );

    error AlreadyWired();
    error Unauthorized();
    error UnknownPool();
    error CurveComplete();

    /// @param deployer_ The account allowed to call `wire` once. Passed explicitly because the hook is
    ///        deployed through the CREATE2 proxy, which would otherwise be msg.sender.
    constructor(IPoolManager poolManager_, address deployer_) HookStub(poolManager_) {
        deployer = deployer_;
    }

    function wire(address factory_, address locker_, IFeeEscrow escrow_, IBuybackVault buybackVault_) external {
        if (msg.sender != deployer) revert Unauthorized();
        if (factory != address(0)) revert AlreadyWired();
        factory = factory_;
        locker = locker_;
        escrow = escrow_;
        buybackVault = buybackVault_;
    }

    modifier onlyFactory() {
        if (msg.sender != factory) revert Unauthorized();
        _;
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory p) {
        p.beforeInitialize = true;
        p.beforeAddLiquidity = true;
        p.beforeSwap = true;
        p.afterSwap = true;
        p.beforeSwapReturnDelta = true;
        p.afterSwapReturnDelta = true;
    }

    // ---------- factory hooks ----------

    function registerPool(PoolKey calldata key, PoolInfo calldata info) external onlyFactory {
        _pools[key.toId()] = info;
    }

    function setGraduated(PoolId id) external onlyFactory {
        _pools[id].graduated = true;
    }

    function setCreatorSettings(PoolId id, address feeRecipient, bool buybackEnabled) external onlyFactory {
        PoolInfo storage p = _pools[id];
        p.feeRecipient = feeRecipient;
        p.buybackEnabled = buybackEnabled;
    }

    // ---------- views ----------

    function poolInfo(PoolId id) external view returns (PoolInfo memory) {
        return _pools[id];
    }

    function isCurveComplete(PoolKey calldata key) public view returns (bool) {
        PoolInfo storage p = _pools[key.toId()];
        if (p.token == address(0)) revert UnknownPool();
        return _curveComplete(key.toId(), p);
    }

    function _curveComplete(PoolId id, PoolInfo storage p) private view returns (bool) {
        (uint160 sqrtP,,,) = poolManager.getSlot0(id);
        // The launch token is bought when the pair flows in. Token as currency0 => price rises.
        return p.pairIsToken0 ? sqrtP <= p.curveEndSqrtPriceX96 : sqrtP >= p.curveEndSqrtPriceX96;
    }

    // ---------- pool callbacks ----------

    function beforeInitialize(address sender, PoolKey calldata, uint160)
        external
        view
        override
        onlyPoolManager
        returns (bytes4)
    {
        if (sender != factory) revert Unauthorized();
        return this.beforeInitialize.selector;
    }

    function beforeAddLiquidity(address sender, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        external
        view
        override
        onlyPoolManager
        returns (bytes4)
    {
        if (sender != factory && sender != locker) revert Unauthorized();
        return this.beforeAddLiquidity.selector;
    }

    function beforeSwap(address sender, PoolKey calldata key, SwapParams calldata params, bytes calldata hookData)
        external
        override
        onlyPoolManager
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        PoolId id = key.toId();
        PoolInfo storage p = _pools[id];
        if (p.token == address(0)) revert UnknownPool();
        if (_feeExempt(sender, hookData)) return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);

        bool buying = params.zeroForOne == p.pairIsToken0;
        if (buying && !p.graduated && _curveComplete(id, p)) revert CurveComplete();

        bool exactInput = params.amountSpecified < 0;
        bool specifiedIsToken0 = exactInput == params.zeroForOne;
        if (specifiedIsToken0 != p.pairIsToken0) return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);

        uint256 feeBps = BASE_FEE_BPS + p.creatorTaxBps;
        uint256 amount = exactInput ? uint256(-params.amountSpecified) : uint256(params.amountSpecified);
        // Exact input: fee is a share of what is spent. Exact output: gross up so the trader still receives `amount`.
        uint256 fee = exactInput ? amount * feeBps / BPS : amount * feeBps / (BPS - feeBps);
        if (fee == 0) return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);

        _collect(id, p, fee);
        return (this.beforeSwap.selector, toBeforeSwapDelta(int128(int256(fee)), 0), 0);
    }

    function afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) external override onlyPoolManager returns (bytes4, int128) {
        PoolId id = key.toId();
        PoolInfo storage p = _pools[id];
        if (_feeExempt(sender, hookData)) return (this.afterSwap.selector, 0);

        bool exactInput = params.amountSpecified < 0;
        bool specifiedIsToken0 = exactInput == params.zeroForOne;
        if (specifiedIsToken0 == p.pairIsToken0) return (this.afterSwap.selector, 0);

        int128 pairDelta = p.pairIsToken0 ? delta.amount0() : delta.amount1();
        uint256 amount = pairDelta < 0 ? uint256(uint128(-pairDelta)) : uint256(uint128(pairDelta));
        uint256 fee = amount * (BASE_FEE_BPS + p.creatorTaxBps) / BPS;
        if (fee == 0) return (this.afterSwap.selector, 0);

        _collect(id, p, fee);
        return (this.afterSwap.selector, int128(int256(fee)));
    }

    function _feeExempt(address sender, bytes calldata hookData) private view returns (bool) {
        if (sender == address(buybackVault)) return true;
        return sender == factory && hookData.length == 1 && hookData[0] == PARK_FLAG;
    }

    function _collect(PoolId id, PoolInfo storage p, uint256 fee) private {
        uint256 feeBps = BASE_FEE_BPS + p.creatorTaxBps;
        uint256 baseFee = fee * BASE_FEE_BPS / feeBps;
        uint256 protocolFee = baseFee * PROTOCOL_SHARE_OF_BASE_BPS / BPS;
        uint256 creatorTotal = fee - protocolFee;
        uint256 buybackFee = p.buybackEnabled ? creatorTotal * p.buybackBps / BPS : 0;
        uint256 creatorFee = creatorTotal - buybackFee;

        uint256 currencyId = p.pair.toId();
        poolManager.mint(address(escrow), currencyId, protocolFee + creatorFee);
        if (protocolFee > 0) escrow.credit(ILaunchFactory(factory).treasury(), p.pair, protocolFee);
        if (creatorFee > 0) escrow.credit(p.feeRecipient, p.pair, creatorFee);
        if (buybackFee > 0) {
            poolManager.mint(address(buybackVault), currencyId, buybackFee);
            buybackVault.notifyBudget(p.token, buybackFee);
        }
        emit FeeTaken(id, p.token, protocolFee, creatorFee, buybackFee);
    }
}
