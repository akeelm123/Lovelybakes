import "server-only";
import { secondaryMfaEnabled } from "./mfa-config";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const sessionCookie = "lovelybakes_admin";
export const pendingCookie = "lovelybakes_pending_mfa";
export const flowCookie = "lovelybakes_login";
export function adminConfiguration() {
  const origin = process.env.PUBLIC_APP_URL;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const emails = (process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (!origin || !secret || secret.length < 32 || !clientId || !clientSecret || !emails.length) return null;
  const url = new URL(origin);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) return null;
  return { origin: url.origin, secret, clientId, clientSecret, emails };
}
export function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: adminConfiguration()?.origin.startsWith("https:") ?? true, sameSite: "lax" as const, path: "/", maxAge };
}
export async function signValue(value: Record<string, unknown>, audience: string, expiresIn: number) {
  const config = adminConfiguration();
  if (!config) throw new Error("ADMIN_NOT_CONFIGURED");
  return new SignJWT(value).setProtectedHeader({ alg: "HS256" }).setIssuer("lovelybakes").setAudience(audience).setIssuedAt().setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn).sign(new TextEncoder().encode(config.secret));
}
export async function readValue(token: string, audience: string) {
  const config = adminConfiguration();
  if (!config) throw new Error("ADMIN_NOT_CONFIGURED");
  return (await jwtVerify(token, new TextEncoder().encode(config.secret), { issuer: "lovelybakes", audience, algorithms: ["HS256"] })).payload;
}
export async function currentAdmin() {
  try {
    const token = (await cookies()).get(sessionCookie)?.value;
    if (!token) return null;
    const value = await readValue(token, "admin");
    if (typeof value.sub !== "string" || typeof value.email !== "string" || !adminConfiguration()?.emails.includes(value.email)) return null;
    if (value.mfa !== "google" && !(value.mfa === "totp" && secondaryMfaEnabled())) return null;
    return { sub: value.sub, email: value.email, role: "admin", amr: ["mfa"] };
  } catch { return null; }
}
export function newLoginFlow() {
  const verifier = randomBytes(32).toString("base64url");
  return { verifier, challenge: createHash("sha256").update(verifier).digest("base64url"), state: randomBytes(32).toString("base64url"), nonce: randomBytes(32).toString("base64url") };
}
export function sameOrigin(request: Request): boolean {
  const origin = adminConfiguration()?.origin;
  return Boolean(origin && request.headers.get("origin") === origin);
}

export async function pendingAdmin() {
  try {
    const token = (await cookies()).get(pendingCookie)?.value;
    if (!token || !secondaryMfaEnabled()) return null;
    const value = await readValue(token, "pending-mfa");
    if (typeof value.sub !== "string" || typeof value.email !== "string" || !adminConfiguration()?.emails.includes(value.email)) return null;
    return { sub: value.sub, email: value.email };
  } catch { return null; }
}
