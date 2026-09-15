"use client";

import { buybackVaultAbi, feeEscrowAbi } from "@rwa/abi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Address } from "viem";
import { useAccount, useConfig, useReadContract } from "wagmi";
import { simulateContract } from "wagmi/actions";
import { CoinAvatar, Copy, CurveBar, Delta, Stat, UnderlyingChip } from "@/components/bits";
import { useAssets, usePortfolio, type Coin } from "@/lib/api";
import { deployments } from "@/lib/config";
import { formatAmount, formatPrice, formatUsd, timeAgo } from "@/lib/format";
import { useTx } from "@/lib/tx";

export default function PortfolioPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { data } = usePortfolio(address);
  const { data: assets } = useAssets();

  if (!address) {
    return (
      <div className="shell page">
        <div className="page-head">
          <h1 className="display page-title">Portfolio</h1>
        </div>
        <div className="panel empty">Connect a wallet to see holdings, fees and vesting.</div>
      </div>
    );
  }

  const totalUsd = (data?.holdings ?? []).reduce((s, h) => s + h.valueUsd, 0);
  const symbolOf = (currency: Address) =>
    currency.toLowerCase() === deployments.usdg.toLowerCase()
      ? { symbol: "USDG", decimals: 6, usd: 1 }
      : (() => {
          const a = assets?.find((x) => x.token.toLowerCase() === currency.toLowerCase());
          return { symbol: a?.symbol ?? currency.slice(0, 8), decimals: 18, usd: a?.priceUsd ?? 0 };
        })();
  const fees = (data?.fees ?? []).filter((f) => BigInt(f.claimable) > 0n);
  const claimableUsd = fees.reduce((s, f) => {
    const m = symbolOf(f.currency);
    return s + (Number(f.claimable) / 10 ** m.decimals) * m.usd;
  }, 0);

  return (
    <div className="shell page">
      <div className="page-head">
        <div>
          <div className="row">
            <span className="eyebrow">Portfolio</span>
            <Copy text={address} />
          </div>
          <h1 className="display page-title">Your desk</h1>
        </div>
        <div className="stats" style={{ minWidth: 420 }}>
          <Stat label="Coin holdings" value={formatUsd(totalUsd)} amber />
          <Stat label="Claimable fees" value={formatUsd(claimableUsd)} sub={`${fees.length} currencies`} />
          <Stat label="Launched" value={data?.created.length ?? "—"} />
        </div>
      </div>

      <section className="reveal">
        <div className="toolbar">
          <span className="eyebrow">Holdings</span>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Coin</th>
                <th>Pair</th>
                <th className="num">Balance</th>
                <th className="num">Price</th>
                <th className="num">24h</th>
                <th className="num">Value</th>
                <th className="num">Curve</th>
              </tr>
            </thead>
            <tbody>
              {(data?.holdings ?? []).map((h) => (
                <tr key={h.coin.token} onClick={() => router.push(`/coin?token=${h.coin.token}`)}>
                  <td>
                    <span className="coin-cell">
                      <CoinAvatar coin={h.coin} />
                      <span>
                        <div className="coin-sym">{h.coin.symbol}</div>
                        <div className="coin-name">{h.coin.name}</div>
                      </span>
                    </span>
                  </td>
                  <td>
                    <UnderlyingChip asset={h.coin.asset} />
                  </td>
                  <td className="num">{formatAmount(h.balance, 18, 0)}</td>
                  <td className="num">${formatPrice(h.coin.priceUsd)}</td>
                  <td className="num">
                    <Delta value={h.coin.change24h} boxed />
                  </td>
                  <td className="num amber">{formatUsd(h.valueUsd)}</td>
                  <td className="num">
                    <CurveBar progress={h.coin.curveProgress} graduated={h.coin.graduated} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.holdings.length === 0 && <div className="empty">No coins held</div>}
        </div>
      </section>

      <div className="board-grid" style={{ marginTop: 12, gridTemplateColumns: "1fr 1fr" }}>
        <section className="panel">
          <div className="panel-head">
            <span className="eyebrow">Claimable fees</span>
            <span className="hint">paid in each coin&apos;s underlying</span>
          </div>
          <div className="list">
            {fees.map((f) => {
              const s = symbolOf(f.currency);
              return <FeeRow key={f.currency} currency={f.currency} claimable={BigInt(f.claimable)} {...s} />;
            })}
            {fees.length === 0 && <div className="empty">Nothing to claim</div>}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="eyebrow">Coins you launched</span>
            <Link href="/launch" className="eyebrow amber">
              Launch →
            </Link>
          </div>
          <div className="list">
            {(data?.created ?? []).map((c) => (
              <CreatedRow key={c.token} coin={c} />
            ))}
            {data?.created.length === 0 && <div className="empty">None yet</div>}
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 12 }}>
        <div className="panel-head">
          <span className="eyebrow">Your trades</span>
          <span className="eyebrow">{data?.trades.length ?? 0} latest</span>
        </div>
        <div className="list list-scroll">
          {(data?.trades ?? []).map((t) => (
            <Link key={t.id} href={`/coin?token=${t.token}`} className="list-row" style={{ gridTemplateColumns: "44px 1fr 1fr 120px 60px" }}>
              <span className={t.side === "buy" ? "up" : "down"}>{t.side.toUpperCase()}</span>
              <span className="right">{formatAmount(t.tokenAmount, 18, 0)}</span>
              <span className="right" style={{ color: "var(--fg)" }}>
                {formatUsd(t.valueUsd)}
              </span>
              <span className="right mute">{t.token.slice(0, 10)}…</span>
              <span className="right mute">{timeAgo(t.timestamp)}</span>
            </Link>
          ))}
          {data?.trades.length === 0 && <div className="empty">No trades yet</div>}
        </div>
      </section>
    </div>
  );
}

