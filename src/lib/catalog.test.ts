import { describe, expect, it } from "vitest";
import { formatPrice, sampleProducts } from "./catalog";

describe("catalog", () => {
  it("uses unique sample identifiers", () => {
    expect(new Set(sampleProducts.map((product) => product.id)).size).toBe(sampleProducts.length);
  });

  it("formats Singapore dollar prices", () => {
    expect(formatPrice(6800)).toContain("68.00");
  });
});
