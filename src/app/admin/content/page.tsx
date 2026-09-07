import { redirect } from "next/navigation";
import { currentAdmin } from "@/server/admin-session";
import { getSiteContent } from "@/server/site-content";
import { ContentEditor } from "@/components/content-editor";
import { AdminHeader } from "@/components/admin-header";
export const dynamic = "force-dynamic";
export default async function ContentPage() {
  if (!await currentAdmin()) redirect("/admin/login");
  const { content, version } = await getSiteContent();
  return <><AdminHeader /><ContentEditor initialContent={content} initialVersion={version} /></>;
}
