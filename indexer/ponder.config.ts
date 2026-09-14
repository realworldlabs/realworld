import fs from "node:fs";
import path from "node:path";
import { createConfig, factory } from "ponder";
import { getAbiItem, type Address } from "viem";
import {
  assetRegistryAbi,
  buybackVaultAbi,
  feeEscrowAbi,
  launchFactoryAbi,
  launchHookAbi,
  launchTokenAbi,
  priceWallAbi,
  redemptionVaultAbi,
} from "@rwa/abi";

/** Deployment addresses: a JSON file written by the deploy/devnet scripts. */
interface Deployments {
  chainId: number;
  startBlock: number;
  assetRegistry: Address;
  launchHook: Address;
  priceWall: Address;
  redemptionVault: Address;
  launchFactory: Address;
  feeEscrow: Address;
  buybackVault: Address;
}

const deploymentsFile = path.resolve(process.env.DEPLOYMENTS_FILE ?? "../contracts/deployments/devnet.json");
const d = JSON.parse(fs.readFileSync(deploymentsFile, "utf8")) as Deployments;
const startBlock = d.startBlock;

export default createConfig({
  chains: {
    robinhood: {
      id: d.chainId,
      // Comma-separated list: Ponder load-balances across providers and backs off the ones that rate-limit.
      rpc: (process.env.PONDER_RPC_URL ?? "http://127.0.0.1:8545").split(",").map((u) => u.trim()).filter(Boolean),
      // Arbitrum Orbit chain: small, frequent blocks. Keep eth_getLogs ranges bounded for the public RPC.
      ethGetLogsBlockRange: Number(process.env.PONDER_LOG_RANGE ?? 5_000),
      // The public RPC returns 429 above roughly this rate; blocks arrive ~5/s so poll in batches.
      maxRequestsPerSecond: Number(process.env.PONDER_MAX_RPS ?? 8),
      // getLogs range must satisfy the strictest provider in the list (QuickNode Discover: 5 blocks).
      pollingInterval: Number(process.env.PONDER_POLL_MS ?? 4_000),
    },
  },
  contracts: {
    AssetRegistry: { chain: "robinhood", abi: assetRegistryAbi, address: d.assetRegistry, startBlock },
    PriceWall: { chain: "robinhood", abi: priceWallAbi, address: d.priceWall, startBlock },
    RedemptionVault: { chain: "robinhood", abi: redemptionVaultAbi, address: d.redemptionVault, startBlock },
    LaunchFactory: { chain: "robinhood", abi: launchFactoryAbi, address: d.launchFactory, startBlock },
    FeeEscrow: { chain: "robinhood", abi: feeEscrowAbi, address: d.feeEscrow, startBlock },
    BuybackVault: { chain: "robinhood", abi: buybackVaultAbi, address: d.buybackVault, startBlock },
    // Trades come from the hook's own Traded event: the shared v4 PoolManager is far too busy to scan.
    LaunchHook: { chain: "robinhood", abi: launchHookAbi, address: d.launchHook, startBlock },
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
