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
  pot: string;
  launches: number;
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
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${INDEXER_URL}${path}`);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

const LIVE = { refetchInterval: 5_000 } as const;

export const useStats = () => useQuery({ queryKey: ["stats"], queryFn: () => get<Stats>("/stats"), ...LIVE });
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
  useQuery({ queryKey: ["trades", token], queryFn: () => get<Trade[]>(`/coins/${token}/trades?limit=40`), ...LIVE });
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
