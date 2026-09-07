import { describe, expect, it } from "vitest";
import { approvedGoogleIdentity, googleIdentityError } from "./admin-identity";
const identity = { sub: "test-subject", email: "owner@example.test", email_verified: true, amr: ["mfa"] };
describe("admin identity", () => {
  it("requires an approved verified identity and MFA", () => {
    expect(approvedGoogleIdentity(identity, [identity.email])).toBe(true);
    expect(approvedGoogleIdentity(identity, ["someone@example.test"])).toBe(false);
    expect(approvedGoogleIdentity({ ...identity, email_verified: false }, [identity.email])).toBe(false);
    expect(approvedGoogleIdentity({ ...identity, amr: ["pwd"] }, [identity.email])).toBe(false);
    expect(approvedGoogleIdentity({ ...identity, amr: undefined }, [identity.email])).toBe(false);
  });
});

describe("sign-in diagnostic categories", () => {
  it("distinguishes missing MFA evidence from the wrong account", () => {
    expect(googleIdentityError({ ...identity, amr: undefined }, [identity.email])).toBe("mfa_unavailable");
    expect(googleIdentityError({ ...identity, amr: ["pwd"] }, [identity.email])).toBe("mfa_required");
    expect(googleIdentityError(identity, ["different@example.test"])).toBe("account");
    expect(googleIdentityError({ ...identity, amr: ["otp"] }, [identity.email])).toBe("mfa_required");
  });
});
