import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const snapshot = JSON.parse(
  await readFile(new URL("../src/generated/public-snapshot.json", import.meta.url), "utf8"),
);
const sql = postgres(databaseUrl, { max: 1, ssl: "require" });

try {
  await sql`
    INSERT INTO site_content (
      site_content_id,
      page_key,
      draft_content,
      published_content,
      published_at_utc
    ) VALUES (
      ${randomUUID()},
      'storefront',
      ${sql.json(snapshot.content)},
      ${sql.json(snapshot.content)},
      now()
    )
    ON CONFLICT (page_key) DO NOTHING
  `;
  console.log("Public storefront content is present.");
} finally {
  await sql.end();
}
