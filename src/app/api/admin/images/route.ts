import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { requireAdmin, AuthorizationError } from "@/server/auth";
import { database } from "@/server/database";
import { problem } from "@/server/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const actor = await requireAdmin(request);
    if (!actor.sub) return problem(403, "AUTH_REQUIRED", "Identified administrator required.");
    const chunks: Uint8Array[] = [];
    const reader = request.body?.getReader();
    if (!reader) return problem(400, "NO_IMAGE", "Choose a photograph.");
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > 5 * 1024 * 1024) { await reader.cancel(); return problem(413, "IMAGE_TOO_LARGE", "Choose a photo smaller than 5 MB."); }
      chunks.push(value);
    }
    let output: Buffer;
    try {
      const source = Buffer.concat(chunks);
      const image = sharp(source, { limitInputPixels: 24000000, animated: false });
      const metadata = await image.metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format ?? "") || (metadata.pages ?? 1) > 1) throw new Error("INVALID_IMAGE");
      output = await image.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
      if (output.length > 2097152) return problem(413, "IMAGE_TOO_LARGE", "Choose a smaller photograph.");
    } catch { return problem(400, "INVALID_IMAGE", "Choose a valid JPG, PNG or WebP photograph."); }
    const id = randomUUID();
    const sql = database();
    await sql.begin(async (tx) => {
      await tx`insert into product_image (product_image_id, content, content_type) values (${id}, ${output}, 'image/webp')`;
      await tx`insert into administrator_event (administrator_event_id, actor_subject, action, resource_id) values (${randomUUID()}, ${actor.sub!}, 'image_uploaded', ${id})`;
    });
    return Response.json({ imageUrl: `/api/media/${id}` }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) return problem(error.status, "AUTH_REQUIRED", error.message);
    return problem(503, "UPLOAD_FAILED", "The photo could not be stored. Try again.");
  }
}
