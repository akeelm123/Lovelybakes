import { redirect } from "next/navigation";
import { currentAdmin } from "@/server/admin-session";
import { AdminHeader } from "@/components/admin-header";
import { CakeOperations } from "@/components/cake-operations";
import { CakeNotificationMonitor } from "@/components/cake-notification-monitor";
import { CakeDatabaseReadiness } from "@/components/cake-database-readiness";

export const dynamic = "force-dynamic";
export default async function CakeRequestsAdminPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return <><AdminHeader /><div className="cake-operations"><CakeDatabaseReadiness /></div><CakeOperations /><div className="cake-operations"><CakeNotificationMonitor /></div></>;
}
