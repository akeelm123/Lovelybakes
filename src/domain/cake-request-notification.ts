export type CakeRequestMessageType = "request_received" | "payment_invitation" | "booking_confirmed" | "manual_review";

export type CakeRequestMessageInput = {
  customerName: string;
  requestId: string;
  requestedForDate: string;
  fulfilmentPreference: "collection" | "delivery";
  amountCents?: number;
  paymentUrl?: string;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]!));

export function renderCakeRequestMessage(type: CakeRequestMessageType, input: CakeRequestMessageInput) {
  if (type === "payment_invitation" && (!input.paymentUrl || !/^https:\/\//.test(input.paymentUrl) || !Number.isSafeInteger(input.amountCents) || (input.amountCents ?? 0) <= 0)) {
    throw new Error("VALID_PAYMENT_INVITATION_REQUIRED");
  }
  const reference = input.requestId.slice(0, 8).toUpperCase();
  const details = `Requested date: ${input.requestedForDate}\nFulfilment: ${input.fulfilmentPreference}`;
  const money = input.amountCents === undefined ? "" : new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(input.amountCents / 100);
  const messages: Record<CakeRequestMessageType, { subject: string; body: string }> = {
    request_received: {
      subject: "Lovely Bakes — we received your cake request",
      body: `We've received your cake request ${reference}. Our team will check the details and availability. This is not yet a confirmed booking. No payment is required now.\n\n${details}`,
    },
    payment_invitation: {
      subject: "Lovely Bakes — your approved cake quote",
      body: `Your cake request ${reference} has been reviewed. Your quote is ${money}. Please use the secure payment link below before it expires:\n${input.paymentUrl}\n\n${details}\n\nYour booking is only confirmed after successful payment and our confirmation message.`,
    },
    booking_confirmed: {
      subject: "Lovely Bakes — your cake booking is confirmed",
      body: `Your payment has been verified and cake booking ${reference} is confirmed.\n\n${details}\n\nWe will share any final collection or delivery arrangements separately.`,
    },
    manual_review: {
      subject: "Lovely Bakes — we're checking your cake payment",
      body: `We are reviewing the payment status for cake request ${reference}. Please do not make another payment until our team contacts you. Your booking is not yet confirmed.\n\n${details}`,
    },
  };
  const selected = messages[type];
  const text = `Hello ${input.customerName},\n\n${selected.body}\n\nLovely Bakes — Celebration Cakes`;
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#2c2725;background:#fffdf8;padding:24px"><h1 style="color:#b72c69;font-size:24px">${escapeHtml(selected.subject)}</h1><p>Hello ${escapeHtml(input.customerName)},</p><p style="white-space:pre-line">${escapeHtml(selected.body)}</p><p style="color:#b08a4a">Lovely Bakes — Celebration Cakes</p></div>`;
  return { subject: selected.subject, text, html };
}
