// @vitest-environment node
import { describe, expect, it } from "vitest";
import { matchingStep, totpAtStep } from "./totp";
// RFC 6238 Appendix B public SHA-1 test key; not a real enrollment secret.
const key = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
describe("TOTP", () => {
  it("matches the published RFC 6238 SHA-1 test vectors", () => {
    for (const [time, expected] of [[59, "94287082"], [1111111109, "07081804"], [1111111111, "14050471"], [1234567890, "89005924"], [2000000000, "69279037"], [20000000000, "65353130"]] as const) {
      expect(totpAtStep(key, Math.floor(time / 30), 8)).toBe(expected);
    }
  });
  it("rejects replay, malformed codes and old time steps", () => {
    const now = 1234567890000;
    const step = Math.floor(now / 30000);
    const code = totpAtStep(key, step);
    expect(matchingStep(key, code, now, -1)).toBe(step);
    expect(matchingStep(key, code, now, step)).toBeNull();
    expect(matchingStep(key, "abcdef", now, -1)).toBeNull();
    expect(matchingStep(key, code, now + 90000, -1)).toBeNull();
  });
});
