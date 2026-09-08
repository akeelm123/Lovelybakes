import { z } from "zod";

export const refundRequestSchema = z.object({
  orderId: z.string().uuid(),
  version: z.number().int().nonnegative(),
  reason: z.string().trim().min(3).max(500),
}).strict();

export type RefundMode = "test" | "live" | "disabled";

export function canRefund(status: string, providerReference: string | null, mode: RefundMode) {
  if (mode === "disabled" || !["paid", "preparing", "ready"].includes(status)) return false;
  return Boolean(providerReference && new RegExp(`^cs_${mode}_[A-Za-z0-9]+$`).test(providerReference));
}
