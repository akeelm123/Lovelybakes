import { z } from "zod";

export const imagePathSchema = z.string().regex(/^\/(?:lovelybakes\/(?:logo|vintage-pink|floral-marble|celestial|character|chocolate-drip|cupcakes)\.jpg|api\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/);
export const productInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(1000),
  category: z.string().trim().min(1).max(60),
  priceCents: z.number().int().min(100).max(1000000),
  imageUrl: imagePathSchema,
  imageAlt: z.string().trim().min(1).max(250),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean(),
}).strict();
export const productUpdateSchema = productInputSchema.extend({ id: z.uuid(), version: z.number().int().positive() });
export type ProductInput = z.infer<typeof productInputSchema>;
export type ManagedProduct = ProductInput & { id: string; version: number; currency: "SGD" };

export function parsePrice(value: string): number | null {
  if (!/^\d{1,5}(?:\.\d{1,2})?$/.test(value.trim())) return null;
  const [whole, fraction = ""] = value.trim().split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return cents >= 100 && cents <= 1000000 ? cents : null;
}
