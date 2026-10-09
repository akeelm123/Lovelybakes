import { databaseConfigured } from "@/server/database";
import { adminConfiguration } from "@/server/admin-session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return Response.json({ error: "Not available on production" }, { status: 404 });
  }
  const checks = {
    databaseConnectionSettingsPresent: databaseConfigured(),
    administratorLoginConfigured: Boolean(adminConfiguration()),
    requestIntakeEnabled: process.env.CAKE_REQUEST_INTAKE_ENABLED === "true",
    capacityReservationsEnabled: process.env.CAKE_CAPACITY_RESERVATIONS_ENABLED === "true",
    paymentWorkflowEnabled: process.env.CAKE_PAYMENT_WORKFLOW_ENABLED === "true",
    stripeTestKeyConfigured: process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false,
    stripeWebhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    publicAppUrlConfigured: Boolean(process.env.PUBLIC_APP_URL),
  };
  const operational = checks.databaseConnectionSettingsPresent && checks.administratorLoginConfigured &&
    checks.requestIntakeEnabled && checks.capacityReservationsEnabled;
  return Response.json({
    mode: "uat",
    operationalConfigurationPresent: operational,
    paymentTestingConfigurationPresent: operational && checks.paymentWorkflowEnabled &&
      checks.stripeTestKeyConfigured && checks.stripeWebhookConfigured,
    checks,
    note: "Configuration presence only. Does not verify database connectivity, isolation, migrations, authentication, webhook delivery, or end-to-end readiness.",
  }, { headers: { "Cache-Control": "no-store" } });
}
