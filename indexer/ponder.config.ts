import fs from "node:fs";
import path from "node:path";
import { createConfig, factory } from "ponder";
import { getAbiItem, parseAbi, type Address } from "viem";
import {
  assetRegistryAbi,
  buybackVaultAbi,
  feeEscrowAbi,
  launchFactoryAbi,
  launchTokenAbi,
  priceWallAbi,
  redemptionVaultAbi,
} from "@rwa/abi";

/** Deployment addresses: a JSON file written by the deploy/devnet scripts. */
interface Deployments {
  chainId: number;
  startBlock: number;
  poolManager: Address;
  assetRegistry: Address;
  priceWall: Address;
  redemptionVault: Address;
  launchFactory: Address;
  feeEscrow: Address;
  buybackVault: Address;
}

const deploymentsFile = path.resolve(process.env.DEPLOYMENTS_FILE ?? "../contracts/deployments/devnet.json");
const d = JSON.parse(fs.readFileSync(deploymentsFile, "utf8")) as Deployments;
const startBlock = d.startBlock;

export const poolManagerAbi = parseAbi([
  "event Swap(bytes32 indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)",
]);

export default createConfig({
  chains: {
    robinhood: {
      id: d.chainId,
      rpc: process.env.PONDER_RPC_URL ?? "http://127.0.0.1:8545",
      // Arbitrum Orbit chain: small, frequent blocks. Keep eth_getLogs ranges bounded for the public RPC.
      ethGetLogsBlockRange: Number(process.env.PONDER_LOG_RANGE ?? 5_000),
    },
  },
  contracts: {
    AssetRegistry: { chain: "robinhood", abi: assetRegistryAbi, address: d.assetRegistry, startBlock },
    PriceWall: { chain: "robinhood", abi: priceWallAbi, address: d.priceWall, startBlock },
    RedemptionVault: { chain: "robinhood", abi: redemptionVaultAbi, address: d.redemptionVault, startBlock },
    LaunchFactory: { chain: "robinhood", abi: launchFactoryAbi, address: d.launchFactory, startBlock },
    FeeEscrow: { chain: "robinhood", abi: feeEscrowAbi, address: d.feeEscrow, startBlock },
    BuybackVault: { chain: "robinhood", abi: buybackVaultAbi, address: d.buybackVault, startBlock },
    PoolManager: { chain: "robinhood", abi: poolManagerAbi, address: d.poolManager, startBlock },
    LaunchToken: {
      chain: "robinhood",
      abi: launchTokenAbi,
      address: factory({
        address: d.launchFactory,
        event: getAbiItem({ abi: launchFactoryAbi, name: "Launched" }),
        parameter: "token",
      }),
      startBlock,
    },
  },
});
