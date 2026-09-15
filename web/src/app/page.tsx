"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CoinArt, CurveBar, Delta, Skeleton } from "@/components/bits";
import { useAssets, useCoins, useStats, type Coin } from "@/lib/api";
import { compactNumber, formatPrice, formatUsd, shortAddress, timeAgo } from "@/lib/format";

const SORTS = [
  { id: "trades", label: "Recent buys" },
  { id: "new", label: "Newest" },
  { id: "old", label: "Oldest" },
  { id: "mcap", label: "Market cap" },
  { id: "volume", label: "Volume" },
] as const;

const WINDOWS = [
  { id: 0, label: "All" },
  { id: 86_400, label: "24h" },
  { id: 7 * 86_400, label: "7d" },
] as const;

export default function ExplorePage() {
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("trades");
  const [range, setRange] = useState<number>(0);
  const [underlying, setUnderlying] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: stats } = useStats();
  const { data: assets } = useAssets();
  const { data: live, isLoading } = useCoins({ sort: sort === "old" ? "new" : sort, assetId: underlying, q: q || undefined, graduated: "false", limit: "100" });
  const { data: graduated } = useCoins({ sort: "mcap", assetId: underlying, q: q || undefined, graduated: "true", limit: "30" });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, []);

  const items = useMemo(() => {
    let list = [...(live?.items ?? [])];
    if (range > 0) {
      const cutoff = Date.now() / 1000 - range;
      list = list.filter((c) => c.createdAt >= cutoff);
    }
    if (sort === "old") list.reverse();
    return list;
  }, [live, range, sort]);

  return (
    <div className="shell page">
      <div className="topbar">
        <div className="search">
          <span className="search-icon">⌕</span>
          <input ref={searchRef} className="input" placeholder="Search coins by name or ticker" value={q} onChange={(e) => setQ(e.target.value)} />
          <span className="search-kbd">⌘K</span>
        </div>
        <div className="row mono mute" style={{ fontSize: 11, gap: 14 }}>
          <span>
            <b style={{ color: "var(--ink)" }}>{stats ? compactNumber(stats.coins) : <Skeleton width={24} />}</b> launched
          </span>
          <span>
            <b style={{ color: "var(--ink)" }}>{stats ? formatUsd(stats.volume24h, { compact: true }) : <Skeleton width={40} />}</b> vol 24h
          </span>
          <span>
            <b style={{ color: "var(--ink)" }}>{stats ? stats.launches24h : <Skeleton width={16} />}</b> new today
          </span>
        </div>
        <Link href="/launch" className="btn btn-ink" style={{ height: 40 }}>
          Create a coin
        </Link>
      </div>

      <div className="pairs">
        <button className="pair-chip" data-active={underlying === undefined} onClick={() => setUnderlying(undefined)}>
          <span className="sym">All underlyings</span>
          <span className="mute">{stats?.assets ?? "—"}</span>
        </button>
        {(assets ?? []).map((a) => (
          <button key={a.assetId} className="pair-chip" data-active={underlying === String(a.assetId)} onClick={() => setUnderlying(underlying === String(a.assetId) ? undefined : String(a.assetId))} title={a.name}>
            <span className="sym">{a.symbol}</span>
            <span className="amber">${formatPrice(a.priceUsd)}</span>
            <Delta value={a.change24h} />
            <span className="mute">{a.launches} coins</span>
          </button>
        ))}
        <button className="pair-chip" data-active={underlying === "usdg"} onClick={() => setUnderlying(underlying === "usdg" ? undefined : "usdg")}>
          <span className="sym">USDG</span>
          <span className="amber">$1.00</span>
          <span className="mute">plain dollars</span>
        </button>
      </div>

      {(graduated?.items.length ?? 0) > 0 && (
        <section>
          <div className="section-title">
            <div>
              <h2>
                Graduated <span className="count">{graduated!.items.length}</span>
              </h2>
              <p>Coins that sold out their curve. Liquidity is locked against the underlying for good.</p>
            </div>
            <span className="chip chip-gold">LOCKED LIQUIDITY</span>
          </div>
          <div className="shelf">
            {graduated!.items.map((c) => (
              <CoinCard key={c.token} coin={c} shelf />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="section-title">
          <div>
            <h2>
              Explore <span className="count">{stats ? `${compactNumber(stats.coins)} LAUNCHED` : ""}</span>
            </h2>
            <p>Coins still climbing toward graduation, each priced in a real-world asset.</p>
          </div>
          <div className="section-tools">
            <div className="seg">
              {SORTS.map((s) => (
                <button key={s.id} data-active={sort === s.id} onClick={() => setSort(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="seg">
              {WINDOWS.map((w) => (
                <button key={w.id} data-active={range === w.id} onClick={() => setRange(w.id)}>
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="cards">
          {items.map((c, i) => (
            <CoinCard key={c.token} coin={c} index={i} />
          ))}
        </div>
        {!isLoading && items.length === 0 && (
          <div className="panel empty">
            Nothing here yet.{" "}
            <Link href="/launch" className="amber">
              Be the first to list a coin →
            </Link>
          </div>
        )}
        {isLoading && <div className="empty">Loading…</div>}
      </section>
    </div>
  );
}

function CoinCard({ coin: c, index = 0, shelf = false }: { coin: Coin; index?: number; shelf?: boolean }) {
  const pct = c.graduated ? 100 : c.curveProgress * 100;
  return (
    <Link href={`/coin?token=${c.token}`} className="card reveal" style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}>
      <div className="card-img">
        <CoinArt coin={c} />
        <div className="card-badges">
          <span className="chip chip-amber">{c.asset ? c.asset.symbol : "USDG"}</span>
          {c.creatorTaxBps > 0 && <span className="chip">TAX {(c.creatorTaxBps / 100).toFixed(2).replace(/\.?0+$/, "")}%</span>}
        </div>
        {c.graduated && <span className="grad-ribbon">GRADUATED</span>}
      </div>
      <div className="card-body">
        <div>
          <div className="card-name" title={c.name}>
            {c.name}
          </div>
          <div className="card-sym">${c.symbol}</div>
        </div>
        <div className="card-mc">
          <b>{formatUsd(c.marketCapUsd, { compact: true })}</b>
          <span>MC</span>
          <span style={{ marginLeft: "auto" }}>
            <Delta value={c.change24h} />
          </span>
        </div>
        {!shelf && (
          <div className="card-prog">
            <CurveBar progress={c.curveProgress} graduated={c.graduated} />
            <span>{c.graduated ? "100%" : `${pct.toFixed(pct < 10 ? 2 : 1)}%`}</span>
          </div>
        )}
        <div className="card-foot">
          <span>{shortAddress(c.token)}</span>
          <span className={c.lastTradeAt > Date.now() / 1000 - 300 ? "up" : ""}>{timeAgo(c.lastTradeAt || c.createdAt)} ago</span>
        </div>
      </div>
    </Link>
  );
}
