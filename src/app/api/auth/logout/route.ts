import { cookies } from "next/headers";
import { adminConfiguration, sameOrigin, sessionCookie, pendingCookie } from "@/server/admin-session";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  (await cookies()).delete(sessionCookie);
  (await cookies()).delete(pendingCookie);
  return Response.redirect(`${adminConfiguration()!.origin}/admin/login`, 303);
}
