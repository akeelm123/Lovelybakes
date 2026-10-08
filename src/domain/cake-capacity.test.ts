import { describe, expect, it } from "vitest";
import { mondayForDate, configureCapacitySchema, reserveCapacitySchema } from "./cake-capacity";

describe("weekly cake capacity", () => {
  it("groups a Sunday into the previous Monday", () => {
    expect(mondayForDate("2026-10-11")).toBe("2026-10-05");
  });
  it("keeps Monday as the start of the week", () => {
    expect(mondayForDate("2026-10-12")).toBe("2026-10-12");
  });
  it("rejects impossible calendar dates", () => {
    expect(() => mondayForDate("2026-02-30")).toThrow("INVALID_DATE");
  });
  it("rejects negative capacity", () => {
    expect(configureCapacitySchema.safeParse({ weekStartDate: "2026-10-12", slotLimit: -1, paused: false }).success).toBe(false);
  });
  it("rejects zero-slot holds", () => {
    expect(reserveCapacitySchema.safeParse({ requestId: "16eb41c2-6d11-47d2-8fba-40c9b49bbd83", slots: 0, version: 1 }).success).toBe(false);
  });
});
