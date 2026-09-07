import { requireAdmin, AuthorizationError } from "@/server/auth";
import { getProducts, saveProduct } from "@/server/products";
import { productInputSchema, productUpdateSchema } from "@/domain/product";
import { problem } from "@/server/http";

function failure(error: unknown) {
  if (error instanceof AuthorizationError) return problem(error.status, "AUTH_REQUIRED", error.message);
  if (error instanceof Error && error.message === "EDIT_CONFLICT") return problem(409, "EDIT_CONFLICT", "This product changed in another window. Reload it before saving.");
  if (error instanceof Error && error.message === "IMAGE_NOT_FOUND") return problem(400, "IMAGE_NOT_FOUND", "Upload the photograph again.");
  return problem(503, "CATALOG_UNAVAILABLE", "The catalog could not be saved or loaded. Check the database connection and try again.");
}
export async function GET(request: Request) {
  try { await requireAdmin(request); return Response.json({ products: await getProducts() }, { headers: { "Cache-Control": "no-store" } }); } catch (error) { return failure(error); }
}
async function save(request: Request, update: boolean) {
  try {
    const actor = await requireAdmin(request);
    if (!actor.sub) return problem(403, "AUTH_REQUIRED", "Identified administrator required.");
    let body: unknown;
    try { body = await request.json(); } catch { return problem(400, "INVALID_JSON", "Send a valid product."); }
    const parsed = (update ? productUpdateSchema : productInputSchema).safeParse(body);
    if (!parsed.success) return problem(400, "INVALID_PRODUCT", "Check the name, description, price and photograph fields.");
    const identity = update ? productUpdateSchema.parse(body) : undefined;
    const id = await saveProduct(parsed.data, actor.sub, identity?.id, identity?.version);
    return Response.json({ id }, { status: update ? 200 : 201 });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) { return save(request, false); }
export async function PATCH(request: Request) { return save(request, true); }
