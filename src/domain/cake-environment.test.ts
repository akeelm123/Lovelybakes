import { describe, expect, it } from "vitest";
import { cakeTransactionalDatabaseReady } from "./cake-environment";

describe("cake transactional database gate", () => {
  it("rejects missing or blank database URLs", () => {
    expect(cakeTransactionalDatabaseReady({})).toBe(false);
    expect(cakeTransactionalDatabaseReady({ DATABASE_URL: "   " })).toBe(false);
  });

  it("rejects snapshot mode even if a database URL exists", () => {
    expect(cakeTransactionalDatabaseReady({
      DATABASE_URL: "postgres://staging.example/db",
      UAT_DATABASE_FALLBACK: "snapshot",
    })).toBe(false);
  });

  it("allows configured non-snapshot environments to proceed to connection checks", () => {
    expect(cakeTransactionalDatabaseReady({
      DATABASE_URL: "postgres://staging.example/db",
    })).toBe(true);
  });
});
