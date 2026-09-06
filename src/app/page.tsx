import { Storefront } from "@/components/storefront";
import { storefrontCatalog } from "@/server/products";
import { publishedContent } from "@/server/site-content";
import { getOrderingRule } from "@/server/ordering";
import { paymentsEnabled } from "@/server/payments";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const content = await publishedContent();
  return { title: content.seoTitle, description: content.seoDescription };
}
export default async function Home() {
  const [{ products, preview }, content, orderingRule] = await Promise.all([storefrontCatalog(), publishedContent(), getOrderingRule()]);
  return <Storefront products={products} preview={preview} content={content} orderingRule={orderingRule} commerceEnabled={paymentsEnabled()} />;
}
