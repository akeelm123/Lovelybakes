import { requireAdmin, AuthorizationError } from "@/server/auth";
import { database } from "@/server/database";
import { problem } from "@/server/http";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const rows = await database()`
      select cake_request_id as "requestId", customer_name as "customerName",
        customer_email as "customerEmail", customer_phone as "customerPhone",
        requested_for_date::text as "requestedForDate",
        fulfilment_preference as "fulfilmentPreference", occasion,
        cake_details as "cakeDetails", allergy_notes as "allergyNotes",
        status, created_at_utc as "createdAtUtc"
      from cake_request order by created_at_utc desc limit 100
    `;
    return Response.json({ requests: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AuthorizationError) return problem(error.status, "AUTHORIZATION_FAILED", error.message);
    return problem(503, "REQUESTS_UNAVAILABLE", "Requests cannot be loaded right now.");
  }
}
