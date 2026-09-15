export default function DocsPage() {
  return (
    <div className="shell page">
      <div className="eyebrow">How it works</div>
      <h1 className="display" style={{ fontSize: "clamp(56px, 8vw, 110px)", margin: "10px 0 0" }}>
        The rules <span className="amber">of the floor</span>
      </h1>
      <div className="prose">
        <h2>What this is</h2>
        <p>
          RealWorld is a memecoin launchpad on Robinhood Chain where every coin is paired with an <strong>underlying</strong>: a synthetic
          token that tracks a real-world price such as US inflation, euro-area house prices, the Fed funds rate, a trading card,
          a CS2 skin or a Big Mac. You buy the coin with its underlying, it is priced in the underlying, the creator is paid in
          the underlying, and it graduates into liquidity locked against the underlying.
        </p>

        <h2>Underlyings</h2>
        <p>
          Nobody issues these assets on-chain, so the protocol does. Each underlying&apos;s whole supply sits in a Uniswap v4 position
          one tick wide: a flat sell wall at a single price. A keeper moves the wall when the real price changes. It only acts
          when two independent sources agree (0.5% for statistics, 10% for market prices), and the contract caps every move
          (±5% for macro, ±20% for collectibles) and enforces a minimum interval. Every move carries a hash of the source
          readings it used.
        </p>
        <p>
          Underlyings can only be <strong>bought</strong> from the wall. To sell one, redeem it with its vault, which pays USDG at
          the wall price from the dollars that underlying&apos;s own wall collected, minus 0.3%. If the price has risen faster than
          the pot, <strong>every holder takes the same pro-rata haircut</strong>. One underlying can never drain another.
        </p>
        <p>
          Because of this, coins paired with an underlying are <strong>sold here</strong>: the order ticket routes coin → underlying →
          vault in one transaction. External trading terminals cannot route an underlying back to USDG and will label such a
          coin as unsellable or &ldquo;100% sell tax&rdquo;. That is the wall doing its job, not a tax.
        </p>
        <p>
          If the keeper misses an asset&apos;s heartbeat (45 days for macro, 48 hours for collectibles), new launches against it are
          blocked. Trading and redemption never stop. A guardian can pause price moves and launches, but not trading.
        </p>

        <h2>Launching</h2>
        <p>
          Pick a name, ticker, image and underlying. Set an optional creator tax (up to 5%) and an optional buyback share. Pay
          the 0.0005 ETH launch fee and, if you want to be first in, a first buy paid in USDG. All of it is fixed at launch.
        </p>
        <p>
          Supply is 1,000,000,000. 714,285,714 tokens are sold on a concentrated curve spanning 25,000 ticks, roughly 12.2× from
          a $4,000 opening market cap to about $48,700. The rest is the reserve that seeds the permanent pool.
        </p>

        <h2>Trading and fees</h2>
        <p>
          Coins trade in a real Uniswap v4 pool from the first block. Every trade pays a <strong>1% base fee</strong>, 70% to the
          creator and 30% to the protocol, plus any creator tax. All fees are taken in the underlying, never in the coin. Creators
          claim fees from their portfolio. When buybacks are on, part of the creator&apos;s share buys the coin back, and those tokens
          vest to the creator over 12 months.
        </p>

        <h2>Graduation</h2>
        <p>
          When the curve sells out, anyone can graduate the coin. The raised underlying and the reserve become a single full-range
          position held by a locker contract that has <strong>no function to remove liquidity</strong>. Reserve that does not fit
          at the graduation price is burned. Trading continues in the same pool with the same fees.
        </p>

        <h2>What can go wrong</h2>
        <p>
          These are memecoins and most go to zero. A coin priced in an underlying carries that underlying&apos;s risk too: if the
          underlying falls, your coin falls with it. Underlyings depend on a single keeper operator, bounded by on-chain limits,
          and on redemption pots that can run short. Collectible prices can be manipulated at the source. Nothing here is
          investment advice.
        </p>
      </div>
    </div>
  );
}
