export type CakePaymentState = "quoted" | "payment_pending" | "paid" | "expired" | "manual_review";
export type CapacityHoldState = "held" | "confirmed" | "released" | "expired";

export function paymentOutcome(input: {
  eventType: "checkout.session.completed" | "checkout.session.expired";
  paymentStatus: string;
  paymentState: CakePaymentState;
  holdState: CapacityHoldState;
  holdExpiresAtMs: number | null;
  nowMs: number;
}): "confirm" | "manual_review" | "expire_session" | "ignore" {
  if (input.eventType === "checkout.session.expired") {
    return input.paymentState === "payment_pending" ? "expire_session" : "ignore";
  }
  if (input.paymentStatus !== "paid") return "ignore";
  if (input.paymentState === "paid") return "ignore";
  if (input.paymentState !== "payment_pending" || input.holdState !== "held" ||
      input.holdExpiresAtMs === null || input.holdExpiresAtMs <= input.nowMs) {
    return "manual_review";
  }
  return "confirm";
}

export function checkoutExpirySeconds(holdExpiresAtMs: number, nowMs: number): number {
  if (holdExpiresAtMs - nowMs < 35 * 60_000) throw new Error("HOLD_TOO_SHORT");
  return Math.floor(Math.min(holdExpiresAtMs - 60_000, nowMs + 23 * 3600_000) / 1000);
}
