import { z } from "zod";

export const cakeRequestSchema = z.object({
  submissionKey: z.uuid(),
  customerName: z.string().trim().min(1).max(120),
  customerEmail: z.email().max(254),
  customerPhone: z.string().trim().regex(/^\\+?[0-9 ()-]{8,20}$/),
  requestedForDate: z.iso.date(),
  fulfilmentPreference: z.enum(["collection", "delivery"]),
  occasion: z.string().trim().max(120).default(""),
  cakeDetails: z.string().trim().min(10).max(3000),
  allergyNotes: z.string().trim().max(1000).default(""),
}).strict();
export type CakeRequestInput = z.infer<typeof cakeRequestSchema>;
