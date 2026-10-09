import { AuthorizationError, requireAdmin } from "@/server/auth";
import { expireCapacityHolds } from "@/server/cake-capacity";
import { problem } from "@/server/http";

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.sub) return problem(403, "MISSING_SUBJECT", "Identified administrator required.");
    const expired = await expireCapacityHolds();
    return Response.json({ expired }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AuthorizationError) return problem(error.status, "AUTHORIZATION_FAILED", error.message);
    return problem(503, "EXPIRY_UNAVAILABLE", "Expired reservations could not be processed.");
  }
}
