import { AdminHeader } from "@/components/admin-header";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/server/admin-session";
import { ProductEditor } from "@/components/product-editor";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return <><AdminHeader /><p style={{ padding: "1rem 2rem" }}><Link href="/admin/cake-requests">Manage cake requests and weekly capacity →</Link></p><ProductEditor /></>;
}
