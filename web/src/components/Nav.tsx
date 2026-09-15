"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { DEVNET } from "@/lib/config";

const LINKS = [
  { href: "/", label: "Explore" },
  { href: "/launch", label: "Create" },
  { href: "/assets", label: "Underlyings" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/docs", label: "Rules" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="nav">
      <div className="shell nav-grid">
        <Link href="/" className="brand" aria-label="RealWorld home">
          <span className="brand-mark">R</span>
          RealWorld
        </Link>
        <nav className="nav-pill">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link"
              data-active={l.href === "/" ? pathname === "/" || pathname.startsWith("/coin") : pathname.startsWith(l.href) || (l.href === "/assets" && pathname.startsWith("/asset"))}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav-side">
          {DEVNET && <DevnetConnect />}
          <ConnectButton chainStatus="none" showBalance={false} accountStatus="address" />
        </div>
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
    <button className="btn btn-sm" onClick={() => connect({ connector: mock })}>
      Devnet wallet
    </button>
  );
}
