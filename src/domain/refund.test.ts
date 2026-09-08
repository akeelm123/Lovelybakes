import { describe, expect, it } from "vitest";
import { canRefund, refundRequestSchema } from "./refund";

describe("refund rules", () => {
  it.each(["paid", "preparing", "ready"])("allows %s orders in their active Stripe mode", status => {
    expect(canRefund(status, "cs_test_123", "test")).toBe(true);
    expect(canRefund(status, "cs_live_123", "live")).toBe(true);
    expect(canRefund(status, "cs_test_123", "live")).toBe(false);
    expect(canRefund(status, "cs_live_123", "test")).toBe(false);
    expect(canRefund(status, "cs_live_123", "disabled")).toBe(false);
  });

  it.each(["pending_payment", "fulfilled", "cancelled"])("rejects %s orders", status => {
    expect(canRefund(status, "cs_live_123", "live")).toBe(false);
  });

  it.each([null, "uat_123", "cs_live_", "cs_live_123 invalid"])("rejects invalid reference %s", reference => {
    expect(canRefund("paid", reference, "live")).toBe(false);
  });

  it("requires an exact, meaningful request", () => {
    expect(refundRequestSchema.safeParse({orderId:"5dc12d6a-4fe7-44b4-a7ea-c38a74242111",version:1,reason:"Customer requested cancellation"}).success).toBe(true);
    expect(refundRequestSchema.safeParse({orderId:"bad",version:1,reason:"x"}).success).toBe(false);
  });
});
