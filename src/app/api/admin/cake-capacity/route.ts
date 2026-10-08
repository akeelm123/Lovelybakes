import { AuthorizationError, requireAdmin } from "@/server/auth";
import { configureCapacity } from "@/server/cake-capacity";
import { configureCapacitySchema } from "@/domain/cake-capacity";
import { problem, safeJson } from "@/server/http";
import { database } from "@/server/database";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const weeks = await database()`
      select w.week_start_date::text as "weekStartDate", w.slot_limit as "slotLimit", w.paused,
        coalesce(sum(r.slots) filter (where r.state = 'confirmed' or (r.state = 'held' and r.expires_at_utc > now())), 0)::int as "reservedSlots"
      from cake_capacity_week w left join cake_capacity_reservation r on r.week_start_date=w.week_start_date
      group by w.week_start_date, w.slot_limit, w.paused
      order by w.week_start_date desc limit 24
    `;
    return Response.json({ weeks }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AuthorizationError) return problem(error.status, "AUTHORIZATION_FAILED", error.message);
    return problem(503, "CAPACITY_UNAVAILABLE", "Capacity could not be loaded.");
  }
}


export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.sub) return problem(403, "MISSING_SUBJECT", "Identified administrator required.");
    const parsed = configureCapacitySchema.safeParse(await safeJson(request, 8192));
    if (!parsed.success) return problem(400, "INVALID_CAPACITY", "Provide a Monday, slot limit and pause setting.");
    return Response.json({ capacity: await configureCapacity(parsed.data) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AuthorizationError) return problem(error.status, "AUTHORIZATION_FAILED", error.message);
    if (error instanceof Error && error.message === "WEEK_MUST_START_MONDAY") return problem(400, "INVALID_WEEK", "The week must start on Monday.");
    if (error instanceof Error && error.message === "CAPACITY_BELOW_RESERVED") return problem(409, "CAPACITY_BELOW_RESERVED", "The limit cannot be lower than active reservations.");
    return problem(503, "CAPACITY_UNAVAILABLE", "Capacity settings could not be saved.");
  }
}
