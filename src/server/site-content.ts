import "server-only";
import { randomUUID } from "node:crypto";
import { database, databaseConfigured } from "./database";
import snapshot from "@/generated/public-snapshot.json";
import { defaultContent, siteContentSchema, type SiteContent } from "@/domain/site-content";
export async function getSiteContent() {
  if (!databaseConfigured()) return { content: siteContentSchema.parse(snapshot.content) as SiteContent, version: 0, publishedAt: null };
  const rows = await database()`select draft_content, version, published_at_utc from site_content where page_key = 'storefront'`;
  return { content: rows[0] ? siteContentSchema.parse(rows[0].draft_content) as SiteContent : defaultContent, version: rows[0]?.version ?? 0, publishedAt: rows[0]?.published_at_utc ?? null };
}
export async function publishedContent(): Promise<SiteContent> {
  if (!databaseConfigured()) return siteContentSchema.parse(snapshot.content) as SiteContent;
  const rows = await database()`select published_content from site_content where page_key = 'storefront'`;
  return rows[0]?.published_content ? siteContentSchema.parse(rows[0].published_content) as SiteContent : defaultContent;
}
export async function saveSiteContent(content: SiteContent, version: number, publish: boolean, actor: string) {
  const sql = database();
  return sql.begin(async (tx) => {
    for (const value of Object.values(content).filter((value) => value.startsWith("/api/media/"))) {
      const images = await tx`select product_image_id from product_image where product_image_id = ${value.split("/").pop()!}`;
      if (!images.length) throw new Error("IMAGE_NOT_FOUND");
    }
    const id = randomUUID();
    const rows = version === 0
      ? await tx`insert into site_content (site_content_id, page_key, draft_content, published_content, published_at_utc) values (${id}, 'storefront', ${tx.json(content)}, ${publish ? tx.json(content) : null}, ${publish ? new Date() : null}) on conflict (page_key) do nothing returning site_content_id, version`
      : await tx`update site_content set draft_content = ${tx.json(content)}, published_content = case when ${publish} then ${tx.json(content)} else published_content end, published_at_utc = case when ${publish} then now() else published_at_utc end, version = version + 1, updated_at_utc = now() where page_key = 'storefront' and version = ${version} returning site_content_id, version`;
    if (!rows.length) throw new Error("EDIT_CONFLICT");
    await tx`insert into administrator_event (administrator_event_id, actor_subject, action, resource_id) values (${randomUUID()}, ${actor}, ${publish ? 'content_published' : 'content_draft_saved'}, ${rows[0].site_content_id})`;
    return rows[0].version as number;
  });
}
