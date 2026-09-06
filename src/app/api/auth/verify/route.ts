import { cookies } from "next/headers";
import { adminConfiguration, cookieOptions, pendingAdmin, pendingCookie, sameOrigin, sessionCookie, signValue } from "@/server/admin-session";
import { verifyLocalCode } from "@/server/local-mfa";
import { databaseMfaEnabled, verifyDatabaseCode } from "@/server/database-mfa";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const config = adminConfiguration()!;
  const admin = await pendingAdmin();
  if (!admin) return Response.redirect(`${config.origin}/admin/login?error=session`, 303);
  try {
    const length = Number(request.headers.get("content-length"));
    if (!Number.isFinite(length) || length > 1024) return new Response(null, { status: 413 });
    if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return new Response(null, { status: 415 });
    const reader = request.body?.getReader();
    let encoded = "";
    let size = 0;
    const decoder = new TextDecoder();
    if (reader) {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > 1024) { await reader.cancel(); return new Response(null, { status: 413 }); }
        encoded += decoder.decode(chunk.value, { stream: true });
      }
    }
    encoded += decoder.decode();
    const body = new URLSearchParams(encoded);
    const code = body.get("code");
    if (typeof code !== "string" || !/^\d{6}$/.test(code)) return Response.redirect(`${config.origin}/admin/verify?error=invalid`, 303);
    const result = databaseMfaEnabled()
      ? await verifyDatabaseCode(admin.sub, code)
      : verifyLocalCode(code);
    if (result !== "ok") return Response.redirect(`${config.origin}/admin/verify?error=${result}`, 303);
    const jar = await cookies();
    jar.set(sessionCookie, await signValue({ ...admin, mfa: "totp" }, "admin", 3600), cookieOptions(3600));
    jar.delete(pendingCookie);
    return Response.redirect(`${config.origin}/admin`, 303);
  } catch { return Response.redirect(`${config.origin}/admin/verify?error=unavailable`, 303); }
}
