import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { aggregate, DEFAULT_RULES } from "../src/aggregate.ts";
import { collect, normalizePeriod } from "../src/sources/index.ts";
import { ALL_FIXTURES, ctx, fixtureFetch } from "./helpers.ts";

const c = ctx(fixtureFetch(ALL_FIXTURES));

describe("normalizePeriod", () => {
  it("maps dates to month and quarter keys", () => {
    expect(normalizePeriod("2026-08-01", "month")).toBe("2026-08");
    expect(normalizePeriod("2026-10-01", "quarter")).toBe("2026-Q4");
    expect(normalizePeriod("2026-09-10", "day")).toBe("2026-09-10");
  });
});

describe("recorded sources", () => {
  it("US CPI: BLS and FRED agree on August 2026", async () => {
    const { observations, errors } = await collect(
      [
        { type: "bls", series: "CUUR0000SA0" },
        { type: "fredCsv", series: "CPIAUCNS", period: "month" },
      ],
      c,
    );
    expect(errors).toEqual([]);
    const r = aggregate(observations, DEFAULT_RULES.MACRO, c.now());
    expect(r).toMatchObject({ ok: true, price: 334.98, period: "2026-08" });
  });

  it("Fed funds: NY Fed and FRED agree", async () => {
    const { observations } = await collect(
      [
        { type: "nyfed", rate: "effr" },
        { type: "fredCsv", series: "EFFR", period: "day" },
      ],
      c,
    );
    const r = aggregate(observations, DEFAULT_RULES.MACRO, c.now());
    expect(r).toMatchObject({ ok: true, price: 3.63, period: "2026-09-10" });
  });

  it("Euro area HPI: Eurostat and BIS (via FRED) agree on 2026-Q1", async () => {
    const { observations } = await collect(
      [
        { type: "eurostat", dataset: "prc_hpi_q", query: "geo=EA20&unit=I15_Q&purchase=TOTAL" },
        { type: "fredCsv", series: "QXMN628BIS", period: "quarter" },
      ],
      c,
    );
    const r = aggregate(observations, DEFAULT_RULES.MACRO, c.now());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.period).toBe("2026-Q1");
      expect(r.price).toBeCloseTo(157.36, 1);
    }
  });

  it("AK-47 Redline: Steam and Skinport agree within 10%", async () => {
    const name = "AK-47 | Redline (Field-Tested)";
    const { observations } = await collect(
      [
        { type: "steam", marketHashName: name },
        { type: "skinport", marketHashName: name },
      ],
      c,
    );
    expect(observations.map((o) => o.source).sort()).toEqual(["skinport", "steam"]);
    const r = aggregate(observations, DEFAULT_RULES.COLLECTIBLE, c.now());
    expect(r.ok).toBe(true);
  });

  it("Big Mac: parses the US row", async () => {
    const { observations } = await collect([{ type: "economistBigMac", iso: "USA" }], c);
    expect(observations.at(-1)).toMatchObject({ source: "economist:bigmac", price: 6.22, period: "2026-07" });
  });

  it("reports failures without throwing", async () => {
    const { observations, errors } = await collect(
      [{ type: "pricecharting", id: "1" }, { type: "nope" }, { type: "steam", marketHashName: "missing" }],
      ctx(fixtureFetch([])),
    );
    expect(observations).toEqual([]);
    expect(errors).toHaveLength(3);
  });
});

describe("per-source scale", () => {
  it("normalises a source before aggregation", async () => {
    const { observations } = await collect([{ type: "steam", marketHashName: "AK-47 | Redline (Field-Tested)", scale: 0.5 }], c);
    expect(observations[0]!.price).toBeCloseTo(36.8 * 0.5, 6);
  });
});

describe("pokemonprice", () => {
  it("reads the per-grade summary, not the transaction rows", async () => {
    const { parsePokemonPrice } = await import("../src/sources/index.ts");
    const html = fs.readFileSync(new URL("./fixtures/pokemonprice-umbreon.html", import.meta.url), "utf8");
    expect(parsePokemonPrice(html, "PSA10")).toBe(1748);
    expect(parsePokemonPrice(html, "Raw")).toBe(991);
    expect(() => parsePokemonPrice(html, "BGS10")).toThrow(/no BGS10/);
  });
});

describe("medianOf", () => {
  it("takes the middle value, averaging an even split", async () => {
    const { medianOf } = await import("../src/sources/index.ts");
    expect(medianOf([30, 10, 20])).toBe(20);
    expect(medianOf([1, 2, 3, 100])).toBe(2.5);
  });
});
