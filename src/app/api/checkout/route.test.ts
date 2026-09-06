import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { POST } from "./route";

const valid = { checkoutRequestKey: "5fa3ca0c-7536-41a8-abef-0d857f86640e", customerName: "Sample", customerEmail: "sample@example.test", customerPhone: "81234567", fulfilmentMethod: "collection", deliveryAddress: "", requestedForDate: "2026-10-01", orderNotes: "", paymentMethod: "visa", items: [{ productId: "a4b0f12c-bb15-4f41-88f1-3ed9963c5925", quantity: 1 }] };
function request(body: unknown) {
  return new Request("http://localhost/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}
describe("checkout boundary", () => {
  it("does not create chargeable orders from the sample catalog", async () => {
    const result = await POST(request(valid));
    expect(result.status).toBe(503);
    expect((await result.json()).error.code).toBe("CHECKOUT_UNAVAILABLE");
  });
  it("rejects client-supplied prices", async () => {
    expect((await POST(request({ ...valid, items: [{ productId: "sample-pandan", quantity: 1, price: 1 }] }))).status).toBe(400);
  });
  it("rejects malformed JSON", async () => {
    expect((await POST(new Request("http://localhost/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }))).status).toBe(400);
  });
});
