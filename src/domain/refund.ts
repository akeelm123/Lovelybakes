import { z } from "zod";

export const refundRequestSchema = z.object({
  orderId: z.string().uuid(),
  version: z.number().int().nonnegative(),
  reason: z.string().trim().min(3).max(500),
}).strict();

export function canRefund(status: string, providerReference: string | null) {
  return ["paid", "preparing", "ready"].includes(status) && Boolean(providerReference?.startsWith("cs_test_"));
}
