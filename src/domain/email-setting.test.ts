import { describe, expect, it } from "vitest";
import { emailSettingSchema } from "./email-setting";

describe("email settings", () => {
  it("accepts a valid reply address and version", () => {
    expect(emailSettingSchema.parse({ replyToEmail: "orders@lovelybakestore.com", version: 1 })).toBeTruthy();
  });

  it("rejects malformed addresses and unknown fields", () => {
    expect(emailSettingSchema.safeParse({ replyToEmail: "not-an-email", version: 1 }).success).toBe(false);
    expect(emailSettingSchema.safeParse({ replyToEmail: "owner@example.com", version: 1, secret: true }).success).toBe(false);
  });
});
