import { cakeRequestSchema } from "@/domain/cake-request";
import { cakeTransactionalDatabaseReady } from "@/domain/cake-environment";
import { createCakeRequest } from "@/server/cake-requests";
import { allowRequest, requestKey } from "@/server/rate-limit";
import { problem, safeJson } from "@/server/http";

export async function POST(request: Request) {
  // Explicitly opt in only after migration, operations and admin review are ready.
  if (process.env.CAKE_REQUEST_INTAKE_ENABLED !== "true") {
    return problem(503, "REQUESTS_NOT_OPEN", "Cake requests are not open online yet.");
  }
  if (!cakeTransactionalDatabaseReady()) return problem(503, "STAGING_DATABASE_NOT_READY", "Cake requests are temporarily unavailable.");
  try {
    if (!await allowRequest(`cake-request:${requestKey(request)}`, 5, 60_000)) {
      return problem(429, "RATE_LIMITED", "Please wait before sending another request.");
    }
    let raw: unknown;
    try { raw = await safeJson(request, 16_384); }
    catch { return problem(400, "INVALID_REQUEST", "A valid JSON request is required."); }
    const parsed = cakeRequestSchema.safeParse(raw);
    if (!parsed.success) return problem(400, "INVALID_REQUEST", "Check the contact, date and cake details.");
    // No Stripe session or order is created here. Availability and price are NOT confirmed.
    const id = await createCakeRequest(parsed.data);
    return Response.json({ requestId: id, status: "received", bookingConfirmed: false, paymentRequiredNow: false }, {
      status: 201, headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return problem(503, "REQUEST_UNAVAILABLE", "We could not receive your request. Please try again later.");
  }
}
