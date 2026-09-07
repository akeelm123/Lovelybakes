import { databaseMfaEnabled } from "./database-mfa";

export function localMfaEnabled(): boolean {
  try {
    const origin = new URL(process.env.PUBLIC_APP_URL ?? "");
    return process.env.ADMIN_LOCAL_MFA === "true" && !process.env.VERCEL && ["127.0.0.1", "localhost"].includes(origin.hostname) && /^[A-Z2-7]{32}$/.test(process.env.ADMIN_TOTP_SECRET ?? "") && (process.env.ADMIN_EMAILS ?? "").split(",").filter((email) => email.trim()).length === 1;
  } catch { return false; }
}

export function secondaryMfaEnabled(): boolean {
  return localMfaEnabled() || databaseMfaEnabled();
}
