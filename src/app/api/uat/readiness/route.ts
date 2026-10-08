import { databaseConfigured } from "@/server/database";
import { adminConfiguration } from "@/server/admin-session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return Response.json({ error: "Not available on production" }, { status: 404 });
  }
  const checks = {
    isolatedDatabaseConfigured: databaseConfigured(),
    administratorLoginConfigured: Boolean(adminConfiguration()),
    requestIntakeEnabled: process.env.CAKE_REQUEST_INTAKE_ENABLED === "true",
    capacityReservationsEnabled: process.env.CAKE_CAPACITY_RESERVATIONS_ENABLED === "true",
    paymentWorkflowEnabled: process.env.CAKE_PAYMENT_WORKFLOW_ENABLED === "true",
    stripeTestKeyConfigured: process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false,
    stripeWebhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    publicAppUrlConfigured: Boolean(process.env.PUBLIC_APP_URL),
  };
  const operational = checks.isolatedDatabaseConfigured && checks.administratorLoginConfigured &&
    checks.requestIntakeEnabled && checks.capacityReservationsEnabled;
  return Response.json({
    mode: "uat",
    operational,
    paymentTestingReady: operational && checks.paymentWorkflowEnabled &&
      checks.stripeTestKeyConfigured && checks.stripeWebhookConfigured,
    checks,
    note: "Configuration checks only; does not verify database migrations or Stripe webhook delivery.",
  }, { headers: { "Cache-Control": "no-store" } });
}
