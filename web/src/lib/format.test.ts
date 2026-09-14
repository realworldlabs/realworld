import { describe, expect, it } from "vitest";
import { bpsToPercent, formatAmount, formatPrice, formatUsd, shortAddress, timeAgo } from "./format";

describe("formatPrice", () => {
  it("uses subscript zero counts for tiny prices", () => {
    expect(formatPrice(0.000004474)).toBe("0.0₅4474");
    expect(formatPrice(0.00005357)).toBe("0.0₄5357");
  });
  it("prints small but not tiny prices plainly", () => {
    expect(formatPrice(0.1234)).toBe("0.1234");
    expect(formatPrice(0.0045)).toBe("0.0045");
  });
  it("handles rounding carries", () => {
    expect(formatPrice(0.099999)).toBe("0.1");
  });
  it("groups prices above one", () => {
    expect(formatPrice(334.98)).toBe("334.98");
    expect(formatPrice(48700.4)).toBe("48,700");
  });
});

describe("other formatters", () => {
  it("formats usd", () => {
    expect(formatUsd(53572, { compact: true })).toBe("$53.6K");
    expect(formatUsd(5.5)).toBe("$5.5");
    expect(formatUsd(0.000004474, { price: true })).toBe("$0.0₅4474");
  });
  it("formats token amounts from base units", () => {
    expect(formatAmount(1234567890000000000000n, 18, 2)).toBe("1,234.56");
    expect(formatAmount("25000000", 6)).toBe("25");
  });
  it("formats misc", () => {
    expect(shortAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")).toBe("0xf39F…2266");
    expect(timeAgo(1000, 1000 + 7200)).toBe("2h");
    expect(bpsToPercent(250)).toBe("2.50%");
    expect(bpsToPercent(100)).toBe("1%");
  });
});
