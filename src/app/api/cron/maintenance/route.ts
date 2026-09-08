import { timingSafeEqual } from "node:crypto";
import { cleanupExpiredRateLimits } from "@/server/operations";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret ?? ""}`);
  if (!secret || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return Response.json({error:"Unauthorized"}, {status:401, headers:{"Cache-Control":"no-store"}});
  }
  try {
    const deleted = await cleanupExpiredRateLimits();
    return Response.json({status:"ok", deleted}, {headers:{"Cache-Control":"no-store"}});
  } catch {
    return Response.json({status:"degraded"}, {status:503, headers:{"Cache-Control":"no-store"}});
  }
}
