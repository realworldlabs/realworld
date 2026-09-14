const SUBSCRIPT = "₀₁₂₃₄₅₆₇₈₉";

/**
 * Tiny prices with a subscript zero count: 0.000004474 -> "0.0₅4474".
 * Larger values get normal grouping with `sig` significant digits.
 */
export function formatPrice(value: number, sig = 4): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1) return sign + abs.toLocaleString("en-US", { maximumFractionDigits: abs >= 1000 ? 0 : 2 });

  // Number of zeros right after the decimal point.
  let zeros = Math.floor(-Math.log10(abs));
  let digits = Math.round(abs * 10 ** (zeros + sig)).toString();
  if (digits.length > sig) {
    // rounding carried into the next place (0.099999 -> 0.1)
    zeros -= 1;
    digits = digits.slice(0, sig);
  }
  const trimmed = digits.replace(/0+$/, "") || "0";
  if (zeros < 4) return `${sign}0.${"0".repeat(zeros)}${trimmed}`;
  const sub = String(zeros)
    .split("")
    .map((d) => SUBSCRIPT[Number(d)])
    .join("");
  return `${sign}0.0${sub}${trimmed}`;
}

export function formatUsd(value: number, opts: { compact?: boolean; price?: boolean } = {}): string {
  if (!Number.isFinite(value)) return "$0";
  if (opts.price) return `$${formatPrice(value)}`;
  if (opts.compact && Math.abs(value) >= 1000) {
    return `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;
  }
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: Math.abs(value) < 10 ? 2 : 0 })}`;
}

export function formatAmount(raw: bigint | string, decimals: number, maxFraction = 4): string {
  const v = typeof raw === "string" ? BigInt(raw) : raw;
  const neg = v < 0n;
  const abs = neg ? -v : v;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = (abs % base).toString().padStart(decimals, "0").slice(0, maxFraction).replace(/0+$/, "");
  const wholeStr = whole.toLocaleString("en-US");
  return `${neg ? "-" : ""}${wholeStr}${frac ? "." + frac : ""}`;
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

export function shortAddress(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function timeAgo(unixSeconds: number, now = Date.now() / 1000): string {
  const s = Math.max(0, Math.floor(now - unixSeconds));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function bpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}%`;
}
