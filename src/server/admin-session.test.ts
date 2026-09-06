// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
import { signValue, readValue, sameOrigin, adminConfiguration } from "./admin-session";
beforeEach(() => {
  vi.stubEnv("PUBLIC_APP_URL", "http://127.0.0.1:3000");
  vi.stubEnv("ADMIN_SESSION_SECRET", "unit-test-secret-not-for-production-123456");
  vi.stubEnv("GOOGLE_CLIENT_ID", "test-client");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "test-secret");
  vi.stubEnv("ADMIN_EMAILS", "owner@example.test");
});
afterEach(() => vi.unstubAllEnvs());
describe("signed admin sessions", () => {
  it("separates login-state tokens from admin sessions", async () => {
    const token = await signValue({ sub: "test" }, "login", 600);
    await expect(readValue(token, "admin")).rejects.toThrow();
  });
  it("rejects expired or tampered tokens", async () => {
    const expired = await signValue({ sub: "test" }, "admin", -10);
    await expect(readValue(expired, "admin")).rejects.toThrow();
    const token = await signValue({ sub: "test" }, "admin", 600);
    const parts = token.split(".");
    parts[1] = btoa(JSON.stringify({ sub: "attacker" }));
    await expect(readValue(parts.join("."), "admin")).rejects.toThrow();
  });
  it("rejects cross-origin mutations and insecure remote origins", () => {
    expect(sameOrigin(new Request("http://127.0.0.1:3000", { headers: { Origin: "https://attacker.example" } }))).toBe(false);
    expect(sameOrigin(new Request("http://127.0.0.1:3000", { headers: { Origin: "http://127.0.0.1:3000" } }))).toBe(true);
    vi.stubEnv("PUBLIC_APP_URL", "http://shop.example");
    expect(adminConfiguration()).toBeNull();
  });
});
