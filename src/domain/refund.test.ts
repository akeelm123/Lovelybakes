import { describe, expect, it } from "vitest";
import { canRefund, refundRequestSchema } from "./refund";

describe("refund rules", () => {
  it("allows refundable test and live Stripe orders", () => {
    expect(canRefund("paid", "cs_test_123")).toBe(true);
    expect(canRefund("ready", "cs_test_123")).toBe(true);
    expect(canRefund("fulfilled", "cs_test_123")).toBe(false);
    expect(canRefund("paid", "cs_live_123")).toBe(true);
    expect(canRefund("paid", "uat_123")).toBe(false);
  });

  it("requires an exact, meaningful request", () => {
    expect(refundRequestSchema.safeParse({orderId:"5dc12d6a-4fe7-44b4-a7ea-c38a74242111",version:1,reason:"Customer requested cancellation"}).success).toBe(true);
    expect(refundRequestSchema.safeParse({orderId:"bad",version:1,reason:"x"}).success).toBe(false);
  });
});
