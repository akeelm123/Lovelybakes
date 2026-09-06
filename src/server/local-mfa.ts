import "server-only";
import { mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync, openSync, closeSync } from "node:fs";
import { join } from "node:path";
import { matchingStep } from "./totp";
import { localMfaEnabled } from "./mfa-config";

type State = { failures: number; lockedUntil: number; lastStep: number };
export function verifyLocalCode(code: string): "ok" | "invalid" | "locked" {
  if (!localMfaEnabled()) throw new Error("Local MFA unavailable");
  const directory = join(process.cwd(), ".private");
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const lock = join(directory, "mfa.lock");
  // This adapter is deliberately single-host. An existing lock fails closed.
  const handle = openSync(lock, "wx", 0o600);
  try {
    const path = join(directory, "mfa-state.json");
    let state: State;
    try { state = JSON.parse(readFileSync(path, "utf8")); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      state = { failures: 0, lockedUntil: 0, lastStep: -1 };
    }
    if (![state.failures, state.lockedUntil, state.lastStep].every(Number.isSafeInteger)) throw new Error("Invalid MFA state");
    const now = Date.now();
    if (state.lockedUntil > now) return "locked";
    if (state.lockedUntil !== 0) { state.failures = 0; state.lockedUntil = 0; }
    const matched = matchingStep(process.env.ADMIN_TOTP_SECRET!, code, now, state.lastStep);
    if (matched === null) {
      state.failures += 1;
      if (state.failures >= 5) state.lockedUntil = now + 15 * 60 * 1000;
    } else { state.lastStep = matched; state.failures = 0; state.lockedUntil = 0; }
    const temporary = `${path}.tmp`;
    writeFileSync(temporary, JSON.stringify(state), { mode: 0o600 });
    renameSync(temporary, path);
    return matched === null ? (state.lockedUntil > now ? "locked" : "invalid") : "ok";
  } finally { closeSync(handle); unlinkSync(lock); }
}
