"use client";

import { launchFactoryAbi, launchRouterAbi } from "@rwa/abi";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useState } from "react";
import { erc20Abi, formatUnits, parseUnits, type Address } from "viem";
import { useAccount, useConfig, useReadContract } from "wagmi";
import { getPublicClient, simulateContract } from "wagmi/actions";
import type { CoinDetail } from "@/lib/api";
import { deployments, TOKEN_DECIMALS, USDG_DECIMALS } from "@/lib/config";
import { bpsToPercent, formatAmount, formatPrice } from "@/lib/format";
import { useTx } from "@/lib/tx";

type Side = "buy" | "sell";

const USDG_QUICK = ["1", "5", "25", "100"];
const PCT_QUICK = [25, 50, 75, 100];

export function TradeTicket({ coin }: { coin: CoinDetail }) {
  const config = useConfig();
  const { address } = useAccount();
  const [side, setSide] = useState<Side>("buy");
  const synthPair = coin.assetId !== null;
  const pairSymbol = coin.asset?.symbol ?? "USDG";
  // "usdg" routes through the synth wall / vault; "pair" trades the pair asset directly.
  const [asset, setAsset] = useState<"usdg" | "pair">("usdg");
  const [amount, setAmount] = useState("");
  const [slippageBps, setSlippageBps] = useState(300);
  const tx = useTx();

  const usingUsdg = asset === "usdg" || !synthPair;
  const quoteAsset: Address = usingUsdg ? deployments.usdg : coin.pair;
  const quoteDecimals = usingUsdg ? USDG_DECIMALS : TOKEN_DECIMALS;
  const quoteSymbol = usingUsdg ? "USDG" : pairSymbol;
  const inAsset: Address = side === "buy" ? quoteAsset : coin.token;
  const inDecimals = side === "buy" ? quoteDecimals : TOKEN_DECIMALS;
  const inSymbol = side === "buy" ? quoteSymbol : coin.symbol;

  let amountIn = 0n;
  try {
    amountIn = amount ? parseUnits(amount, inDecimals) : 0n;
  } catch {
    amountIn = 0n;
  }
  const deferredAmount = useDeferredValue(amountIn);

  const balance = useReadContract({
    address: inAsset,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5_000 },
  });

  const ready = useReadContract({
    address: deployments.launchFactory,
    abi: launchFactoryAbi,
    functionName: "isReadyToMigrate",
    args: [coin.token],
    query: { refetchInterval: 5_000 },
  });

  const quote = useQuery({
    queryKey: ["quote", coin.token, side, quoteAsset, deferredAmount.toString()],
    enabled: deferredAmount > 0n,
    retry: false,
    queryFn: async () => {
      const client = getPublicClient(config)!;
      if (side === "buy") {
        const [cap, out] = await Promise.all([
          client.readContract({ address: deployments.launchRouter, abi: launchRouterAbi, functionName: "maxBuyInput", args: [coin.token, quoteAsset] }),
          client.simulateContract({ address: deployments.launchRouter, abi: launchRouterAbi, functionName: "quoteBuy", args: [coin.token, quoteAsset, deferredAmount] }),
        ]);
        return { out: out.result, capped: deferredAmount > cap ? cap : undefined };
      }
      const { result } = await client.simulateContract({
        address: deployments.launchRouter,
        abi: launchRouterAbi,
        functionName: "quoteSell",
        args: [coin.token, deferredAmount, quoteAsset],
      });
      return { out: result[0], capped: undefined };
    },
  });

  const outDecimals = side === "buy" ? TOKEN_DECIMALS : quoteDecimals;
  const outSymbol = side === "buy" ? coin.symbol : quoteSymbol;
  const minOut = quote.data ? (quote.data.out * BigInt(10_000 - slippageBps)) / 10_000n : 0n;
  const spend = quote.data?.capped ?? amountIn;
  const execPrice =
    quote.data && quote.data.out > 0n
      ? side === "buy"
        ? Number(formatUnits(spend, quoteDecimals)) / Number(formatUnits(quote.data.out, TOKEN_DECIMALS))
        : Number(formatUnits(quote.data.out, quoteDecimals)) / Number(formatUnits(amountIn, TOKEN_DECIMALS))
      : undefined;
  const insufficient = balance.data !== undefined && amountIn > balance.data;
  const totalFeeBps = 100 + coin.creatorTaxBps;

  function setPct(pct: number) {
    if (balance.data === undefined) return;
    setAmount(formatUnits((balance.data * BigInt(pct)) / 100n, inDecimals));
  }

  async function submit() {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
    await tx.run(
      side === "buy" ? `Buying ${coin.symbol}` : `Selling ${coin.symbol}`,
      async () =>
        side === "buy"
          ? simulateContract(config, {
              address: deployments.launchRouter,
              abi: launchRouterAbi,
              functionName: "buy",
              args: [coin.token, quoteAsset, amountIn, minOut, address!, deadline],
            })
          : simulateContract(config, {
              address: deployments.launchRouter,
              abi: launchRouterAbi,
              functionName: "sell",
              args: [coin.token, amountIn, quoteAsset, minOut, address!, deadline],
            }),
      [{ token: inAsset, spender: deployments.launchRouter, amount: amountIn }],
    );
    setAmount("");
  }

  async function migrate() {
    await tx.run("Graduating", () =>
      simulateContract(config, { address: deployments.launchFactory, abi: launchFactoryAbi, functionName: "migrate", args: [coin.token] }),
    );
  }

  return (
    <aside className="panel">
      <div className="panel-head">
        <span className="eyebrow">Order ticket</span>
        <span className="mono mute" style={{ fontSize: 10.5 }}>
          № {coin.token.slice(2, 8).toUpperCase()}
        </span>
      </div>

      {ready.data && (
        <div className="panel-body" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="warn-bar">The curve is sold out. Graduate it to lock liquidity; buys resume after.</div>
          <button className="btn btn-amber btn-block" style={{ marginTop: 8 }} onClick={migrate} disabled={!address || tx.state.status === "pending"}>
            Graduate {coin.symbol}
          </button>
        </div>
      )}

      <div className="ticket-tabs">
        {(["buy", "sell"] as const).map((s) => (
          <button key={s} className="ticket-tab" data-side={s} data-active={side === s} onClick={() => setSide(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="panel-body stack">
        {synthPair && (
          <div className="between">
            <span className="label">{side === "buy" ? "Pay with" : "Receive"}</span>
            <div className="seg">
              <button data-active={asset === "usdg"} onClick={() => setAsset("usdg")}>
                USDG
              </button>
              <button data-active={asset === "pair"} onClick={() => setAsset("pair")}>
                {pairSymbol}
              </button>
            </div>
          </div>
        )}

        <div className="field">
          <div className="between">
            <label htmlFor="amount" className="label">
              Amount · {inSymbol}
            </label>
            <span className="hint mono">
              Bal {balance.data !== undefined ? formatAmount(balance.data, inDecimals, side === "buy" ? 2 : 0) : "—"}
            </span>
          </div>
          <input
            id="amount"
            className="input input-lg"
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          />
          <div className="quick">
            {side === "buy" && usingUsdg
              ? USDG_QUICK.map((v) => (
                  <button key={v} onClick={() => setAmount(v)}>
                    ${v}
                  </button>
                ))
              : PCT_QUICK.map((p) => (
                  <button key={p} onClick={() => setPct(p)} disabled={balance.data === undefined}>
                    {p === 100 ? "MAX" : `${p}%`}
                  </button>
                ))}
          </div>
        </div>

        <div>
          <div className="ticket-row">
            <span>You receive (est.)</span>
            <strong>{quote.isFetching ? "…" : quote.data ? `${formatAmount(quote.data.out, outDecimals, side === "buy" ? 0 : 4)} ${outSymbol}` : "—"}</strong>
          </div>
          <div className="ticket-row">
            <span>Execution price</span>
            <span className="v">{execPrice ? `${formatPrice(execPrice)} ${quoteSymbol}` : "—"}</span>
          </div>
          <div className="ticket-row">
            <span>Min. after slippage</span>
            <span className="v">{quote.data ? formatAmount(minOut, outDecimals, side === "buy" ? 0 : 4) : "—"}</span>
          </div>
          <div className="ticket-row">
            <span>Fee</span>
            <span className="v">
              {bpsToPercent(totalFeeBps)}
              {coin.creatorTaxBps > 0 && <span className="mute"> · incl. {bpsToPercent(coin.creatorTaxBps)} creator</span>}
            </span>
          </div>
          <div className="ticket-row">
            <span>Slippage</span>
            <span className="seg" style={{ padding: 1 }}>
              {[100, 300, 1000].map((b) => (
                <button key={b} data-active={slippageBps === b} onClick={() => setSlippageBps(b)} style={{ padding: "2px 7px", fontSize: 10.5 }}>
                  {bpsToPercent(b)}
                </button>
              ))}
            </span>
          </div>
        </div>

        {quote.data?.capped !== undefined && (
          <div className="warn-bar">
            Only {formatAmount(quote.data.capped, quoteDecimals)} {quoteSymbol} fits before the curve sells out. The rest stays in your wallet.
          </div>
        )}
        {quote.isError && (
          <div className="status" data-kind="error" style={{ marginTop: 0 }}>
            {ready.data && side === "buy" ? "Curve is complete: graduate first." : "No quote for this amount."}
          </div>
        )}

        <button
          className={`btn btn-lg btn-block ${side === "buy" ? "btn-up" : "btn-down"}`}
          disabled={!address || amountIn === 0n || insufficient || !quote.data || tx.state.status === "pending"}
          onClick={submit}
        >
          {!address
            ? "Connect a wallet"
            : insufficient
              ? `Not enough ${inSymbol}`
              : tx.state.status === "pending"
                ? tx.state.label
                : `${side === "buy" ? "Buy" : "Sell"} ${coin.symbol}`}
        </button>

        {synthPair && (
          <p className="hint" style={{ margin: 0 }}>
            {asset === "usdg"
              ? side === "buy"
                ? `USDG buys ${pairSymbol} at its wall, then ${coin.symbol}, in one transaction.`
                : `Proceeds in ${pairSymbol} are redeemed for USDG from its vault (0.3% fee, pro-rata haircut if the pot is short). Sell here: external terminals cannot route ${pairSymbol} back to USDG.`
              : `Trades directly in ${pairSymbol}.`}
          </p>
        )}

        {tx.state.status === "error" && (
          <div className="status" data-kind="error" style={{ marginTop: 0 }}>
            {tx.state.message}
          </div>
        )}
        {tx.state.status === "success" && (
          <div className="status" data-kind="success" style={{ marginTop: 0 }}>
            Filled · {tx.state.hash.slice(0, 18)}…
          </div>
        )}
      </div>
    </aside>
  );
}
