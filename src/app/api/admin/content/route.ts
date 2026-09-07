import { requireAdmin, AuthorizationError } from "@/server/auth";
import { getSiteContent, saveSiteContent } from "@/server/site-content";
import { contentSaveSchema, type SiteContent } from "@/domain/site-content";
import { problem } from "@/server/http";
function failure(error: unknown) {
  if (error instanceof AuthorizationError) return problem(error.status, "AUTH_REQUIRED", error.message);
  if (error instanceof Error && error.message === "EDIT_CONFLICT") return problem(409, "EDIT_CONFLICT", "Content changed in another window. Reload before saving.");
  return problem(503, "CONTENT_UNAVAILABLE", "Content could not be loaded or saved. Check the database connection.");
}
export async function GET(request: Request) {
  try { await requireAdmin(request); return Response.json(await getSiteContent(), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return failure(error); }
}
export async function PUT(request: Request) {
  try {
    const actor = await requireAdmin(request);
    if (!actor.sub) return problem(403, "AUTH_REQUIRED", "Identified administrator required.");
    const parsed = contentSaveSchema.safeParse(await request.json());
    if (!parsed.success) return problem(400, "INVALID_CONTENT", "Complete every field. Use HTTPS links and uploaded or existing photographs.");
    const version = await saveSiteContent(parsed.data.content as SiteContent, parsed.data.version, parsed.data.publish, actor.sub);
    return Response.json({ version });
  } catch (error) { return failure(error); }
}
