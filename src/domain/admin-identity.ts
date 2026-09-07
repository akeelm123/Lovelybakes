import type { JWTPayload } from "jose";

export function googleIdentityError(payload: JWTPayload, emails: string[]): "identity" | "account" | "mfa_unavailable" | "mfa_required" | null {
  if (typeof payload.sub !== "string" || !payload.sub || typeof payload.email !== "string" || payload.email_verified !== true) return "identity";
  if (!emails.includes(payload.email.toLowerCase())) return "account";
  if (!Array.isArray(payload.amr) || payload.amr.length === 0) return "mfa_unavailable";
  return payload.amr.includes("mfa") ? null : "mfa_required";
}
export function approvedGoogleIdentity(payload: JWTPayload, emails: string[]) {
  return googleIdentityError(payload, emails) === null;
}
