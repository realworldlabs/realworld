"use client";

import { assetRegistryAbi, launchRouterAbi } from "@rwa/abi";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useDeferredValue, useState } from "react";
import { erc20Abi, formatUnits, parseUnits, type Address } from "viem";
import { useAccount, useConfig, useReadContract } from "wagmi";
import { getPublicClient, simulateContract } from "wagmi/actions";
import { AssetChart } from "@/components/AssetChart";
import { AssetIcon } from "@/components/AssetIcon";
import { CoinAvatar, Copy, CurveBar, Delta } from "@/components/bits";
import { useAsset, useCoins, type Asset } from "@/lib/api";
import { deployments, robinhood, TOKEN_DECIMALS, USDG_DECIMALS } from "@/lib/config";
import { formatAmount, formatPrice, formatUsd, timeAgo } from "@/lib/format";
import { useTx } from "@/lib/tx";

const WALL_SUPPLY = 1_000_000_000n * 10n ** 18n;

export default function AssetPage() {
  return (
    <Suspense fallback={<div className="shell page empty">Loading underlying…</div>}>
      <AssetView />
    </Suspense>
  );
}

function AssetView() {
  const id = useSearchParams().get("id") ?? "";
  const assetId = Number(id);
  const { data: asset } = useAsset(assetId);
  const { data: coins } = useCoins({ assetId: id, sort: "mcap", limit: "20" });

  const { data: cfg } = useReadContract({ address: deployments.assetRegistry, abi: assetRegistryAbi, functionName: "getConfig", args: [BigInt(assetId)] });
  const { data: stale } = useReadContract({
    address: deployments.assetRegistry,
    abi: assetRegistryAbi,
    functionName: "isStale",
    args: [BigInt(assetId)],
    query: { refetchInterval: 15_000 },
  });

  if (!asset) return <div className="shell page empty">Loading underlying…</div>;
  const explorer = robinhood.blockExplorers.default.url;

  // Circulating synth is everything not still on offer; coverage is how much of it the wall's USDG can buy back.
  const circulating = WALL_SUPPLY - BigInt(asset.wallSynth);
  const circulatingUsd = (Number(circulating) / 1e18) * asset.priceUsd;
  const backingUsd = Number(asset.pot) / 10 ** USDG_DECIMALS;
  const coverage = circulatingUsd > 0 ? Math.min(1, backingUsd / circulatingUsd) : 1;

  return (
    <div className="shell page">
      <div className="panel coin-head reveal">
        <div className="coin-ident">
          <AssetIcon symbol={asset.symbol} size={44} className="asset-icon-green" />
          <div style={{ minWidth: 0 }}>
            <div className="row" style={{ flexWrap: "wrap" }}>
              <span className="coin-title" style={{ textTransform: "none" }}>
                {asset.symbol}
              </span>
              <span className="chip chip-amber">{asset.category}</span>
              {asset.metadataUri.startsWith("sources:") && !asset.metadataUri.includes(",") && (
                <span className="chip" title="Priced from one publisher (eBay-derived sales data). The two-source rule does not apply to this asset.">
                  SINGLE SOURCE
                </span>
              )}
              {asset.paused ? <span className="chip chip-down">PAUSED</span> : stale ? <span className="chip chip-down">STALE</span> : <span className="chip chip-up">LIVE</span>}
            </div>
            <div className="row mono mute" style={{ fontSize: 11, marginTop: 4, flexWrap: "wrap" }}>
              <span className="dim">{asset.name}</span>
              <span>·</span>
              <Link href="/assets">all underlyings</Link>
              <Copy text={asset.token} />
            </div>
          </div>
        </div>
        <div className="coin-metrics">
          <div className="metric">
            <div className="eyebrow">Wall price</div>
            <div className="metric-v big">${formatPrice(asset.priceUsd)}</div>
            <div className="row mono" style={{ fontSize: 11, gap: 8 }}>
              <Delta value={asset.change24h} boxed />
              <span className="mute">updated {timeAgo(asset.lastUpdate)} ago</span>
            </div>
          </div>
          <Metric label="Backing · USDG" value={formatUsd(backingUsd)} sub="bidding in the wall" />
          <Metric label="Coverage" value={`${(coverage * 100).toFixed(1)}%`} sub={`of ${formatUsd(circulatingUsd, { compact: true })} in circulation`} down={coverage < 0.999} />
          <Metric label="Max move" value={cfg ? `±${(cfg.maxMoveTicks / 100).toFixed(0)}%` : "—"} sub={cfg ? `every ${Math.round(cfg.minUpdateInterval / 3600)}h+` : undefined} />
          <Metric label="Heartbeat" value={cfg ? `${Math.round(cfg.heartbeat / 3600)}h` : "—"} />
          <Metric label="Coins" value={String(asset.launches)} />
        </div>
      </div>

      {stale && (
        <div className="warn-bar" style={{ marginBottom: 12 }}>
          No keeper update within the heartbeat. New launches against this underlying are blocked until it updates; trading continues.
        </div>
      )}

      <div className="coin-layout">
        <div className="stack reveal" style={{ animationDelay: "60ms", minWidth: 0 }}>
          <div className="panel">
            <div className="panel-head">
              <span className="eyebrow">Wall price · USD</span>
              <span className="eyebrow">{Math.max(0, asset.history.length - 1)} keeper moves</span>
            </div>
            <AssetChart history={asset.history} current={asset.priceUsd} />
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="eyebrow">Keeper moves · audit trail</span>
              <span className="hint">each hash commits to the source readings behind the move</span>
            </div>
            <div className="list list-scroll">
              {asset.prices.map((p) => (
                <a key={p.id} className="list-row" style={{ gridTemplateColumns: "120px 90px 1fr 60px" }} href={p.txHash ? `${explorer}/tx/${p.txHash}` : undefined} target="_blank" rel="noreferrer">
                  <span className="amber">${formatPrice(p.priceUsd)}</span>
                  <span className="dim">tick {p.tick}</span>
                  <span className="mute">{p.sourcesHash.startsWith("0x000000") ? "opening price" : `${p.sourcesHash.slice(0, 22)}…`}</span>
                  <span className="right mute">{timeAgo(p.timestamp)}</span>
                </a>
              ))}
              {asset.prices.length === 0 && <div className="empty">Opening price only. No keeper moves yet.</div>}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="eyebrow">Coins priced in {asset.symbol}</span>
              <Link href="/launch" className="eyebrow amber">
                Launch one →
              </Link>
            </div>
            <div className="list">
              {(coins?.items ?? []).map((c) => (
                <Link key={c.token} href={`/coin?token=${c.token}`} className="list-row" style={{ gridTemplateColumns: "34px 1fr 100px 80px 90px" }}>
                  <CoinAvatar coin={c} size={24} />
                  <span>
                    <span style={{ color: "var(--fg, var(--ink))" }}>{c.symbol}</span> <span className="mute">{c.name}</span>
                  </span>
                  <span className="right">
                    <CurveBar progress={c.curveProgress} graduated={c.graduated} />
                  </span>
                  <span className="right">
                    <Delta value={c.change24h} />
                  </span>
                  <span className="right amber">{formatUsd(c.marketCapUsd, { compact: true })}</span>
                </Link>
              ))}
              {coins?.items.length === 0 && <div className="empty">No coins yet</div>}
            </div>
          </div>
        </div>

        <div className="ticket reveal" style={{ animationDelay: "120ms" }}>
          <WallTicket asset={asset} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, sub, down }: { label: string; value: React.ReactNode; sub?: React.ReactNode; down?: boolean }) {
  return (
    <div className="metric">
      <div className="eyebrow">{label}</div>
      <div className="metric-v" style={down ? { color: "var(--down)" } : undefined}>
        {value}
      </div>
      {sub !== undefined && (
        <div className="mono mute" style={{ fontSize: 11 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/** Buys the synth from its wall with USDG, or sells it back into the wall's USDG, through the router. */
function WallTicket({ asset }: { asset: Asset }) {
  const config = useConfig();
  const { address } = useAccount();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [slippageBps, setSlippageBps] = useState(100);
  const tx = useTx();

  const sellSynth = side === "sell";
  const inAsset: Address = sellSynth ? asset.token : deployments.usdg;
  const inDecimals = sellSynth ? TOKEN_DECIMALS : USDG_DECIMALS;
  const inSymbol = sellSynth ? asset.symbol : "USDG";
  const outDecimals = sellSynth ? USDG_DECIMALS : TOKEN_DECIMALS;
  const outSymbol = sellSynth ? "USDG" : asset.symbol;

  let amountIn = 0n;
  try {
    amountIn = amount ? parseUnits(amount, inDecimals) : 0n;
  } catch {}
  const deferred = useDeferredValue(amountIn);

  const { data: balance } = useReadContract({
    address: inAsset,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5_000 },
  });

  const quote = useQuery({
    queryKey: ["wallQuote", asset.token, side, deferred.toString()],
    enabled: deferred > 0n,
    retry: false,
    queryFn: async () => {
      const { result } = await getPublicClient(config)!.simulateContract({
        address: deployments.launchRouter,
        abi: launchRouterAbi,
        functionName: "quoteWall",
        args: [asset.token, sellSynth, deferred],
      });
      return result;
    },
  });

  const minOut = quote.data ? (quote.data * BigInt(10_000 - slippageBps)) / 10_000n : 0n;
  const insufficient = balance !== undefined && amountIn > balance;
  const backing = BigInt(asset.pot);
  // Selling more than the wall bids leaves the remainder unsold; warn before it happens.
  const wouldExceed = sellSynth && quote.data !== undefined && quote.data >= backing && backing > 0n;

  async function submit() {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
    await tx.run(
      sellSynth ? `Selling ${asset.symbol}` : `Buying ${asset.symbol}`,
      () =>
        simulateContract(config, {
          address: deployments.launchRouter,
          abi: launchRouterAbi,
          functionName: "swapWall",
          args: [asset.token, sellSynth, amountIn, minOut, address!, deadline],
        }),
      [{ token: inAsset, spender: deployments.launchRouter, amount: amountIn }],
    );
    setAmount("");
  }

  return (
    <aside className="panel">
      <div className="panel-head">
        <span className="eyebrow">Wall ticket</span>
        <span className="mono mute" style={{ fontSize: 10.5 }}>
          {asset.symbol} ⇄ USDG
        </span>
      </div>
      <div className="ticket-tabs">
        {(["buy", "sell"] as const).map((s) => (
          <button key={s} className="ticket-tab" data-side={s} data-active={side === s} onClick={() => setSide(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="panel-body stack">
        <p className="hint" style={{ margin: 0 }}>
          {sellSynth
            ? `Sells ${asset.symbol} into the USDG the wall holds, at the wall price less a one-tick spread. Any router can do the same.`
            : `Buys ${asset.symbol} from the wall at its price. What you pay stays in the wall as the bid you can sell back into.`}
        </p>
        <div className="field">
          <div className="between">
            <label htmlFor="wall-amount" className="label">
              Amount · {inSymbol}
            </label>
            <span className="hint mono">Bal {balance !== undefined ? formatAmount(balance, inDecimals, sellSynth ? 4 : 2) : "—"}</span>
          </div>
          <input id="wall-amount" className="input input-lg" inputMode="decimal" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} />
          <div className="quick">
            {[25, 50, 75, 100].map((p) => (
              <button key={p} disabled={balance === undefined} onClick={() => balance !== undefined && setAmount(formatUnits((balance * BigInt(p)) / 100n, inDecimals))}>
                {p === 100 ? "MAX" : `${p}%`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="ticket-row">
            <span>You receive (est.)</span>
            <strong>{quote.isFetching ? "…" : quote.data !== undefined ? `${formatAmount(quote.data, outDecimals, sellSynth ? 2 : 4)} ${outSymbol}` : "—"}</strong>
          </div>
          <div className="ticket-row">
            <span>Min. after slippage</span>
            <span className="v">{quote.data !== undefined ? formatAmount(minOut, outDecimals, sellSynth ? 2 : 4) : "—"}</span>
          </div>
          <div className="ticket-row">
            <span>Wall bid · USDG</span>
            <span className="v">{formatAmount(backing, USDG_DECIMALS, 0)}</span>
          </div>
          <div className="ticket-row">
            <span>Slippage</span>
            <span className="seg" style={{ padding: 1 }}>
              {[50, 100, 300].map((b) => (
                <button key={b} data-active={slippageBps === b} onClick={() => setSlippageBps(b)} style={{ padding: "2px 7px", fontSize: 10.5 }}>
                  {(b / 100).toFixed(b % 100 ? 1 : 0)}%
                </button>
              ))}
            </span>
          </div>
        </div>
        {wouldExceed && <div className="warn-bar">The wall only bids {formatAmount(backing, USDG_DECIMALS, 0)} USDG right now. Anything beyond that stays unsold in your wallet.</div>}
        {quote.isError && (
          <div className="status" data-kind="error" style={{ marginTop: 0 }}>
            No quote for this amount.
          </div>
        )}
        <button
          className={`btn btn-lg btn-block ${sellSynth ? "btn-down" : "btn-up"}`}
          disabled={!address || amountIn === 0n || insufficient || quote.data === undefined || tx.state.status === "pending"}
          onClick={submit}
        >
          {!address ? "Connect a wallet" : insufficient ? `Not enough ${inSymbol}` : tx.state.status === "pending" ? tx.state.label : `${sellSynth ? "Sell" : "Buy"} ${asset.symbol}`}
        </button>
        {tx.state.status === "error" && (
          <div className="status" data-kind="error" style={{ marginTop: 0 }}>
            {tx.state.message}
          </div>
        )}
        {tx.state.status === "success" && (
          <div className="status" data-kind="success" style={{ marginTop: 0 }}>
            Filled · {tx.state.hash.slice(0, 18)}…
          </div>
        )}
      </div>
    </aside>
  );
}
