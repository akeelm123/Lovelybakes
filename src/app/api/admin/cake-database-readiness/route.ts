import { AuthorizationError, requireAdmin } from "@/server/auth";
import { database } from "@/server/database";
import { problem } from "@/server/http";

export const dynamic = "force-dynamic";

// Admin-only, read-only schema probe. No credentials, connection strings,
// customer data or table contents are returned to the browser.
const requiredTables = [
  "cake_request",
  "cake_capacity_week",
  "cake_capacity_reservation",
  "cake_request_payment",
  "cake_request_payment_event",
  "cake_request_notification",
] as const;

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    if (process.env.UAT_DATABASE_FALLBACK === "snapshot") {
      return Response.json({
        schemaReady: false,
        databaseConnected: false,
        reason: "SNAPSHOT_FALLBACK_ACTIVE",
        note: "Disable snapshot fallback only after confirming an isolated staging database.",
      }, { headers: { "Cache-Control": "no-store" } });
    }
    if (!process.env.DATABASE_URL) {
      return Response.json({
        schemaReady: false,
        databaseConnected: false,
        reason: "DATABASE_URL_MISSING",
      }, { headers: { "Cache-Control": "no-store" } });
    }
    const rows = await database()`
      select table_name as name from information_schema.tables
      where table_schema = current_schema()
        and table_name in (
          'cake_request', 'cake_capacity_week', 'cake_capacity_reservation',
          'cake_request_payment', 'cake_request_payment_event',
          'cake_request_notification'
        )
    `;
    const present = new Set(rows.map(row => String(row.name)));
    const migrations = requiredTables.map(table => ({ table, present: present.has(table) }));
    return Response.json({
      schemaReady: migrations.every(item => item.present),
      databaseConnected: true,
      schemaChecks: migrations,
      note: "Schema presence only; not proof of database isolation, migration correctness, webhook or concurrency safety.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AuthorizationError) return problem(error.status, "AUTHORIZATION_FAILED", error.message);
    return problem(503, "STAGING_DATABASE_UNAVAILABLE", "The staging database could not be checked.");
  }
}
