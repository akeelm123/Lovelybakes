// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verifyLocalCode } from "./local-mfa";
import { totpAtStep } from "./totp";
const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
let directory: string;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "lovely-mfa-test-"));
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  vi.spyOn(Date, "now").mockReturnValue(1800000000000);
  vi.stubEnv("PUBLIC_APP_URL", "http://127.0.0.1:3000");
  vi.stubEnv("ADMIN_LOCAL_MFA", "true");
  vi.stubEnv("ADMIN_EMAILS", "owner@example.test");
  vi.stubEnv("ADMIN_TOTP_SECRET", secret);
  vi.stubEnv("VERCEL", "");
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); rmSync(directory, { recursive: true, force: true }); });
it("persists successful steps and rejects reused codes", () => {
  const code = totpAtStep(secret, Math.floor(Date.now() / 30000));
  expect(verifyLocalCode(code)).toBe("ok");
  expect(verifyLocalCode(code)).toBe("invalid");
});
it("locks after five failures and permits a fresh code after fifteen minutes", () => {
  for (let attempt = 0; attempt < 4; attempt++) expect(verifyLocalCode("invalid")).toBe("invalid");
  expect(verifyLocalCode("invalid")).toBe("locked");
  expect(verifyLocalCode(totpAtStep(secret, Math.floor(Date.now() / 30000)))).toBe("locked");
  vi.mocked(Date.now).mockReturnValue(1800000900001);
  expect(verifyLocalCode(totpAtStep(secret, Math.floor(Date.now() / 30000)))).toBe("ok");
});
it("fails closed outside local UAT", () => {
  vi.stubEnv("PUBLIC_APP_URL", "https://lovelybakes.example");
  expect(() => verifyLocalCode("123456")).toThrow("Local MFA unavailable");
});
