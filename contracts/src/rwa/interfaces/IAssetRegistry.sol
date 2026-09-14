// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IAssetRegistry {
    enum Category {
        MACRO,
        COLLECTIBLE
    }

    struct AssetConfig {
        string name;
        string symbol;
        Category category;
        string metadataURI;
        /// @notice Real-world units represented by one whole token, 1e18-scaled (1e15 = 1/1000 of a unit).
        uint256 unitScale;
        /// @notice Largest tick change per update (1 tick ~= 1 bp).
        uint24 maxMoveTicks;
        uint32 minUpdateInterval;
        uint32 heartbeat;
        uint256 wallSupply;
    }

    struct AssetState {
        address token;
        int24 tick;
        uint64 lastUpdate;
        bool paused;
        bool launchesEnabled;
    }

    function owner() external view returns (address);
    function guardian() external view returns (address);
    function keeper() external view returns (address);
    function treasury() external view returns (address);
    function priceWall() external view returns (address);
    function vault() external view returns (address);

    function assetCount() external view returns (uint256);
    function getConfig(uint256 assetId) external view returns (AssetConfig memory);
    function getState(uint256 assetId) external view returns (AssetState memory);
    /// @notice Returns (true, id) when `token` is a registered synth.
    function assetIdOf(address token) external view returns (bool found, uint256 assetId);
    function isStale(uint256 assetId) external view returns (bool);
    function isLaunchable(uint256 assetId) external view returns (bool);

    function recordPriceUpdate(uint256 assetId, int24 newTick) external;
}
