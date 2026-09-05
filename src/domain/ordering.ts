import { z } from "zod";
export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value, "Invalid date");
export const orderingRuleSchema = z.object({
  collectionEnabled: z.boolean(), deliveryEnabled: z.boolean(),
  deliveryFeeCents: z.number().int().min(0).max(10000), minimumOrderCents: z.number().int().min(0).max(1000000),
  leadTimeDays: z.number().int().min(1).max(90), maximumAdvanceDays: z.number().int().min(1).max(365),
  collectionInstructions: z.string().trim().min(1).max(500), deliveryArea: z.string().trim().min(1).max(500),
  blackoutDates: z.array(dateStringSchema).max(180), version: z.number().int().positive(),
}).strict().refine((value) => value.collectionEnabled || value.deliveryEnabled, { message: "Enable collection or delivery" }).refine((value) => value.maximumAdvanceDays >= value.leadTimeDays, { message: "Maximum advance time must include the lead time" }).refine((value) => new Set(value.blackoutDates).size === value.blackoutDates.length, { message: "Blackout dates must be unique" });
export type OrderingRule = z.infer<typeof orderingRuleSchema>;
export const defaultOrderingRule: OrderingRule = { collectionEnabled: true, deliveryEnabled: false, deliveryFeeCents: 0, minimumOrderCents: 3000, leadTimeDays: 5, maximumAdvanceDays: 90, collectionInstructions: "Collection details are confirmed after an order is accepted.", deliveryArea: "Delivery is currently unavailable.", blackoutDates: [], version: 1 };
export function orderDateBounds(rule: OrderingRule, today = new Date()) {
  const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const add = (days: number) => { const next = new Date(date); next.setUTCDate(next.getUTCDate() + days); return next.toISOString().slice(0, 10); };
  return { minimum: add(rule.leadTimeDays), maximum: add(rule.maximumAdvanceDays) };
}
