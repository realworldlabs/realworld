"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CoinAvatar, Copy, Delta, Kv, UnderlyingChip } from "@/components/bits";
import { CoinChart } from "@/components/CoinChart";
import { TradeTicket } from "@/components/TradeTicket";
import { useCoin, useTrades } from "@/lib/api";
import { robinhood, SUPPLY } from "@/lib/config";
import { bpsToPercent, compactNumber, formatAmount, formatPrice, formatUsd, shortAddress, timeAgo } from "@/lib/format";

const GRAD_MCAP = 48_700;

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
  const [tab, setTab] = useState<"trades" | "holders" | "terms" | "about">("trades");

  if (isLoading) return <div className="shell page empty">Loading coin…</div>;
  if (error || !coin) return <div className="shell page empty">Coin not found on this board.</div>;

  const explorer = robinhood.blockExplorers.default.url;
  const progressPct = coin.graduated ? 100 : coin.curveProgress * 100;
  const pairSymbol = coin.asset?.symbol ?? "USDG";

  return (
    <div className="shell page">
      <div className="panel coin-head reveal">
        <div className="coin-ident">
          <CoinAvatar coin={coin} size={44} />
          <div style={{ minWidth: 0 }}>
            <div className="row" style={{ flexWrap: "wrap" }}>
              <span className="coin-title">${coin.symbol}</span>
              <UnderlyingChip asset={coin.asset} />
              {coin.graduated ? <span className="chip chip-up">GRADUATED</span> : <span className="chip">ON CURVE</span>}
            </div>
            <div className="row mono mute" style={{ fontSize: 11, marginTop: 4, flexWrap: "wrap" }}>
              <span className="dim truncate" style={{ maxWidth: 220 }}>
                {coin.name}
              </span>
              <span>·</span>
              <span>launched {timeAgo(coin.createdAt)} ago</span>
              <span>·</span>
              <a href={`${explorer}/address/${coin.creator}`} target="_blank" rel="noreferrer">
                by {shortAddress(coin.creator)}
              </a>
              <Copy text={coin.token} />
            </div>
          </div>
        </div>
        <div className="coin-metrics">
          <div className="metric">
            <div className="eyebrow">Price</div>
            <div className="metric-v big">${formatPrice(coin.priceUsd)}</div>
            <div className="row mono" style={{ fontSize: 11, gap: 8 }}>
              <Delta value={coin.change24h} boxed />
              <span className="mute">
                {formatPrice(coin.priceInPair)} {pairSymbol}
              </span>
            </div>
          </div>
          <Metric label="Market cap" value={formatUsd(coin.marketCapUsd, { compact: true })} />
          <Metric label="Vol 24h" value={formatUsd(coin.volume24h, { compact: true })} sub={`${formatUsd(coin.volumeUsd, { compact: true })} total`} />
          <Metric label="Holders" value={compactNumber(coin.holders)} />
          <Metric label="Txns" value={compactNumber(coin.trades)} />
          {coin.asset && (
            <Metric
              label={`${coin.asset.symbol} price`}
              value={
                <Link href={`/asset?id=${coin.asset.assetId}`} className="amber">
                  ${formatPrice(coin.asset.priceUsd)}
                </Link>
              }
              sub={<Delta value={coin.asset.change24h} />}
            />
          )}
        </div>
      </div>

      <div className="coin-layout">
        <div className="stack reveal" style={{ animationDelay: "60ms", minWidth: 0 }}>
          <CoinChart token={coin.token} />

          <div className="panel">
            <div className="tabs">
              {(
                [
                  ["trades", `Trades · ${trades?.length ?? 0}`],
                  ["holders", `Holders · ${compactNumber(coin.holders)}`],
                  ["terms", "Terms"],
                  ["about", "About"],
                ] as const
              ).map(([id, label]) => (
                <button key={id} className="tab" data-active={tab === id} onClick={() => setTab(id)}>
                  {label}
                </button>
              ))}
            </div>

            {tab === "trades" && (
              <div className="list list-scroll">
                <div className="list-row mute" style={{ gridTemplateColumns: "44px 1fr 1fr 1fr 110px 60px", height: 28, fontSize: 10.5, letterSpacing: "0.1em" }}>
                  <span>SIDE</span>
                  <span className="right">{coin.symbol}</span>
                  <span className="right">VALUE</span>
                  <span className="right">PRICE</span>
                  <span className="right">TRADER</span>
                  <span className="right">AGE</span>
                </div>
                {(trades ?? []).map((t) => (
                  <a key={t.id} className="list-row" style={{ gridTemplateColumns: "44px 1fr 1fr 1fr 110px 60px" }} href={`${explorer}/tx/${t.txHash}`} target="_blank" rel="noreferrer">
                    <span className={t.side === "buy" ? "up" : "down"}>{t.side.toUpperCase()}</span>
                    <span className="right">{formatAmount(t.tokenAmount, 18, 0)}</span>
                    <span className="right" style={{ color: "var(--fg)" }}>
                      {formatUsd(t.valueUsd)}
                    </span>
                    <span className="right dim">${formatPrice(t.priceUsd)}</span>
                    <span className="right dim">{shortAddress(t.trader)}</span>
                    <span className="right mute">{timeAgo(t.timestamp)}</span>
                  </a>
                ))}
                {trades?.length === 0 && <div className="empty">No trades yet</div>}
              </div>
            )}

            {tab === "holders" && (
              <div className="list list-scroll">
                {coin.topHolders.map((h, i) => {
                  const pct = (Number(BigInt(h.balance) / 10n ** 14n) / 1e4 / SUPPLY) * 100;
                  return (
                    <a key={h.account} className="list-row" style={{ gridTemplateColumns: "28px 1fr 120px 80px" }} href={`${explorer}/address/${h.account}`} target="_blank" rel="noreferrer">
                      <span className="mute">{i + 1}</span>
                      <span>{shortAddress(h.account)}</span>
                      <span className="right dim">{formatAmount(h.balance, 18, 0)}</span>
                      <span className="right amber">{pct.toFixed(2)}%</span>
                    </a>
                  );
                })}
                {coin.topHolders.length === 0 && <div className="empty">No holders yet</div>}
              </div>
            )}

            {tab === "terms" && (
              <div>
                <Kv k="Underlying" v={coin.asset ? `${coin.asset.symbol} · ${coin.asset.name}` : "USDG"} />
                <Kv k="Trade fee" v={`1% base${coin.creatorTaxBps ? ` + ${bpsToPercent(coin.creatorTaxBps)} creator tax` : ""}`} />
                <Kv k="Buyback" v={coin.buybackEnabled ? `${bpsToPercent(coin.buybackBps)} of creator fees, vests 12 months` : "Off"} />
                <Kv k="Supply" v="1,000,000,000 fixed" />
                <Kv k="Graduation" v={`~${formatUsd(GRAD_MCAP, { compact: true })} market cap → locked full-range pool`} />
                <Kv k="Creator" v={<a href={`${explorer}/address/${coin.creator}`}>{coin.creator}</a>} />
                <Kv k="Fee recipient" v={<a href={`${explorer}/address/${coin.feeRecipient}`}>{coin.feeRecipient}</a>} />
                <Kv k="Contract" v={<a href={`${explorer}/address/${coin.token}`}>{coin.token}</a>} />
                <Kv k="Pool id" v={coin.poolId} />
                {coin.buybacks.length > 0 && <Kv k="Buybacks" v={`${coin.buybacks.length} executed`} />}
              </div>
            )}

            {tab === "about" && (
              <div className="panel-body dim" style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {coin.description || <span className="mute">No description.</span>}
              </div>
            )}
          </div>
        </div>

        <div className="ticket stack reveal" style={{ animationDelay: "120ms" }}>
          <div className="panel">
            <div className="panel-head">
              <span className="eyebrow">Bonding curve</span>
              <span className={`mono ${coin.graduated ? "up" : "amber"}`} style={{ fontSize: 12 }}>
                {coin.graduated ? "GRADUATED" : `${progressPct.toFixed(1)}%`}
              </span>
            </div>
            <div className="panel-body">
              <div className="gauge" data-grad={coin.graduated}>
                <div className="gauge-fill" style={{ width: `${Math.max(progressPct, 1)}%` }} />
              </div>
              <div className="between mono mute" style={{ fontSize: 10.5, marginTop: 8 }}>
                <span>{formatUsd(coin.marketCapUsd, { compact: true })} now</span>
                <span>graduates ~{formatUsd(GRAD_MCAP, { compact: true })}</span>
              </div>
            </div>
          </div>
          <TradeTicket coin={coin} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="metric">
      <div className="eyebrow">{label}</div>
      <div className="metric-v">{value}</div>
      {sub !== undefined && (
        <div className="mono mute" style={{ fontSize: 11 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
