import "server-only";
import { randomUUID } from "node:crypto";
import { database, databaseConfigured } from "./database";
import { matchingStep } from "./totp";

export function databaseMfaEnabled(): boolean {
  return (
    process.env.ADMIN_DATABASE_MFA === "true" &&
    databaseConfigured() &&
    /^[A-Z2-7]{32}$/.test(process.env.ADMIN_TOTP_SECRET ?? "")
  );
}

export async function verifyDatabaseCode(
  administratorSubject: string,
  code: string,
  nowMs = Date.now(),
): Promise<"ok" | "invalid" | "locked"> {
  if (!databaseMfaEnabled()) throw new Error("Database MFA unavailable");
  const sql = database();

  return sql.begin(async (transaction) => {
    await transaction`
      INSERT INTO administrator_mfa_state (
        administrator_mfa_state_id,
        administrator_subject
      ) VALUES (${randomUUID()}, ${administratorSubject})
      ON CONFLICT (administrator_subject) DO NOTHING
    `;
    const [state] = await transaction<{
      failed_attempt_count: number;
      locked_until_utc: Date | null;
      last_accepted_step: string | number;
    }[]>`
      SELECT failed_attempt_count, locked_until_utc, last_accepted_step
      FROM administrator_mfa_state
      WHERE administrator_subject = ${administratorSubject}
      FOR UPDATE
    `;
    if (!state) throw new Error("MFA state unavailable");

    const lockedUntil = state.locked_until_utc?.getTime() ?? 0;
    if (lockedUntil > nowMs) return "locked";

    const matchedStep = matchingStep(
      process.env.ADMIN_TOTP_SECRET!,
      code,
      nowMs,
      Number(state.last_accepted_step),
    );
    const previousFailures = lockedUntil ? 0 : state.failed_attempt_count;
    const failedAttempts = matchedStep === null ? Math.min(previousFailures + 1, 5) : 0;
    const nextLockedUntil = failedAttempts >= 5 ? new Date(nowMs + 15 * 60 * 1000) : null;

    await transaction`
      UPDATE administrator_mfa_state
      SET failed_attempt_count = ${failedAttempts},
          locked_until_utc = ${nextLockedUntil},
          last_accepted_step = ${matchedStep ?? Number(state.last_accepted_step)},
          updated_at_utc = now()
      WHERE administrator_subject = ${administratorSubject}
    `;

    if (matchedStep !== null) return "ok";
    return nextLockedUntil ? "locked" : "invalid";
  });
}
