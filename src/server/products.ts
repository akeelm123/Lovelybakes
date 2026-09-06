import "server-only";
import { randomUUID } from "node:crypto";
import { database, databaseConfigured } from "./database";
import type { ManagedProduct, ProductInput } from "@/domain/product";
import snapshot from "@/generated/public-snapshot.json";

export async function getProducts(publishedOnly = false): Promise<ManagedProduct[]> {
  const sql = database();
  const rows = await sql`select product_id as id, name, description, category, price_cents as "priceCents", image_path as "imageUrl", image_alternative_text as "imageAlt", status, featured, version from product where (${publishedOnly} = false or status = 'published') order by featured desc, created_at_utc desc`;
  return rows.map((row) => ({ ...row, currency: "SGD" })) as ManagedProduct[];
}
export async function storefrontCatalog() {
  if (!databaseConfigured()) return { products: snapshot.products as ManagedProduct[], preview: false };
  return { products: await getProducts(true), preview: process.env.UAT_MODE === "true" };
}
export async function saveProduct(input: ProductInput, actor: string, id: string = randomUUID(), version?: number) {
  const sql = database();
  return sql.begin(async (tx) => {
    const imageId = input.imageUrl.startsWith("/api/media/") ? input.imageUrl.split("/").pop()! : null;
    if (imageId) {
      const images = await tx`select product_image_id from product_image where product_image_id = ${imageId}`;
      if (!images.length) throw new Error("IMAGE_NOT_FOUND");
    }
    if (version !== undefined) {
      const rows = await tx`update product set name = ${input.name}, description = ${input.description}, category = ${input.category}, price_cents = ${input.priceCents}, image_path = ${input.imageUrl}, product_image_id = ${imageId}, image_alternative_text = ${input.imageAlt}, status = ${input.status}, featured = ${input.featured}, version = version + 1, updated_at_utc = now() where product_id = ${id} and version = ${version} returning product_id`;
      if (!rows.length) throw new Error("EDIT_CONFLICT");
    } else {
      await tx`insert into product (product_id, name, description, category, price_cents, image_path, product_image_id, image_alternative_text, status, featured) values (${id}, ${input.name}, ${input.description}, ${input.category}, ${input.priceCents}, ${input.imageUrl}, ${imageId}, ${input.imageAlt}, ${input.status}, ${input.featured})`;
    }
    await tx`insert into administrator_event (administrator_event_id, actor_subject, action, resource_id) values (${randomUUID()}, ${actor}, ${version === undefined ? 'product_created' : 'product_updated'}, ${id})`;
    return id;
  });
}
