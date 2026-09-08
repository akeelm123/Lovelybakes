import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/server/admin-session";
import { operationalSummary } from "@/server/operations";
import { AdminHeader } from "@/components/admin-header";
export const dynamic = "force-dynamic";
export default async function Operations() {
  if (!await currentAdmin()) redirect("/admin/login");
  const summary = await operationalSummary().catch(() => null);
  const attention = summary ? summary.failedEmails + summary.overdueEmails + summary.pendingRefunds + summary.oldCheckouts : 0;
  return <><AdminHeader/><main className="admin-main">
    <div className="admin-heading"><div><h1>Operations</h1><p>Payment and email checks for the active Stripe mode. Refresh this page for the latest counts.</p></div></div>
    {!summary ? <p className="admin-message admin-error" role="alert">Operational checks are unavailable. Check database health before accepting more orders.</p> : <>
      <p className="admin-message" role="status">{attention ? `${attention} records need review across the checks below. A record may appear in more than one check.` : "No issues detected by these checks."}</p>
      <section className="admin-panel"><h2>Customer communications</h2><p>Failed emails: <strong>{summary.failedEmails}</strong></p><p>Emails pending over 15 minutes: <strong>{summary.overdueEmails}</strong></p><Link href="/admin/notifications">Review customer emails and retry failures</Link></section>
      <section className="admin-panel"><h2>Payments and refunds</h2><p>Refunds pending over 15 minutes: <strong>{summary.pendingRefunds}</strong></p><p>Unpaid checkouts older than 24 hours: <strong>{summary.oldCheckouts}</strong></p><p>Check the matching Stripe payment before retrying a refund. An old unpaid checkout needs investigation, not automatic fulfilment.</p><Link href="/admin/orders">Review orders</Link></section>
      <section className="admin-panel"><h2>Maintenance</h2><p>Expired rate-limit records eligible for cleanup: <strong>{summary.expiredBuckets}</strong></p><p>{process.env.CRON_SECRET ? "Daily cleanup authentication is configured. Check Vercel execution logs to confirm successful runs." : "Daily cleanup is awaiting its private authentication configuration."}</p><p>Each run removes up to 1,000 records expired for more than 24 hours.</p></section>
    </>}
    <p>These checks do not verify bank settlement, inbox placement, rejected webhooks, or backup recovery. External incident alerts are not configured by this page.</p>
  </main></>;
}
