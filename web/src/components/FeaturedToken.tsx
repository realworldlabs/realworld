"use client";

import { CoinAvatar, Copy, CurveBar, Delta, Sparkline } from "@/components/bits";
import { BrandMark } from "@/components/BrandMark";
import { useFeatured } from "@/lib/api";
import { formatPrice, formatUsd } from "@/lib/format";

const EXPLORER = "https://robinhoodchain.blockscout.com";

/**
 * The RealWorld token is launched on pons, so it is not one of the coins below. This strip shows its live price
 * from the indexer's poller and sends trading to pons. Renders nothing until a token is configured.
 */
export function FeaturedToken() {
  const { data: f } = useFeatured();
  if (!f) return null;

  const onCurve = f.phase === "curve";
  const price = f.priceUsd !== null ? `$${formatPrice(f.priceUsd)}` : `${formatPrice(f.priceInPair)} ${f.pair.symbol}`;
  const mcap =
    f.marketCapUsd !== null
      ? formatUsd(f.marketCapUsd, { compact: true })
      : `${formatUsd(f.marketCapInPair, { compact: true }).replace("$", "")} ${f.pair.symbol}`;

  return (
    <section className="featured reveal" aria-label="RealWorld token">
      <div className="featured-seal">
        <BrandMark size={18} />
        <span>RealWorld token</span>
      </div>
      <div className="featured-id">
        <CoinAvatar coin={{ logo: f.logo, symbol: f.symbol }} size={46} />
        <div>
          <div className="featured-name">
            {f.name} <span className="featured-sym">${f.symbol}</span>
          </div>
          <div className="featured-sub">
            Launched on pons · priced in {f.pair.symbol}
            {onCurve ? " · on the curve" : f.phase === "pool" ? " · trading on Uniswap v4" : f.phase === "swept" ? " · graduating" : ""}
          </div>
        </div>
      </div>
      <div className="featured-price">
        <div className="featured-num">{price}</div>
        <div className="featured-lbl">
          price <Delta value={f.change24h} />
        </div>
      </div>
      <div className="featured-price">
        <div className="featured-num">{mcap}</div>
        <div className="featured-lbl">market cap</div>
      </div>
      <div className="featured-spark">
        <Sparkline points={f.spark} width={140} height={34} />
        {onCurve && (
          <div className="featured-prog">
            <CurveBar progress={f.progress} graduated={false} width={140} />
            <span>{(f.progress * 100).toFixed(f.progress < 0.1 ? 2 : 1)}% to graduation</span>
          </div>
        )}
      </div>
      <div className="featured-actions">
        <Copy text={f.token} />
        <a className="btn btn-sm" href={`${EXPLORER}/token/${f.token}`} target="_blank" rel="noreferrer">
          Explorer ↗
        </a>
        <a className="btn btn-sm btn-ink" href={f.ponsUrl} target="_blank" rel="noreferrer">
          Trade on pons ↗
        </a>
      </div>
    </section>
  );
}
