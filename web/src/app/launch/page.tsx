"use client";

import { launchFactoryAbi, launchRouterAbi } from "@rwa/abi";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { parseEventLogs, parseUnits, toHex, type Address } from "viem";
import { useAccount, useBalance, useConfig, useReadContract } from "wagmi";
import { getPublicClient, simulateContract } from "wagmi/actions";
import { CoinAvatar } from "@/components/bits";
import { useAssets } from "@/lib/api";
import { deployments, LAUNCH_FEE, USDG_DECIMALS } from "@/lib/config";
import { bpsToPercent, formatAmount, formatPrice, formatUsd } from "@/lib/format";
import { useTx } from "@/lib/tx";

const START_MCAP = 4_000;
const GRAD_MCAP = 48_700;

export default function LaunchPage() {
  const router = useRouter();
  const config = useConfig();
  const { address } = useAccount();
  const { data: assets } = useAssets();
  const tx = useTx();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");
  const [pair, setPair] = useState<Address | "">("");
  const [taxBps, setTaxBps] = useState(0);
  const [buybackBps, setBuybackBps] = useState(0);
  const [firstBuy, setFirstBuy] = useState("");

  const { data: configHash } = useReadContract({
    address: deployments.launchFactory,
    abi: launchFactoryAbi,
    functionName: "configHash",
    args: [0n],
  });
  const { data: ethBalance } = useBalance({ address });

  const launchable = (assets ?? []).filter((a) => !a.paused);
  const selected = launchable.find((a) => a.token === pair);
  const pairAddress: Address = selected ? selected.token : deployments.usdg;
  let firstBuyRaw = 0n;
  try {
    firstBuyRaw = parseUnits(firstBuy || "0", USDG_DECIMALS);
  } catch {}

  const estTokens = useMemo(() => {
    const usd = Number(firstBuy || 0) * (1 - (100 + taxBps) / 10_000);
    return usd / (START_MCAP / 1e9);
  }, [firstBuy, taxBps]);

  const errors = [
    !name.trim() && "Name",
    !/^[A-Z0-9]{2,12}$/.test(symbol) && "Ticker (2-12 letters/digits)",
  ].filter(Boolean) as string[];

  async function submit() {
    const salt = toHex(crypto.getRandomValues(new Uint8Array(32)));
    const hash = await tx.run(
      `Launching $${symbol}`,
      () =>
        simulateContract(config, {
          address: deployments.launchRouter,
          abi: launchRouterAbi,
          functionName: "launch",
          args: [
            {
              name: name.trim(),
              symbol,
              logo: logo.trim(),
              description: description.trim(),
              socials: { twitter: twitter.trim(), telegram: telegram.trim(), website: website.trim() },
              creator: address!,
              feeRecipient: address!,
              creatorTaxBps: taxBps,
              buybackBps,
              salt,
            },
            0,
            pairAddress,
            configHash!,
            deployments.usdg,
            firstBuyRaw,
            0n,
          ],
          value: LAUNCH_FEE,
        }),
      firstBuyRaw > 0n ? [{ token: deployments.usdg, spender: deployments.launchRouter, amount: firstBuyRaw }] : [],
    );
    if (!hash) return;
    const receipt = await getPublicClient(config)!.getTransactionReceipt({ hash });
    const [launched] = parseEventLogs({ abi: launchFactoryAbi, eventName: "Launched", logs: receipt.logs });
    if (launched) setTimeout(() => router.push(`/coin?token=${launched.args.token}`), 1_200);
  }

  return (
    <div className="shell page">
      <div className="eyebrow">New listing</div>
      <h1 className="display" style={{ fontSize: "clamp(56px, 8vw, 110px)", margin: "10px 0 28px" }}>
        List a coin <span className="amber">on the board</span>
      </h1>

      <div className="coin-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section className="panel" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              01 · Identity
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" className="input" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Rent Is Due" />
              </div>
              <div className="field">
                <label htmlFor="symbol">Ticker</label>
                <input
                  id="symbol"
                  className="input mono"
                  maxLength={12}
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  placeholder="RENT"
                />
              </div>
              <div className="field span-2">
                <label htmlFor="logo">Image URL</label>
                <input id="logo" className="input" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://… or ipfs://…" />
                <span className="hint">Stored on-chain as a URL. Pin the image to IPFS for permanence.</span>
              </div>
              <div className="field span-2">
                <label htmlFor="desc">Description</label>
                <textarea id="desc" className="textarea" maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="tw">X / Twitter</label>
                <input id="tw" className="input" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@handle" />
              </div>
              <div className="field">
                <label htmlFor="tg">Telegram</label>
                <input id="tg" className="input" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="t.me/…" />
              </div>
              <div className="field span-2">
                <label htmlFor="web">Website</label>
                <input id="web" className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
              </div>
            </div>
          </section>

          <section className="panel" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              02 · Underlying
            </div>
            <p className="hint" style={{ marginTop: 0, marginBottom: 16 }}>
              The coin is priced, traded and pays its fees in this asset. It cannot be changed later.
            </p>
            <div className="pair-options">
              {launchable.map((a) => (
                <button key={a.assetId} className="pair-option" data-active={pair === a.token} onClick={() => setPair(a.token)}>
                  <span className="display" style={{ fontSize: 22, textTransform: "none" }}>
                    {a.symbol}
                  </span>
                  <span className="hint">{a.name}</span>
                  <span className="mono amber">${formatPrice(a.priceUsd)}</span>
                </button>
              ))}
              <button className="pair-option" data-active={pair === ""} onClick={() => setPair("")}>
                <span className="display" style={{ fontSize: 22 }}>
                  USDG
                </span>
                <span className="hint">Plain dollars, no underlying</span>
                <span className="mono amber">$1.00</span>
              </button>
            </div>
          </section>

          <section className="panel" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              03 · Economics (fixed at launch)
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="tax">Creator tax · {bpsToPercent(taxBps)}</label>
                <input id="tax" type="range" className="range" min={0} max={500} step={25} value={taxBps} onChange={(e) => setTaxBps(Number(e.target.value))} />
                <span className="hint">On top of the 1% base fee (70% of which is yours). Max 5%.</span>
              </div>
              <div className="field">
                <label htmlFor="bb">Buyback · {bpsToPercent(buybackBps)} of your fees</label>
                <input id="bb" type="range" className="range" min={0} max={10_000} step={500} value={buybackBps} onChange={(e) => setBuybackBps(Number(e.target.value))} />
                <span className="hint">Spent buying your coin back, vested to you over 12 months.</span>
              </div>
              <div className="field span-2">
                <label htmlFor="fb">First buy · USDG (optional)</label>
                <input id="fb" className="input mono" inputMode="decimal" placeholder="0" value={firstBuy} onChange={(e) => setFirstBuy(e.target.value.replace(/[^0-9.]/g, ""))} />
                <span className="hint">
                  Buy the first tokens in the same transaction, before anyone else. Leave empty to open the curve untouched.
                  {selected ? ` Converted to ${selected.symbol} at its wall price.` : ""}
                </span>
              </div>
            </div>
          </section>
        </div>

        <aside className="ticket">
          <div className="ticket-head">
            <span className="display" style={{ fontSize: 28 }}>
              Listing slip
            </span>
            <span className="mono" style={{ fontSize: 11 }}>
              CONFIG #0
            </span>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
            <CoinAvatar coin={{ logo, symbol: symbol || "??" }} size={56} />
            <div>
              <div className="display" style={{ fontSize: 34 }}>
                ${symbol || "TICKER"}
              </div>
              <div style={{ color: "var(--ink-dim)" }}>{name || "Coin name"}</div>
            </div>
          </div>
          <div className="ticket-row">
            <span>Underlying</span>
            <strong>{selected?.symbol ?? "USDG"}</strong>
          </div>
          <div className="ticket-row">
            <span>Supply</span>
            <span>1,000,000,000</span>
          </div>
          <div className="ticket-row">
            <span>Opening market cap</span>
            <span>{formatUsd(START_MCAP)}</span>
          </div>
          <div className="ticket-row">
            <span>Graduation market cap</span>
            <span>~{formatUsd(GRAD_MCAP, { compact: true })}</span>
          </div>
          <div className="ticket-row">
            <span>Trade fee</span>
            <span>{bpsToPercent(100 + taxBps)}</span>
          </div>
          <div className="ticket-row">
            <span>First buy ≈</span>
            <span>{firstBuyRaw > 0n ? `${formatAmount(BigInt(Math.floor(estTokens)), 0)} tokens` : "none"}</span>
          </div>
          <div className="ticket-row">
            <span>Launch fee</span>
            <span>0.0005 ETH</span>
          </div>

          <button
            className="btn btn-ink btn-block"
            style={{ height: 52, marginTop: 18, fontSize: 14 }}
            disabled={!address || errors.length > 0 || !configHash || tx.state.status === "pending" || (ethBalance?.value ?? 0n) < LAUNCH_FEE}
            onClick={submit}
          >
            {!address ? "Connect a wallet" : tx.state.status === "pending" ? tx.state.label : `Launch $${symbol || "…"}`}
          </button>
          {address && errors.length > 0 && <div className="status">Missing: {errors.join(", ")}</div>}
          {tx.state.status === "error" && (
            <div className="status" data-kind="error">
              {tx.state.message}
            </div>
          )}
          {tx.state.status === "success" && (
            <div className="status" data-kind="success">
              Listed. Opening the coin page…
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
