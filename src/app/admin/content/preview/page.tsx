import { redirect } from "next/navigation";
import { currentAdmin } from "@/server/admin-session";
import { getSiteContent } from "@/server/site-content";
import { storefrontCatalog } from "@/server/products";
import { Storefront } from "@/components/storefront";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function ContentPreview() {
  if (!await currentAdmin()) redirect("/admin/login");
  const [{ content }, { products }] = await Promise.all([getSiteContent(), storefrontCatalog()]);
  return <><div className="admin-preview-note">Saved draft preview — your public shop is unchanged until you publish. <a href="/admin/content">Back to editor</a></div><Storefront products={products} content={content} preview /></>;
}
