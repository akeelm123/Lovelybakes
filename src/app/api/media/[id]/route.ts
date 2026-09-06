import { z } from "zod";
import { database } from "@/server/database";
import { currentAdmin } from "@/server/admin-session";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new Response(null, { status: 404 });
  try {
    const sql = database();
    const published = await sql`select product_id from product where product_image_id = ${id} and status = 'published' limit 1`;
    const sections = await sql`select site_content_id from site_content where published_content @> ${sql.json({ logoImage: `/api/media/${id}` })} or published_content @> ${sql.json({ heroImage: `/api/media/${id}` })} or published_content @> ${sql.json({ customImage: `/api/media/${id}` })} limit 1`;
    if (!published.length && !sections.length && !await currentAdmin()) return new Response(null, { status: 404 });
    const rows = await sql`select content from product_image where product_image_id = ${id}`;
    if (!rows.length) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(rows[0].content), { headers: { "Content-Type": "image/webp", "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" } });
  } catch { return new Response(null, { status: 503 }); }
}
