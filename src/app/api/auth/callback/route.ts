import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { adminConfiguration, cookieOptions, flowCookie, pendingCookie, readValue, sessionCookie, signValue } from "@/server/admin-session";
import { secondaryMfaEnabled } from "@/server/mfa-config";
import { googleIdentityError } from "@/domain/admin-identity";

const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
export async function GET(request: Request) {
  const config = adminConfiguration();
  if (!config) return Response.json({ error: "Sign-in is not configured." }, { status: 503 });
  const jar = await cookies();
  const token = jar.get(flowCookie)?.value;
  jar.delete(flowCookie);
  let failure = "signin";
  try {
    const params = new URL(request.url).searchParams;
    if (params.get("error")) { failure = "cancelled"; throw new Error("LOGIN_FAILED"); }
    if (!token || !params.get("code")) { failure = "session"; throw new Error("LOGIN_FAILED"); }
    failure = "session";
    const flow = await readValue(token, "login");
    if (params.get("state") !== flow.state || typeof flow.verifier !== "string") throw new Error("LOGIN_FAILED");
    failure = "exchange";
    const result = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: params.get("code")!, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: `${config.origin}/api/auth/callback`, grant_type: "authorization_code", code_verifier: flow.verifier }), signal: AbortSignal.timeout(15000) });
    if (!result.ok) throw new Error("LOGIN_FAILED");
    const tokens = await result.json();
    failure = "verification";
    const { payload } = await jwtVerify(tokens.id_token, googleKeys, { issuer: ["https://accounts.google.com", "accounts.google.com"], audience: config.clientId, algorithms: ["RS256"] });
    if (!payload.exp || payload.nonce !== flow.nonce) throw new Error("LOGIN_FAILED");
    const identityError = googleIdentityError(payload, config.emails);
    if ((identityError === "mfa_unavailable" || identityError === "mfa_required") && secondaryMfaEnabled()) {
      const duration = Math.min(300, payload.exp - Math.floor(Date.now() / 1000));
      if (duration <= 0) throw new Error("LOGIN_FAILED");
      jar.delete(sessionCookie);
      jar.set(pendingCookie, await signValue({ sub: payload.sub, email: (payload.email as string).toLowerCase() }, "pending-mfa", duration), cookieOptions(duration));
      return Response.redirect(`${config.origin}/admin/verify`, 303);
    }
    if (identityError) { failure = identityError; throw new Error("LOGIN_FAILED"); }
    const duration = Math.min(3600, payload.exp - Math.floor(Date.now() / 1000));
    if (duration <= 0) throw new Error("LOGIN_FAILED");
    failure = "session_save";
    jar.set(sessionCookie, await signValue({ sub: payload.sub, email: (payload.email as string).toLowerCase(), mfa: "google" }, "admin", duration), cookieOptions(duration));
    return Response.redirect(`${config.origin}/admin`, 303);
  } catch {
    // Only a fixed diagnostic category is logged; never tokens, codes or account data.
    console.warn(JSON.stringify({ event: "admin_signin_failed", reason: failure }));
    return Response.redirect(`${config.origin}/admin/login?error=${failure}`, 303);
  }
}
