import { requireAdmin, AuthorizationError } from "@/server/auth";
import { orderingRuleSchema } from "@/domain/ordering";
import { getOrderingRule, saveOrderingRule } from "@/server/ordering";
import { problem, safeJson } from "@/server/http";
function fail(error: unknown) { if (error instanceof AuthorizationError) return problem(error.status,"AUTH_REQUIRED",error.message); if (error instanceof Error && error.message === "EDIT_CONFLICT") return problem(409,"EDIT_CONFLICT","Ordering rules changed in another window. Reload before saving."); return problem(503,"ORDERING_UNAVAILABLE","Ordering rules are temporarily unavailable."); }
export async function GET(request: Request) { try { await requireAdmin(request); return Response.json({ rule: await getOrderingRule() }, { headers: { "Cache-Control":"no-store" } }); } catch(error) { return fail(error); } }
export async function PUT(request: Request) { try { const actor=await requireAdmin(request); if(!actor.sub) return problem(403,"AUTH_REQUIRED","Identified administrator required."); const parsed=orderingRuleSchema.safeParse(await safeJson(request)); if(!parsed.success) return problem(400,"INVALID_RULES","Check fulfilment methods, fees, dates and instructions."); return Response.json({ version:await saveOrderingRule(parsed.data,actor.sub) }); } catch(error) { return fail(error); } }
