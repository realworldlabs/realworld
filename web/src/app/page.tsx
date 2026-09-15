"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import { CoinAvatar, CurveBar, Delta, Skeleton, Sparkline, Stat, UnderlyingChip } from "@/components/bits";
import { useAssets, useCoins, useStats, useTape, type Coin } from "@/lib/api";
import { compactNumber, formatPrice, formatUsd, timeAgo } from "@/lib/format";

type SortKey = "marketCapUsd" | "createdAt" | "volume24h" | "curveProgress" | "change24h" | "holders" | "trades" | "priceUsd";
type Scope = "all" | "curve" | "graduated";

const COLUMNS: { key: SortKey; label: string; title?: string }[] = [
  { key: "priceUsd", label: "Price" },
  { key: "change24h", label: "24h" },
  { key: "marketCapUsd", label: "Mcap" },
  { key: "volume24h", label: "Vol 24h" },
  { key: "holders", label: "Holders" },
  { key: "trades", label: "Txns" },
  { key: "curveProgress", label: "Curve", title: "Share of the bonding curve sold" },
];

export default function BoardPage() {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("all");
  const [underlying, setUnderlying] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("marketCapUsd");
  const [dir, setDir] = useState<"desc" | "asc">("desc");

  const { data: stats } = useStats();
  const { data: assets } = useAssets();
  const { data: coins, isLoading } = useCoins({
    sort: "mcap",
    assetId: underlying,
    q: q || undefined,
    graduated: scope === "all" ? undefined : scope === "graduated" ? "true" : "false",
    limit: "100",
  });

  const rows = useMemo(() => {
    const items = [...(coins?.items ?? [])];
    const sign = dir === "desc" ? -1 : 1;
    items.sort((a, b) => {
      const av = a[sortKey] ?? Number.NEGATIVE_INFINITY;
      const bv = b[sortKey] ?? Number.NEGATIVE_INFINITY;
      return av === bv ? 0 : av < bv ? -sign : sign;
    });
    return items;
  }, [coins, sortKey, dir]);

  function sortBy(key: SortKey) {
    if (key === sortKey) setDir(dir === "desc" ? "asc" : "desc");
    else {
      setSortKey(key);
      setDir("desc");
    }
  }

  return (
    <div className="shell page">
      <section className="mast">
        <div className="mast-card reveal">
          <div className="seal">
            ON-CHAIN
            <br />
            PRICED
            <br />
            ASSETS
          </div>
          <div className="eyebrow">Robinhood Chain · Synthetic real-world assets</div>
          <h1 className="display mast-title" style={{ marginTop: 6 }}>
            Memecoins, priced <em>in the real world.</em>
          </h1>
          <p className="mast-copy">
            Every coin here trades against a synthetic real-world price: inflation, rates, house prices, a trading card, a skin.
            Fees are paid in it. Graduation locks liquidity against it.
          </p>
          <div className="row" style={{ marginTop: 14 }}>
            <Link href="/launch" className="btn btn-ink">
              Launch a coin
            </Link>
            <Link href="/docs" className="btn">
              How it works
            </Link>
          </div>
          <div className="sources">
            Priced from <b>BLS</b> · <b>FRED</b> · <b>NY Fed</b> · <b>Eurostat</b> · <b>Steam</b> · <b>Skinport</b> — two sources must agree before a wall moves
          </div>
        </div>
        <div className="stats reveal" style={{ animationDelay: "60ms" }}>
          <Stat label="Coins" value={stats ? stats.coins : <Skeleton />} sub={stats ? `${stats.graduated} graduated` : undefined} />
          <Stat label="Launches 24h" value={stats ? stats.launches24h : <Skeleton />} />
          <Stat label="Volume 24h" value={stats ? formatUsd(stats.volume24h, { compact: true }) : <Skeleton />} sub={stats ? `${formatUsd(stats.volumeUsd, { compact: true })} all time` : undefined} amber />
          <Stat label="Trades 24h" value={stats ? compactNumber(stats.trades24h) : <Skeleton />} />
          <Stat label="Underlyings" value={stats ? stats.assets : <Skeleton />} sub="macro · collectibles" />
        </div>
      </section>

      <div className="board-grid">
        <div className="reveal" style={{ animationDelay: "120ms", minWidth: 0 }}>
          <div className="toolbar">
            <div className="seg">
              {(
                [
                  ["all", "All"],
                  ["curve", "On curve"],
                  ["graduated", "Graduated"],
                ] as const
              ).map(([id, label]) => (
                <button key={id} data-active={scope === id} onClick={() => setScope(id)}>
                  {label}
                </button>
              ))}
            </div>
            <span style={{ width: 6 }} />
            <button className="filter" data-active={underlying === undefined} onClick={() => setUnderlying(undefined)}>
              All pairs
            </button>
            {(assets ?? []).map((a) => (
              <button key={a.assetId} className="filter" data-active={underlying === String(a.assetId)} onClick={() => setUnderlying(String(a.assetId))}>
                {a.symbol} <span className="count">{a.launches}</span>
              </button>
            ))}
            <button className="filter" data-active={underlying === "usdg"} onClick={() => setUnderlying("usdg")}>
              USDG
            </button>
            <input className="input" placeholder="Search name or ticker" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>#</th>
                  <th>Coin</th>
                  <th>Pair</th>
                  {COLUMNS.map((c, i) => (
                    <Fragment key={c.key}>
                      <th className="num" data-sortable="true" data-sorted={sortKey === c.key} onClick={() => sortBy(c.key)} title={c.title}>
                        {c.label}
                        {sortKey === c.key ? (dir === "desc" ? " ▾" : " ▴") : ""}
                      </th>
                      {i === 1 && <th className="num">24h chart</th>}
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c, i) => (
                  <CoinRow key={c.token} coin={c} index={i + 1} onOpen={() => router.push(`/coin?token=${c.token}`)} />
                ))}
              </tbody>
            </table>
            {!isLoading && rows.length === 0 && <div className="empty">No coins match. Be the first to list one.</div>}
            {isLoading && <div className="empty">Loading the board…</div>}
          </div>
        </div>

        <aside className="side reveal" style={{ animationDelay: "180ms" }}>
          <UnderlyingsPanel />
          <TapePanel />
        </aside>
      </div>
    </div>
  );
}

