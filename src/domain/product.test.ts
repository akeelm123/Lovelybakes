import { describe, expect, it } from "vitest";
import { parsePrice, productInputSchema } from "./product";
const valid = { name: "Test cake", description: "A celebration cake", category: "Celebration", priceCents: 6800, imageUrl: "/lovelybakes/vintage-pink.jpg", imageAlt: "Pink cake", status: "draft", featured: false };
describe("product validation", () => {
  it("converts decimal prices without floating point rounding", () => {
    expect(parsePrice("68.01")).toBe(6801);
    expect(parsePrice("1.1")).toBe(110);
    for (const value of ["", "0", "-20", "2.999", "1e3", "10000.01"]) expect(parsePrice(value)).toBeNull();
  });
  it("rejects arbitrary image URLs, fractional cents and unknown status", () => {
    expect(productInputSchema.safeParse(valid).success).toBe(true);
    expect(productInputSchema.safeParse({ ...valid, imageUrl: "https://evil.example/image.svg" }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...valid, priceCents: 1.5 }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...valid, status: "live" }).success).toBe(false);
  });
});
