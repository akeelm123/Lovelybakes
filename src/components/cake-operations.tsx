"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type RequestItem = {
  requestId: string; customerName: string; customerEmail: string; customerPhone: string;
  requestedForDate: string; fulfilmentPreference: string; occasion: string;
  cakeDetails: string; allergyNotes: string; status: string; version: number;
  heldSlots: number | null; reservationState: string | null; holdExpiresAtUtc: string | null;
  quoteCents: number | null; paymentState: string | null;
};
type Week = { weekStartDate: string; slotLimit: number; paused: boolean; reservedSlots: number };

async function api(path: string, method = "GET", body?: object) {
  const response = await fetch(path, { method, headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message ?? payload.detail ?? "The operation could not be completed.");
  return payload;
}

export function CakeOperations() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [weekStartDate, setWeekStartDate] = useState("");
  const [slotLimit, setSlotLimit] = useState("2");
  const [paused, setPaused] = useState(false);
  const [slotsById, setSlotsById] = useState<Record<string, string>>({});
  const [quoteById, setQuoteById] = useState<Record<string, string>>({});
  const [paymentLinks, setPaymentLinks] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    const [requestResult, capacityResult] = await Promise.all([
      api("/api/admin/cake-requests"), api("/api/admin/cake-capacity")
    ]);
    setRequests(requestResult.requests ?? []);
    setWeeks(capacityResult.weeks ?? []);
  }, []);
  useEffect(() => {
    // Defer the initial fetch to an asynchronous callback rather than
    // synchronously triggering state changes in the effect body.
    const controller = new AbortController();
    const start = async () => {
      if (controller.signal.aborted) return;
      try { await load(); } catch (error) {
        if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : "Unable to load requests.");
      }
    };
    void start();
    return () => controller.abort();
  }, [load]);
  async function action(work: () => Promise<unknown>) {
    setBusy(true); setMessage("");
    try { await work(); await load(); setMessage("Saved."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save."); }
    finally { setBusy(false); }
  }
  return <main className="cake-operations">
    <header className="cake-operations-heading">
      <p className="eyebrow">Lovely Bakes studio</p>
      <h1>Cake requests & capacity</h1>
      <p>Internal review only. A request or capacity hold is not a confirmed booking.</p>
      <p><Link href="/admin">Back to product studio</Link></p>
    </header>
    <div className="cake-operations-actions">
      <button disabled={busy} onClick={() => action(async () => {})}>Refresh requests</button>
      <button disabled={busy} onClick={() => action(() => api("/api/admin/cake-capacity/expire", "POST"))}>Clear expired holds</button>
      {message && <p role="status">{message}</p>}
    </div>
    <section>
      <h2>Weekly capacity</h2>
      <form onSubmit={event => { event.preventDefault(); action(() => api("/api/admin/cake-capacity", "PUT", {
        weekStartDate, slotLimit: Number(slotLimit), paused
      })); }}>
        <label>Monday <input required type="date" value={weekStartDate} onChange={event => setWeekStartDate(event.target.value)} /></label>
        <label>Maximum slots <input required type="number" min="0" max="1000" value={slotLimit} onChange={event => setSlotLimit(event.target.value)} /></label>
        <label><input type="checkbox" checked={paused} onChange={event => setPaused(event.target.checked)} /> Pause new reservations</label>
        <button disabled={busy} type="submit">Save capacity</button>
      </form>
      <div className="cake-operations-table-wrap"><table><thead><tr><th>Week beginning</th><th>Limit</th><th>Reserved</th><th>Available</th><th>Status</th></tr></thead><tbody>
        {weeks.map(week => <tr key={week.weekStartDate}><td>{week.weekStartDate}</td><td>{week.slotLimit}</td><td>{week.reservedSlots}</td><td>{Math.max(0, week.slotLimit - week.reservedSlots)}</td><td>{week.paused ? "Paused" : "Open"}</td></tr>)}
      </tbody></table></div>
    </section>
    <section>
      <h2>Recent cake requests</h2>
      {requests.length === 0 && <p>No requests to display, or intake has not been enabled.</p>}
      {requests.map(item => <article key={item.requestId} className="cake-operations-request">
        <div><h3>{item.customerName} — {item.requestedForDate}</h3>
          <p>{item.customerEmail} · {item.customerPhone} · {item.fulfilmentPreference}</p>
          <p><strong>Status:</strong> {item.status} · <strong>Reservation:</strong> {item.reservationState ?? "None"} · <strong>Payment:</strong> {item.paymentState ?? "Not quoted"}</p>
          {item.holdExpiresAtUtc && <p>Hold expires: {new Date(item.holdExpiresAtUtc).toLocaleString("en-SG", { timeZone: "Asia/Singapore" })} SGT</p>}
          {item.quoteCents !== null && <p>Quote: S${(Number(item.quoteCents) / 100).toFixed(2)}</p>}
          <p><strong>Occasion:</strong> {item.occasion || "Not specified"}</p>
          <p><strong>Design:</strong> {item.cakeDetails}</p>
          {item.allergyNotes && <p><strong>Allergy notes:</strong> {item.allergyNotes}</p>}
        </div>
        <div className="cake-operations-buttons">
          {item.status === "received" && <button disabled={busy} onClick={() => action(() => api("/api/admin/cake-requests", "PATCH", {
            requestId: item.requestId, status: "reviewing", version: item.version
          }))}>Start review</button>}
          {["received", "reviewing"].includes(item.status) && <button disabled={busy} onClick={() => action(() => api("/api/admin/cake-requests", "PATCH", {
            requestId: item.requestId, status: "declined", version: item.version
          }))}>Decline request</button>}
          {item.status === "reviewing" && <>
            <label>Slots <input type="number" min="1" max="20" value={slotsById[item.requestId] ?? "1"}
              onChange={event => setSlotsById(prev => ({ ...prev, [item.requestId]: event.target.value }))} /></label>
            <button disabled={busy} onClick={() => action(() => api("/api/admin/cake-capacity/reserve", "POST", {
              requestId: item.requestId, version: item.version, slots: Number(slotsById[item.requestId] ?? "1")
            }))}>Approve & hold slots</button>
          </>}
          {item.status === "approved" && item.reservationState === "held" && (item.paymentState === null || item.paymentState === "quoted") && <>
            <label>Quote (SGD) <input type="number" min="1" step=".01" value={quoteById[item.requestId] ?? ""}
              onChange={event => setQuoteById(prev => ({ ...prev, [item.requestId]: event.target.value }))} /></label>
            <button disabled={busy || !quoteById[item.requestId]} onClick={() => action(() => api("/api/admin/cake-payments/quote", "POST", {
              requestId: item.requestId, amountCents: Math.round(Number(quoteById[item.requestId]) * 100)
            }))}>Save quote</button>
          </>}
          {item.paymentState === "quoted" && item.reservationState === "held" && <button disabled={busy} onClick={() => action(async () => {
            const result = await api("/api/admin/cake-payments/session", "POST", { requestId: item.requestId });
            if (result.session?.checkoutUrl) setPaymentLinks(prev => ({ ...prev, [item.requestId]: result.session.checkoutUrl }));
          })}>Create Stripe test payment link</button>}
          {paymentLinks[item.requestId] && <div className="cake-operations-payment-link">
            <p><strong>Payment link prepared — not sent to customer.</strong></p>
            <a href={paymentLinks[item.requestId]} target="_blank" rel="noopener noreferrer">Open payment link</a>
            <button disabled={busy} onClick={() => navigator.clipboard.writeText(paymentLinks[item.requestId]).then(() => setMessage("Link copied. Check the request and recipient before sharing.")).catch(() => setMessage("Unable to copy link."))}>Copy link</button>
          </div>}
        </div>
      </article>)}
    </section>
  </main>;
}
