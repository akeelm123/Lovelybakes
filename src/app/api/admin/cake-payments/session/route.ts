import { z } from "zod";
import { cakeTransactionalDatabaseReady } from "@/domain/cake-environment";
import { AuthorizationError, requireAdmin } from "@/server/auth";
import { prepareCakePaymentSession } from "@/server/cake-payment";
import { problem, safeJson } from "@/server/http";

const inputSchema = z.object({ requestId: z.uuid() }).strict();

export async function POST(request: Request) {
  if (process.env.CAKE_PAYMENT_WORKFLOW_ENABLED !== "true")
    return problem(503, "PAYMENT_WORKFLOW_DISABLED", "Cake payments are not enabled.");
  if (!cakeTransactionalDatabaseReady()) return problem(503, "STAGING_DATABASE_NOT_READY", "Cake payments require a configured transactional database.");
  try {
    const admin = await requireAdmin(request);
    if (!admin.sub) return problem(403, "MISSING_SUBJECT", "Identified administrator required.");
    const input = inputSchema.safeParse(await safeJson(request, 8192));
    if (!input.success) return problem(400, "INVALID_REQUEST", "A valid request ID is required.");
    const session = await prepareCakePaymentSession(input.data.requestId);
    return Response.json({ session }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AuthorizationError) return problem(error.status, "AUTHORIZATION_FAILED", error.message);
    const code = error instanceof Error ? error.message : "";
    if (["PAYMENT_NOT_ELIGIBLE", "HOLD_TOO_SHORT", "PAYMENT_SESSION_CONFLICT"].includes(code))
      return problem(409, code, "This request is no longer eligible for a payment session.");
    return problem(503, "PAYMENT_SESSION_UNAVAILABLE", "Payment session could not be created.");
  }
}
