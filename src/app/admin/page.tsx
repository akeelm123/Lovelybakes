import { AdminHeader } from "@/components/admin-header";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/server/admin-session";
import { ProductEditor } from "@/components/product-editor";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return <><AdminHeader /><ProductEditor /></>;
}
