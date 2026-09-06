import { storefrontCatalog } from "@/server/products";
export async function GET() {
  try { return Response.json({ ...await storefrontCatalog(), checkoutEnabled: false }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ error: "Catalog temporarily unavailable" }, { status: 503 }); }
}