function FeeRow({ currency, claimable, symbol, decimals, usd }: { currency: Address; claimable: bigint; symbol: string; decimals: number; usd: number }) {
  const config = useConfig();
  const { address } = useAccount();
  const tx = useTx();
  return (
    <div className="list-row" style={{ gridTemplateColumns: "1fr 90px 80px" }}>
      <span>
        <strong className="amber">{formatAmount(claimable, decimals)}</strong> <span className="dim">{symbol}</span>
      </span>
      <span className="right dim">{formatUsd((Number(claimable) / 10 ** decimals) * usd)}</span>
      <span className="right">
        <button
          className="btn btn-sm"
          disabled={tx.state.status === "pending"}
          onClick={() =>
            tx.run(`Claiming ${symbol}`, () =>
              simulateContract(config, { address: deployments.feeEscrow, abi: feeEscrowAbi, functionName: "claim", args: [currency, address!] }),
            )
          }
        >
          {tx.state.status === "pending" ? "…" : tx.state.status === "error" ? "Retry" : "Claim"}
        </button>
      </span>
    </div>
  );
}

function CreatedRow({ coin }: { coin: Coin }) {
  const config = useConfig();
  const tx = useTx();
  const { data: releasable } = useReadContract({
    address: deployments.buybackVault,
    abi: buybackVaultAbi,
    functionName: "releasable",
    args: [coin.token],
    query: { refetchInterval: 15_000 },
  });
  const { data: budget } = useReadContract({
    address: deployments.buybackVault,
    abi: buybackVaultAbi,
    functionName: "budget",
    args: [coin.token],
    query: { refetchInterval: 15_000 },
  });
  return (
    <div className="list-row" style={{ gridTemplateColumns: "1fr auto auto" }}>
      <Link href={`/coin?token=${coin.token}`} className="row">
        <CoinAvatar coin={coin} size={22} />
        <span style={{ color: "var(--fg)" }}>{coin.symbol}</span>
        <span className="mute">{formatUsd(coin.marketCapUsd, { compact: true })}</span>
        <Delta value={coin.change24h} />
      </Link>
      {budget !== undefined && budget > 0n ? (
        <button
          className="btn btn-sm"
          title="Spend the accrued buyback budget"
          onClick={() =>
            tx.run("Buying back", () =>
              simulateContract(config, { address: deployments.buybackVault, abi: buybackVaultAbi, functionName: "executeBuyback", args: [coin.token] }),
            )
          }
        >
          Buy back
        </button>
      ) : (
        <span />
      )}
      {releasable !== undefined && releasable > 0n ? (
        <button
          className="btn btn-sm"
          onClick={() =>
            tx.run("Releasing", () =>
              simulateContract(config, { address: deployments.buybackVault, abi: buybackVaultAbi, functionName: "release", args: [coin.token] }),
            )
          }
        >
          Release {formatAmount(releasable, 18, 0)}
        </button>
      ) : (
        <span className="mute" style={{ fontSize: 11 }}>
          no vested tokens
        </span>
      )}
    </div>
  );
}
