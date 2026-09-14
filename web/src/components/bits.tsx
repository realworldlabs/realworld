"use client";

import { useState } from "react";
import type { Asset, Coin } from "@/lib/api";

/** Renders logos from http(s) or ipfs:// URLs; falls back to the ticker initials on an amber block. */
export function CoinAvatar({ coin, size = 38 }: { coin: Pick<Coin, "logo" | "symbol">; size?: number }) {
  const src = coin.logo?.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${coin.logo.slice(7)}`
    : coin.logo?.startsWith("http")
      ? coin.logo
      : undefined;
  const [failed, setFailed] = useState(false);
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.45 }}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        coin.symbol.slice(0, 2)
      )}
    </span>
  );
}

export function CurveMeter({ progress, graduated }: { progress: number; graduated: boolean }) {
  const on = graduated ? 20 : Math.round(progress * 20);
  return (
    <span className="meter" data-grad={graduated} title={graduated ? "Graduated" : `${(progress * 100).toFixed(1)}% of curve`}>
      {Array.from({ length: 20 }, (_, i) => (
        <i key={i} data-on={i < on} />
      ))}
    </span>
  );
}

export function UnderlyingChip({ asset }: { asset: Asset | null }) {
  if (!asset) return <span className="chip">USDG</span>;
  return (
    <span className="chip chip-amber" title={asset.name}>
      <span className="tag-dot" />
      {asset.symbol}
    </span>
  );
}

/** Each character in its own lit slot, like a split-flap board. */
export function Flap({ text }: { text: string }) {
  return (
    <span className="flap mono" aria-label={text}>
      {text.split("").map((ch, i) => (
        <span key={i}>{ch}</span>
      ))}
    </span>
  );
}
