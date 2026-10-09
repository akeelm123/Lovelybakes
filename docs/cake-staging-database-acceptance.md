# Cake staging database acceptance gate

Status: **BLOCKED — awaiting verified isolated staging database**.

This runbook applies only to the `feat/editorial-patisserie-foundation` preview branch. Do not alter production environment variables, database credentials, data or feature flags.

## Observed configuration (9 October 2026)

- The preview environment exposes an encrypted `STAGING_DATABASE_URL` integration variable.
- The application uses `DATABASE_URL`; no `DATABASE_URL` mapping is configured for this branch.
- `UAT_DATABASE_FALLBACK` is configured for this branch, and snapshot fallback has been used for visual preview.
- A separate preview `DATABASE_URL` exists for branch `release-2`; do not copy or reuse it without explicit isolation verification.
- Cake intake, capacity and payment feature flags were not found configured in the reviewed environment inventory. Keep them off.
- A green build or passing unit tests do not establish database connectivity or schema correctness.

## Owner/provider evidence required before any credential mapping

1. Confirm the staging database project/instance identifier and that it is distinct from the production database project/instance.
2. Confirm a dedicated least-privilege application database user and separate migration credentials, with no production access.
3. Confirm the intended preview branch scope and that no secret is shared with production.
4. Approve binding the verified staging connection to `DATABASE_URL` for **this preview branch only**.
5. Confirm whether to disable snapshot fallback only after connection and schema probes succeed.

Do not paste passwords or connection strings into tickets, chats, GitHub commits or logs.

## Read-only checks after the owner approves the isolated binding

Run authenticated admin database readiness endpoint `/api/admin/cake-database-readiness`. Verify a successful connection and presence of all six required tables:

- `cake_request`
- `cake_capacity_week`
- `cake_capacity_reservation`
- `cake_request_payment`
- `cake_request_payment_event`
- `cake_request_notification`

These checks are necessary but not sufficient. Inspect migrations 013–016 and their constraints against the expected schema, verify migrations were applied to staging only, and confirm the staging database has no production customer records. Do not rely on a table-presence check alone.

## Operational acceptance (only after isolated database verification)

1. Verify admin authentication and MFA; keep customer intake disabled.
2. Apply migrations 013–016 to the verified staging instance with a backup/rollback plan.
3. Enable one cake workflow feature at a time **only with explicit owner approval** and use synthetic customer data.
4. Test duplicate submissions, competing weekly reservations, expired holds, review/decline, and failed transactions.
5. Configure a dedicated Stripe **test-mode** signing secret, validate signed webhook delivery and replay, late payment manual review, and expiry behaviour.
6. Confirm booking only when Stripe test payment is verified **and** capacity reservation is confirmed.
7. Keep notification outbox delivery disconnected until the owner approves sending and the email templates, retention and unsubscribe requirements have been reviewed.
8. Record evidence and obtain a separate production release approval. Do not merge or activate live payment flags as part of staging acceptance.

## Stop conditions

Stop immediately if database isolation is uncertain, authentication fails, the schema is incomplete, Stripe credentials are live-mode, or a test appears to touch production. Revert preview-only changes and investigate before proceeding.