function CoinRow({ coin: c, index, onOpen }: { coin: Coin; index: number; onOpen: () => void }) {
  return (
    <tr onClick={onOpen}>
      <td className="mono mute">{index}</td>
      <td>
        <Link href={`/coin?token=${c.token}`} className="coin-cell" onClick={(e) => e.stopPropagation()}>
          <CoinAvatar coin={c} size={30} />
          <span style={{ minWidth: 0 }}>
            <div className="coin-sym">
              {c.symbol}
              {c.graduated && (
                <span className="chip chip-up" style={{ marginLeft: 8, height: 16, fontSize: 9.5 }}>
                  GRAD
                </span>
              )}
            </div>
            <div className="coin-name">
              {c.name} <span className="mute">· {timeAgo(c.createdAt)}</span>
            </div>
          </span>
        </Link>
      </td>
      <td>
        <UnderlyingChip asset={c.asset} />
      </td>
      <td className="num">${formatPrice(c.priceUsd)}</td>
      <td className="num">
        <Delta value={c.change24h} boxed />
      </td>
      <td className="num">
        <span style={{ display: "inline-block" }}>
          <Sparkline points={c.spark} width={80} height={24} />
        </span>
      </td>
      <td className="num amber">{formatUsd(c.marketCapUsd, { compact: true })}</td>
      <td className="num">{formatUsd(c.volume24h, { compact: true })}</td>
      <td className="num">{compactNumber(c.holders)}</td>
      <td className="num">{compactNumber(c.trades)}</td>
      <td className="num">
        <span className="row" style={{ justifyContent: "flex-end" }}>
          <CurveBar progress={c.curveProgress} graduated={c.graduated} />
          <span className={`mono ${c.graduated ? "up" : "dim"}`} style={{ fontSize: 11, width: 42, textAlign: "right" }}>
            {c.graduated ? "100%" : `${(c.curveProgress * 100).toFixed(1)}%`}
          </span>
        </span>
      </td>
    </tr>
  );
}

function UnderlyingsPanel() {
  const { data: assets } = useAssets();
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="eyebrow">Underlyings</span>
        <Link href="/assets" className="eyebrow amber">
          All →
        </Link>
      </div>
      <div className="list">
        {(assets ?? []).map((a) => (
          <Link key={a.assetId} href={`/asset?id=${a.assetId}`} className="list-row" style={{ gridTemplateColumns: "1fr 80px 64px" }}>
            <span>
              <span style={{ color: "var(--fg)" }}>{a.symbol}</span>
              <span className="mute" style={{ marginLeft: 8, fontSize: 10.5 }}>
                {a.category === "MACRO" ? "MACRO" : "COLLECT"}
              </span>
            </span>
            <span className="right amber">${formatPrice(a.priceUsd)}</span>
            <span className="right">
              <Delta value={a.change24h} />
            </span>
          </Link>
        ))}
        {!assets && <div className="empty">…</div>}
      </div>
    </div>
  );
}

function TapePanel() {
  const { data: tape } = useTape();
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="eyebrow">Tape</span>
        <span className="eyebrow">live</span>
      </div>
      <div className="list list-scroll">
        {(tape ?? []).map((t) => (
          <Link key={t.id} href={`/coin?token=${t.token}`} className="list-row" style={{ gridTemplateColumns: "34px 1fr 70px 34px" }}>
            <span className={t.side === "buy" ? "up" : "down"}>{t.side === "buy" ? "BUY" : "SELL"}</span>
            <span style={{ color: "var(--fg)" }}>${t.symbol}</span>
            <span className="right dim">{formatUsd(t.valueUsd)}</span>
            <span className="right mute">{timeAgo(t.timestamp)}</span>
          </Link>
        ))}
        {tape?.length === 0 && <div className="empty">No trades yet</div>}
      </div>
    </div>
  );
}
