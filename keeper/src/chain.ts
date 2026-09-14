import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  type Address,
  type Hex,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { assetRegistryAbi, buybackVaultAbi, launchFactoryAbi, priceWallAbi } from "@rwa/abi";
import type { Env } from "./config.ts";

export const robinhoodChain = defineChain({
  id: Number(process.env.CHAIN_ID ?? 4663),
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.chain.robinhood.com"] } },
  blockExplorers: { default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" } },
});

export interface AssetOnChain {
  tick: number;
  lastUpdate: number;
  paused: boolean;
  maxMoveTicks: number;
  minUpdateInterval: number;
  heartbeat: number;
  synthIsToken0: boolean;
}

/** Everything the jobs need from the chain. Implemented with viem below and faked in tests. */
export interface KeeperChain {
  /** Latest block timestamp (seconds). On-chain intervals are measured against this, not the local clock. */
  now(): Promise<number>;
  asset(assetId: number): Promise<AssetOnChain>;
  movePrice(assetId: number, tick: number, sourcesHash: Hex): Promise<Hex>;
  launchTokens(fromIndex: number): Promise<Address[]>;
  isGraduated(token: Address): Promise<boolean>;
  isReadyToMigrate(token: Address): Promise<boolean>;
  migrate(token: Address): Promise<Hex>;
  buybackBudget(token: Address): Promise<bigint>;
  executeBuyback(token: Address): Promise<Hex>;
}

export function viemChain(env: Env): KeeperChain {
  const account = privateKeyToAccount(env.KEEPER_PRIVATE_KEY as Hex);
  // The keeper shares its RPC with the indexer, whose backfill bursts trigger 429s: back off for ~1.5 min before giving up.
  const transport = http(env.RPC_URL, { timeout: 30_000, retryCount: 6, retryDelay: 1_500 });
  const pub: PublicClient = createPublicClient({ chain: robinhoodChain, transport });
  const wallet: WalletClient = createWalletClient({ chain: robinhoodChain, transport, account });
  const registry = env.REGISTRY as Address;
  const priceWall = env.PRICE_WALL as Address;

  async function send(address: Address, abi: readonly unknown[], functionName: string, args: readonly unknown[]): Promise<Hex> {
    const { request } = await pub.simulateContract({ address, abi, functionName, args, account } as never);
    const hash = await wallet.writeContract(request as never);
    const receipt = await pub.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") throw new Error(`${functionName} reverted in ${hash}`);
    return hash;
  }

  function need(addr: string | undefined, name: string): Address {
    if (!addr) throw new Error(`${name} not configured`);
    return addr as Address;
  }

  return {
    async now() {
      return Number((await pub.getBlock({ blockTag: "latest" })).timestamp);
    },
    async asset(assetId) {
      const id = BigInt(assetId);
      const [state, config, synthIsToken0] = await Promise.all([
        pub.readContract({ address: registry, abi: assetRegistryAbi, functionName: "getState", args: [id] }),
        pub.readContract({ address: registry, abi: assetRegistryAbi, functionName: "getConfig", args: [id] }),
        pub.readContract({ address: priceWall, abi: priceWallAbi, functionName: "synthIsToken0", args: [id] }),
      ]);
      return {
        tick: state.tick,
        lastUpdate: Number(state.lastUpdate),
        paused: state.paused,
        maxMoveTicks: config.maxMoveTicks,
        minUpdateInterval: config.minUpdateInterval,
        heartbeat: config.heartbeat,
        synthIsToken0,
      };
    },
    movePrice: (assetId, tick, hash) => send(priceWall, priceWallAbi, "movePrice", [BigInt(assetId), tick, hash]),
    async launchTokens(fromIndex) {
      const factory = need(env.FACTORY, "FACTORY");
      const count = Number(await pub.readContract({ address: factory, abi: launchFactoryAbi, functionName: "launchCount" }));
      const out: Address[] = [];
      for (let i = fromIndex; i < count; i++) {
        out.push(await pub.readContract({ address: factory, abi: launchFactoryAbi, functionName: "allTokens", args: [BigInt(i)] }));
      }
      return out;
    },
    isGraduated: (token) =>
      pub.readContract({ address: need(env.FACTORY, "FACTORY"), abi: launchFactoryAbi, functionName: "isGraduated", args: [token] }),
    isReadyToMigrate: (token) =>
      pub.readContract({ address: need(env.FACTORY, "FACTORY"), abi: launchFactoryAbi, functionName: "isReadyToMigrate", args: [token] }),
    migrate: (token) => send(need(env.FACTORY, "FACTORY"), launchFactoryAbi, "migrate", [token]),
    buybackBudget: (token) =>
      pub.readContract({ address: need(env.BUYBACK_VAULT, "BUYBACK_VAULT"), abi: buybackVaultAbi, functionName: "budget", args: [token] }),
    executeBuyback: (token) => send(need(env.BUYBACK_VAULT, "BUYBACK_VAULT"), buybackVaultAbi, "executeBuyback", [token]),
  };
}
