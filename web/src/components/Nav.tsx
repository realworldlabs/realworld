"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
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
        {DEVNET && <DevnetConnect />}
        <ConnectButton chainStatus="none" showBalance={false} accountStatus="address" />
      </div>
    </header>
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
    <button className="btn" onClick={() => connect({ connector: mock })}>
      Devnet wallet
    </button>
  );
}
