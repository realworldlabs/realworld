// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IAssetRegistry} from "./interfaces/IAssetRegistry.sol";
import {IPriceWall} from "./interfaces/IPriceWall.sol";
import {IRedemptionVault} from "./interfaces/IRedemptionVault.sol";

/// @notice Buys synth back for USDG out of that asset's own pot, at the wall price,
///         with a pro-rata haircut when the pot cannot cover every holder.
contract RedemptionVault is IRedemptionVault, ReentrancyGuardTransient {
    using SafeERC20 for IERC20;

    uint256 public constant REDEEM_FEE_BPS = 30;
    uint256 private constant BPS = 10_000;
    uint256 private constant ONE = 1e18;

    IAssetRegistry public immutable registry;
    IERC20 public immutable usdg;
    /// @dev 10 ** (36 - usdgDecimals): converts synth(1e18) * price(1e18) into USDG units.
    uint256 private immutable _valueDivisor;

    mapping(uint256 assetId => uint256) public pot;

    event PotCredited(uint256 indexed assetId, uint256 amount);
    event Redeemed(
        uint256 indexed assetId, address indexed from, address indexed to, uint256 synthIn, uint256 usdgOut, uint256 fee
    );

    error Unauthorized();
    error ZeroAmount();
    error InsufficientOutput();

    constructor(IAssetRegistry registry_, address usdg_) {
        registry = registry_;
        usdg = IERC20(usdg_);
        _valueDivisor = 10 ** (36 - uint256(IERC20Metadata(usdg_).decimals()));
    }

    function creditPot(uint256 assetId, uint256 amount) external {
        if (msg.sender != registry.priceWall()) revert Unauthorized();
        pot[assetId] += amount;
        emit PotCredited(assetId, amount);
    }

    function quoteRedeem(uint256 assetId, uint256 amount)
        public
        view
        returns (uint256 gross, uint256 fee, uint256 out, uint256 ratioX18)
    {
        IPriceWall wall = IPriceWall(registry.priceWall());
        address token = registry.getState(assetId).token;
        uint256 price = wall.priceX18(assetId);
        (uint256 wallSynth, uint256 wallUsdg) = wall.wallBalances(assetId);

        uint256 circulating = IERC20(token).totalSupply() - IERC20(token).balanceOf(address(wall)) - wallSynth;
        uint256 liability = Math.mulDiv(circulating, price, _valueDivisor);
        uint256 potTotal = pot[assetId] + wallUsdg;
        uint256 value = Math.mulDiv(amount, price, _valueDivisor);

        if (liability == 0 || potTotal >= liability) {
            ratioX18 = ONE;
            gross = value;
        } else {
            ratioX18 = Math.mulDiv(potTotal, ONE, liability);
            gross = Math.mulDiv(value, potTotal, liability);
        }
        fee = Math.mulDiv(gross, REDEEM_FEE_BPS, BPS);
        out = gross - fee;
    }

    function redeem(uint256 assetId, uint256 amount, uint256 minOut, address to)
        external
        nonReentrant
        returns (uint256 out)
    {
        if (amount == 0) revert ZeroAmount();
        uint256 gross;
        uint256 fee;
        (gross,,,) = quoteRedeem(assetId, amount);

        IPriceWall wall = IPriceWall(registry.priceWall());
        if (gross > pot[assetId]) wall.harvest(assetId);
        // The view estimate of wall USDG can differ from the swept amount by rounding.
        if (gross > pot[assetId]) gross = pot[assetId];
        fee = Math.mulDiv(gross, REDEEM_FEE_BPS, BPS);
        out = gross - fee;
        if (out < minOut || out == 0) revert InsufficientOutput();
        pot[assetId] -= gross;

        IERC20(registry.getState(assetId).token).safeTransferFrom(msg.sender, address(wall), amount);
        if (fee > 0) usdg.safeTransfer(registry.treasury(), fee);
        usdg.safeTransfer(to, out);
        emit Redeemed(assetId, msg.sender, to, amount, out, fee);
    }
}
