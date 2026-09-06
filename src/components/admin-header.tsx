import Link from "next/link";
export function AdminHeader() {
  return <header className="admin-header"><Link className="admin-brand" href="/admin">Lovelybakes studio</Link><nav aria-label="Admin navigation"><Link href="/admin">Products</Link><Link href="/admin/content">Website content</Link><Link href="/admin/ordering">Ordering</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/notifications">Customer emails</Link><Link href="/admin/privacy">Privacy</Link><Link href="/admin/payments">Payments</Link><Link href="/" target="_blank">View shop ↗</Link><form action="/api/auth/logout" method="post"><button>Sign out</button></form></nav></header>;
}
