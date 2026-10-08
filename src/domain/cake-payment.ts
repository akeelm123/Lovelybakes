import { z } from "zod";

export const quoteCakeRequestSchema = z.object({
  requestId: z.uuid(),
  amountCents: z.number().int().min(100).max(5_000_000),
}).strict();

export type CakePaymentEvent = {
  id: string;
  type: "checkout.session.completed" | "checkout.session.expired";
  session: {
    id: string;
    client_reference_id: string | null;
    metadata: Record<string, string> | null;
    amount_total: number | null;
    currency: string | null;
    payment_status: string;
  };
};
