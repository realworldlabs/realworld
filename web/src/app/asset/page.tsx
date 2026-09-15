"use client";

import { assetRegistryAbi, priceWallAbi, redemptionVaultAbi } from "@rwa/abi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { useAccount, useConfig, useReadContract } from "wagmi";
import { simulateContract } from "wagmi/actions";
import { AssetChart } from "@/components/AssetChart";
import { CoinAvatar, Copy, CurveBar, Delta } from "@/components/bits";
import { useAsset, useCoins } from "@/lib/api";
import { deployments, robinhood } from "@/lib/config";
import { formatAmount, formatPrice, formatUsd, timeAgo } from "@/lib/format";
import { useTx } from "@/lib/tx";

const ONE = 10n ** 18n;

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
  const { data: wall } = useReadContract({
    address: deployments.priceWall,
    abi: priceWallAbi,
    functionName: "wallBalances",
    args: [BigInt(assetId)],
    query: { refetchInterval: 10_000 },
  });
  const { data: unitQuote } = useReadContract({
    address: deployments.redemptionVault,
    abi: redemptionVaultAbi,
    functionName: "quoteRedeem",
    args: [BigInt(assetId), ONE],
    query: { refetchInterval: 10_000 },
  });

  if (!asset) return <div className="shell page empty">Loading underlying…</div>;
  const ratio = unitQuote ? Number(unitQuote[3]) / 1e18 : undefined;
  const explorer = robinhood.blockExplorers.default.url;
  const potUsdg = wall ? BigInt(asset.pot) + wall[1] : BigInt(asset.pot);

  return (
    <div className="shell page">
      <div className="panel coin-head reveal">
        <div className="coin-ident">
          <span className="avatar" style={{ width: 44, height: 44, fontSize: 14, background: "var(--bg-4)", color: "var(--amber)" }}>
            {asset.symbol.slice(1, 4)}
          </span>
          <div style={{ minWidth: 0 }}>
            <div className="row" style={{ flexWrap: "wrap" }}>
              <span className="coin-title" style={{ textTransform: "none" }}>
                {asset.symbol}
              </span>
              <span className="chip chip-amber">{asset.category}</span>
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
          <Metric label="Redemption ratio" value={ratio === undefined ? "—" : `${(ratio * 100).toFixed(2)}%`} down={ratio !== undefined && ratio < 0.9995} />
          <Metric label="Pot · USDG" value={`$${formatAmount(potUsdg, 6, 0)}`} sub="vault + wall" />
          <Metric label="Max move" value={cfg ? `±${(cfg.maxMoveTicks / 100).toFixed(0)}%` : "—"} sub={cfg ? `every ${Math.round(cfg.minUpdateInterval / 3600)}h+` : undefined} />
          <Metric label="Heartbeat" value={cfg ? `${Math.round(cfg.heartbeat / 3600)}h` : "—"} />
          <Metric label="Coins" value={String(asset.launches)} />
        </div>
      </div>

      {stale && (
        <div className="warn-bar" style={{ marginBottom: 12 }}>
          No keeper update within the heartbeat. New launches against this underlying are blocked until it updates; trading and redemptions continue.
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
                    <span style={{ color: "var(--fg)" }}>{c.symbol}</span> <span className="mute">{c.name}</span>
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
          <RedeemTicket assetId={assetId} token={asset.token} symbol={asset.symbol} />
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

function RedeemTicket({ assetId, token, symbol }: { assetId: number; token: `0x${string}`; symbol: string }) {
  const config = useConfig();
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const tx = useTx();
  let raw = 0n;
  try {
    raw = amount ? parseUnits(amount, 18) : 0n;
  } catch {}

  const { data: balance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5_000 },
  });
  const { data: quote } = useReadContract({
    address: deployments.redemptionVault,
    abi: redemptionVaultAbi,
    functionName: "quoteRedeem",
    args: [BigInt(assetId), raw],
    query: { enabled: raw > 0n },
  });

  async function redeem() {
    const minOut = quote ? (quote[2] * 99n) / 100n : 0n;
    await tx.run(
      `Redeeming ${symbol}`,
      () =>
        simulateContract(config, {
          address: deployments.redemptionVault,
          abi: redemptionVaultAbi,
          functionName: "redeem",
          args: [BigInt(assetId), raw, minOut, address!],
        }),
      [{ token, spender: deployments.redemptionVault, amount: raw }],
    );
    setAmount("");
  }

  return (
    <aside className="panel">
      <div className="panel-head">
        <span className="eyebrow">Redemption slip</span>
        <span className="mono mute" style={{ fontSize: 10.5 }}>
          {symbol} → USDG
        </span>
      </div>
      <div className="panel-body stack">
        <p className="hint" style={{ margin: 0 }}>
          The vault buys {symbol} back at the wall price from this asset&apos;s own USDG pot, minus 0.3%. If the price has risen faster than
          the pot, every holder takes the same pro-rata haircut.
        </p>
        <div className="field">
          <div className="between">
            <label htmlFor="redeem" className="label">
              Amount · {symbol}
            </label>
            <span className="hint mono">Bal {balance !== undefined ? formatAmount(balance, 18) : "—"}</span>
          </div>
          <input id="redeem" className="input input-lg" inputMode="decimal" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} />
          <div className="quick">
            {[25, 50, 75, 100].map((p) => (
              <button key={p} disabled={balance === undefined} onClick={() => balance !== undefined && setAmount(formatUnits((balance * BigInt(p)) / 100n, 18))}>
                {p === 100 ? "MAX" : `${p}%`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="ticket-row">
            <span>Gross</span>
            <span className="v">{quote ? `${formatAmount(quote[0], 6)} USDG` : "—"}</span>
          </div>
          <div className="ticket-row">
            <span>Fee (0.3%)</span>
            <span className="v">{quote ? formatAmount(quote[1], 6) : "—"}</span>
          </div>
          <div className="ticket-row">
            <span>Pot ratio</span>
            <span className="v">{quote ? `${(Number(quote[3]) / 1e16).toFixed(2)}%` : "—"}</span>
          </div>
          <div className="ticket-row">
            <span>You receive</span>
            <strong>{quote ? `${formatAmount(quote[2], 6)} USDG` : "—"}</strong>
          </div>
        </div>
        <button
          className="btn btn-lg btn-block btn-amber"
          disabled={!address || raw === 0n || (balance !== undefined && raw > balance) || tx.state.status === "pending"}
          onClick={redeem}
        >
          {!address ? "Connect a wallet" : tx.state.status === "pending" ? tx.state.label : `Redeem ${symbol}`}
        </button>
        {tx.state.status === "error" && (
          <div className="status" data-kind="error" style={{ marginTop: 0 }}>
            {tx.state.message}
          </div>
        )}
        {tx.state.status === "success" && (
          <div className="status" data-kind="success" style={{ marginTop: 0 }}>
            Redeemed · {tx.state.hash.slice(0, 18)}…
          </div>
        )}
      </div>
    </aside>
  );
}
