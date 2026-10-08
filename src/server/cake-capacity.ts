import "server-only";
import { randomUUID } from "node:crypto";
import { database } from "@/server/database";
import { mondayForDate } from "@/domain/cake-capacity";

type ReserveInput = { requestId: string; slots: number; version: number };
type ConfigureInput = { weekStartDate: string; slotLimit: number; paused: boolean };

export async function configureCapacity(input: ConfigureInput) {
  if (mondayForDate(input.weekStartDate) !== input.weekStartDate) throw new Error("WEEK_MUST_START_MONDAY");
  const rows = await database()`
    insert into cake_capacity_week (week_start_date, slot_limit, paused)
    values (${input.weekStartDate}, ${input.slotLimit}, ${input.paused})
    on conflict (week_start_date) do update set slot_limit=excluded.slot_limit,
      paused=excluded.paused, updated_at_utc=now()
    returning week_start_date::text as "weekStartDate", slot_limit as "slotLimit", paused
  `;
  return rows[0];
}

export async function reserveCakeCapacity(input: ReserveInput) {
  const sql = database();
  return sql.begin(async (tx) => {
    const request = await tx`
      select requested_for_date::text as "requestedForDate", status, version
      from cake_request where cake_request_id=${input.requestId} for update
    `;
    if (!request[0]) throw new Error("REQUEST_NOT_FOUND");
    if (request[0].status !== "reviewing" || Number(request[0].version) !== input.version) throw new Error("REQUEST_CHANGED");

    const weekStartDate = mondayForDate(String(request[0].requestedForDate));
    // Lock the week before counting or writing. All writers must use this lock order.
    const weeks = await tx`
      select slot_limit as "slotLimit", paused from cake_capacity_week
      where week_start_date=${weekStartDate} for update
    `;
    if (!weeks[0] || weeks[0].paused) throw new Error("CAPACITY_CLOSED");

    // Expired holds never count towards capacity, even if cleanup has not yet run.
    const reserved = await tx`
      select coalesce(sum(slots),0)::int as used from cake_capacity_reservation
      where week_start_date=${weekStartDate}
        and (state='confirmed' or (state='held' and expires_at_utc > now()))
    `;
    const remaining = Number(weeks[0].slotLimit) - Number(reserved[0].used);
    if (remaining < input.slots) throw new Error("CAPACITY_FULL");

    const existing = await tx`select reservation_id from cake_capacity_reservation where cake_request_id=${input.requestId}`;
    if (existing.length) throw new Error("ALREADY_RESERVED");

    const rows = await tx`
      insert into cake_capacity_reservation
        (reservation_id, cake_request_id, week_start_date, slots, state, expires_at_utc)
      values (${randomUUID()}, ${input.requestId}, ${weekStartDate}, ${input.slots}, 'held', now() + interval '48 hours')
      returning reservation_id as "reservationId", expires_at_utc as "expiresAtUtc"
    `;
    await tx`
      update cake_request set status='approved', version=version+1, updated_at_utc=now()
      where cake_request_id=${input.requestId}
    `;
    return { reservationId: String(rows[0].reservationId), expiresAtUtc: rows[0].expiresAtUtc, weekStartDate, slots: input.slots, bookingConfirmed: false };
  });
}

export async function expireCapacityHolds() {
  const rows = await database()`
    update cake_capacity_reservation set state='expired', updated_at_utc=now()
    where state='held' and expires_at_utc <= now()
    returning reservation_id
  `;
  return rows.length;
}
