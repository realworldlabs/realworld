"use client";

import Link from "next/link";
import { Delta } from "@/components/bits";
import { useAssets, useCoins } from "@/lib/api";
import { formatPrice } from "@/lib/format";

/** Scrolling tape of underlying prices and the busiest coins. Duplicated once so the loop is seamless. */
export function TickerTape() {
  const { data: assets } = useAssets();
  const { data: coins } = useCoins({ sort: "volume", limit: "10" });

  const items = [
    ...(assets ?? []).map((a) => ({ key: `a${a.assetId}`, href: `/asset?id=${a.assetId}`, sym: a.symbol, value: `$${formatPrice(a.priceUsd)}`, change: a.change24h })),
    ...(coins?.items ?? []).map((c) => ({ key: c.token, href: `/coin?token=${c.token}`, sym: `$${c.symbol}`, value: `$${formatPrice(c.priceUsd)}`, change: c.change24h })),
  ];
  if (items.length === 0) return <div className="tape" />;

  return (
    <div className="tape" aria-label="Live prices">
      <div className="tape-track">
        {[...items, ...items].map((it, i) => (
          <Link className="tape-item" key={`${it.key}-${i}`} href={it.href}>
            <span className="tape-sym">{it.sym}</span>
            <span className="amber">{it.value}</span>
            <Delta value={it.change} />
          </Link>
        ))}
      </div>
    </div>
  );
}
