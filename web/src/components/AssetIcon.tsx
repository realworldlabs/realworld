/**
 * Engraved seal icons for the underlyings: a monoline glyph inside a ring, drawn in currentColor so the same
 * mark works on cream chips and on inverted (ink) ones. Unknown symbols fall back to their initials.
 */

const GLYPHS: Record<string, React.ReactNode> = {
  // US consumer prices: a shopping basket
  sUSCPI: (
    <>
      <path d="M8 14h16l-1.6 9.5a1.5 1.5 0 0 1-1.5 1.3H11.1a1.5 1.5 0 0 1-1.5-1.3L8 14z" />
      <path d="M12 14l3-6M20 14l-3-6M13.5 18v3M18.5 18v3" />
    </>
  ),
  // Fed funds rate: a percent sign
  sFEDFUNDS: (
    <>
      <path d="M11 21L21 11" />
      <circle cx="11.5" cy="11.5" r="2.2" />
      <circle cx="20.5" cy="20.5" r="2.2" />
    </>
  ),
  // euro-area house prices: a house
  sEUHPI: (
    <>
      <path d="M7.5 15.5L16 8l8.5 7.5" />
      <path d="M10 14v9.5h12V14" />
      <path d="M14 23.5v-5h4v5" />
    </>
  ),
  // US rent: a key
  sUSRENT: (
    <>
      <circle cx="11.5" cy="13" r="4" />
      <path d="M14.5 15.5L24 25M21 22l2.5-2.5M18.5 19.5L21 17" />
    </>
  ),
  // US jobs: a briefcase
  sUSJOBS: (
    <>
      <rect x="7" y="12" width="18" height="12" rx="1.5" />
      <path d="M12.5 12V9.5h7V12M7 17h18" />
    </>
  ),
  // US wages: a banknote
  sUSWAGE: (
    <>
      <rect x="6.5" y="10.5" width="19" height="11" rx="1" />
      <circle cx="16" cy="16" r="2.6" />
      <path d="M9.5 13.5v5M22.5 13.5v5" />
    </>
  ),
  // US gasoline: a fuel pump
  sUSGAS: (
    <>
      <path d="M9 24V9.5A1.5 1.5 0 0 1 10.5 8h7A1.5 1.5 0 0 1 19 9.5V24" />
      <path d="M7.5 24h13M11 11.5h6v4h-6z" />
      <path d="M19 13h2.5a1.5 1.5 0 0 1 1.5 1.5V20a1.5 1.5 0 0 0 3 0v-6.5L23.5 11" />
    </>
  ),
  // US eggs: an egg
  sUSEGGS: <path d="M16 7.5c3.6 0 6.5 5.2 6.5 10a6.5 6.5 0 0 1-13 0c0-4.8 2.9-10 6.5-10z" />,
  // Big Mac index: a burger
  sBIGMAC: (
    <>
      <path d="M8 14a8 8 0 0 1 16 0z" />
      <path d="M7.5 17.5h17M8 21a8 4.5 0 0 0 16 0z" />
    </>
  ),
  // a trading card
  sCHARIZARD: (
    <>
      <rect x="9" y="7" width="14" height="18" rx="1.5" />
      <path d="M12 11h8M12 21h8" />
      <circle cx="16" cy="16" r="2" />
    </>
  ),
  // a CS2 skin: a crosshair
  sREDLINE: (
    <>
      <circle cx="16" cy="16" r="6" />
      <path d="M16 7v4M16 21v4M7 16h4M21 16h4" />
    </>
  ),
  // plain dollars
  USDG: (
    <>
      <path d="M16 8v16" />
      <path d="M19.5 12.2c-.5-1.6-1.9-2.4-3.5-2.4-2 0-3.5 1-3.5 2.7 0 3.8 7 2 7 5.8 0 1.8-1.6 2.9-3.5 2.9-1.9 0-3.4-1-3.8-2.7" />
    </>
  ),
};

/** Symbols that share a glyph. */
const ALIAS: Record<string, string> = { sMOONBREON: "sCHARIZARD", sBLASTOISE: "sCHARIZARD" };

export function AssetIcon({ symbol, size = 18, className, title }: { symbol: string; size?: number; className?: string; title?: string }) {
  const glyph = GLYPHS[ALIAS[symbol] ?? symbol];
  const stroke = size >= 36 ? 1.6 : size >= 26 ? 1.8 : 2.1;
  return (
    <span className={`asset-icon${className ? ` ${className}` : ""}`} style={{ width: size, height: size }} title={title} aria-hidden="true">
      <svg viewBox="0 0 32 32" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="14.6" strokeWidth={size >= 36 ? 1.2 : 1.5} />
        {glyph ?? (
          <text x="16" y="20.5" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="currentColor" stroke="none">
            {symbol.replace(/^s/, "").slice(0, 3)}
          </text>
        )}
      </svg>
    </span>
  );
}
