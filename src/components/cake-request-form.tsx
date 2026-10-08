"use client";

import { FormEvent, useState } from "react";

export function CakeRequestForm({ enabled }: { enabled: boolean }) {
  const [submissionKey, setSubmissionKey] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || busy) return;
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/cake-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionKey,
          customerName: data.get("customerName"),
          customerEmail: data.get("customerEmail"),
          customerPhone: data.get("customerPhone"),
          requestedForDate: data.get("requestedForDate"),
          fulfilmentPreference: data.get("fulfilmentPreference"),
          occasion: data.get("occasion"),
          cakeDetails: data.get("cakeDetails"),
          allergyNotes: data.get("allergyNotes"),
        }),
      });
      const result = await response.json();
      if (!response.ok || result.bookingConfirmed !== false || typeof result.requestId !== "string") {
        throw new Error(result.error?.message ?? "Your request could not be submitted.");
      }
      setRequestId(result.requestId);
      setSubmissionKey(crypto.randomUUID());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (requestId) return <section className="cake-request-success" role="status">
    <h2>Thank you — we’ve received your cake request.</h2>
    <p>Reference: <strong>{requestId}</strong></p>
    <p>We’ll review your details and availability before confirming anything. No booking or payment has been made.</p>
    <button type="button" className="secondary-button" onClick={() => setRequestId("")}>Start another request</button>
  </section>;

  return <form className="cake-request-form" onSubmit={submit}>
    <p className="cake-request-notice">This is an enquiry, not a confirmed booking. We will review availability and contact you before any payment is requested.</p>
    <div className="cake-request-fields">
      <label>Your name <input name="customerName" autoComplete="name" required maxLength={120} /></label>
      <label>Email <input name="customerEmail" type="email" autoComplete="email" required /></label>
      <label>Mobile number <input name="customerPhone" type="tel" autoComplete="tel" required /></label>
      <label>Celebration date <input name="requestedForDate" type="date" min={new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" })} required /></label>
      <label>Preferred fulfilment <select name="fulfilmentPreference" required defaultValue="collection"><option value="collection">Collection</option><option value="delivery">Delivery (subject to availability)</option></select></label>
      <label>Occasion (optional) <input name="occasion" maxLength={120} placeholder="Birthday, anniversary…" /></label>
      <label className="cake-request-wide">Tell us about your cake <textarea name="cakeDetails" required minLength={10} maxLength={3000} rows={5} placeholder="Size, servings, colours, flavours, design ideas and any special details…" /></label>
      <label className="cake-request-wide">Allergies or dietary considerations (optional) <textarea name="allergyNotes" maxLength={1000} rows={3} /></label>
    </div>
    {error && <p role="alert" className="field-error">{error}</p>}
    <button className="primary-button" type="submit" disabled={!enabled || busy}>{!enabled ? "Online requests opening soon" : busy ? "Sending request…" : "Submit Cake Request"}</button>
    {!enabled && <p>Online requests are not open yet. Please use the existing enquiry contact option until this service launches.</p>}
  </form>;
}
