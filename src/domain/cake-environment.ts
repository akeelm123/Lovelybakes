// Fail closed for the new cake workflow while the staging storefront is
// running from a static catalogue snapshot. This does not affect legacy orders.
export function cakeTransactionalDatabaseReady(env: {
  DATABASE_URL?: string;
  UAT_DATABASE_FALLBACK?: string;
} = process.env): boolean {
  return Boolean(env.DATABASE_URL?.trim()) && env.UAT_DATABASE_FALLBACK !== "snapshot";
}
