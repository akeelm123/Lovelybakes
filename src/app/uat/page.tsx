import Link from "next/link";
import { databaseConfigured } from "@/server/database";
import { adminConfiguration } from "@/server/admin-session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lovely Bakes UAT", robots: { index: false, follow: false } };

export default function UatPage() {
  if (process.env.VERCEL_ENV === "production") return <main style={{ padding: "3rem" }}><h1>Not available</h1></main>;
  const checks = [
    ["Staging database connected", databaseConfigured()],
    ["Admin login configured", Boolean(adminConfiguration())],
    ["Cake request intake enabled", process.env.CAKE_REQUEST_INTAKE_ENABLED === "true"],
    ["Capacity reservations enabled", process.env.CAKE_CAPACITY_RESERVATIONS_ENABLED === "true"],
    ["Payment workflow enabled", process.env.CAKE_PAYMENT_WORKFLOW_ENABLED === "true"],
    ["Stripe test key configured", process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false],
  ] as const;
  return <main style={{ maxWidth: 850, margin: "auto", padding: "3rem 1.5rem", lineHeight: 1.6 }}>
    <p className="eyebrow">Preview environment only</p>
    <h1 style={{ maxWidth: "none", fontSize: "clamp(2.5rem,5vw,4rem)" }}>Lovely Bakes UAT</h1>
    <p>Review the editorial storefront and test the new request-to-payment workflow when its staging services are connected. No live payment should be made during UAT.</p>
    <h2>Environment readiness</h2>
    <ul>{checks.map(([name, ready]) => <li key={name}>{ready ? "✓" : "○"} {name} — {ready ? "configured" : "not configured"}</li>)}</ul>
    <p><strong>Important:</strong> Configuration status does not prove database migrations or Stripe webhook delivery. Do not enter real customer details until the staging database is verified.</p>
    <h2>UAT walkthrough</h2>
    <ol>
      <li><Link href="/">Check homepage, category cards, product selection and mobile layout</Link></li>
      <li><Link href="/bespoke">Check bespoke page and cake request form</Link></li>
      <li><Link href="/cake-care">Review cake care instructions</Link></li>
      <li><Link href="/admin/cake-requests">Sign in as administrator and inspect weekly capacity</Link></li>
      <li>When enabled: submit a fictional request, start review, approve a hold, quote and create a Stripe test payment link</li>
      <li>Verify that booking confirmation only occurs after the signed Stripe test webhook</li>
      <li>Try expired holds, duplicate requests and unsuccessful payments</li>
    </ol>
    <p>Record any issues with the page, steps to reproduce, expected result and actual result.</p>
  </main>;
}
