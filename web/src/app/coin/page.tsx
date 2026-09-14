"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CoinAvatar, UnderlyingChip } from "@/components/bits";
import { CoinChart } from "@/components/CoinChart";
import { TradeTicket } from "@/components/TradeTicket";
import { useCoin, useTrades } from "@/lib/api";
import { robinhood, SUPPLY } from "@/lib/config";
import { bpsToPercent, compactNumber, formatAmount, formatPrice, formatUsd, shortAddress, timeAgo } from "@/lib/format";

export default function CoinPage() {
  return (
    <Suspense fallback={<div className="shell page empty">Loading coin…</div>}>
      <CoinView />
    </Suspense>
  );
}

function CoinView() {
  const token = useSearchParams().get("token") ?? "";
  const { data: coin, isLoading, error } = useCoin(token);
  const { data: trades } = useTrades(token);

  if (isLoading) return <div className="shell page empty">Loading coin…</div>;
  if (error || !coin) return <div className="shell page empty">Coin not found on this board.</div>;

  const explorer = robinhood.blockExplorers.default.url;
  const progressPct = coin.graduated ? 100 : coin.curveProgress * 100;

  return (
    <div className="shell page">
      <div className="coin-hero">
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
          <CoinAvatar coin={coin} size={88} />
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <UnderlyingChip asset={coin.asset} />
              {coin.graduated ? <span className="chip chip-up">GRADUATED</span> : <span className="chip">ON CURVE</span>}
              <span className="eyebrow">launched {timeAgo(coin.createdAt)} ago</span>
            </div>
            <h1 className="display coin-title">${coin.symbol}</h1>
            <div className="dim">{coin.name}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="eyebrow">Price</div>
          <div className="mono amber" style={{ fontSize: 40 }}>
            ${formatPrice(coin.priceUsd)}
          </div>
          <div className="mono dim">
            {formatPrice(coin.priceInPair)} {coin.asset?.symbol ?? "USDG"} · mcap {formatUsd(coin.marketCapUsd, { compact: true })}
          </div>
        </div>
      </div>

      <div className="coin-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <div className="panel" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span className="eyebrow">Bonding curve</span>
              <span className="mono dim" style={{ fontSize: 12 }}>
                graduates at ~$48.7K market cap into permanently locked liquidity
              </span>
            </div>
            <div className="gauge" data-grad={coin.graduated}>
              <div className="gauge-fill" style={{ width: `${Math.max(progressPct, 1.5)}%` }} />
              <div className="gauge-label">
                <span>{coin.graduated ? "GRADUATED" : `${progressPct.toFixed(1)}% SOLD`}</span>
                <span>{coin.asset ? `PAIRED WITH ${coin.asset.symbol}` : "PAIRED WITH USDG"}</span>
              </div>
            </div>
          </div>

          <CoinChart token={coin.token} />

          <div className="grid-cells" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            <Cell label="Market cap" value={formatUsd(coin.marketCapUsd, { compact: true })} />
            <Cell label="Volume" value={formatUsd(coin.volumeUsd, { compact: true })} />
            <Cell label="Holders" value={compactNumber(coin.holders)} />
            <Cell label="Trades" value={compactNumber(coin.trades)} />
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="eyebrow">Tape</span>
              <span className="eyebrow">{trades?.length ?? 0} latest</span>
            </div>
            <div className="tape-list">
              {(trades ?? []).map((t) => (
                <a key={t.id} className="tape-row" href={`${explorer}/tx/${t.txHash}`} target="_blank" rel="noreferrer">
                  <span className={t.side === "buy" ? "up" : "down"}>{t.side.toUpperCase()}</span>
                  <span>{formatAmount(t.tokenAmount, 18, 0)}</span>
                  <span className="dim">{formatUsd(t.valueUsd)}</span>
                  <span className="dim">{shortAddress(t.trader)}</span>
                  <span className="mute" style={{ textAlign: "right" }}>
                    {timeAgo(t.timestamp)}
                  </span>
                </a>
              ))}
              {trades?.length === 0 && <div className="empty">No trades yet</div>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <span className="eyebrow">Top holders</span>
              </div>
              <div className="tape-list">
                {coin.topHolders.map((h, i) => (
                  <div key={h.account} className="tape-row" style={{ gridTemplateColumns: "28px 1fr 90px" }}>
                    <span className="mute">{i + 1}</span>
                    <span>{shortAddress(h.account)}</span>
                    <span className="amber" style={{ textAlign: "right" }}>
                      {((Number(BigInt(h.balance) / 10n ** 14n) / 1e4 / SUPPLY) * 100).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-head">
                <span className="eyebrow">Terms (fixed at launch)</span>
              </div>
              <div className="tape-list">
                <Term k="Underlying" v={coin.asset ? `${coin.asset.symbol} · ${coin.asset.name}` : "USDG"} />
                <Term k="Trade fee" v={`1% base${coin.creatorTaxBps ? ` + ${bpsToPercent(coin.creatorTaxBps)} creator tax` : ""}`} />
                <Term k="Buyback" v={coin.buybackEnabled ? `${bpsToPercent(coin.buybackBps)} of creator fees` : "Off"} />
                <Term k="Supply" v="1,000,000,000 fixed" />
                <Term k="Creator" v={<a href={`${explorer}/address/${coin.creator}`}>{shortAddress(coin.creator)}</a>} />
                <Term k="Contract" v={<a href={`${explorer}/address/${coin.token}`}>{shortAddress(coin.token)}</a>} />
                {coin.asset && (
                  <Term k="Underlying price" v={<Link href={`/asset?id=${coin.asset.assetId}`}>${formatPrice(coin.asset.priceUsd)} →</Link>} />
                )}
              </div>
            </div>
          </div>

          {coin.description && (
            <div className="panel" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                About
              </div>
              <p className="dim" style={{ margin: 0, lineHeight: 1.6 }}>
                {coin.description}
              </p>
            </div>
          )}
        </div>

        <TradeTicket coin={coin} />
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="cell">
      <div className="eyebrow">{label}</div>
      <div className="cell-value" style={{ fontSize: 22 }}>
        {value}
      </div>
    </div>
  );
}

function Term({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="tape-row" style={{ gridTemplateColumns: "130px 1fr" }}>
      <span className="mute">{k}</span>
      <span style={{ textAlign: "right" }}>{v}</span>
    </div>
  );
}
