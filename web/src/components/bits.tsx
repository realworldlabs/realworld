"use client";

import { useState } from "react";
import type { Asset, Coin } from "@/lib/api";
import { imageUrl } from "@/lib/config";

/** Renders logos from http(s) or ipfs:// URLs; falls back to the ticker initials on an ink block. */
export function CoinAvatar({ coin, size = 30 }: { coin: Pick<Coin, "logo" | "symbol">; size?: number }) {
  const src = imageUrl(coin.logo);
  const [failed, setFailed] = useState(false);
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        coin.symbol.slice(0, 2)
      )}
    </span>
  );
}

/** Square card artwork: the coin's image, or an engraved placeholder with the ticker set in serif. */
export function CoinArt({ coin }: { coin: Pick<Coin, "logo" | "symbol"> }) {
  const src = imageUrl(coin.logo);
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" onError={() => setFailed(true)} />;
  }
  const tone = (coin.symbol.charCodeAt(0) + coin.symbol.length) % 4;
  const n = coin.symbol.length;
  return (
    <div className="card-art" data-tone={tone} style={{ fontSize: n <= 4 ? "3.4em" : n <= 6 ? "2.6em" : n <= 8 ? "2em" : "1.5em" }}>
      {coin.symbol}
    </div>
  );
}

/** Thin curve-progress bar. */
export function CurveBar({ progress, graduated, width }: { progress: number; graduated: boolean; width?: number }) {
  const pct = graduated ? 100 : Math.max(0, Math.min(100, progress * 100));
  return (
    <span className="bar" data-grad={graduated} style={width ? { width } : undefined} title={graduated ? "Graduated" : `${pct.toFixed(1)}% of curve`}>
      <i style={{ width: `${Math.max(pct, 1)}%` }} />
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

/** Signed percentage change; null renders as a dash. */
export function Delta({ value, boxed = false, digits = 1 }: { value: number | null | undefined; boxed?: boolean; digits?: number }) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return (
      <span className="delta" data-dir="flat">
        —
      </span>
    );
  }
  const pct = value * 100;
  const dir = pct > 0.005 ? "up" : pct < -0.005 ? "down" : "flat";
  const text = `${pct > 0 ? "+" : ""}${pct.toFixed(digits)}%`;
  return (
    <span className={boxed ? "delta delta-box" : "delta"} data-dir={dir}>
      {text}
    </span>
  );
}

/** Tiny line chart; colour follows the sign of the move. */
export function Sparkline({ points, width = 92, height = 26 }: { points: number[]; width?: number; height?: number }) {
  if (points.length < 2) {
    return (
      <svg className="spark" viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden>
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="var(--line-2)" strokeDasharray="2 3" />
      </svg>
    );
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || max || 1;
  const pad = 2;
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (width - pad * 2));
  const ys = points.map((p) => height - pad - ((p - min) / span) * (height - pad * 2));
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i]!.toFixed(1)}`).join(" ");
  const up = points[points.length - 1]! >= points[0]!;
  const color = up ? "var(--up)" : "var(--down)";
  const id = `g${Math.round(min * 1e9)}${points.length}`;
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${xs[xs.length - 1]!.toFixed(1)},${height} L${xs[0]!.toFixed(1)},${height} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function Skeleton({ width = 60 }: { width?: number | string }) {
  return <span className="skeleton" style={{ width }} />;
}

export function Stat({ label, value, sub, amber }: { label: string; value: React.ReactNode; sub?: React.ReactNode; amber?: boolean }) {
  return (
    <div className="stat">
      <div className="eyebrow">{label}</div>
      <div className={`stat-v${amber ? " amber" : ""}`}>{value}</div>
      {sub !== undefined && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export function Kv({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="kv">
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}

/** Copies text to the clipboard and flashes a tick. */
export function Copy({ text, label }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="chip"
      style={{ cursor: "pointer" }}
      title="Copy"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        });
      }}
    >
      {label ?? `${text.slice(0, 6)}…${text.slice(-4)}`}
      <span className={done ? "up" : "mute"}>{done ? "✓" : "⧉"}</span>
    </button>
  );
}
