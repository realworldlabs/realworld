import { defineChain, type Address } from "viem";

export interface Deployments {
  chainId: number;
  usdg: Address;
  poolManager: Address;
  assetRegistry: Address;
  priceWall: Address;
  wallHook: Address;
  launchFactory: Address;
  launchRouter: Address;
  feeEscrow: Address;
  buybackVault: Address;
}

export const deployments = JSON.parse(process.env.NEXT_PUBLIC_DEPLOYMENTS ?? "{}") as Deployments;

export const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL ?? "http://127.0.0.1:42069";
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545";
/**
 * Local devnet: enables the unlocked anvil account as a wallet so every flow can be exercised without an extension.
 * Tied to the anvil chain id so a stray NEXT_PUBLIC_DEVNET in a production build can never switch it on.
 */
export const DEVNET = process.env.NEXT_PUBLIC_DEVNET === "true" && deployments.chainId === 31337;
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://gateway.pinata.cloud/ipfs/";

/** http(s) URL for a coin image stored as an ipfs:// or http(s) reference; undefined when there is none. */
export function imageUrl(ref: string | undefined | null): string | undefined {
  if (!ref) return undefined;
  if (ref.startsWith("ipfs://")) return `${IPFS_GATEWAY}${ref.slice(7)}`;
  if (ref.startsWith("http://") || ref.startsWith("https://")) return ref;
  return undefined;
}

export const LAUNCH_FEE = 500_000_000_000_000n; // 0.0005 ETH
export const USDG_DECIMALS = 6;
export const TOKEN_DECIMALS = 18;
export const SUPPLY = 1_000_000_000;

export const robinhood = defineChain({
  id: deployments.chainId || 4663,
  name: DEVNET ? "Robinhood Chain (devnet)" : "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
  blockExplorers: { default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" } },
});
