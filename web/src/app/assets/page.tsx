"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AssetIcon } from "@/components/AssetIcon";
import { Delta, Sparkline } from "@/components/bits";
import { useAssets, type Asset } from "@/lib/api";
import { formatAmount, formatPrice, timeAgo } from "@/lib/format";

const CATEGORY = {
  MACRO: {
    title: "Macro",
    copy: "Published statistics: indices, inflation and rates. Moves at most ±5% per update, only when two official sources agree within 0.5%.",
  },
  COLLECTIBLE: {
    title: "Collectibles",
    copy: "Market prices for cards, skins and everyday goods. Moves at most ±20% per update, median of two marketplaces within 10%.",
  },
} as const;

export default function AssetsPage() {
  const router = useRouter();
  const { data: assets, isLoading } = useAssets();
  const groups = (["MACRO", "COLLECTIBLE"] as const).map((cat) => ({ cat, items: (assets ?? []).filter((a) => a.category === cat) }));

  return (
    <div className="shell page">
      <div className="page-head">
        <div>
          <div className="eyebrow">What coins are priced in</div>
          <h1 className="display page-title">
            The <span className="amber">underlyings</span>
          </h1>
        </div>
        <p className="hint" style={{ maxWidth: 560, margin: 0 }}>
          Each underlying is a synthetic token whose whole supply sits in a one-price sell wall. A keeper moves the wall when the
          real-world price changes, within limits the contract enforces, and publishes the source readings behind every move.
        </p>
      </div>

      {isLoading && <div className="empty">Loading underlyings…</div>}
      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.cat} style={{ marginBottom: 16 }}>
              <div className="toolbar" style={{ justifyContent: "space-between" }}>
                <span className="display" style={{ fontSize: 20 }}>
                  {CATEGORY[g.cat].title}
                </span>
                <span className="hint" style={{ maxWidth: 620 }}>
                  {CATEGORY[g.cat].copy}
                </span>
              </div>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Underlying</th>
                      <th className="num">Wall price</th>
                      <th className="num">24h</th>
                      <th className="num">History</th>
                      <th className="num">Updated</th>
                      <th className="num">Moves</th>
                      <th className="num">Coins</th>
                      <th className="num">Pot</th>
                      <th className="num">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((a) => (
                      <AssetRow key={a.assetId} asset={a} onOpen={() => router.push(`/asset?id=${a.assetId}`)} />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ),
      )}
    </div>
  );
}

function AssetRow({ asset: a, onOpen }: { asset: Asset; onOpen: () => void }) {
  return (
    <tr onClick={onOpen}>
      <td>
        <Link href={`/asset?id=${a.assetId}`} className="coin-cell" onClick={(e) => e.stopPropagation()}>
          <AssetIcon symbol={a.symbol} size={30} />
          <span>
            <div className="coin-sym">{a.symbol}</div>
            <div className="coin-name">{a.name}</div>
          </span>
        </Link>
      </td>
      <td className="num amber" style={{ fontSize: 14 }}>
        ${formatPrice(a.priceUsd)}
      </td>
      <td className="num">
        <Delta value={a.change24h} boxed />
      </td>
      <td className="num">
        <span style={{ display: "inline-block" }}>
          <Sparkline points={a.history.map((h) => h.p)} />
        </span>
      </td>
      <td className="num mute">{timeAgo(a.lastUpdate)} ago</td>
      <td className="num">{Math.max(0, a.history.length - 1)}</td>
      <td className="num">{a.launches}</td>
      <td className="num">${formatAmount(a.pot, 6, 0)}</td>
      <td className="num">{a.paused ? <span className="chip chip-down">PAUSED</span> : <span className="chip chip-up">LIVE</span>}</td>
    </tr>
  );
}
