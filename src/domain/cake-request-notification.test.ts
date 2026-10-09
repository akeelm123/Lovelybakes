import { describe, expect, it } from "vitest";
import { renderCakeRequestMessage } from "./cake-request-notification";

const input = {
  customerName: "Test Customer",
  requestId: "abcdef12-3456-7890-1234-567890abcdef",
  requestedForDate: "2026-12-12",
  fulfilmentPreference: "collection" as const,
};

describe("cake request communications", () => {
  it("does not imply a submitted request is confirmed", () => {
    const message = renderCakeRequestMessage("request_received", input);
    expect(message.text).toContain("not yet a confirmed booking");
    expect(message.text).toContain("No payment is required now");
  });
  it("requires a valid quote and secure URL before creating a payment invitation", () => {
    expect(() => renderCakeRequestMessage("payment_invitation", input)).toThrow("VALID_PAYMENT_INVITATION_REQUIRED");
    expect(() => renderCakeRequestMessage("payment_invitation", { ...input, amountCents: 10000, paymentUrl: "http://example.com" })).toThrow();
    const message = renderCakeRequestMessage("payment_invitation", { ...input, amountCents: 10000, paymentUrl: "https://checkout.stripe.com/test" });
    expect(message.text).toContain("only confirmed after successful payment");
  });
  it("distinguishes confirmed payment from manual review", () => {
    expect(renderCakeRequestMessage("booking_confirmed", input).text).toContain("payment has been verified");
    expect(renderCakeRequestMessage("manual_review", input).text).toContain("not yet confirmed");
  });
  it("escapes customer supplied text in HTML", () => {
    const message = renderCakeRequestMessage("request_received", { ...input, customerName: "<script>alert(1)</script>" });
    expect(message.html).not.toContain("<script>");
    expect(message.html).toContain("&lt;script&gt;");
  });
});
