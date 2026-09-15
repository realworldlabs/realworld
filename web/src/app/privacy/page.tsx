export default function PrivacyPage() {
  return (
    <div className="shell page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Legal</div>
          <h1 className="display page-title">Privacy policy</h1>
        </div>
        <span className="hint">Last updated 15 September 2026</span>
      </div>
      <div className="prose">
        <p>
          RealWorld is a non-custodial interface to smart contracts on Robinhood Chain. There are no accounts, passwords or
          sign-ups. This page explains what the site can see and what it keeps.
        </p>

        <h2>What we do not collect</h2>
        <p>
          We never hold your private keys, seed phrases or funds. Transactions are signed in your own wallet and sent to the
          chain by it. We do not run advertising trackers and we do not sell data.
        </p>

        <h2>What is public by design</h2>
        <p>
          Everything you do on-chain — launching a coin, trading, claiming fees — is recorded on Robinhood Chain and visible to
          anyone, including through this site&apos;s indexer. Wallet addresses, balances, trades and the names, images and links
          you attach to a coin are permanent public data. Do not put personal information in a coin&apos;s name, description or
          image.
        </p>

        <h2>What our servers see</h2>
        <p>
          When you use the site, our indexer receives your requests (the pages and data you load) and, if you connect a wallet,
          the address you connect, so it can show your portfolio. Requests carry your IP address and browser type, which our
          hosting providers log for a limited time to keep the service running and to stop abuse. Images uploaded for a coin are
          pinned to IPFS and become public.
        </p>

        <h2>Third parties</h2>
        <p>
          The site is served by Vercel, the indexer runs on Railway, images are pinned through Pinata, and chain reads go through
          a JSON-RPC provider. Your wallet software and any block explorer you open have their own privacy policies. Price data
          for underlyings comes from public statistical and market sources and contains nothing about you.
        </p>

        <h2>Cookies and local storage</h2>
        <p>
          The site stores wallet-connection preferences in your browser so you stay connected between visits. It sets no
          advertising or cross-site cookies.
        </p>

        <h2>Your choices</h2>
        <p>
          Disconnect your wallet at any time from the wallet menu. Clearing your browser storage removes local preferences. Data
          already written to the chain cannot be removed by us or by anyone.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy: open an issue on the project repository linked in the footer. Changes to this page are
          noted by the date above.
        </p>
      </div>
    </div>
  );
}
