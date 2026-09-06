# Lovelybakes operations runbook

## Health and incident checks

`GET /api/health` returns only `ok` or `degraded` and never exposes configuration. A degraded response means the application cannot reach PostgreSQL. Check Vercel runtime logs and Neon status before accepting orders. Stripe delivery is checked separately in the Stripe event log and the Lovelybakes payment-event ledger.

## Backup and restore

Neon is the system of record for products, content, orders, audit events, MFA state, notifications, and policies. Before production activation, confirm the selected Neon plan's restore window and perform a restore drill into an isolated branch. Verify table counts, the latest migration number, a published-content read, an administrator login, and a synthetic order read. Never restore production customer data into an unmasked non-production environment.

### UAT recovery rehearsal — 6 September 2026

A PostgreSQL 18 custom-format logical backup was restored into an isolated temporary Neon database. Validation found 14 application tables, 6 products, 3 synthetic orders, 2 payment events, 1 notification, and 1 retention policy, matching the UAT source at backup time. The temporary database and local backup file were deleted after validation. The stable UAT health endpoint returned `ok` after the exercise.

The first attempt used an incompatible PostgreSQL 17 client and its process diagnostic exposed the UAT connection URL. The attempt stopped before a restore database was created. The database role password was rotated immediately, the private local configuration and Release 2 branch secret were replaced, Release 2 was redeployed, and health was reverified. The disclosed credential is invalid. Future restore commands pass passwords through `PGPASSWORD` and never place connection URLs in command arguments.

### Refund rehearsal — 6 September 2026

Migration 011 was applied before the application deployment. A synthetic S$64.00 Stripe test-mode order was paid through hosted Checkout, confirmed by the signed webhook, then cancelled and fully refunded through the authenticated admin workflow. The order ended in `cancelled`, the refund ledger recorded `succeeded`, Stripe reported the same S$64.00 SGD refund as `succeeded`, and three ordered lifecycle events remained. The admin flow uses an inline reason and explicit confirmation; an uncertain provider response retains the pending ledger row and reuses its Stripe idempotency key on retry.

## Rate limiting

Migration 010 stores checkout counters in PostgreSQL so limits apply across Vercel instances. Bucket identifiers are hashed before storage. If the database is unavailable, checkout already fails closed; local development uses an in-process fallback. Add a scheduled cleanup for expired buckets before production launch.

## Rollback

Roll back application code by assigning the stable alias to the last known-good deployment. Database migrations are forward-only; restore into an isolated Neon branch and validate before any data recovery. Do not rewrite Git history or drop production tables during an incident.

## Alert thresholds

Alert the owner when health checks fail twice consecutively, Stripe webhook reconciliation returns 5xx, pending or failed emails accumulate after provider activation, or checkout failures rise materially above the established baseline. Final notification channels must be tested before launch.
