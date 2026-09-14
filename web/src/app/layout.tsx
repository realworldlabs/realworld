import type { Metadata } from "next";
import { Big_Shoulders, IBM_Plex_Mono, Manrope } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { TickerTape } from "@/components/TickerTape";

const display = Big_Shoulders({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-big-shoulders" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Underlying — memecoins priced in real-world assets",
  description:
    "Launch and trade memecoins paired with synthetic real-world assets: house prices, inflation, rates, trading cards and skins. On Robinhood Chain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} ${body.variable}`}>
      <body>
        <Providers>
          <TickerTape />
          <Nav />
          <main>{children}</main>
          <footer className="footer">
            <div className="shell" style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
              <span className="mono">UNDERLYING · ROBINHOOD CHAIN</span>
              <span>
                Memecoins are volatile and most go to zero. Synthetic assets carry keeper and redemption risk. Nothing here is
                investment advice.
              </span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
