import Link from "next/link";
import { redirect } from "next/navigation";
import { adminConfiguration, currentAdmin } from "@/server/admin-session";
export const dynamic = "force-dynamic";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentAdmin()) redirect("/admin");
  const configured = Boolean(adminConfiguration());
  const error = (await searchParams).error;
  const errors: Record<string, string> = {
    account: "This Google Account is not on the administrator list. Choose the approved account and try again.",
    identity: "Google did not return a verified account identity. Try again with your approved Google Account.",
    mfa_unavailable: "Google confirmed your identity but did not provide the MFA information required by this app. This is a Lovelybakes sign-in setup issue, not an incorrect password. An additional verification method must be connected before admin access can open.",
    mfa_required: "Google did not confirm multi-factor authentication for this session. Complete Google two-step verification, then try again.",
    session: "Your sign-in session expired or could not be matched. Start again from this page in the same browser.",
    cancelled: "Google sign-in was cancelled or denied. You can try again when ready.",
    exchange: "Lovelybakes could not complete the secure exchange with Google. Please try again; if it repeats, the Google client configuration needs checking.",
    verification: "The Google sign-in response could not be verified. Please start sign-in again.",
    session_save: "Lovelybakes could not save your sign-in session. Please try again.",
  };
  return <><header className="admin-header"><Link className="admin-brand" href="/">Lovelybakes <small>by Nash</small></Link><Link href="/">View shop ↗</Link></header><main className="admin-panel admin-login"><p>YOUR LOVELYBAKES STUDIO</p><h1>A little space for your lovely creations.</h1><p>Manage your cakes, photographs and prices in one place.</p>{error && <div className="admin-message" role="alert">{errors[error] ?? "Sign-in could not be completed. Please try again so we can identify the specific problem."}</div>}{configured ? <a className="google-button" href="/api/auth/login">Continue with Google</a> : <div className="admin-message"><strong>Google sign-in is being connected.</strong><p>The studio will open once the approved Google login and catalog storage are configured.</p><Link href="/admin/preview">Preview the product editor →</Link></div>}<p className="admin-small">Access is limited to approved administrators. Your Google password is never shared with Lovelybakes.</p></main></>;
}
