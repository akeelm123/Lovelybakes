import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Static contract checks only. These do not replace applying migrations to
// an isolated staging database and checking constraints with live SQL.
const migration = (name: string) =>
  readFileSync(join(process.cwd(), "migrations", name), "utf8");

describe("cake workflow migration contracts", () => {
  it("keeps cake request intake separate from legacy orders", () => {
    const sql = migration("013_cake_request.sql");
    expect(sql).toMatch(/CREATE TABLE cake_request\s*\(/i);
    expect(sql).toMatch(/submission_key UUID NOT NULL UNIQUE/i);
    expect(sql).toMatch(/status IN \('received','reviewing','approved','declined','cancelled'\)/i);
  });
  it("requires one reservation per cake request and bounded slot counts", () => {
    const sql = migration("014_request_capacity.sql");
    expect(sql).toMatch(/cake_request_id UUID NOT NULL UNIQUE REFERENCES cake_request\(cake_request_id\)/i);
    expect(sql).toMatch(/slots BETWEEN 1 AND 20/i);
    expect(sql).toMatch(/state = 'held' AND expires_at_utc IS NOT NULL/i);
  });
  it("keeps payment events idempotent and isolated", () => {
    const sql = migration("015_cake_request_payment.sql");
    expect(sql).toMatch(/stripe_session_id TEXT UNIQUE/i);
    expect(sql).toMatch(/stripe_event_id TEXT PRIMARY KEY/i);
    expect(sql).toMatch(/amount_cents BIGINT NOT NULL CHECK \(amount_cents > 0\)/i);
  });
  it("does not create a notification sender and deduplicates message types", () => {
    const sql = migration("016_cake_request_notification.sql");
    expect(sql).toMatch(/UNIQUE\(cake_request_id, message_type\)/i);
    expect(sql).toMatch(/status IN \('pending','sending','sent','failed','cancelled'\)/i);
    expect(sql).not.toMatch(/CREATE TRIGGER|CREATE FUNCTION|http_post/i);
  });
});
