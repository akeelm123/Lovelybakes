import "server-only";
import { adminConfiguration, currentAdmin, sameOrigin } from "./admin-session";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export class AuthorizationError extends Error {
  constructor(public readonly status: 401 | 403 | 503, message: string) { super(message); }
}

export async function requireAdmin(request: Request): Promise<JWTPayload> {
  const session = await currentAdmin();
  if (session) {
    if (!["GET", "HEAD"].includes(request.method) && !sameOrigin(request)) throw new AuthorizationError(403, "Invalid request origin");
    return session;
  }
  const issuer = process.env.OIDC_ISSUER;
  const audience = process.env.OIDC_AUDIENCE;
  const jwksUrl = process.env.OIDC_JWKS_URL;
  const header = request.headers.get("authorization");
  if (!header && adminConfiguration()) throw new AuthorizationError(401, "Administrator session required");
  if (!issuer || !audience || !jwksUrl) throw new AuthorizationError(503, "Administrator authentication is not configured");
  if (!header?.startsWith("Bearer ")) throw new AuthorizationError(401, "Bearer token required");
  try {
    const { payload } = await jwtVerify(header.slice(7), createRemoteJWKSet(new URL(jwksUrl)), { issuer, audience });
    const roles = Array.isArray(payload.roles) ? payload.roles : [payload.role].filter(Boolean);
    const methods = Array.isArray(payload.amr) ? payload.amr : [];
    if (!roles.includes("admin")) throw new AuthorizationError(403, "Administrator role required");
    if (!methods.some((method) => method === "mfa" || method === "otp")) throw new AuthorizationError(403, "Multi-factor authentication required");
    return payload;
  } catch (error) {
    if (error instanceof AuthorizationError) throw error;
    throw new AuthorizationError(401, "Invalid administrator token");
  }
}
