import "server-only";
import postgres from "postgres";

let client: ReturnType<typeof postgres> | undefined;

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_NOT_CONFIGURED");
  client ??= postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 10, ssl: ["127.0.0.1", "localhost"].includes(new URL(url).hostname) ? false : process.env.NODE_ENV === "production" ? "require" : undefined });
  return client;
}
