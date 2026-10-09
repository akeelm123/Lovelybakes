import "server-only";
import { randomUUID } from "node:crypto";
import type postgres from "postgres";
import { database } from "@/server/database";

// This outbox deliberately has no automatic sender. Enqueueing does not send
// messages, confirm bookings, or change payment/capacity state.
export async function enqueueCakeRequestReceipt(sql: postgres.TransactionSql, requestId: string) {
  const rows = await sql`
    insert into cake_request_notification (notification_id, cake_request_id, message_type, recipient_email)
    select ${randomUUID()}, r.cake_request_id, 'request_received', r.customer_email
    from cake_request r where r.cake_request_id=${requestId}
    on conflict (cake_request_id, message_type) do nothing
    returning notification_id
  `;
  return rows.length > 0;
}

export async function enqueueVerifiedCakeBookingConfirmation(sql: postgres.TransactionSql, requestId: string) {
  // Check both authoritative records within the caller's transaction.
  // This must be invoked only after the signed payment webhook reconciles.
  const rows = await sql`
    insert into cake_request_notification (notification_id, cake_request_id, message_type, recipient_email)
    select ${randomUUID()}, r.cake_request_id, 'booking_confirmed', r.customer_email
    from cake_request r
    join cake_request_payment p on p.cake_request_id=r.cake_request_id
    join cake_capacity_reservation c on c.cake_request_id=r.cake_request_id
    where r.cake_request_id=${requestId}
      and r.status='approved' and p.state='paid' and c.state='confirmed'
    on conflict (cake_request_id, message_type) do nothing
    returning notification_id
  `;
  return rows.length > 0;
}

export async function cakeRequestNotificationCounts() {
  const rows = await database()`
    select status, count(*)::int as count from cake_request_notification
    group by status
  `;
  return rows.map(row => ({ status: String(row.status), count: Number(row.count) }));
}

export async function enqueueCakeManualReview(sql: postgres.TransactionSql, requestId: string) {
  // A payment exception is not a booking. Enqueue only when the payment
  // record is in manual review; never send automatically.
  const rows = await sql`
    insert into cake_request_notification (notification_id, cake_request_id, message_type, recipient_email)
    select ${randomUUID()}, r.cake_request_id, 'manual_review', r.customer_email
    from cake_request r
    join cake_request_payment p on p.cake_request_id=r.cake_request_id
    where r.cake_request_id=${requestId} and p.state='manual_review'
    on conflict (cake_request_id, message_type) do nothing
    returning notification_id
  `;
  return rows.length > 0;
}
