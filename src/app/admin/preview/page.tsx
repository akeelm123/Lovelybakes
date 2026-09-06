import Link from "next/link";
import { ProductEditor } from "@/components/product-editor";
export default function AdminPreview() {
  return <><header className="admin-header"><Link className="admin-brand" href="/">Lovelybakes studio</Link><Link href="/admin/login">Admin sign-in →</Link></header><ProductEditor preview /></>;
}
