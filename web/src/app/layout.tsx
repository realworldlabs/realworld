import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";

const display = Fraunces({ subsets: ["latin"], weight: "variable", style: ["normal", "italic"], axes: ["opsz"], variable: "--font-fraunces" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-sans" });

export const metadata: Metadata = {
  title: "RealWorld — memecoins priced in real-world assets",
  description:
    "Launch and trade memecoins paired with synthetic real-world assets: house prices, inflation, rates, trading cards and skins. On Robinhood Chain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} ${body.variable}`}>
      <body>
        <Providers>
          <Nav />
          <main>{children}</main>
          <footer className="footer">
            <div className="shell" style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
              <span className="mono">REALWORLD · ROBINHOOD CHAIN</span>
              <span style={{ maxWidth: 640 }}>
                Memecoins are volatile and most go to zero. Synthetic underlyings carry keeper and backing risk. Nothing here is
                investment advice.
              </span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
