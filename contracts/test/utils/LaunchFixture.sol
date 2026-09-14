// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LaunchFactory} from "../../src/launchpad/LaunchFactory.sol";
import {LaunchHook} from "../../src/launchpad/LaunchHook.sol";
import {LaunchToken} from "../../src/launchpad/LaunchToken.sol";
import {LaunchTokenDeployer} from "../../src/launchpad/LaunchTokenDeployer.sol";
import {LaunchLocker} from "../../src/launchpad/LaunchLocker.sol";
import {FeeEscrow} from "../../src/launchpad/FeeEscrow.sol";
import {BuybackVault} from "../../src/launchpad/BuybackVault.sol";
import {LaunchRouter} from "../../src/launchpad/LaunchRouter.sol";
import {ILaunchHook} from "../../src/launchpad/interfaces/ILaunchpad.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {PriceMath} from "../../src/libraries/PriceMath.sol";
import {RwaFixture} from "./RwaFixture.sol";

/// @notice RWA stack plus the full launchpad, with helpers to launch and trade.
abstract contract LaunchFixture is RwaFixture {
    uint256 internal constant LAUNCH_FEE = 0.0005 ether;
    address internal constant LAUNCH_HOOK_ADDRESS = address(
        uint160(
            Hooks.BEFORE_INITIALIZE_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG | Hooks.BEFORE_SWAP_FLAG
                | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
        ) | uint160(0x7777 << 144)
    );

    address internal creator = makeAddr("creator");
    address internal launchTreasury = makeAddr("launchTreasury");

    LaunchHook internal launchHook;
    LaunchFactory internal factory;
    FeeEscrow internal escrow;
    BuybackVault internal buyback;
    LaunchLocker internal locker;
    LaunchRouter internal router;
    uint32 internal configId;

    function setUpLaunchpad() internal {
        setUpRwa();
        deployCodeTo("LaunchHook.sol:LaunchHook", abi.encode(manager, address(this)), LAUNCH_HOOK_ADDRESS);
        launchHook = LaunchHook(LAUNCH_HOOK_ADDRESS);

        LaunchTokenDeployer tokenDeployer = new LaunchTokenDeployer();
        factory = new LaunchFactory(
            owner, manager, registry, address(usdgToken), launchHook, tokenDeployer, launchTreasury, guardian, LAUNCH_FEE
        );
        tokenDeployer.setFactory(address(factory));
        escrow = new FeeEscrow(manager, address(launchHook));
        buyback = new BuybackVault(manager, launchHook, factory, escrow, 365 days);
        locker = new LaunchLocker(manager, address(factory));

        launchHook.wire(address(factory), address(locker), escrow, buyback);
        router = new LaunchRouter(manager, factory, registry, address(usdgToken));
        vm.startPrank(owner);
        factory.setLocker(locker);
        factory.setRouter(address(router));
        configId = uint32(factory.addConfig(defaultLaunchConfig()));
        vm.stopPrank();

        vm.deal(creator, 10 ether);
    }

    function defaultLaunchConfig() internal pure returns (LaunchFactory.LaunchConfig memory c) {
        c.supply = 1_000_000_000e18;
        c.curveSupply = 714_285_714e18;
        c.curveWidthTicks = 25_000;
        c.tickSpacing = 200;
        c.startMarketCapUsd = 4_000e18;
        c.maxCreatorTaxBps = 500;
        c.enabled = true;
    }

    function launchParams(string memory symbol, uint16 taxBps, uint16 buybackBps)
        internal
        view
        returns (LaunchFactory.LaunchParams memory p)
    {
        p.name = symbol;
        p.symbol = symbol;
        p.logo = "ipfs://logo";
        p.description = "a coin";
        p.creator = creator;
        p.creatorTaxBps = taxBps;
        p.buybackBps = buybackBps;
        p.salt = keccak256(bytes(symbol));
    }

    /// @notice Creator launches against `pair`, first buy paid in `pair`. Mints/buys the pair as needed.
    function launchAgainst(address pair, LaunchFactory.LaunchParams memory p, uint256 firstBuy)
        internal
        returns (address token)
    {
        fundPair(pair, creator, firstBuy);
        vm.startPrank(creator);
        IERC20(pair).approve(address(factory), firstBuy);
        token = factory.launch{value: LAUNCH_FEE}(p, configId, pair, factory.configHash(configId), firstBuy, 0);
        vm.stopPrank();
    }

    /// @notice Gives `who` `amount` of a pair asset: mints USDG, or buys synth from its wall.
    function fundPair(address pair, address who, uint256 amount) internal {
        if (pair == address(usdgToken)) {
            usdgToken.mint(who, amount);
            return;
        }
        (, uint256 assetId) = registry.assetIdOf(pair);
        uint256 price = priceWall.priceX18(assetId);
        // buy a little extra to cover rounding, then send the surplus away
        uint256 usdgIn = amount * price / 1e30 + 10e6;
        buySynth(assetId, who, usdgIn);
        uint256 extra = IERC20(pair).balanceOf(who) - amount;
        vm.prank(who);
        IERC20(pair).transfer(address(0xdead), extra);
    }

    function pairOfLaunch(address token) internal view returns (Currency) {
        PoolKey memory key = factory.poolKeyOf(token);
        return Currency.unwrap(key.currency0) == token ? key.currency1 : key.currency0;
    }

    function swapLaunch(address token, address trader, bool buy, int256 amountSpecified)
        internal
        returns (int256 pairChange, int256 tokenChange)
    {
        PoolKey memory key = factory.poolKeyOf(token);
        bool tokenIs0 = Currency.unwrap(key.currency0) == token;
        IERC20 pair = IERC20(Currency.unwrap(pairOfLaunch(token)));
        bool zeroForOne = buy ? !tokenIs0 : tokenIs0;

        uint256 pairBefore = pair.balanceOf(trader);
        uint256 tokenBefore = IERC20(token).balanceOf(trader);
        vm.startPrank(trader);
        pair.approve(address(swapRouter), type(uint256).max);
        IERC20(token).approve(address(swapRouter), type(uint256).max);
        swapRouter.swap(
            key,
            SwapParams({
                zeroForOne: zeroForOne,
                amountSpecified: amountSpecified,
                sqrtPriceLimitX96: zeroForOne ? MIN_PRICE_LIMIT : MAX_PRICE_LIMIT
            }),
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}),
            ""
        );
        vm.stopPrank();
        pairChange = int256(pair.balanceOf(trader)) - int256(pairBefore);
        tokenChange = int256(IERC20(token).balanceOf(trader)) - int256(tokenBefore);
    }

    /// @notice Current USD price (1e18) of a launch token.
    function tokenPriceUsd(address token) internal view returns (uint256) {
        PoolKey memory key = factory.poolKeyOf(token);
        (uint160 sqrtP,,,) = StateLibrary.getSlot0(manager, key.toId());
        bool tokenIs0 = Currency.unwrap(key.currency0) == token;
        (uint256 pairUsd, uint8 dec) = factory.pairQuote(Currency.unwrap(pairOfLaunch(token)));
        uint256 inPair = PriceMath.priceAtSqrtPrice(sqrtP, tokenIs0, 10 ** (36 - uint256(dec)));
        return inPair * pairUsd / 1e18;
    }
}
