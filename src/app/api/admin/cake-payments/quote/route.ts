import { AuthorizationError, requireAdmin } from "@/server/auth";
import { quoteCakeRequest } from "@/server/cake-payment";
import { quoteCakeRequestSchema } from "@/domain/cake-payment";
import { problem, safeJson } from "@/server/http";

export async function POST(request: Request) {
  if (process.env.CAKE_PAYMENT_WORKFLOW_ENABLED !== "true")
    return problem(503, "PAYMENT_WORKFLOW_DISABLED", "The cake payment workflow is not enabled.");
  try {
    const admin = await requireAdmin(request);
    if (!admin.sub) return problem(403, "MISSING_SUBJECT", "Identified administrator required.");
    const input = quoteCakeRequestSchema.safeParse(await safeJson(request, 8192));
    if (!input.success) return problem(400, "INVALID_QUOTE", "Provide a valid request and amount in Singapore cents.");
    return Response.json({ quote: await quoteCakeRequest(input.data.requestId, input.data.amountCents), paymentLinkSent: false, bookingConfirmed: false });
  } catch (error) {
    if (error instanceof AuthorizationError) return problem(error.status, "AUTHORIZATION_FAILED", error.message);
    const code = error instanceof Error ? error.message : "";
    if (["REQUEST_NOT_HELD", "QUOTE_LOCKED"].includes(code)) return problem(409, code, "The request is not eligible for quoting.");
    return problem(503, "QUOTE_UNAVAILABLE", "The quote could not be saved.");
  }
}
