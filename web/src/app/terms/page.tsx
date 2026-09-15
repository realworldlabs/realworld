export default function TermsPage() {
  return (
    <div className="shell page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Legal</div>
          <h1 className="display page-title">Terms of use</h1>
        </div>
        <span className="hint">Last updated 15 September 2026</span>
      </div>
      <div className="prose">
        <p>
          By using realworld.family (the &ldquo;site&rdquo;) you agree to these terms. If you do not agree, do not use the site or
          the contracts it connects to.
        </p>

        <h2>What the site is</h2>
        <p>
          The site is an interface to open smart contracts deployed on Robinhood Chain: a token launchpad and a set of
          synthetic tokens (&ldquo;underlyings&rdquo;) that track real-world prices. The contracts are permissionless; anyone can
          use them with or without this site. The site does not custody assets, execute trades on your behalf or give advice.
        </p>

        <h2>Eligibility and responsibility</h2>
        <p>
          You are responsible for complying with the laws that apply to you, including any restriction on trading tokens where
          you live. You are responsible for your wallet, your keys and every transaction you sign. Transactions on the chain are
          final and cannot be reversed by us.
        </p>

        <h2>Risks</h2>
        <p>
          Newly launched tokens are speculative and many lose all value. A coin paired with an underlying also moves with that underlying.
          Underlyings are synthetic: their price is set by a keeper within on-chain limits, from public sources that can be
          wrong, late or manipulated, and their backing can run short after a price rise. Software can contain bugs. You may
          lose everything you put in. Use amounts you can afford to lose.
        </p>

        <h2>Content you create</h2>
        <p>
          You are responsible for the names, tickers, descriptions, links and images you attach to a coin. Do not upload content
          you do not have the right to use, or content that is unlawful, defamatory or that impersonates a person or brand. This
          content is written to a public blockchain and public storage and cannot be taken down by us.
        </p>

        <h2>Fees</h2>
        <p>
          Launches carry a fixed fee and every trade pays the fees shown on the coin&apos;s page. Fees are set by the contracts at
          launch and are visible before you sign. Network gas is paid separately to the chain.
        </p>

        <h2>No warranty</h2>
        <p>
          The site and the contracts are provided as they are, without warranty of any kind. To the fullest extent permitted
          by law, the operators of the site are not liable for any loss arising from your use of the site or the contracts,
          including losses caused by errors in price data, keeper actions, third-party services or your own mistakes.
        </p>

        <h2>Changes</h2>
        <p>
          We may change the site and these terms at any time. The contracts themselves cannot be changed except through the
          admin functions described in the documentation. Continued use after a change means you accept it.
        </p>
      </div>
    </div>
  );
}
