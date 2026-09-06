# Lovelybakes admin setup

Implemented `/admin/login`, `/admin`, and a public, non-saving `/admin/preview`. The preview cannot call any protected write endpoint successfully without authentication. Google authorization-code flow uses state, nonce, PKCE and an HttpOnly signed session cookie. Sessions expire within one hour and access is rechecked against the email allowlist on each request. No passwords or Google access tokens are stored in the database.

## Activation

1. Register a Google OAuth web client. Register the exact redirect URI `http://127.0.0.1:3000/api/auth/callback` for local UAT and the HTTPS callback for hosting. Enable the approved account as a test user when the consent screen is in testing mode.
2. Set local environment values in `.env.local` (never commit it): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS`, `ADMIN_SESSION_SECRET` (at least 32 random characters), `PUBLIC_APP_URL=http://127.0.0.1:3000`, and `DATABASE_URL` for PostgreSQL. Use the CPO-approved address saved in private local configuration, provided this address is a registered Google Account. The allowlist is not a general signup facility.
3. Apply migrations 001 and 002 in order through the migration process, once per database, using a restricted application role afterwards. No migration has been applied by this implementation task.
4. Restart the app, open `/admin/login`, and complete Google sign-in.

## MFA gate

The accepted threat model requires verified MFA. This implementation requires the Google ID token `amr` to contain `mfa`; it never assumes that email verification proves MFA. Validate this claim with the chosen Google account/configuration before activating. If Google does not supply suitable MFA evidence, a separately implemented app step-up (such as WebAuthn) or an identity provider able to assert MFA is required. Do not remove this check to make login pass.

## Product workflow

Create a draft, upload a JPG/PNG/WebP photograph up to 5 MB, add an accessible description, set an SGD price, then publish. Published products replace the sample catalog. A featured published product leads the storefront and supplies its hero image. Draft and archived products stay hidden. Versions prevent one editor silently overwriting another editor’s work.

Images are decoded, rotated, resized to fit 1600px, converted to WebP and stripped of metadata. Stored files are capped at 2 MB and source decompression at 24 million pixels. PostgreSQL stores binary images for this small initial catalog; a managed object store is a later scaling option. Unattached draft uploads remain private and require a retention cleanup policy. Product edits and image uploads generate database audit events in the same transaction.

## Still required before release

Google client configuration and end-to-end MFA verification, PostgreSQL provisioning and migration execution, real upload/edit/publish testing, durable shared rate limiting/WAF and infrastructure backups. Credentials and provisioning are not included in source code. Live checkout remains disabled.

Reference: https://developers.google.com/identity/openid-connect/openid-connect


Google compatibility correction: Google documents that `amr` requires an explicit claims request plus Authentication strength claims under Advanced Settings. The Security Bundle requires a published, verified app and the claim may still be absent. The local testing app therefore needs an app-owned second factor before its admin flow can be considered operational. Merely enabling Google two-step verification does not guarantee this claim is returned. The callback now reports fixed, non-sensitive failure categories; it never records tokens, authorization codes or account details. Source: https://developers.google.com/identity/siwg/security-bundle


## Local UAT authenticator fallback

The approved Google identity can now proceed to an isolated five-minute pending-MFA session. It grants no admin permissions. A six-digit RFC 6238 code must pass before a full session is created. The local seed is provisioned out of band in `.env.local`, with private enrollment instructions in `.private/authenticator-setup.txt`; neither is tracked. The Google-authenticated browser never receives the seed. Existing authenticated Google MFA remains supported.

This fallback only runs with an explicit local flag, exactly one approved email, a loopback application origin and no Vercel runtime. It stores no credentials in the application database. A single-host private state file persists replay counters and a 15-minute lockout after five incorrect codes, protected by an exclusive file lock. Any storage corruption/lock error fails closed. Host restart does not clear lockouts. A production rollout requires a durable managed MFA credential store and distributed verifier; do not enable this local adapter remotely. Lost-authenticator recovery requires the local enrollment file or a separately authorized local credential rotation; no public reset endpoint exists.

## Website content management
Apply migrations 003 and 004 after 001 and 002. Migration 004 imports the six existing storefront creations under stable UUIDs, retaining sample prices for UAT; rerunning it does not overwrite edits.

Products: select a cake from the catalog list to update or archive it. Website content: edit Brand, Hero, Highlights, Catalog, Custom orders, Story, FAQs, Footer and Search engines. Save draft persists changes without publishing. Preview saved draft is authenticated; Publish website updates every section together. Concurrent stale saves are rejected. Images reuse the validated image upload pipeline. The hero image is independently managed rather than changing when products are reordered.

Checkout and sign-in system messages remain controlled by application behavior. This release has one public storefront page; its linked sections are all editable. Local UAT uses PostgreSQL on loopback port 54329, with private data in `.private/postgres`; credentials stay in `.env.local`. UAT_MODE keeps sample-price and no-payment notices visible.

## Stripe payment connection
Migration 006 adds checkout request idempotency and the payment-event ledger. UAT requires a Stripe test secret (`sk_test_...`), a webhook signing secret, and `PAYMENTS_ENABLED=true`; a live key is rejected while `UAT_MODE=true`. Configure Stripe to send `checkout.session.completed` and `checkout.session.expired` to `/api/stripe/webhook`. The handler validates the raw-body signature, checks session/order identity, SGD currency and exact total, records each external event once, and then advances the order. Do not enable payments until the `/admin/payments` readiness screen is complete and the signed test checkout passes. No card data enters Lovelybakes.

## Customer email delivery

Migration 008 adds the customer notification outbox. Payment and fulfilment state changes enqueue versioned messages in the same database transaction as the order change. The unique order/template/version key prevents duplicate messages. `/admin/notifications` shows pending, sent and failed messages and allows an administrator to retry delivery.

Delivery remains paused unless both `RESEND_API_KEY` and `EMAIL_FROM` are configured. `EMAIL_FROM` must use a sender or domain verified by the chosen provider. Provider calls use the notification UUID as an idempotency key; failed attempts retain a bounded error code and an exponential next-attempt time. No public endpoint can send or retry email. Connect a sandbox provider and test only synthetic recipients before approving customer delivery.

## Privacy and retention controls

Migration 009 creates the versioned retention policy and immutable erasure audit. `/admin/privacy` defaults to 180 days and never deletes data automatically. An administrator can apply the policy only to fulfilled or cancelled orders after the configured period, or record a verified customer-request deletion for a terminal order. The transaction replaces customer identity, contact, address, notes, checkout key, and queued-email recipient. It retains order totals, item snapshots, statuses, Stripe references, and webhook IDs so financial audit and webhook idempotency remain intact. Active orders cannot be erased.
