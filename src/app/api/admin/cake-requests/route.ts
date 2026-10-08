import { requireAdmin, AuthorizationError } from "@/server/auth";
import { database } from "@/server/database";
import { problem, safeJson } from "@/server/http";
import { z } from "zod";

const reviewSchema = z.object({ requestId: z.uuid(), status: z.enum(["reviewing", "declined"]), version: z.number().int().positive() }).strict();

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const rows = await database()`
      select r.cake_request_id as "requestId", r.customer_name as "customerName",
        r.customer_email as "customerEmail", r.customer_phone as "customerPhone",
        r.requested_for_date::text as "requestedForDate",
        r.fulfilment_preference as "fulfilmentPreference", r.occasion,
        r.cake_details as "cakeDetails", r.allergy_notes as "allergyNotes",
        r.status, r.version, r.created_at_utc as "createdAtUtc",
        c.slots as "heldSlots", c.state as "reservationState", c.expires_at_utc as "holdExpiresAtUtc",
        p.amount_cents as "quoteCents", p.state as "paymentState"
      from cake_request r
      left join cake_capacity_reservation c on c.cake_request_id=r.cake_request_id
      left join cake_request_payment p on p.cake_request_id=r.cake_request_id
      order by r.created_at_utc desc limit 100
    `;
    return Response.json({ requests: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AuthorizationError) return problem(error.status, "AUTHORIZATION_FAILED", error.message);
    return problem(503, "REQUESTS_UNAVAILABLE", "Requests cannot be loaded right now.");
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.sub) return problem(403, "MISSING_SUBJECT", "Identified administrator required.");
    let raw: unknown;
    try { raw = await safeJson(request, 8192); }
    catch { return problem(400, "INVALID_REQUEST", "A valid JSON request is required."); }
    const parsed = reviewSchema.safeParse(raw);
    if (!parsed.success) return problem(400, "INVALID_UPDATE", "Check the request, version and review status.");
    const { requestId, status, version } = parsed.data;
    // Reviewing or declining only. Approval and payment must use a separate capacity-checked workflow.
    const rows = await database()`
      update cake_request set status=${status}, version=version+1, updated_at_utc=now()
      where cake_request_id=${requestId} and version=${version}
        and (status='received' or (status='reviewing' and ${status}='declined'))
      returning cake_request_id as "requestId", status, version
    `;
    if (!rows[0]) return problem(409, "REVIEW_CONFLICT", "Request was already reviewed or changed. Refresh and try again.");
    return Response.json({ request: rows[0], bookingConfirmed: false }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AuthorizationError) return problem(error.status, "AUTHORIZATION_FAILED", error.message);
    return problem(503, "REVIEW_UNAVAILABLE", "Request review is temporarily unavailable.");
  }
}
