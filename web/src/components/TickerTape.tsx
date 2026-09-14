"use client";

import { useAssets, useCoins } from "@/lib/api";
import { formatPrice } from "@/lib/format";

/** Scrolling tape of underlying prices and the hottest coins. Duplicated once so the loop is seamless. */
export function TickerTape() {
  const { data: assets } = useAssets();
  const { data: coins } = useCoins({ sort: "volume", limit: "8" });

  const items = [
    ...(assets ?? []).map((a) => ({ key: `a${a.assetId}`, sym: a.symbol, value: `$${formatPrice(a.priceUsd)}`, note: a.category === "MACRO" ? "MACRO" : "COLLECT" })),
    ...(coins?.items ?? []).map((c) => ({
      key: c.token,
      sym: `$${c.symbol}`,
      value: `$${formatPrice(c.priceUsd)}`,
      note: c.graduated ? "GRAD" : `${Math.round(c.curveProgress * 100)}%`,
    })),
  ];
  if (items.length === 0) return <div className="tape" />;

  return (
    <div className="tape" aria-label="Live prices">
      <div className="tape-track">
        {[...items, ...items].map((it, i) => (
          <span className="tape-item" key={`${it.key}-${i}`}>
            <span className="tape-sym">{it.sym}</span>
            <span>{it.value}</span>
            <span className="mute">{it.note}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
