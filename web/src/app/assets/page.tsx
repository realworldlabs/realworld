"use client";

import Link from "next/link";
import { useAssets } from "@/lib/api";
import { formatAmount, formatPrice, timeAgo } from "@/lib/format";

const CATEGORY_COPY = {
  MACRO: "Published statistics: indices, inflation and rates. Moves at most ±5% per update, from two agreeing official sources.",
  COLLECTIBLE: "Market prices for cards, skins and everyday goods. Moves at most ±20% per update, median of two marketplaces.",
} as const;

export default function AssetsPage() {
  const { data: assets, isLoading } = useAssets();
  const groups = (["MACRO", "COLLECTIBLE"] as const).map((cat) => ({ cat, items: (assets ?? []).filter((a) => a.category === cat) }));

  return (
    <div className="shell page">
      <div className="eyebrow">What coins are priced in</div>
      <h1 className="display" style={{ fontSize: "clamp(56px, 8vw, 110px)", margin: "10px 0 12px" }}>
        The <span className="amber">underlyings</span>
      </h1>
      <p className="hero-copy" style={{ maxWidth: 720 }}>
        Each underlying is a synthetic token whose whole supply sits in a one-price sell wall. A keeper moves the wall when the
        real-world price changes, within limits the contract enforces, and publishes the source readings behind every move.
        Sell an underlying back to its vault for USDG.
      </p>

      {isLoading && <div className="empty">Loading underlyings…</div>}
      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.cat} style={{ marginTop: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, gap: 20 }}>
                <h2 className="display" style={{ fontSize: 40, margin: 0 }}>
                  {g.cat === "MACRO" ? "Macro" : "Collectibles"}
                </h2>
                <span className="hint" style={{ maxWidth: 560, textAlign: "right" }}>
                  {CATEGORY_COPY[g.cat]}
                </span>
              </div>
              <div className="asset-grid">
                {g.items.map((a) => (
                  <Link key={a.assetId} href={`/asset?id=${a.assetId}`} className="asset-card">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="display" style={{ fontSize: 30, textTransform: "none" }}>
                        {a.symbol}
                      </span>
                      {a.paused ? <span className="chip down">PAUSED</span> : <span className="chip chip-up">LIVE</span>}
                    </div>
                    <div className="dim">{a.name}</div>
                    <div className="asset-price">${formatPrice(a.priceUsd)}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto" }} className="mono">
                      <span className="mute" style={{ fontSize: 12 }}>
                        updated {timeAgo(a.lastUpdate)} ago
                      </span>
                      <span style={{ fontSize: 12 }}>
                        {a.launches} coins · pot ${formatAmount(a.pot, 6, 0)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ),
      )}
    </div>
  );
}
