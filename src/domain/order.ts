import { z } from "zod";

export const orderStatusSchema = z.enum(["pending_payment", "paid", "preparing", "ready", "fulfilled", "cancelled"]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const checkoutSchema = z.object({
  checkoutRequestKey: z.uuid(),
  customerName: z.string().trim().min(1).max(120),
  customerEmail: z.email().max(254),
  customerPhone: z.string().trim().regex(/^\+?[0-9 ()-]{8,20}$/),
  fulfilmentMethod: z.enum(["collection", "delivery"]),
  deliveryAddress: z.string().trim().max(500),
  requestedForDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  orderNotes: z.string().trim().max(1000).optional().default(""),
  paymentMethod: z.literal("visa"),
  items: z.array(z.object({ productId: z.uuid(), quantity: z.number().int().min(1).max(20) }).strict()).min(1).max(30),
}).strict().refine((value) => value.fulfilmentMethod !== "delivery" || value.deliveryAddress.length >= 8, { message: "Delivery address required", path: ["deliveryAddress"] });

export const adminOrderUpdateSchema = z.object({
  orderId: z.uuid(),
  status: orderStatusSchema,
  version: z.number().int().positive(),
}).strict();

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  pending_payment: ["cancelled"],
  paid: ["preparing"],
  preparing: ["ready"],
  ready: ["fulfilled"],
  fulfilled: [],
  cancelled: [],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from].includes(to);
}
