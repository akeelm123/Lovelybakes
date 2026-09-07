import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./order";

describe("checkoutSchema", () => {
  it("accepts a valid Singapore checkout request", () => {
    expect(checkoutSchema.safeParse({ checkoutRequestKey: "5fa3ca0c-7536-41a8-abef-0d857f86640e", customerName: "Sample Customer", customerEmail: "sample@example.test", customerPhone: "81234567", fulfilmentMethod: "collection", deliveryAddress: "", requestedForDate: "2026-10-01", orderNotes: "", paymentMethod: "visa", items: [{ productId: "a4b0f12c-bb15-4f41-88f1-3ed9963c5925", quantity: 1 }] }).success).toBe(true);
  });

  it("rejects unknown fields and empty carts", () => {
    expect(checkoutSchema.safeParse({ ...{ checkoutRequestKey: "5fa3ca0c-7536-41a8-abef-0d857f86640e", customerName: "Sample", customerEmail: "sample@example.test", customerPhone: "81234567", fulfilmentMethod: "collection", deliveryAddress: "", requestedForDate: "2026-10-01", orderNotes: "", paymentMethod: "visa", items: [{ productId: "a4b0f12c-bb15-4f41-88f1-3ed9963c5925", quantity: 1 }] }, customerName: "A", items: [], cardNumber: "4111111111111111" }).success).toBe(false);
  });
});
