import { AuthorizationError, requireAdmin } from "@/server/auth";
import { configureCapacity } from "@/server/cake-capacity";
import { configureCapacitySchema } from "@/domain/cake-capacity";
import { problem, safeJson } from "@/server/http";

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.sub) return problem(403, "MISSING_SUBJECT", "Identified administrator required.");
    const parsed = configureCapacitySchema.safeParse(await safeJson(request, 8192));
    if (!parsed.success) return problem(400, "INVALID_CAPACITY", "Provide a Monday, slot limit and pause setting.");
    return Response.json({ capacity: await configureCapacity(parsed.data) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AuthorizationError) return problem(error.status, "AUTHORIZATION_FAILED", error.message);
    if (error instanceof Error && error.message === "WEEK_MUST_START_MONDAY") return problem(400, "INVALID_WEEK", "The week must start on Monday.");
    return problem(503, "CAPACITY_UNAVAILABLE", "Capacity settings could not be saved.");
  }
}
