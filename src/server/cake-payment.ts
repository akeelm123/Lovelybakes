import "server-only";
import { database } from "@/server/database";
import type { CakePaymentEvent } from "@/domain/cake-payment";

// This service deliberately does not create or send payment links yet.
// It prepares approved amounts and reconciles signed Stripe webhook events.
export async function quoteCakeRequest(requestId: string, amountCents: number) {
  return database().begin(async tx => {
    const rows = await tx`
      select r.status, c.state, c.expires_at_utc as expires
      from cake_request r join cake_capacity_reservation c using (cake_request_id)
      where r.cake_request_id=${requestId} for update of r, c
    `;
    if (!rows[0] || rows[0].status !== "approved" || rows[0].state !== "held" || new Date(String(rows[0].expires)).getTime() <= Date.now())
      throw new Error("REQUEST_NOT_HELD");
    const quoted = await tx`
      insert into cake_request_payment(cake_request_id, amount_cents)
      values (${requestId}, ${amountCents})
      on conflict(cake_request_id) do update
        set amount_cents=excluded.amount_cents, updated_at_utc=now()
      where cake_request_payment.state='quoted'
      returning cake_request_id as "requestId", amount_cents as "amountCents", state
    `;
    if (!quoted[0]) throw new Error("QUOTE_LOCKED");
    return quoted[0];
  });
}

export async function reconcileCakePayment(event: CakePaymentEvent) {
  const requestId = event.session.client_reference_id;
  if (!requestId || event.session.metadata?.cakeRequestId !== requestId) throw new Error("PAYMENT_REFERENCE_MISMATCH");
  return database().begin(async tx => {
    const payment = await tx`
      select amount_cents as amount, stripe_session_id as session, state
      from cake_request_payment where cake_request_id=${requestId} for update
    `;
    if (!payment[0] || payment[0].session !== event.session.id ||
      Number(payment[0].amount) !== event.session.amount_total || event.session.currency !== "sgd")
      throw new Error("PAYMENT_MISMATCH");
    const prior = await tx`select stripe_event_id from cake_request_payment_event where stripe_event_id=${event.id}`;
    if (prior[0]) return "duplicate";
    const hold = await tx`
      select state, expires_at_utc as expires from cake_capacity_reservation
      where cake_request_id=${requestId} for update
    `;
    let outcome = "ignored";
    if (event.type === "checkout.session.completed" && event.session.payment_status === "paid") {
      const valid = hold[0]?.state === "held" && new Date(String(hold[0].expires)).getTime() > Date.now();
      if (valid && payment[0].state === "payment_pending") {
        await tx`update cake_capacity_reservation set state='confirmed', expires_at_utc=null, updated_at_utc=now() where cake_request_id=${requestId}`;
        await tx`update cake_request_payment set state='paid', paid_at_utc=now(), updated_at_utc=now() where cake_request_id=${requestId}`;
        outcome = "confirmed";
      } else {
        // Money may have been collected outside the valid hold. Never silently confirm.
        await tx`update cake_request_payment set state='manual_review', updated_at_utc=now() where cake_request_id=${requestId} and state<>'paid'`;
        outcome = "manual_review";
      }
    } else if (event.type === "checkout.session.expired" && payment[0].state === "payment_pending") {
      await tx`update cake_request_payment set state='expired', updated_at_utc=now() where cake_request_id=${requestId}`;
      if (hold[0]?.state === "held") await tx`update cake_capacity_reservation set state='released', updated_at_utc=now() where cake_request_id=${requestId}`;
      outcome = "expired";
    }
    await tx`
      insert into cake_request_payment_event(stripe_event_id, cake_request_id, event_type, outcome)
      values (${event.id}, ${requestId}, ${event.type}, ${outcome})
    `;
    return outcome;
  });
}
