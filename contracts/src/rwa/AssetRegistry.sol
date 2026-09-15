// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IAssetRegistry} from "./interfaces/IAssetRegistry.sol";
import {IPriceWall} from "./interfaces/IPriceWall.sol";
import {SynthToken} from "./SynthToken.sol";

/// @notice Source of truth for synthetic assets: parameters, keeper bounds, pause and staleness.
contract AssetRegistry is IAssetRegistry, Ownable2Step {
    address public guardian;
    address public keeper;
    address public treasury;
    address public priceWall;

    AssetConfig[] private _configs;
    AssetState[] private _states;
    mapping(address token => uint256 idPlusOne) private _idPlusOne;

    event Wired(address priceWall);
    event AssetAdded(uint256 indexed assetId, address indexed token, string symbol, int24 startTick);
    event PriceRecorded(uint256 indexed assetId, int24 oldTick, int24 newTick);
    event PausedSet(uint256 indexed assetId, bool paused);
    event LaunchesEnabledSet(uint256 indexed assetId, bool enabled);
    event BoundsUpdated(uint256 indexed assetId, uint24 maxMoveTicks, uint32 minUpdateInterval, uint32 heartbeat);
    event GuardianSet(address guardian);
    event KeeperSet(address keeper);
    event TreasurySet(address treasury);

    error AlreadyWired();
    error NotWired();
    error ZeroAddress();
    error Unauthorized();
    error UnknownAsset();
    error InvalidConfig();
    error AssetPaused();
    error UpdateTooSoon();
    error MoveTooLarge();

    constructor(address owner_, address guardian_, address keeper_, address treasury_) Ownable(owner_) {
        if (guardian_ == address(0) || keeper_ == address(0) || treasury_ == address(0)) revert ZeroAddress();
        guardian = guardian_;
        keeper = keeper_;
        treasury = treasury_;
    }

    modifier knownAsset(uint256 assetId) {
        if (assetId >= _states.length) revert UnknownAsset();
        _;
    }

    // ---------- wiring & roles ----------

    function wire(address priceWall_) external onlyOwner {
        if (priceWall != address(0)) revert AlreadyWired();
        if (priceWall_ == address(0)) revert ZeroAddress();
        priceWall = priceWall_;
        emit Wired(priceWall_);
    }

    function owner() public view override(IAssetRegistry, Ownable) returns (address) {
        return Ownable.owner();
    }

    function setGuardian(address guardian_) external onlyOwner {
        if (guardian_ == address(0)) revert ZeroAddress();
        guardian = guardian_;
        emit GuardianSet(guardian_);
    }

    function setKeeper(address keeper_) external onlyOwner {
        if (keeper_ == address(0)) revert ZeroAddress();
        keeper = keeper_;
        emit KeeperSet(keeper_);
    }

    function setTreasury(address treasury_) external onlyOwner {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        emit TreasurySet(treasury_);
    }

    // ---------- assets ----------

    function addAsset(AssetConfig calldata config, int24 startTick) external onlyOwner returns (uint256 assetId) {
        if (priceWall == address(0)) revert NotWired();
        _validateBounds(config.maxMoveTicks, config.minUpdateInterval, config.heartbeat);
        if (config.wallSupply == 0 || config.unitScale == 0 || bytes(config.symbol).length == 0) {
            revert InvalidConfig();
        }

        assetId = _states.length;
        SynthToken token = new SynthToken(config.name, config.symbol, config.wallSupply, priceWall);

        _configs.push(config);
        _states.push(
            AssetState({
                token: address(token),
                tick: startTick,
                lastUpdate: uint64(block.timestamp),
                paused: false,
                launchesEnabled: true
            })
        );
        _idPlusOne[address(token)] = assetId + 1;

        IPriceWall(priceWall).initWall(assetId, address(token), startTick);
        emit AssetAdded(assetId, address(token), config.symbol, startTick);
    }

    function updateBounds(uint256 assetId, uint24 maxMoveTicks, uint32 minUpdateInterval, uint32 heartbeat)
        external
        onlyOwner
        knownAsset(assetId)
    {
        _validateBounds(maxMoveTicks, minUpdateInterval, heartbeat);
        AssetConfig storage c = _configs[assetId];
        c.maxMoveTicks = maxMoveTicks;
        c.minUpdateInterval = minUpdateInterval;
        c.heartbeat = heartbeat;
        emit BoundsUpdated(assetId, maxMoveTicks, minUpdateInterval, heartbeat);
    }

    /// @notice Guardian or owner may pause; only the owner may unpause.
    function setPaused(uint256 assetId, bool paused) external knownAsset(assetId) {
        if (paused) {
            if (msg.sender != guardian && msg.sender != owner()) revert Unauthorized();
        } else {
            if (msg.sender != owner()) revert Unauthorized();
        }
        _states[assetId].paused = paused;
        emit PausedSet(assetId, paused);
    }

    function setLaunchesEnabled(uint256 assetId, bool enabled) external onlyOwner knownAsset(assetId) {
        _states[assetId].launchesEnabled = enabled;
        emit LaunchesEnabledSet(assetId, enabled);
    }

    /// @notice Validates and records a keeper price move. Called by the PriceWall before it moves liquidity.
    function recordPriceUpdate(uint256 assetId, int24 newTick) external knownAsset(assetId) {
        if (msg.sender != priceWall) revert Unauthorized();
        AssetState storage s = _states[assetId];
        AssetConfig storage c = _configs[assetId];
        if (s.paused) revert AssetPaused();
        if (block.timestamp < uint256(s.lastUpdate) + c.minUpdateInterval) revert UpdateTooSoon();
        int256 diff = int256(newTick) - int256(s.tick);
        if (diff < 0) diff = -diff;
        if (uint256(diff) > c.maxMoveTicks) revert MoveTooLarge();

        emit PriceRecorded(assetId, s.tick, newTick);
        s.tick = newTick;
        s.lastUpdate = uint64(block.timestamp);
    }

    // ---------- views ----------

    function assetCount() external view returns (uint256) {
        return _states.length;
    }

    function getConfig(uint256 assetId) external view knownAsset(assetId) returns (AssetConfig memory) {
        return _configs[assetId];
    }

    function getState(uint256 assetId) external view knownAsset(assetId) returns (AssetState memory) {
        return _states[assetId];
    }

    function assetIdOf(address token) external view returns (bool found, uint256 assetId) {
        uint256 v = _idPlusOne[token];
        if (v == 0) return (false, 0);
        return (true, v - 1);
    }

    function isStale(uint256 assetId) public view knownAsset(assetId) returns (bool) {
        return block.timestamp > uint256(_states[assetId].lastUpdate) + _configs[assetId].heartbeat;
    }

    function isLaunchable(uint256 assetId) external view knownAsset(assetId) returns (bool) {
        AssetState storage s = _states[assetId];
        return s.launchesEnabled && !s.paused && !isStale(assetId);
    }

    function _validateBounds(uint24 maxMoveTicks, uint32 minUpdateInterval, uint32 heartbeat) private pure {
        if (maxMoveTicks == 0 || heartbeat == 0 || heartbeat <= minUpdateInterval) revert InvalidConfig();
    }
}
