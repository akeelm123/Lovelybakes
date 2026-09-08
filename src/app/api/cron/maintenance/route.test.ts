// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("@/server/operations", () => ({cleanupExpiredRateLimits:vi.fn()}));
import { cleanupExpiredRateLimits } from "@/server/operations";
import { GET } from "./route";
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("CRON_SECRET", "maintenance-test-secret"); });
afterEach(() => vi.unstubAllEnvs());
it.each([undefined, "Bearer wrong", "Bearer maintenance-test-secrex"])("rejects unauthorized cleanup: %s", async auth => {
  const response = await GET(new Request("https://example.test/api/cron/maintenance", {headers:auth ? {authorization:auth} : {}}));
  expect(response.status).toBe(401);
  expect(cleanupExpiredRateLimits).not.toHaveBeenCalled();
});
it("fails closed when the secret is missing", async () => {
  vi.stubEnv("CRON_SECRET", "");
  const response = await GET(new Request("https://example.test", {headers:{authorization:"Bearer "}}));
  expect(response.status).toBe(401);
  expect(cleanupExpiredRateLimits).not.toHaveBeenCalled();
});
it("returns the cleanup count without exposing records", async () => {
  vi.mocked(cleanupExpiredRateLimits).mockResolvedValue(1000);
  const response = await GET(new Request("https://example.test", {headers:{authorization:"Bearer maintenance-test-secret"}}));
  expect(await response.json()).toEqual({status:"ok",deleted:1000});
  expect(response.headers.get("cache-control")).toBe("no-store");
});
it("does not expose database errors", async () => {
  vi.mocked(cleanupExpiredRateLimits).mockRejectedValue(new Error("private database detail"));
  const response = await GET(new Request("https://example.test", {headers:{authorization:"Bearer maintenance-test-secret"}}));
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({status:"degraded"});
});
