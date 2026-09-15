"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { useHealth } from "@/lib/api";
import { DEVNET } from "@/lib/config";

const LINKS = [
  { href: "/", label: "Board" },
  { href: "/launch", label: "Launch" },
  { href: "/assets", label: "Underlyings" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/docs", label: "How it works" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="nav">
      <div className="shell nav-inner">
        <Link href="/" className="brand" aria-label="RealWorld home">
          <span className="brand-mark">R</span>
          REALWORLD
        </Link>
        <nav className="nav-links">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link"
              data-active={l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <ChainStatus />
        {DEVNET && <DevnetConnect />}
        <ConnectButton chainStatus="none" showBalance={false} accountStatus="address" />
      </div>
    </header>
  );
}

/** Indexer block height against the chain head: the one number that says whether what you see is current. */
function ChainStatus() {
  const { data, isError } = useHealth();
  const lag = data ? data.headBlock - data.lastBlock : 0;
  const state = isError || !data ? "down" : lag > 200 ? "lag" : "ok";
  return (
    <span className="nav-status" title={data ? `indexed ${data.lastBlock.toLocaleString()} / head ${data.headBlock.toLocaleString()}` : "indexer unreachable"}>
      <span className="dot" data-state={state} />
      {DEVNET ? "DEVNET" : "RH CHAIN"}
      <span className="mute">{data ? `#${data.lastBlock.toLocaleString("en-US")}` : "—"}</span>
    </span>
  );
}

/** Connects the unlocked anvil account on a local devnet, automatically on load and on demand. */
function DevnetConnect() {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const mock = connectors.find((c) => c.id === "mock");
  useEffect(() => {
    if (mock && !isConnected && !isConnecting && !isReconnecting) connect({ connector: mock });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mock, isReconnecting]);
  if (isConnected || !mock) return null;
  return (
    <button className="btn btn-sm" onClick={() => connect({ connector: mock })}>
      Devnet wallet
    </button>
  );
}
