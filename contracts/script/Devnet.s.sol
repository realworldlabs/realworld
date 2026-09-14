// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {console2} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IAssetRegistry} from "../src/rwa/interfaces/IAssetRegistry.sol";
import {PriceMath} from "../src/libraries/PriceMath.sol";
import {LaunchFactory} from "../src/launchpad/LaunchFactory.sol";
import {StackDeployer} from "./base/StackDeployer.sol";
import {RobinhoodChain} from "./RobinhoodChain.sol";

/// @notice Populates a local anvil fork of Robinhood Chain with the full stack, assets, launches and trades,
///         and writes addresses to deployments/devnet.json for the indexer and web app.
/// @dev Driven by script/devnet.sh, which funds the broadcaster with USDG first.
contract Devnet is StackDeployer {
    RwaStack internal rwa;
    LaunchStack internal lp;
    address internal me;

    function run() external {
        uint256 startBlock = block.number;
        vm.startBroadcast();
        me = msg.sender;

        rwa = _deployRwa(me, me, me, me);
        lp = _deployLaunchpad(me, rwa.registry, me, me);
        lp.buyback.setOperator(me, true);

        uint256 cpi = _addAsset("US CPI-U Index", "sUSCPI", IAssetRegistry.Category.MACRO, 334.98e18);
        uint256 redline = _addAsset("AK-47 Redline (FT)", "sREDLINE", IAssetRegistry.Category.COLLECTIBLE, 35.96e18);
        uint256 bigmac = _addAsset("Big Mac (US)", "sBIGMAC", IAssetRegistry.Category.COLLECTIBLE, 6.22e18);

        IERC20 usdg = IERC20(RobinhoodChain.USDG);
        usdg.approve(address(lp.router), type(uint256).max);
        usdg.approve(address(lp.factory), type(uint256).max);

        address rent = _launch("Rent Is Due", "RENT", _synth(cpi), 200, 3_000, 50e6);
        address rally = _launch("Redline Rally", "RALLY", _synth(redline), 100, 0, 25e6);
        address supersize = _launch("Supersize Me", "SUPER", _synth(bigmac), 0, 5_000, 20e6);
        address ddog = _launch("Dollar Dog", "DDOG", RobinhoodChain.USDG, 300, 0, 10e6);

        // Organic-looking trading.
        _buy(rent, 400e6);
        _buy(rally, 150e6);
        _buy(ddog, 900e6);
        _sell(rent, 3);
        _buy(rent, 250e6);
        _sell(ddog, 4);
        _buy(rally, 75e6);

        // Sell out SUPER and graduate it.
        _buy(supersize, 12_000e6);
        lp.factory.migrate(supersize);
        _buy(supersize, 500e6);
        lp.buyback.executeBuyback(rent);

        vm.stopBroadcast();

        string memory j = "devnet";
        vm.serializeUint(j, "chainId", block.chainid);
        vm.serializeUint(j, "startBlock", startBlock);
        vm.serializeAddress(j, "poolManager", RobinhoodChain.POOL_MANAGER);
        vm.serializeAddress(j, "usdg", RobinhoodChain.USDG);
        vm.serializeAddress(j, "assetRegistry", address(rwa.registry));
        vm.serializeAddress(j, "priceWall", address(rwa.priceWall));
        vm.serializeAddress(j, "redemptionVault", address(rwa.vault));
        vm.serializeAddress(j, "launchHook", address(lp.hook));
        vm.serializeAddress(j, "launchFactory", address(lp.factory));
        vm.serializeAddress(j, "feeEscrow", address(lp.escrow));
        vm.serializeAddress(j, "buybackVault", address(lp.buyback));
        vm.serializeAddress(j, "launchLocker", address(lp.locker));
        string memory out = vm.serializeAddress(j, "launchRouter", address(lp.router));
        vm.writeJson(out, "./deployments/devnet.json");
        console2.log("wrote deployments/devnet.json");
    }

    function _addAsset(string memory name, string memory symbol, IAssetRegistry.Category category, uint256 priceX18)
        internal
        returns (uint256 id)
    {
        IAssetRegistry.AssetConfig memory c;
        c.name = name;
        c.symbol = symbol;
        c.category = category;
        c.metadataURI = string.concat("ipfs://", symbol);
        c.unitScale = 1e18;
        c.minUpdateInterval = 1 hours;
        (c.maxMoveTicks, c.heartbeat) = category == IAssetRegistry.Category.MACRO ? (uint24(500), uint32(45 days)) : (uint24(2_000), uint32(48 hours));
        c.wallSupply = 1_000_000_000e18;
        address predicted = vm.computeCreateAddress(address(rwa.registry), vm.getNonce(address(rwa.registry)));
        id = rwa.registry.addAsset(c, PriceMath.tickAtPrice(priceX18, predicted < RobinhoodChain.USDG, 1e30));
    }

    function _synth(uint256 assetId) internal view returns (address) {
        return rwa.registry.getState(assetId).token;
    }

    function _launch(string memory name, string memory symbol, address pair, uint16 tax, uint16 buyback, uint256 usdgIn)
        internal
        returns (address token)
    {
        LaunchFactory.LaunchParams memory p;
        p.name = name;
        p.symbol = symbol;
        p.logo = string.concat("ipfs://logo-", symbol);
        p.description = string.concat(name, " - a devnet coin.");
        p.creator = me;
        p.creatorTaxBps = tax;
        p.buybackBps = buyback;
        p.salt = keccak256(bytes(symbol));
        bytes32 h = lp.factory.configHash(0);
        if (pair == RobinhoodChain.USDG) {
            token = lp.factory.launch{value: LAUNCH_FEE}(p, 0, pair, h, usdgIn, 0);
        } else {
            token = lp.router.launch{value: LAUNCH_FEE}(p, 0, pair, h, RobinhoodChain.USDG, usdgIn, 0);
        }
    }

    function _buy(address token, uint256 usdgIn) internal {
        lp.router.buy(token, RobinhoodChain.USDG, usdgIn, 0, me, block.timestamp + 1 hours);
    }

    function _sell(address token, uint256 divisor) internal {
        uint256 amount = IERC20(token).balanceOf(me) / divisor;
        IERC20(token).approve(address(lp.router), amount);
        lp.router.sell(token, amount, RobinhoodChain.USDG, 0, me, block.timestamp + 1 hours);
    }
}
