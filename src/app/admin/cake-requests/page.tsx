import { redirect } from "next/navigation";
import { currentAdmin } from "@/server/admin-session";
import { AdminHeader } from "@/components/admin-header";
import { CakeOperations } from "@/components/cake-operations";

export const dynamic = "force-dynamic";
export default async function CakeRequestsAdminPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return <><AdminHeader /><CakeOperations /></>;
}
