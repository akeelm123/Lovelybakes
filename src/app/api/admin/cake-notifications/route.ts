import { AuthorizationError, requireAdmin } from "@/server/auth";
import { database } from "@/server/database";
import { problem } from "@/server/http";

export const dynamic = "force-dynamic";

// Read-only monitoring endpoint. Deliberately no send/retry mutation until
// delivery safety, provider credentials and staging integration tests pass.
export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const rows = await database()`
      select n.notification_id as "notificationId", n.cake_request_id as "requestId",
        n.message_type as "messageType", n.status, n.attempt_count as "attemptCount",
        n.created_at_utc as "createdAtUtc", n.sent_at_utc as "sentAtUtc",
        n.last_error_code as "lastErrorCode"
      from cake_request_notification n
      order by n.created_at_utc desc
      limit 100
    `;
    return Response.json({ notifications: rows, deliveryEnabled: false }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) return problem(error.status, "AUTHORIZATION_FAILED", error.message);
    return problem(503, "NOTIFICATIONS_UNAVAILABLE", "Cake notification records are unavailable. Check the isolated database and migration 016.");
  }
}
