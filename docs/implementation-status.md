## Latest update: Vercel-ready administrator MFA

Release 2 now includes database-backed administrator authenticator state in migration 007. It provides replay prevention and a distributed fifteen-minute lockout across Vercel instances. The authenticator secret remains in managed environment configuration and is never stored in PostgreSQL. Production activation requires a managed PostgreSQL database, applied migrations, Google OAuth values and Vercel environment variables.

## Latest update: Stripe payment boundary

Migration 006 introduces checkout idempotency and an immutable payment-event ledger. Checkout derives products, prices, delivery fees, fulfilment availability and booking dates on the server. Stripe-hosted card sessions, raw-body signed webhooks, exact order/currency reconciliation, duplicate-event handling, expiry cancellation and a non-indexed confirmation page are implemented. `/admin/payments` shows connection readiness. UAT remains disabled until both Stripe test credentials are supplied; live Stripe keys are blocked in UAT. PayNow and outbound email providers are not selected.

## Latest update: ordering operations

Ordering rules, blackout dates, fulfilment methods and fees are editable under `/admin/ordering` and displayed by the UAT shop. `/admin/orders` provides synthetic-only UAT order creation, full item/customer details, ordered fulfilment transitions and durable status history. Live checkout and payment remain disabled; public forms still do not transmit or store customer details. Migration 005 adds `ordering_rule`, operational order columns and `order_status_event`.

## Latest update: existing products and website content

Local UAT now connects to private PostgreSQL on 127.0.0.1:54329. Migrations 001–004 are applied. The six existing storefront creations are editable under /admin. Their prices remain UAT sample prices.

/admin/content manages existing marketing copy, navigation labels, logo, hero/custom photographs, social links, FAQs, footer and search metadata. Save draft, authenticated draft preview and publish are implemented with optimistic concurrency and audit events. Published image access includes site sections; unpublished images remain admin-only. Checkout remains a preview.

Verification: editor interaction tests, API authorization and validation tests, isolated PostgreSQL roundtrips for draft/publish/conflicts/existing product edits, and build/lint checks. User must sign in again to verify the authenticated browser workflow in their session.

---

# Lovelybakes implementation status

The cancelled squad run remains unchanged. This work continues the existing application directly under the recorded implementation approval; it is not a security gate pass or release sign-off.

Implemented: sample catalog API, validated but disabled checkout boundary, OIDC/MFA protected admin order API, transactional fulfilment transitions, initial order storage migration and dictionary, cart persistence with validation and quantity limits, and drawer keyboard handling.

Live checkout stays disabled because the catalog contains unapproved sample products. No personal checkout information is transmitted by the preview UI. No migration has been applied and no services provisioned.

Remaining before a functioning commerce MVP:
- Approved catalog, photography, prices, delivery charges and operational policies.
- Payment provider configuration, signed webhook verification, amount/currency reconciliation, retry-safe order creation, refunds and payment expiry handling.
- Connect Google OAuth and PostgreSQL to activate the implemented admin login, photo uploads and product editor; verify Google MFA claims end-to-end. Customer order detail views and durable order-status audit storage remain outstanding.
- Email delivery with retries and notification status.
- Shared rate limiting, WAF, security headers, analytics consent interface and measurement backend.
- Migration verification against PostgreSQL, provider integration tests, desktop/mobile browser verification and security review.

The existing process-local rate limiter and console audit helper are not production controls. Secrets and paid resource setup require separate authorization. Nothing has been deployed or pushed.


Admin implementation: `/admin/login`, `/admin`, `/admin/preview`; protected product and photo APIs; draft/publish/archive controls; optimistic edit versions; transactional catalog audit; dynamic published storefront. Google client and database credentials are not supplied. No migration has been applied. Public preview deliberately disables uploads and saving. See admin-setup.md.

Validation: lint and production build pass; 18 tests pass including identity allowlist, verified email/MFA, JWT audience/expiry/tampering, request origin, product price/image validation, unauthenticated product writes, and edit conflicts. Browser checks confirmed login redirect, product switching and responsive editor. Real Google login, database storage, upload persistence and published-product roundtrip still need configured services.
