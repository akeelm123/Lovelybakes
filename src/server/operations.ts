import "server-only";
import { database } from "./database";

export async function operationalSummary() {
  const mode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "cs_live_%" : "cs_test_%";
  const rows = await database()`
    select
      (select count(*)::int from customer_notification n join customer_order o using(customer_order_id)
       where o.payment_provider_reference like ${mode} and n.delivery_status='failed') as "failedEmails",
      (select count(*)::int from customer_notification n join customer_order o using(customer_order_id)
       where o.payment_provider_reference like ${mode} and n.delivery_status='pending'
       and n.created_at_utc < now()-interval '15 minutes') as "overdueEmails",
      (select count(*)::int from payment_refund r join customer_order o using(customer_order_id)
       where o.payment_provider_reference like ${mode} and r.status='pending'
       and r.created_at_utc < now()-interval '15 minutes') as "pendingRefunds",
      (select count(*)::int from customer_order where payment_provider_reference like ${mode}
       and status='pending_payment' and created_at_utc < now()-interval '24 hours') as "oldCheckouts",
      (select count(*)::int from api_rate_limit_bucket
       where reset_at_utc < now()-interval '24 hours') as "expiredBuckets"`;
  return rows[0] as {failedEmails:number;overdueEmails:number;pendingRefunds:number;oldCheckouts:number;expiredBuckets:number};
}

export async function cleanupExpiredRateLimits() {
  const rows = await database()`
    with expired as (
      select api_rate_limit_bucket_id from api_rate_limit_bucket
      where reset_at_utc < now()-interval '24 hours'
      order by reset_at_utc limit 1000 for update skip locked
    )
    delete from api_rate_limit_bucket b using expired e
    where b.api_rate_limit_bucket_id=e.api_rate_limit_bucket_id
      and b.reset_at_utc < now()-interval '24 hours'
    returning b.api_rate_limit_bucket_id`;
  return rows.length;
}
