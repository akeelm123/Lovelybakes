import { createHmac, timingSafeEqual } from "node:crypto";

export function decodeBase32(secret: string): Buffer {
  if (!/^[A-Z2-7]{32}$/.test(secret)) throw new Error("Invalid authenticator configuration");
  let bits = "";
  for (const char of secret) bits += "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(char).toString(2).padStart(5, "0");
  return Buffer.from(bits.match(/.{8}/g)!.map((byte) => parseInt(byte, 2)));
}
export function totpAtStep(secret: string, step: number, digits = 6): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac("sha1", decodeBase32(secret)).update(counter).digest();
  const offset = digest[digest.length - 1] & 15;
  const value = digest.readUInt32BE(offset) & 0x7fffffff;
  return (value % 10 ** digits).toString().padStart(digits, "0");
}
export function matchingStep(secret: string, code: string, nowMs: number, lastStep: number): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const step = Math.floor(nowMs / 30000);
  for (const candidate of [step, step - 1, step + 1]) {
    if (candidate <= lastStep || candidate < 0) continue;
    if (timingSafeEqual(Buffer.from(code), Buffer.from(totpAtStep(secret, candidate)))) return candidate;
  }
  return null;
}
