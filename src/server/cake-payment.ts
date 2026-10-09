import "server-only";
import { database } from "@/server/database";
import { enqueueVerifiedCakeBookingConfirmation } from "@/server/cake-request-notifications";
import { stripeClient, paymentsEnabled } from "@/server/payments";
import type { CakePaymentEvent } from "@/domain/cake-payment";
import { checkoutExpirySeconds, paymentOutcome, type CakePaymentState, type CapacityHoldState } from "@/domain/cake-payment-policy";

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


export async function prepareCakePaymentSession(requestId: string) {
  if (!paymentsEnabled()) throw new Error("PAYMENTS_DISABLED");
  // New cake payments are test-only until a separate production release is approved.
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) throw new Error("CAKE_PAYMENT_TEST_MODE_ONLY");
  if (process.env.CAKE_PAYMENT_WORKFLOW_ENABLED !== "true") throw new Error("WORKFLOW_DISABLED");
  const sql = database();
  const rows = await sql`
    select p.amount_cents as amount, p.state, p.stripe_session_id as session,
      r.customer_email as email, r.status as request_status,
      c.state as hold_state, c.expires_at_utc as hold_expires
    from cake_request_payment p
    join cake_request r using (cake_request_id)
    join cake_capacity_reservation c using (cake_request_id)
    where p.cake_request_id=${requestId}
  `;
  const row = rows[0];
  if (!row || row.state !== "quoted" || row.request_status !== "approved" || row.hold_state !== "held" || row.session)
    throw new Error("PAYMENT_NOT_ELIGIBLE");
  const holdExpires = new Date(String(row.hold_expires)).getTime();
  const now = Date.now();

  const baseUrl = process.env.PUBLIC_APP_URL;
  if (!baseUrl) throw new Error("PUBLIC_APP_URL_NOT_CONFIGURED");
  // Stripe Checkout Sessions cannot remain open for 48 hours. Keep the slot
  // hold at 48 hours, but expire this Checkout Session within 23 hours.
  const expiresAt = checkoutExpirySeconds(holdExpires, now);
  const session = await stripeClient().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: requestId,
    customer_email: String(row.email),
    metadata: { cakeRequestId: requestId },
    expires_at: expiresAt,
    success_url: `${baseUrl}/request/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/bespoke?payment=cancelled`,
    line_items: [{ quantity: 1, price_data: {
      currency: "sgd", unit_amount: Number(row.amount),
      product_data: { name: "Approved Lovely Bakes cake request" },
    } }],
  }, { idempotencyKey: `cake-payment-${requestId}-${row.amount}` });
  // If another admin already attached a session, do not expose this session.
  const attached = await sql`
    update cake_request_payment p set stripe_session_id=${session.id},
      state='payment_pending', updated_at_utc=now()
    from cake_capacity_reservation c
    where p.cake_request_id=${requestId} and c.cake_request_id=p.cake_request_id
      and p.state='quoted' and p.stripe_session_id is null
      and c.state='held' and c.expires_at_utc > now() + interval '1 minute'
    returning p.cake_request_id
  `;
  if (!attached[0]) {
    const current = await sql`select stripe_session_id as id, state from cake_request_payment where cake_request_id=${requestId}`;
    // Concurrent retries may have attached this exact idempotent Stripe session.
    // Never expire a session another administrator successfully attached.
    if (current[0]?.id !== session.id || current[0]?.state !== "payment_pending") {
      if (current[0]?.id !== session.id) await stripeClient().checkout.sessions.expire(session.id).catch(() => undefined);
      throw new Error("PAYMENT_SESSION_CONFLICT");
    }
  }
  // The URL is for the authenticated administrator only; sending is a separate action.
  return { requestId, sessionId: session.id, checkoutUrl: session.url, expiresAt, linkSent: false, bookingConfirmed: false };
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
    const decision = paymentOutcome({
      eventType: event.type,
      paymentStatus: event.session.payment_status,
      paymentState: String(payment[0].state) as CakePaymentState,
      holdState: String(hold[0]?.state ?? "released") as CapacityHoldState,
      holdExpiresAtMs: hold[0]?.expires ? new Date(String(hold[0].expires)).getTime() : null,
      nowMs: Date.now(),
    });
    if (decision === "confirm") {
        // The reservation must still be held at the moment of the SQL write.
        // This prevents confirmation after an expiry worker has released it.
        const confirmed = await tx`
          update cake_capacity_reservation set state='confirmed', expires_at_utc=null, updated_at_utc=now()
          where cake_request_id=${requestId} and state='held' and expires_at_utc > now()
          returning reservation_id
        `;
        if (!confirmed[0]) {
          await tx`update cake_request_payment set state='manual_review', updated_at_utc=now() where cake_request_id=${requestId}`;
          outcome = "manual_review";
        } else {
          await tx`update cake_request_payment set state='paid', paid_at_utc=now(), updated_at_utc=now() where cake_request_id=${requestId}`;
          await enqueueVerifiedCakeBookingConfirmation(tx, requestId);
          outcome = "confirmed";
        }
    } else if (decision === "manual_review") {
      // A paid checkout without a valid hold is an exception, not a booking.
      await tx`update cake_request_payment set state='manual_review', updated_at_utc=now() where cake_request_id=${requestId} and state<>'paid'`;
      outcome = "manual_review";
    } else if (decision === "expire_session") {
      await tx`update cake_request_payment set state='expired', updated_at_utc=now() where cake_request_id=${requestId}`;
      outcome = "session_expired_hold_retained";
    }
    await tx`
      insert into cake_request_payment_event(stripe_event_id, cake_request_id, event_type, outcome)
      values (${event.id}, ${requestId}, ${event.type}, ${outcome})
    `;
    return outcome;
  });
}

