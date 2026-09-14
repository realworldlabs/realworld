"use client";

import { assetRegistryAbi, priceWallAbi, redemptionVaultAbi } from "@rwa/abi";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { useAccount, useConfig, useReadContract } from "wagmi";
import { simulateContract } from "wagmi/actions";
import { CoinAvatar, CurveMeter } from "@/components/bits";
import { useAsset, useCoins } from "@/lib/api";
import { deployments, robinhood } from "@/lib/config";
import { formatAmount, formatPrice, formatUsd, timeAgo } from "@/lib/format";
import { useTx } from "@/lib/tx";

const ONE = 10n ** 18n;

export default function AssetPage() {
  const { id } = useParams<{ id: string }>();
  const assetId = Number(id);
  const { data: asset } = useAsset(assetId);
  const { data: coins } = useCoins({ assetId: id, sort: "mcap", limit: "20" });

  const { data: cfg } = useReadContract({
    address: deployments.assetRegistry,
    abi: assetRegistryAbi,
    functionName: "getConfig",
    args: [BigInt(assetId)],
  });
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

  return (
    <div className="shell page">
      <Link href="/assets" className="eyebrow">
        ← All underlyings
      </Link>
      <div className="coin-hero" style={{ marginTop: 14 }}>
        <div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="chip chip-amber">{asset.category}</span>
            {asset.paused && <span className="chip down">PAUSED</span>}
            {stale && <span className="chip down">STALE</span>}
          </div>
          <h1 className="display coin-title" style={{ textTransform: "none" }}>
            {asset.symbol}
          </h1>
          <div className="dim">{asset.name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="eyebrow">Wall price</div>
          <div className="mono amber" style={{ fontSize: 48 }}>
            ${formatPrice(asset.priceUsd)}
          </div>
          <div className="mono dim">updated {timeAgo(asset.lastUpdate)} ago</div>
        </div>
      </div>

      {stale && <div className="warn-bar" style={{ marginBottom: 20 }}>No keeper update within the heartbeat. New launches against this underlying are blocked until it updates; trading and redemptions continue.</div>}

      <div className="coin-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <div className="grid-cells">
            <div className="cell">
              <div className="eyebrow">Redemption ratio</div>
              <div className="cell-value" style={{ fontSize: 22, color: ratio !== undefined && ratio < 0.9995 ? "var(--down)" : undefined }}>
                {ratio === undefined ? "—" : `${(ratio * 100).toFixed(2)}%`}
              </div>
            </div>
            <div className="cell">
              <div className="eyebrow">Pot (vault + wall)</div>
              <div className="cell-value" style={{ fontSize: 22 }}>
                ${wall ? formatAmount(BigInt(asset.pot) + wall[1], 6, 0) : formatAmount(asset.pot, 6, 0)}
              </div>
            </div>
            <div className="cell">
              <div className="eyebrow">Max move / update</div>
              <div className="cell-value" style={{ fontSize: 22 }}>
                {cfg ? `±${(cfg.maxMoveTicks / 100).toFixed(0)}%` : "—"}
              </div>
            </div>
            <div className="cell">
              <div className="eyebrow">Heartbeat</div>
              <div className="cell-value" style={{ fontSize: 22 }}>
                {cfg ? `${Math.round(cfg.heartbeat / 3600)}h` : "—"}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="eyebrow">Keeper moves · audit trail</span>
              <span className="hint">each hash commits to the source readings behind the move</span>
            </div>
            <div className="tape-list">
              {asset.prices.map((p) => (
                <a key={p.id} className="tape-row" style={{ gridTemplateColumns: "140px 1fr 1fr 60px" }} href={`${explorer}/tx/${p.txHash}`} target="_blank" rel="noreferrer">
                  <span className="amber">${formatPrice(p.priceUsd)}</span>
                  <span className="dim">tick {p.tick}</span>
                  <span className="mute">{p.sourcesHash.slice(0, 18)}…</span>
                  <span className="mute" style={{ textAlign: "right" }}>
                    {timeAgo(p.timestamp)}
                  </span>
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
            <div className="tape-list">
              {(coins?.items ?? []).map((c) => (
                <Link key={c.token} href={`/coin/${c.token}`} className="tape-row" style={{ gridTemplateColumns: "44px 1fr 150px 110px" }}>
                  <CoinAvatar coin={c} size={30} />
                  <span>
                    <strong>{c.symbol}</strong> <span className="mute">{c.name}</span>
                  </span>
                  <CurveMeter progress={c.curveProgress} graduated={c.graduated} />
                  <span className="amber" style={{ textAlign: "right" }}>
                    {formatUsd(c.marketCapUsd, { compact: true })}
                  </span>
                </Link>
              ))}
              {coins?.items.length === 0 && <div className="empty">No coins yet</div>}
            </div>
          </div>
        </div>

        <RedeemTicket assetId={assetId} token={asset.token} symbol={asset.symbol} />
      </div>
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
    <aside className="ticket">
      <div className="ticket-head">
        <span className="display" style={{ fontSize: 28 }}>
          Redemption slip
        </span>
        <span className="mono" style={{ fontSize: 11 }}>
          {symbol} → USDG
        </span>
      </div>
      <p className="hint" style={{ marginTop: 0 }}>
        The vault buys {symbol} back at the wall price from this asset&apos;s own USDG pot, minus 0.3%. If the price has risen
        faster than the pot, every holder takes the same pro-rata haircut.
      </p>
      <div className="field">
        <label htmlFor="redeem">Amount · {symbol}</label>
        <input id="redeem" className="input" inputMode="decimal" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="hint">Balance: {balance !== undefined ? formatAmount(balance, 18) : "—"}</span>
          {balance !== undefined && balance > 0n && (
            <button className="hint" style={{ background: "none", border: 0, cursor: "pointer", textDecoration: "underline" }} onClick={() => setAmount(formatUnits(balance, 18))}>
              Max
            </button>
          )}
        </div>
      </div>
      <div style={{ margin: "16px 0" }}>
        <div className="ticket-row">
          <span>Gross</span>
          <span>{quote ? `${formatAmount(quote[0], 6)} USDG` : "—"}</span>
        </div>
        <div className="ticket-row">
          <span>Fee (0.3%)</span>
          <span>{quote ? formatAmount(quote[1], 6) : "—"}</span>
        </div>
        <div className="ticket-row">
          <span>Pot ratio</span>
          <span>{quote ? `${(Number(quote[3]) / 1e16).toFixed(2)}%` : "—"}</span>
        </div>
        <div className="ticket-row">
          <span>You receive</span>
          <strong>{quote ? `${formatAmount(quote[2], 6)} USDG` : "—"}</strong>
        </div>
      </div>
      <button
        className="btn btn-ink btn-block"
        style={{ height: 50 }}
        disabled={!address || raw === 0n || (balance !== undefined && raw > balance) || tx.state.status === "pending"}
        onClick={redeem}
      >
        {!address ? "Connect a wallet" : tx.state.status === "pending" ? tx.state.label : `Redeem ${symbol}`}
      </button>
      {tx.state.status === "error" && (
        <div className="status" data-kind="error">
          {tx.state.message}
        </div>
      )}
      {tx.state.status === "success" && (
        <div className="status" data-kind="success">
          Redeemed · {tx.state.hash.slice(0, 18)}…
        </div>
      )}
    </aside>
  );
}
