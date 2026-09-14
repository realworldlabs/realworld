// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IRedemptionVault {
    function creditPot(uint256 assetId, uint256 amount) external;
    function pot(uint256 assetId) external view returns (uint256);
    function quoteRedeem(uint256 assetId, uint256 amount)
        external
        view
        returns (uint256 gross, uint256 fee, uint256 out, uint256 ratioX18);
    function redeem(uint256 assetId, uint256 amount, uint256 minOut, address to) external returns (uint256 out);
}
