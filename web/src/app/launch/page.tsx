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

  const { data: configHash } = useReadContract({ address: deployments.launchFactory, abi: launchFactoryAbi, functionName: "configHash", args: [0n] });
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

  const errors = [!name.trim() && "name", !/^[A-Z0-9]{2,12}$/.test(symbol) && "ticker (2-12 letters/digits)"].filter(Boolean) as string[];
  const lowEth = (ethBalance?.value ?? 0n) < LAUNCH_FEE;

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
      <div className="page-head">
        <div>
          <div className="eyebrow">New listing</div>
          <h1 className="display page-title">
            List a coin <span className="amber">on the board</span>
          </h1>
        </div>
        <p className="hint" style={{ maxWidth: 520, margin: 0 }}>
          One transaction. 1B supply, 714M sold on a 25,000-tick curve from a $4K opening market cap; graduates near $48.7K into
          permanently locked liquidity. Terms are fixed at launch.
        </p>
      </div>

      <div className="coin-layout">
        <div className="stack">
          <section className="panel">
            <div className="panel-head">
              <span className="section-head" style={{ margin: 0 }}>
                <span className="step-no">1</span>
                <span className="eyebrow" style={{ color: "var(--fg)" }}>
                  Identity
                </span>
              </span>
            </div>
            <div className="panel-body form-grid">
              <div className="field">
                <label htmlFor="name" className="label">
                  Name
                </label>
                <input id="name" className="input" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Rent Is Due" />
              </div>
              <div className="field">
                <label htmlFor="symbol" className="label">
                  Ticker
                </label>
                <input id="symbol" className="input" maxLength={12} value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="RENT" />
              </div>
              <div className="field span-2">
                <label htmlFor="logo" className="label">
                  Image URL
                </label>
                <input id="logo" className="input" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://… or ipfs://…" />
                <span className="hint">Stored on-chain as a URL. Pin the image to IPFS for permanence.</span>
              </div>
              <div className="field span-2">
                <label htmlFor="desc" className="label">
                  Description
                </label>
                <textarea id="desc" className="textarea" maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="tw" className="label">
                  X / Twitter
                </label>
                <input id="tw" className="input" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@handle" />
              </div>
              <div className="field">
                <label htmlFor="tg" className="label">
                  Telegram
                </label>
                <input id="tg" className="input" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="t.me/…" />
              </div>
              <div className="field span-2">
                <label htmlFor="web" className="label">
                  Website
                </label>
                <input id="web" className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <span className="section-head" style={{ margin: 0 }}>
                <span className="step-no">2</span>
                <span className="eyebrow" style={{ color: "var(--fg)" }}>
                  Underlying
                </span>
              </span>
              <span className="hint">Priced, traded and fee-paid in this asset. Cannot change later.</span>
            </div>
            <div className="panel-body">
              <div className="pair-options">
                {launchable.map((a) => (
                  <button key={a.assetId} className="pair-option" data-active={pair === a.token} onClick={() => setPair(a.token)}>
                    <span className="mono" style={{ fontSize: 14, color: "var(--fg)" }}>
                      {a.symbol}
                    </span>
                    <span className="hint truncate">{a.name}</span>
                    <span className="mono amber" style={{ fontSize: 12 }}>
                      ${formatPrice(a.priceUsd)}
                    </span>
                  </button>
                ))}
                <button className="pair-option" data-active={pair === ""} onClick={() => setPair("")}>
                  <span className="mono" style={{ fontSize: 14, color: "var(--fg)" }}>
                    USDG
                  </span>
                  <span className="hint">Plain dollars · tradable anywhere</span>
                  <span className="mono amber" style={{ fontSize: 12 }}>
                    $1.00
                  </span>
                </button>
              </div>
              {selected && (
                <p className="hint" style={{ margin: "10px 0 0" }}>
                  Coins paired with {selected.symbol} are bought and sold on RealWorld. External terminals cannot route {selected.symbol} back to USDG.
                </p>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <span className="section-head" style={{ margin: 0 }}>
                <span className="step-no">3</span>
                <span className="eyebrow" style={{ color: "var(--fg)" }}>
                  Economics
                </span>
              </span>
              <span className="hint">Fixed at launch.</span>
            </div>
            <div className="panel-body form-grid">
              <div className="field">
                <label htmlFor="tax" className="label">
                  Creator tax · <span className="amber">{bpsToPercent(taxBps)}</span>
                </label>
                <input id="tax" type="range" className="range" min={0} max={500} step={25} value={taxBps} onChange={(e) => setTaxBps(Number(e.target.value))} />
                <span className="hint">On top of the 1% base fee (70% of which is yours). Max 5%.</span>
              </div>
              <div className="field">
                <label htmlFor="bb" className="label">
                  Buyback · <span className="amber">{bpsToPercent(buybackBps)}</span> of your fees
                </label>
                <input id="bb" type="range" className="range" min={0} max={10_000} step={500} value={buybackBps} onChange={(e) => setBuybackBps(Number(e.target.value))} />
                <span className="hint">Spent buying your coin back, vested to you over 12 months.</span>
              </div>
              <div className="field span-2">
                <label htmlFor="fb" className="label">
                  First buy · USDG <span className="mute">(optional)</span>
                </label>
                <input id="fb" className="input" inputMode="decimal" placeholder="0" value={firstBuy} onChange={(e) => setFirstBuy(e.target.value.replace(/[^0-9.]/g, ""))} />
                <span className="hint">
                  Buy the first tokens in the same transaction, before anyone else. Leave empty to open the curve untouched.
                  {selected ? ` Converted to ${selected.symbol} at its wall price.` : ""}
                </span>
              </div>
            </div>
          </section>
        </div>

        <aside className="ticket panel">
          <div className="panel-head">
            <span className="eyebrow">Listing slip</span>
            <span className="mono mute" style={{ fontSize: 10.5 }}>
              CONFIG #0
            </span>
          </div>
          <div className="panel-body stack">
            <div className="row" style={{ gap: 12 }}>
              <CoinAvatar coin={{ logo, symbol: symbol || "??" }} size={44} />
              <div style={{ minWidth: 0 }}>
                <div className="coin-title">${symbol || "TICKER"}</div>
                <div className="dim truncate" style={{ fontSize: 12 }}>
                  {name || "Coin name"}
                </div>
              </div>
            </div>
            <div>
              <div className="ticket-row">
                <span>Underlying</span>
                <strong>{selected?.symbol ?? "USDG"}</strong>
              </div>
              <div className="ticket-row">
                <span>Supply</span>
                <span className="v">1,000,000,000</span>
              </div>
              <div className="ticket-row">
                <span>Opening market cap</span>
                <span className="v">{formatUsd(START_MCAP)}</span>
              </div>
              <div className="ticket-row">
                <span>Graduation</span>
                <span className="v">~{formatUsd(GRAD_MCAP, { compact: true })}</span>
              </div>
              <div className="ticket-row">
                <span>Trade fee</span>
                <span className="v">{bpsToPercent(100 + taxBps)}</span>
              </div>
              <div className="ticket-row">
                <span>Buyback</span>
                <span className="v">{buybackBps ? bpsToPercent(buybackBps) : "off"}</span>
              </div>
              <div className="ticket-row">
                <span>First buy ≈</span>
                <span className="v">{firstBuyRaw > 0n ? `${formatAmount(BigInt(Math.floor(estTokens)), 0)} tokens` : "none"}</span>
              </div>
              <div className="ticket-row">
                <span>Launch fee</span>
                <span className="v">0.0005 ETH</span>
              </div>
            </div>

            <button
              className="btn btn-amber btn-lg btn-block"
              disabled={!address || errors.length > 0 || !configHash || tx.state.status === "pending" || lowEth}
              onClick={submit}
            >
              {!address ? "Connect a wallet" : lowEth ? "Need 0.0005 ETH + gas" : tx.state.status === "pending" ? tx.state.label : `Launch $${symbol || "…"}`}
            </button>
            {address && errors.length > 0 && <div className="hint">Missing: {errors.join(", ")}</div>}
            {tx.state.status === "error" && (
              <div className="status" data-kind="error" style={{ marginTop: 0 }}>
                {tx.state.message}
              </div>
            )}
            {tx.state.status === "success" && (
              <div className="status" data-kind="success" style={{ marginTop: 0 }}>
                Listed. Opening the coin page…
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
