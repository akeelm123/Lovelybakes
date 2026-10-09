import { describe, expect, it } from "vitest";
import { checkoutExpirySeconds, paymentOutcome } from "./cake-payment-policy";

const now = Date.UTC(2026, 9, 8, 12);
const base = {
  eventType: "checkout.session.completed" as const,
  paymentStatus: "paid",
  paymentState: "payment_pending" as const,
  holdState: "held" as const,
  holdExpiresAtMs: now + 48 * 3600_000,
  nowMs: now,
};

describe("cake payment confirmation policy", () => {
  it("confirms a paid checkout only with an active hold", () => {
    expect(paymentOutcome(base)).toBe("confirm");
  });
  it("requires manual review for late payments", () => {
    expect(paymentOutcome({ ...base, holdExpiresAtMs: now })).toBe("manual_review");
  });
  it("requires manual review if the hold was released", () => {
    expect(paymentOutcome({ ...base, holdState: "released" })).toBe("manual_review");
  });
  it("does not confirm unpaid checkout completions", () => {
    expect(paymentOutcome({ ...base, paymentStatus: "unpaid" })).toBe("ignore");
  });
  it("sends paid sessions with no capacity hold to manual review", () => {
    expect(paymentOutcome({ ...base, holdState: "expired", holdExpiresAtMs: null })).toBe("manual_review");
  });
  it("sends paid sessions in an unexpected payment state to manual review", () => {
    expect(paymentOutcome({ ...base, paymentState: "quoted" })).toBe("manual_review");
  });
  it("sends paid sessions already marked for manual review back to manual review", () => {
    expect(paymentOutcome({ ...base, paymentState: "manual_review" })).toBe("manual_review");
  });
  it("does not reconfirm paid requests", () => {
    expect(paymentOutcome({ ...base, paymentState: "paid" })).toBe("ignore");
  });
  it("expires a payment session without expiring the separate capacity hold", () => {
    expect(paymentOutcome({ ...base, eventType: "checkout.session.expired" })).toBe("expire_session");
  });
  it("ignores duplicate expiry for a session already marked expired", () => {
    expect(paymentOutcome({ ...base, eventType: "checkout.session.expired", paymentState: "expired" })).toBe("ignore");
  });
  it("ignores repeated expiry after payment has been confirmed", () => {
    expect(paymentOutcome({ ...base, eventType: "checkout.session.expired", paymentState: "paid" })).toBe("ignore");
  });
});

describe("Stripe checkout expiry", () => {
  it("caps session lifetime below 24 hours", () => {
    expect(checkoutExpirySeconds(now + 48 * 3600_000, now)).toBe(Math.floor((now + 23 * 3600_000) / 1000));
  });
  it("ends a session before the hold expires", () => {
    expect(checkoutExpirySeconds(now + 2 * 3600_000, now)).toBe(Math.floor((now + 2 * 3600_000 - 60_000) / 1000));
  });
  it("rejects the boundary at exactly 34 minutes before hold expiry", () => {
    expect(() => checkoutExpirySeconds(now + 34 * 60_000, now)).toThrow("HOLD_TOO_SHORT");
  });
  it("rejects holds too close to expiry", () => {
    expect(() => checkoutExpirySeconds(now + 20 * 60_000, now)).toThrow("HOLD_TOO_SHORT");
  });
});
