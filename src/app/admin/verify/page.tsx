import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin, pendingAdmin } from "@/server/admin-session";
export const dynamic = "force-dynamic";
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentAdmin()) redirect("/admin");
  if (!await pendingAdmin()) redirect("/admin/login?error=session");
  const { error } = await searchParams;
  const messages: Record<string, string> = { invalid: "That code is incorrect or has already been used. Wait for the next code and try again.", locked: "Too many attempts. Wait 15 minutes, then sign in again.", unavailable: "Verification is temporarily unavailable. Please try again." };
  return <><header className="admin-header"><Link href="/">Lovelybakes studio</Link></header><main className="admin-panel admin-login"><h1>One more step.</h1><p>Google confirmed your identity. Enter the six-digit Lovelybakes code from your authenticator app.</p>{error && <p className="admin-message" role="alert">{messages[error] ?? messages.invalid}</p>}<form action="/api/auth/verify" method="post" className="admin-form"><div className="admin-field"><label htmlFor="authenticator-code">Authenticator code</label><input id="authenticator-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required /></div><button className="primary-button" type="submit">Verify & open studio</button></form><p className="admin-small">First time? Add the setup key from the private Lovelybakes authenticator setup file to your authenticator app. It is separate from your Google verification code.</p><Link href="/admin/login">Start sign-in again</Link></main></>;
}
