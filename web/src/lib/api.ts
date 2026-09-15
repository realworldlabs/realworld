import { useQuery } from "@tanstack/react-query";
import type { Address, Hex } from "viem";
import { INDEXER_URL } from "./config";

export interface Asset {
  assetId: number;
  token: Address;
  symbol: string;
  name: string;
  category: "MACRO" | "COLLECTIBLE";
  metadataUri: string;
  poolId: Hex;
  synthIsToken0: boolean;
  tick: number;
  priceUsd: number;
  lastUpdate: number;
  paused: boolean;
  /** USDG bidding in the wall (6 decimals): what holders can sell back into. */
  pot: string;
  /** Synth still on offer in the wall (18 decimals). */
  wallSynth: string;
  launches: number;
  /** Fraction, e.g. 0.031 for +3.1%; null when there is no baseline yet. */
  change24h: number | null;
  /** Wall price history (opening price plus keeper moves), oldest first. */
  history: { t: number; p: number }[];
}

export interface AssetPrice {
  id: string;
  assetId: number;
  tick: number;
  priceUsd: number;
  sourcesHash: Hex;
  timestamp: number;
  txHash: Hex;
}

export interface Coin {
  token: Address;
  name: string;
  symbol: string;
  logo: string;
  description: string;
  creator: Address;
  feeRecipient: Address;
  pair: Address;
  assetId: number | null;
  poolId: Hex;
  tokenIsToken0: boolean;
  creatorTaxBps: number;
  buybackBps: number;
  buybackEnabled: boolean;
  createdAt: number;
  graduated: boolean;
  graduatedAt: number | null;
  priceInPair: number;
  priceUsd: number;
  marketCapUsd: number;
  curveProgress: number;
  volumeUsd: number;
  trades: number;
  lastTradeAt: number;
  holders: number;
  asset: Asset | null;
  change24h: number | null;
  volume24h: number;
  /** Hourly closes over the last day, oldest first. */
  spark: number[];
}

export interface CoinDetail extends Coin {
  topHolders: { account: Address; balance: string }[];
  buybacks: { id: string; pairSpent: string; tokensBought: string; timestamp: number }[];
}

export interface Trade {
  id: string;
  token: Address;
  trader: Address;
  side: "buy" | "sell";
  tokenAmount: string;
  pairAmount: string;
  priceUsd: number;
  valueUsd: number;
  timestamp: number;
  txHash: Hex;
}

export interface TapeTrade extends Trade {
  symbol: string;
  logo: string;
  assetId: number | null;
}

export interface Candle {
  bucket: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volumeUsd: number;
}

export interface Portfolio {
  holdings: { balance: string; coin: Coin; valueUsd: number }[];
  fees: { account: Address; currency: Address; credited: string; claimed: string; claimable: string }[];
  created: Coin[];
  trades: Trade[];
}

export interface Stats {
  coins: number;
  graduated: number;
  volumeUsd: number;
  assets: number;
  volume24h: number;
  trades24h: number;
  launches24h: number;
  lastBlock: number;
  headBlock: number;
}

/** The RealWorld token, launched on pons v2 and polled by the indexer. */
export interface Featured {
  token: Address;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  description: string;
  socials: { twitter: string; telegram: string; discord: string; website: string; farcaster: string };
  pair: { address: Address; symbol: string; decimals: number };
  phase: "curve" | "swept" | "pool" | "rescued";
  curve: Address;
  poolId: Hex | null;
  priceInPair: number;
  pairUsd: number | null;
  priceUsd: number | null;
  supply: number;
  marketCapInPair: number;
  marketCapUsd: number | null;
  progress: number;
  change24h: number | null;
  spark: number[];
  ponsUrl: string;
  updatedAt: number;
}

export interface Health {
  ok: boolean;
  lastBlock: number;
  headBlock: number;
  ready: boolean;
  lastError?: string;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${INDEXER_URL}${path}`);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

const LIVE = { refetchInterval: 5_000 } as const;

export const useStats = () => useQuery({ queryKey: ["stats"], queryFn: () => get<Stats>("/stats"), ...LIVE });
/** null while no featured token is configured (404), so the card simply does not render. */
export const useFeatured = () =>
  useQuery({
    queryKey: ["featured"],
    queryFn: async () => {
      const res = await fetch(`${INDEXER_URL}/featured`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`/featured: ${res.status}`);
      return res.json() as Promise<Featured>;
    },
    refetchInterval: 30_000,
    retry: false,
  });
export const useHealth = () => useQuery({ queryKey: ["health"], queryFn: () => get<Health>("/health"), refetchInterval: 10_000 });
export const useAssets = () => useQuery({ queryKey: ["assets"], queryFn: () => get<Asset[]>("/assets"), ...LIVE });
export const useAsset = (id: number) =>
  useQuery({ queryKey: ["asset", id], queryFn: () => get<Asset & { prices: AssetPrice[] }>(`/assets/${id}`), ...LIVE });

export function useCoins(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => !!e[1])).toString();
  return useQuery({ queryKey: ["coins", qs], queryFn: () => get<{ total: number; items: Coin[] }>(`/coins?${qs}`), ...LIVE });
}

export const useCoin = (token: string) =>
  useQuery({ queryKey: ["coin", token], queryFn: () => get<CoinDetail>(`/coins/${token}`), ...LIVE });
export const useTrades = (token: string) =>
  useQuery({ queryKey: ["trades", token], queryFn: () => get<Trade[]>(`/coins/${token}/trades?limit=60`), ...LIVE });
export const useTape = () => useQuery({ queryKey: ["tape"], queryFn: () => get<TapeTrade[]>("/trades?limit=40"), ...LIVE });
export const useCandles = (token: string, interval: number) =>
  useQuery({
    queryKey: ["candles", token, interval],
    queryFn: () => get<Candle[]>(`/coins/${token}/candles?interval=${interval}`),
    ...LIVE,
  });
export const usePortfolio = (address?: string) =>
  useQuery({
    queryKey: ["portfolio", address],
    queryFn: () => get<Portfolio>(`/portfolio/${address}`),
    enabled: !!address,
    ...LIVE,
  });
