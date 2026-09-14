/** One reading from one data source. */
export interface Observation {
  /** Source id, e.g. "fred:CPIAUCNS". */
  source: string;
  /** USD price per real-world unit (before unitScale). */
  price: number;
  /**
   * Reporting period for published statistics ("2026-08", "2026-Q1", "2026-09-10").
   * Market sources leave it undefined and are compared on freshness instead.
   */
  period?: string;
  /** When the value was observed or published (ms since epoch). */
  observedAt: number;
  /** Raw payload excerpt kept for the audit trail. */
  raw: unknown;
}

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export interface SourceContext {
  fetch: Fetcher;
  env: Record<string, string | undefined>;
  now: () => number;
}

export interface SourceSpec {
  type: string;
  [key: string]: unknown;
}

/** Returns one observation per recent reporting period (statistics) or a single current one (markets). */
export type SourceAdapter = (spec: SourceSpec, ctx: SourceContext) => Promise<Observation[]>;
