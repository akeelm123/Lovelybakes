# Lovelybakes operations runbook

## Health and incident checks

`GET /api/health` returns only `ok` or `degraded` and never exposes configuration. A degraded response means the application cannot reach PostgreSQL. Check Vercel runtime logs and Neon status before accepting orders. Stripe delivery is checked separately in the Stripe event log and the Lovelybakes payment-event ledger.

## Backup and restore

Neon is the system of record for products, content, orders, audit events, MFA state, notifications, and policies. Before production activation, confirm the selected Neon plan's restore window and perform a restore drill into an isolated branch. Verify table counts, the latest migration number, a published-content read, an administrator login, and a synthetic order read. Never restore production customer data into an unmasked non-production environment.

## Rate limiting

Migration 010 stores checkout counters in PostgreSQL so limits apply across Vercel instances. Bucket identifiers are hashed before storage. If the database is unavailable, checkout already fails closed; local development uses an in-process fallback. Add a scheduled cleanup for expired buckets before production launch.

## Rollback

Roll back application code by assigning the stable alias to the last known-good deployment. Database migrations are forward-only; restore into an isolated Neon branch and validate before any data recovery. Do not rewrite Git history or drop production tables during an incident.

## Alert thresholds

Alert the owner when health checks fail twice consecutively, Stripe webhook reconciliation returns 5xx, pending or failed emails accumulate after provider activation, or checkout failures rise materially above the established baseline. Final notification channels must be tested before launch.
