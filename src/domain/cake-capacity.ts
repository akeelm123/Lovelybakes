import { z } from "zod";

export const reserveCapacitySchema = z.object({
  requestId: z.uuid(),
  slots: z.number().int().min(1).max(20),
  version: z.number().int().positive(),
}).strict();

export const configureCapacitySchema = z.object({
  weekStartDate: z.iso.date(),
  slotLimit: z.number().int().min(0).max(1000),
  paused: z.boolean(),
}).strict();

export function mondayForDate(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== isoDate) throw new Error("INVALID_DATE");
  const weekday = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - ((weekday + 6) % 7));
  return date.toISOString().slice(0, 10);
}
