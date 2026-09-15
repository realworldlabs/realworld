// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IUnlockCallback} from "@uniswap/v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {LiquidityAmounts} from "@uniswap/v4-periphery/src/libraries/LiquidityAmounts.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IAssetRegistry} from "../rwa/interfaces/IAssetRegistry.sol";
import {IPriceWall} from "../rwa/interfaces/IPriceWall.sol";
import {PriceMath} from "../libraries/PriceMath.sol";
import {LaunchToken} from "./LaunchToken.sol";
import {LaunchTokenDeployer} from "./LaunchTokenDeployer.sol";
import {ILaunchFactory, ILaunchHook, ILaunchLocker} from "./interfaces/ILaunchpad.sol";

/// @notice Entry point for launching coins paired with a synthetic RWA (or USDG) and for graduating them.
contract LaunchFactory is ILaunchFactory, IUnlockCallback, Ownable2Step, ReentrancyGuardTransient {
    using SafeERC20 for IERC20;
    using StateLibrary for IPoolManager;

    struct LaunchConfig {
        uint256 supply;
        uint256 curveSupply;
        int24 curveWidthTicks;
        int24 tickSpacing;
        /// @notice USD market cap (1e18) at the first curve tick.
        uint256 startMarketCapUsd;
        uint16 maxCreatorTaxBps;
        bool enabled;
    }

    struct LaunchParams {
        string name;
        string symbol;
        string logo;
        string description;
        LaunchToken.Socials socials;
        /// @notice Creator of record. Must equal msg.sender unless the caller is the trusted router.
        address creator;
        address feeRecipient;
        uint16 creatorTaxBps;
        uint16 buybackBps;
        bytes32 salt;
    }

    struct Launch {
        PoolKey key;
        address creator;
        address feeRecipient;
        uint32 configId;
        bool tokenIsToken0;
        bool graduated;
        bool buybackEnabled;
        int24 curveLower;
        int24 curveUpper;
        uint128 curveLiquidity;
        uint256 reserve;
    }

    uint256 private constant BPS = 10_000;
    uint256 private constant ONE = 1e18;
    bytes1 private constant PARK_FLAG = 0x01;
    uint8 private constant ACTION_LAUNCH = 1;
    uint8 private constant ACTION_MIGRATE = 2;

    IPoolManager public immutable poolManager;
    IAssetRegistry public immutable registry;
    address public immutable usdg;
    ILaunchHook public immutable hook;
    LaunchTokenDeployer public immutable tokenDeployer;
    ILaunchLocker public locker;
    address public guardian;
    address public router;
    address public treasury;
    uint256 public launchFee;

    LaunchConfig[] private _configs;
    mapping(address token => Launch) private _launches;
    address[] public allTokens;

    event Launched(
        address indexed token,
        address indexed creator,
        address indexed pair,
        PoolId poolId,
        uint32 configId,
        uint16 creatorTaxBps,
        uint16 buybackBps,
        uint256 firstBuyPair,
        uint256 firstBuyTokens
    );
    event Migrated(address indexed token, uint256 pairAmount, uint256 tokenAmount);
    event CreatorSettingsUpdated(address indexed token, address feeRecipient, bool buybackEnabled);
    event ConfigAdded(uint256 indexed configId);
    event ConfigEnabled(uint256 indexed configId, bool enabled);

    error Unauthorized();
    error AlreadyWired();
    error ZeroAddress();
    error WrongLaunchFee();
    error ConfigDisabled();
    error ConfigMismatch();
    error InvalidConfig();
    error PairNotAllowed();
    error TaxTooHigh();
    error InvalidBuybackBps();
    error SlippageExceeded();
    error UnknownLaunch();
    error AlreadyGraduated();
    error NotReadyToMigrate();

    constructor(
        address owner_,
        IPoolManager poolManager_,
        IAssetRegistry registry_,
        address usdg_,
        ILaunchHook hook_,
        LaunchTokenDeployer tokenDeployer_,
        address treasury_,
        address guardian_,
        uint256 launchFee_
    ) Ownable(owner_) {
        if (treasury_ == address(0) || guardian_ == address(0)) revert ZeroAddress();
        poolManager = poolManager_;
        registry = registry_;
        usdg = usdg_;
        hook = hook_;
        tokenDeployer = tokenDeployer_;
        treasury = treasury_;
        guardian = guardian_;
        launchFee = launchFee_;
    }

    // ---------- admin ----------

    function setLocker(ILaunchLocker locker_) external onlyOwner {
        if (address(locker) != address(0)) revert AlreadyWired();
        locker = locker_;
    }

    function setRouter(address router_) external onlyOwner {
        router = router_;
    }

    function setTreasury(address treasury_) external onlyOwner {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
    }

    function setGuardian(address guardian_) external onlyOwner {
        if (guardian_ == address(0)) revert ZeroAddress();
        guardian = guardian_;
    }

    function setLaunchFee(uint256 launchFee_) external onlyOwner {
        launchFee = launchFee_;
    }

    function addConfig(LaunchConfig calldata c) external onlyOwner returns (uint256 id) {
        if (
            c.curveSupply == 0 || c.curveSupply >= c.supply || c.tickSpacing <= 0 || c.curveWidthTicks <= 0
                || c.curveWidthTicks % c.tickSpacing != 0 || c.startMarketCapUsd == 0 || c.maxCreatorTaxBps > 900
        ) revert InvalidConfig();
        id = _configs.length;
        _configs.push(c);
        emit ConfigAdded(id);
    }

    function setConfigEnabled(uint256 id, bool enabled) external onlyOwner {
        _configs[id].enabled = enabled;
        emit ConfigEnabled(id, enabled);
    }

    // ---------- views ----------

    function configCount() external view returns (uint256) {
        return _configs.length;
    }

    function getConfig(uint256 id) external view returns (LaunchConfig memory) {
        return _configs[id];
    }

    function configHash(uint256 id) public view returns (bytes32) {
        return keccak256(abi.encode(_configs[id]));
    }

    function launchCount() external view returns (uint256) {
        return allTokens.length;
    }

    function getLaunch(address token) external view returns (Launch memory) {
        return _launches[token];
    }

    function poolKeyOf(address token) external view returns (PoolKey memory) {
        return _launches[token].key;
    }

    function feeRecipientOf(address token) external view returns (address) {
        return _launches[token].feeRecipient;
    }

    function isGraduated(address token) external view returns (bool) {
        return _launches[token].graduated;
    }

    /// @notice USD price (1e18) and decimals of an allowed pair asset. Reverts when the pair cannot be launched against.
    function pairQuote(address pair) public view returns (uint256 usdPrice, uint8 decimals) {
        if (pair == usdg) return (ONE, IERC20Metadata(usdg).decimals());
        (bool found, uint256 assetId) = registry.assetIdOf(pair);
        if (!found || !registry.isLaunchable(assetId)) revert PairNotAllowed();
        return (IPriceWall(registry.priceWall()).priceX18(assetId), 18);
    }

    function isReadyToMigrate(address token) public view returns (bool) {
        Launch storage l = _launches[token];
        if (l.key.tickSpacing == 0 || l.graduated) return false;
        return hook.isCurveComplete(l.key);
    }

    // ---------- launch ----------

    function launch(
        LaunchParams calldata p,
        uint32 configId,
        address pair,
        bytes32 expectedConfigHash,
        uint256 firstBuyPair,
        uint256 minFirstBuyTokens
    ) external payable nonReentrant returns (address token) {
        if (msg.value != launchFee) revert WrongLaunchFee();
        if (configId >= _configs.length) revert InvalidConfig();
        LaunchConfig memory c = _configs[configId];
        if (!c.enabled) revert ConfigDisabled();
        if (keccak256(abi.encode(c)) != expectedConfigHash) revert ConfigMismatch();
        if (p.creatorTaxBps > c.maxCreatorTaxBps) revert TaxTooHigh();
        if (p.buybackBps > BPS) revert InvalidBuybackBps();
        address creator = msg.sender == router ? p.creator : msg.sender;
        if (creator == address(0)) revert ZeroAddress();
        address feeRecipient = p.feeRecipient == address(0) ? creator : p.feeRecipient;

        (uint256 pairUsd, uint8 pairDecimals) = pairQuote(pair);
        if (launchFee > 0) Address.sendValue(payable(treasury), msg.value);

        token = tokenDeployer.deploy(
            keccak256(abi.encode(creator, p.salt)), p.name, p.symbol, p.logo, p.description, p.socials, c.supply
        );

        Launch storage l = _launches[token];
        l.creator = creator;
        l.feeRecipient = feeRecipient;
        l.configId = configId;
        l.buybackEnabled = p.buybackBps > 0;
        _initCurve(l, c, token, pair, pairUsd, pairDecimals);

        hook.registerPool(
            l.key,
            ILaunchHook.PoolInfo({
                token: token,
                pair: Currency.wrap(pair),
                pairIsToken0: !l.tokenIsToken0,
                graduated: false,
                buybackEnabled: l.buybackEnabled,
                creatorTaxBps: p.creatorTaxBps,
                buybackBps: p.buybackBps,
                feeRecipient: feeRecipient,
                curveEndSqrtPriceX96: TickMath.getSqrtPriceAtTick(l.tokenIsToken0 ? l.curveUpper : l.curveLower)
            })
        );
        int24 startTick = l.tokenIsToken0 ? l.curveLower : l.curveUpper;
        poolManager.initialize(l.key, TickMath.getSqrtPriceAtTick(startTick));

        // The first buy is optional: without one the pool simply opens at the start tick.
        if (firstBuyPair > 0) IERC20(pair).safeTransferFrom(msg.sender, address(this), firstBuyPair);
        (uint256 used, uint256 bought, uint256 curveTokens) = abi.decode(
            poolManager.unlock(abi.encode(ACTION_LAUNCH, token, c.curveSupply, firstBuyPair, creator)),
            (uint256, uint256, uint256)
        );
        if (bought < minFirstBuyTokens) revert SlippageExceeded();
        l.reserve = c.supply - curveTokens;
        if (used < firstBuyPair) IERC20(pair).safeTransfer(msg.sender, firstBuyPair - used);

        allTokens.push(token);
        emit Launched(token, creator, pair, l.key.toId(), configId, p.creatorTaxBps, p.buybackBps, used, bought);
    }

    function _initCurve(
        Launch storage l,
        LaunchConfig memory c,
        address token,
        address pair,
        uint256 pairUsd,
        uint8 pairDecimals
    ) private {
        bool tokenIs0 = token < pair;
        l.tokenIsToken0 = tokenIs0;
        l.key = PoolKey({
            currency0: Currency.wrap(tokenIs0 ? token : pair),
            currency1: Currency.wrap(tokenIs0 ? pair : token),
            fee: 0,
            tickSpacing: c.tickSpacing,
            hooks: IHooks(address(hook))
        });

        // Token price in pair units (1e18) at the start market cap.
        uint256 tokenUsd = c.startMarketCapUsd * ONE / c.supply;
        uint256 tokenInPair = tokenUsd * ONE / pairUsd;
        uint256 scale = 10 ** (36 - uint256(pairDecimals));
        int24 tick = _floor(PriceMath.tickAtPrice(tokenInPair, tokenIs0, scale), c.tickSpacing);

        // Token is bought by moving price up when it is currency0, down when it is currency1.
        (l.curveLower, l.curveUpper) = tokenIs0 ? (tick, tick + c.curveWidthTicks) : (tick - c.curveWidthTicks, tick);
        if (l.curveLower < TickMath.minUsableTick(c.tickSpacing) || l.curveUpper > TickMath.maxUsableTick(c.tickSpacing)) {
            revert InvalidConfig();
        }
        uint160 sqrtA = TickMath.getSqrtPriceAtTick(l.curveLower);
        uint160 sqrtB = TickMath.getSqrtPriceAtTick(l.curveUpper);
        l.curveLiquidity = tokenIs0
            ? LiquidityAmounts.getLiquidityForAmount0(sqrtA, sqrtB, c.curveSupply)
            : LiquidityAmounts.getLiquidityForAmount1(sqrtA, sqrtB, c.curveSupply);
    }

    // ---------- graduation ----------

    /// @notice Permissionless. Moves a sold-out curve into a permanently locked full-range position.
    function migrate(address token) external nonReentrant {
        Launch storage l = _launches[token];
        if (l.key.tickSpacing == 0) revert UnknownLaunch();
        if (l.graduated) revert AlreadyGraduated();
        if (!hook.isCurveComplete(l.key)) revert NotReadyToMigrate();

        l.graduated = true;
        hook.setGraduated(l.key.toId());
        (uint256 pairOut, uint256 tokenOut) =
            abi.decode(poolManager.unlock(abi.encode(ACTION_MIGRATE, token, uint256(0), uint256(0), address(0))), (uint256, uint256));

        uint256 tokenTotal = tokenOut + l.reserve;
        l.reserve = 0;
        IERC20(token).safeTransfer(address(locker), tokenTotal);
        (uint256 amount0, uint256 amount1) = l.tokenIsToken0 ? (tokenTotal, pairOut) : (pairOut, tokenTotal);
        locker.lock(l.key, token, amount0, amount1);
        emit Migrated(token, pairOut, tokenTotal);
    }

    // ---------- creator controls ----------

    function setFeeRecipient(address token, address feeRecipient) external {
        Launch storage l = _launches[token];
        if (msg.sender != l.feeRecipient && msg.sender != l.creator) revert Unauthorized();
        if (feeRecipient == address(0)) revert ZeroAddress();
        l.feeRecipient = feeRecipient;
        _pushCreatorSettings(token, l);
    }

    /// @notice Creator can switch buybacks on or off; the guardian can only switch them off.
    function setBuybackEnabled(address token, bool enabled) external {
        Launch storage l = _launches[token];
        if (l.key.tickSpacing == 0) revert UnknownLaunch();
        bool isCreator = msg.sender == l.creator || msg.sender == l.feeRecipient;
        if (!isCreator && !(msg.sender == guardian && !enabled)) revert Unauthorized();
        l.buybackEnabled = enabled;
        _pushCreatorSettings(token, l);
    }

    function _pushCreatorSettings(address token, Launch storage l) private {
        hook.setCreatorSettings(l.key.toId(), l.feeRecipient, l.buybackEnabled);
        emit CreatorSettingsUpdated(token, l.feeRecipient, l.buybackEnabled);
    }

    // ---------- pool manager callback ----------

    function unlockCallback(bytes calldata data) external returns (bytes memory) {
        if (msg.sender != address(poolManager)) revert Unauthorized();
        (uint8 action, address token, uint256 curveSupply, uint256 firstBuyPair, address creator) =
            abi.decode(data, (uint8, address, uint256, uint256, address));
        Launch storage l = _launches[token];
        return action == ACTION_LAUNCH ? _launchCallback(l, token, curveSupply, firstBuyPair, creator) : _migrateCallback(l, token);
    }

    function _launchCallback(Launch storage l, address token, uint256 curveSupply, uint256 firstBuyPair, address creator)
        private
        returns (bytes memory)
    {
        (BalanceDelta added,) = poolManager.modifyLiquidity(
            l.key, ModifyLiquidityParams(l.curveLower, l.curveUpper, int256(uint256(l.curveLiquidity)), 0), ""
        );
        uint256 curveTokens = uint256(uint128(-(l.tokenIsToken0 ? added.amount0() : added.amount1())));
        require(curveTokens <= curveSupply);
        Currency tokenC = Currency.wrap(token);
        if (firstBuyPair == 0) {
            _pay(tokenC, curveTokens);
            return abi.encode(uint256(0), uint256(0), curveTokens);
        }

        // First buy: pair in, exact input. Pays the normal fees.
        BalanceDelta d = poolManager.swap(
            l.key,
            SwapParams({
                zeroForOne: !l.tokenIsToken0,
                amountSpecified: -int256(firstBuyPair),
                sqrtPriceLimitX96: TickMath.getSqrtPriceAtTick(l.tokenIsToken0 ? l.curveUpper : l.curveLower)
            }),
            ""
        );
        int128 pairSwap = l.tokenIsToken0 ? d.amount1() : d.amount0();
        int128 tokenSwap = l.tokenIsToken0 ? d.amount0() : d.amount1();
        uint256 used = uint256(uint128(-pairSwap));
        uint256 bought = uint256(uint128(tokenSwap));

        Currency pairC = l.tokenIsToken0 ? l.key.currency1 : l.key.currency0;
        _pay(tokenC, curveTokens);
        _pay(pairC, used);
        poolManager.take(tokenC, creator, bought);
        return abi.encode(used, bought, curveTokens);
    }

    function _migrateCallback(Launch storage l, address token) private returns (bytes memory) {
        (BalanceDelta removed,) = poolManager.modifyLiquidity(
            l.key, ModifyLiquidityParams(l.curveLower, l.curveUpper, -int256(uint256(l.curveLiquidity)), 0), ""
        );
        l.curveLiquidity = 0;

        // Re-park the now empty pool exactly at the curve's end price so the locked position opens there,
        // no matter how far a buyer pushed the price through the empty range above the curve.
        uint160 end = TickMath.getSqrtPriceAtTick(l.tokenIsToken0 ? l.curveUpper : l.curveLower);
        (uint160 current,,,) = poolManager.getSlot0(l.key.toId());
        if (current != end) {
            poolManager.swap(
                l.key, SwapParams({zeroForOne: end < current, amountSpecified: -1, sqrtPriceLimitX96: end}), abi.encodePacked(PARK_FLAG)
            );
        }

        uint256 tokenOut = uint256(uint128(l.tokenIsToken0 ? removed.amount0() : removed.amount1()));
        uint256 pairOut = uint256(uint128(l.tokenIsToken0 ? removed.amount1() : removed.amount0()));
        Currency pairC = l.tokenIsToken0 ? l.key.currency1 : l.key.currency0;
        if (tokenOut > 0) poolManager.take(Currency.wrap(token), address(this), tokenOut);
        if (pairOut > 0) poolManager.take(pairC, address(locker), pairOut);
        return abi.encode(pairOut, tokenOut);
    }

    function _pay(Currency currency, uint256 amount) private {
        if (amount == 0) return;
        poolManager.sync(currency);
        IERC20(Currency.unwrap(currency)).safeTransfer(address(poolManager), amount);
        poolManager.settle();
    }

    function _floor(int24 tick, int24 spacing) private pure returns (int24) {
        int24 q = tick / spacing;
        if (tick < 0 && tick % spacing != 0) q--;
        return q * spacing;
    }
}
