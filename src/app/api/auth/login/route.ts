import { cookies } from "next/headers";
import { adminConfiguration, cookieOptions, flowCookie, newLoginFlow, signValue } from "@/server/admin-session";

export async function GET() {
  const config = adminConfiguration();
  if (!config) return Response.json({ error: "Google sign-in is not configured." }, { status: 503 });
  const flow = newLoginFlow();
  (await cookies()).set(flowCookie, await signValue(flow, "login", 600), cookieOptions(600));
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: `${config.origin}/api/auth/callback`, response_type: "code", scope: "openid email", state: flow.state, nonce: flow.nonce, code_challenge: flow.challenge, code_challenge_method: "S256", prompt: "select_account", claims: JSON.stringify({ id_token: { amr: { essential: true } } }) }).toString();
  return Response.redirect(url, 303);
}
