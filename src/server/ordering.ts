import "server-only";
import { randomUUID } from "node:crypto";
import { database, databaseConfigured } from "./database";
import snapshot from "@/generated/public-snapshot.json";
import { defaultOrderingRule, orderingRuleSchema, type OrderingRule } from "@/domain/ordering";
function map(row: Record<string, unknown>): OrderingRule { return orderingRuleSchema.parse({ collectionEnabled: row.collectionEnabled, deliveryEnabled: row.deliveryEnabled, deliveryFeeCents: row.deliveryFeeCents, minimumOrderCents: row.minimumOrderCents, leadTimeDays: row.leadTimeDays, maximumAdvanceDays: row.maximumAdvanceDays, collectionInstructions: row.collectionInstructions, deliveryArea: row.deliveryArea, blackoutDates: row.blackoutDates, version: row.version }); }
export async function getOrderingRule(): Promise<OrderingRule> {
  if (!databaseConfigured()) return orderingRuleSchema.parse(snapshot.orderingRule);
  const rows = await database()`select collection_enabled as "collectionEnabled", delivery_enabled as "deliveryEnabled", delivery_fee_cents as "deliveryFeeCents", minimum_order_cents as "minimumOrderCents", lead_time_days as "leadTimeDays", maximum_advance_days as "maximumAdvanceDays", collection_instructions as "collectionInstructions", delivery_area as "deliveryArea", blackout_dates::text[] as "blackoutDates", version from ordering_rule where rule_key = 'storefront'`;
  return rows[0] ? map(rows[0]) : defaultOrderingRule;
}
export async function saveOrderingRule(rule: OrderingRule, actor: string) {
  const sql = database();
  return sql.begin(async (tx) => {
    const rows = await tx`update ordering_rule set collection_enabled=${rule.collectionEnabled}, delivery_enabled=${rule.deliveryEnabled}, delivery_fee_cents=${rule.deliveryFeeCents}, minimum_order_cents=${rule.minimumOrderCents}, lead_time_days=${rule.leadTimeDays}, maximum_advance_days=${rule.maximumAdvanceDays}, collection_instructions=${rule.collectionInstructions}, delivery_area=${rule.deliveryArea}, blackout_dates=${tx.array(rule.blackoutDates)}::date[], version=version+1, updated_at_utc=now() where rule_key='storefront' and version=${rule.version} returning ordering_rule_id, version`;
    if (!rows.length) throw new Error("EDIT_CONFLICT");
    await tx`insert into administrator_event (administrator_event_id, actor_subject, action, resource_id) values (${randomUUID()}, ${actor}, 'ordering_rules_updated', ${rows[0].ordering_rule_id})`;
    return rows[0].version as number;
  });
}
