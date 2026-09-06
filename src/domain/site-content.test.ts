import { describe, expect, it } from "vitest";
import { defaultContent, siteContentSchema, contentSaveSchema } from "./site-content";
describe("website content validation", () => {
  it("accepts existing site content", () => { expect(siteContentSchema.safeParse(defaultContent).success).toBe(true); });
  it("rejects executable links, external images and unrecognized fields", () => {
    expect(siteContentSchema.safeParse({ ...defaultContent, socialUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(siteContentSchema.safeParse({ ...defaultContent, heroImage: "https://example.test/image.png" }).success).toBe(false);
    expect(siteContentSchema.safeParse({ ...defaultContent, unexpected: "field" }).success).toBe(false);
  });
  it("requires an explicit version and publishing decision", () => {
    expect(contentSaveSchema.safeParse({ content: defaultContent }).success).toBe(false);
    expect(contentSaveSchema.safeParse({ content: defaultContent, version: 0, publish: false }).success).toBe(true);
  });
});
