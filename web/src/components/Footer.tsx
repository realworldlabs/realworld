import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

const COLUMNS = [
  {
    title: "Trade",
    links: [
      { href: "/", label: "Explore coins" },
      { href: "/launch", label: "Create a coin" },
      { href: "/assets", label: "Underlyings" },
      { href: "/portfolio", label: "Portfolio" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/docs", label: "How it works" },
      { href: "/docs#launching", label: "Launching" },
      { href: "/docs#fees", label: "Trading & fees" },
      { href: "/docs#risk", label: "What can go wrong" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
    ],
  },
  {
    title: "Chain",
    links: [
      { href: "https://robinhoodchain.blockscout.com", label: "Block explorer", external: true },
      { href: "https://robinhoodchain.blockscout.com/address/0x31d1A8c14160fF7Affc8A3f6240965fF3215787D", label: "Launch factory", external: true },
      { href: "https://robinhoodchain.blockscout.com/address/0xA5609FDdC8B60e8ae21aFacF9198943D228a93B4", label: "Asset registry", external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <span className="brand">
            <BrandMark className="brand-mark" />
            RealWorld
          </span>
          <p className="hint" style={{ maxWidth: 300, marginTop: 10 }}>
            Launch any coin — meme, tech, community — priced in a real-world asset: inflation, rates, house prices, rent, wages
            and everyday goods. On Robinhood Chain.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              {c.title}
            </div>
            <ul className="footer-links">
              {c.links.map((l) => (
                <li key={l.href}>
                  {"external" in l && l.external ? (
                    <a href={l.href} target="_blank" rel="noreferrer">
                      {l.label} ↗
                    </a>
                  ) : (
                    <Link href={l.href}>{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="shell footer-bottom">
        <span className="mono">© 2026 REALWORLD · realworld.family</span>
        <span>New tokens are volatile and many go to zero. Synthetic underlyings carry keeper and backing risk. Nothing here is investment advice.</span>
      </div>
    </footer>
  );
}
