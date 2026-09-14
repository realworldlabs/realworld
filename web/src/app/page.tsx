"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CoinAvatar, CurveMeter, Flap, UnderlyingChip } from "@/components/bits";
import { useAssets, useCoins, useStats } from "@/lib/api";
import { compactNumber, formatUsd, formatPrice, timeAgo } from "@/lib/format";

const SORTS = [
  { id: "mcap", label: "Market cap" },
  { id: "new", label: "Newest" },
  { id: "volume", label: "Volume" },
  { id: "progress", label: "Near graduation" },
];

export default function BoardPage() {
  const router = useRouter();
  const [sort, setSort] = useState("mcap");
  const [underlying, setUnderlying] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const { data: stats } = useStats();
  const { data: assets } = useAssets();
  const { data: coins, isLoading } = useCoins({ sort, assetId: underlying, q: q || undefined, limit: "100" });

  return (
    <div className="shell page">
      <section className="hero">
        <div>
          <div className="eyebrow reveal">Robinhood Chain · Synthetic RWA pairs</div>
          <h1 className="display hero-title reveal" style={{ animationDelay: "80ms" }}>
            Every coin
            <br />
            has an <em>underlying.</em>
          </h1>
        </div>
        <div className="reveal" style={{ animationDelay: "180ms" }}>
          <p className="hero-copy">
            Launch a memecoin priced in house prices, inflation, interest rates, a PSA 10 Charizard or a Big Mac. You trade it in
            that asset, the creator is paid in it, and it graduates into locked liquidity against it.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <Link href="/launch" className="btn btn-amber">
              Launch a coin
            </Link>
            <Link href="/assets" className="btn">
              See underlyings
            </Link>
          </div>
        </div>
      </section>

      <section className="grid-cells reveal" style={{ animationDelay: "260ms" }}>
        <Stat label="Coins listed" value={stats ? String(stats.coins) : "—"} />
        <Stat label="Graduated" value={stats ? String(stats.graduated) : "—"} />
        <Stat label="Volume" value={stats ? formatUsd(stats.volumeUsd, { compact: true }) : "—"} />
        <Stat label="Underlyings" value={stats ? String(stats.assets) : "—"} />
      </section>

      <div className="filters">
        {SORTS.map((s) => (
          <button key={s.id} className="filter" data-active={sort === s.id} onClick={() => setSort(s.id)}>
            {s.label}
          </button>
        ))}
        <span style={{ width: 16 }} />
        <button className="filter" data-active={underlying === undefined} onClick={() => setUnderlying(undefined)}>
          All pairs
        </button>
        {(assets ?? []).map((a) => (
          <button
            key={a.assetId}
            className="filter"
            data-active={underlying === String(a.assetId)}
            onClick={() => setUnderlying(String(a.assetId))}
          >
            {a.symbol} · {a.launches}
          </button>
        ))}
        <button className="filter" data-active={underlying === "usdg"} onClick={() => setUnderlying("usdg")}>
          USDG
        </button>
        <input
          className="input"
          placeholder="Search name or ticker"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: 220, marginLeft: "auto", height: 36, padding: "6px 10px" }}
        />
      </div>

      <div className="panel board-wrap">
        <table className="board">
          <thead>
            <tr>
              <th>#</th>
              <th>Coin</th>
              <th>Underlying</th>
              <th className="num">Price</th>
              <th className="num">Market cap</th>
              <th>Curve</th>
              <th className="num">Volume</th>
              <th className="num">Holders</th>
              <th className="num">Age</th>
            </tr>
          </thead>
          <tbody>
            {(coins?.items ?? []).map((c, i) => (
              <tr key={c.token} onClick={() => router.push(`/coin/${c.token}`)}>
                <td className="mono mute">{String(i + 1).padStart(2, "0")}</td>
                <td>
                  <Link href={`/coin/${c.token}`} className="coin-cell" onClick={(e) => e.stopPropagation()}>
                    <CoinAvatar coin={c} />
                    <span>
                      <div className="coin-sym">{c.symbol}</div>
                      <div className="coin-name">{c.name}</div>
                    </span>
                  </Link>
                </td>
                <td>
                  <UnderlyingChip asset={c.asset} />
                </td>
                <td className="num">${formatPrice(c.priceUsd)}</td>
                <td className="num amber">{formatUsd(c.marketCapUsd, { compact: true })}</td>
                <td>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <CurveMeter progress={c.curveProgress} graduated={c.graduated} />
                    <span className={`mono ${c.graduated ? "up" : "dim"}`} style={{ fontSize: 12 }}>
                      {c.graduated ? "GRAD" : `${(c.curveProgress * 100).toFixed(1)}%`}
                    </span>
                  </span>
                </td>
                <td className="num">{formatUsd(c.volumeUsd, { compact: true })}</td>
                <td className="num">{compactNumber(c.holders)}</td>
                <td className="num mute">{timeAgo(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && (coins?.items.length ?? 0) === 0 && <div className="empty">No coins on this board yet.</div>}
        {isLoading && <div className="empty">Loading the board…</div>}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="cell">
      <div className="eyebrow">{label}</div>
      <div className="cell-value" style={{ fontSize: 24 }}>
        <Flap text={value} />
      </div>
    </div>
  );
}
