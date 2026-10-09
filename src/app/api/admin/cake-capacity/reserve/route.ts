import { AuthorizationError, requireAdmin } from "@/server/auth";
import { reserveCakeCapacity } from "@/server/cake-capacity";
import { reserveCapacitySchema } from "@/domain/cake-capacity";
import { problem, safeJson } from "@/server/http";

export async function POST(request: Request) {
  // No payment link or customer confirmation is issued here.
  if (process.env.CAKE_CAPACITY_RESERVATIONS_ENABLED !== "true") {
    return problem(503, "RESERVATIONS_DISABLED", "Capacity reservations are not enabled.");
  }
  try {
    const admin = await requireAdmin(request);
    if (!admin.sub) return problem(403, "MISSING_SUBJECT", "Identified administrator required.");
    const parsed = reserveCapacitySchema.safeParse(await safeJson(request, 8192));
    if (!parsed.success) return problem(400, "INVALID_RESERVATION", "Check the request, slots and version.");
    return Response.json({ hold: await reserveCakeCapacity(parsed.data) }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AuthorizationError) return problem(error.status, "AUTHORIZATION_FAILED", error.message);
    const code = error instanceof Error ? error.message : "";
    if (["REQUEST_NOT_FOUND","REQUEST_CHANGED","CAPACITY_CLOSED","CAPACITY_FULL","ALREADY_RESERVED"].includes(code))
      return problem(409, code, "The request or available capacity has changed. Refresh before retrying.");
    return problem(503, "RESERVATION_UNAVAILABLE", "The slot could not be held.");
  }
}
