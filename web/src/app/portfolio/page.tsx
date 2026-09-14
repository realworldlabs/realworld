"use client";

import { buybackVaultAbi, feeEscrowAbi } from "@rwa/abi";
import Link from "next/link";
import type { Address } from "viem";
import { useAccount, useConfig, useReadContract } from "wagmi";
import { simulateContract } from "wagmi/actions";
import { CoinAvatar, CurveMeter, UnderlyingChip } from "@/components/bits";
import { useAssets, usePortfolio, type Coin } from "@/lib/api";
import { deployments } from "@/lib/config";
import { formatAmount, formatPrice, formatUsd, timeAgo } from "@/lib/format";
import { useTx } from "@/lib/tx";

export default function PortfolioPage() {
  const { address } = useAccount();
  const { data } = usePortfolio(address);
  const { data: assets } = useAssets();

  if (!address) {
    return (
      <div className="shell page">
        <h1 className="display" style={{ fontSize: 96, margin: 0 }}>
          Portfolio
        </h1>
        <div className="empty">Connect a wallet to see holdings, fees and vesting.</div>
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

  return (
    <div className="shell page">
      <div className="eyebrow">{address}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
        <h1 className="display" style={{ fontSize: "clamp(56px, 8vw, 110px)", margin: "10px 0 0" }}>
          Portfolio
        </h1>
        <div style={{ textAlign: "right" }}>
          <div className="eyebrow">Coin holdings</div>
          <div className="mono amber" style={{ fontSize: 44 }}>
            {formatUsd(totalUsd)}
          </div>
        </div>
      </div>

      <section className="panel board-wrap" style={{ marginTop: 28 }}>
        <div className="panel-head">
          <span className="eyebrow">Holdings</span>
        </div>
        <table className="board">
          <thead>
            <tr>
              <th>Coin</th>
              <th>Underlying</th>
              <th className="num">Balance</th>
              <th className="num">Price</th>
              <th className="num">Value</th>
              <th>Curve</th>
            </tr>
          </thead>
          <tbody>
            {(data?.holdings ?? []).map((h) => (
              <tr key={h.coin.token} onClick={() => (window.location.href = `/coin/${h.coin.token}`)}>
                <td>
                  <span className="coin-cell">
                    <CoinAvatar coin={h.coin} />
                    <span className="coin-sym">{h.coin.symbol}</span>
                  </span>
                </td>
                <td>
                  <UnderlyingChip asset={h.coin.asset} />
                </td>
                <td className="num">{formatAmount(h.balance, 18, 0)}</td>
                <td className="num">${formatPrice(h.coin.priceUsd)}</td>
                <td className="num amber">{formatUsd(h.valueUsd)}</td>
                <td>
                  <CurveMeter progress={h.coin.curveProgress} graduated={h.coin.graduated} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.holdings.length === 0 && <div className="empty">No coins held</div>}
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
        <section className="panel">
          <div className="panel-head">
            <span className="eyebrow">Claimable fees</span>
          </div>
          <div className="tape-list">
            {(data?.fees ?? [])
              .filter((f) => BigInt(f.claimable) > 0n)
              .map((f) => {
                const s = symbolOf(f.currency);
                return <FeeRow key={f.currency} currency={f.currency} claimable={BigInt(f.claimable)} {...s} />;
              })}
            {(data?.fees ?? []).every((f) => BigInt(f.claimable) === 0n) && <div className="empty">Nothing to claim</div>}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="eyebrow">Coins you launched</span>
          </div>
          <div className="tape-list">
            {(data?.created ?? []).map((c) => (
              <CreatedRow key={c.token} coin={c} />
            ))}
            {data?.created.length === 0 && (
              <div className="empty">
                None yet · <Link href="/launch" className="amber">launch one</Link>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <div className="panel-head">
          <span className="eyebrow">Your trades</span>
        </div>
        <div className="tape-list">
          {(data?.trades ?? []).map((t) => (
            <Link key={t.id} href={`/coin/${t.token}`} className="tape-row">
              <span className={t.side === "buy" ? "up" : "down"}>{t.side.toUpperCase()}</span>
              <span>{formatAmount(t.tokenAmount, 18, 0)}</span>
              <span className="dim">{formatUsd(t.valueUsd)}</span>
              <span className="mute">{t.token.slice(0, 10)}…</span>
              <span className="mute" style={{ textAlign: "right" }}>
                {timeAgo(t.timestamp)}
              </span>
            </Link>
          ))}
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
    <div className="tape-row" style={{ gridTemplateColumns: "1fr 100px 110px" }}>
      <span>
        <strong className="amber">{formatAmount(claimable, decimals)}</strong> {symbol}
      </span>
      <span className="dim">{formatUsd((Number(claimable) / 10 ** decimals) * usd)}</span>
      <button
        className="btn"
        style={{ height: 32 }}
        disabled={tx.state.status === "pending"}
        onClick={() =>
          tx.run(`Claiming ${symbol}`, () =>
            simulateContract(config, { address: deployments.feeEscrow, abi: feeEscrowAbi, functionName: "claim", args: [currency, address!] }),
          )
        }
      >
        {tx.state.status === "pending" ? "…" : tx.state.status === "error" ? "Retry" : "Claim"}
      </button>
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
    <div className="tape-row" style={{ gridTemplateColumns: "1fr auto auto" }}>
      <Link href={`/coin/${coin.token}`}>
        <strong>{coin.symbol}</strong> <span className="mute">{formatUsd(coin.marketCapUsd, { compact: true })}</span>
      </Link>
      {budget !== undefined && budget > 0n ? (
        <button
          className="btn"
          style={{ height: 32 }}
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
          className="btn"
          style={{ height: 32 }}
          onClick={() =>
            tx.run("Releasing", () =>
              simulateContract(config, { address: deployments.buybackVault, abi: buybackVaultAbi, functionName: "release", args: [coin.token] }),
            )
          }
        >
          Release {formatAmount(releasable, 18, 0)}
        </button>
      ) : (
        <span className="mute">no vested tokens</span>
      )}
    </div>
  );
}
