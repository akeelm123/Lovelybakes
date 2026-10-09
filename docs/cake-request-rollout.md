# Cake request workflow — release gates

This work is intentionally additive. Do not replace the production Stripe checkout until the request-and-approval flow is verified.

## Current implementation
- Public bespoke page with feature-flagged request form.
- POST /api/cake-requests validates and stores requests when CAKE_REQUEST_INTAKE_ENABLED=true.
- Admin GET /api/admin/cake-requests lists recent requests.
- Admin PATCH accepts only reviewing or declined with optimistic version matching.
- Migrations 013 and 014 define requests, weekly capacity and reservation structures.
- Admin capacity holds and quote storage are implemented behind separate feature flags. A dedicated Stripe-signed webhook reconciliation handler and administrator-only Stripe test Checkout session creator exist. Checkout links are shown to administrators but are not automatically sent. Cake-request-specific customer message templates and tests exist, but they are not connected to a notification outbox or delivery service.

## Before enabling intake
1. Apply and verify migrations 013 and 014 in an isolated preview database, not the production database.
2. Confirm authentication, MFA, same-origin protection and customer data retention.
3. Implement and test administrator review interface, audit trail and notifications.
4. Implement atomic weekly capacity checks with a configured slot limit, pause controls, held-slot expiry and release.
5. Implement quote and Stripe payment link issuance after explicit approval, with 48-hour expiry and webhook-verified confirmation.
6. Test duplicate submissions, concurrent requests, expired holds, cancellations, failed payments, blackout dates, collection/delivery and refunds.
7. Confirm approved customer-facing pricing, availability and policies.
8. Obtain explicit approval before production migration, environment flag changes or merging the branch.

## Operational rules
A request is never a booking. Only a successful verified payment against an approved, capacity-held request may confirm a booking. A database row with status 'approved' alone is insufficient. Existing paid orders remain under the legacy workflow until migration is separately approved.

## Payment safety review (pending)
- Migration 015 adds separate cake_request_payment and idempotent event records.
- CAKE_PAYMENT_WORKFLOW_ENABLED defaults to off. Do not enable it yet.
- Stripe session creation must bind a reviewed amount and approved cakeRequestId, persist the session ID before a payment link is delivered, and expire the Stripe session no later than the held slot.
- Stripe can report a successful payment after a hold has expired; current handler flags this for manual review rather than confirming a booking. Define and test a refund/exception-handling procedure before release.
- Ensure the Stripe webhook configuration routes cake payments only to the dedicated signed endpoint; avoid duplicate or cross-workflow processing.
- Validate all migration and transactional logic against an isolated Postgres database, including concurrent reservations and late webhook deliveries.

## Stripe Checkout session limitations
- Stripe Checkout sessions have a shorter maximum expiry than the 48-hour capacity hold. The current session creator uses at most 23 hours and never later than the capacity hold.
- Session creation is administrator-only and disabled by CAKE_PAYMENT_WORKFLOW_ENABLED. It does not send emails or payment links.
- The return page is not proof of payment; only a signed webhook can mark the reservation confirmed.
- Do not enable the payment feature before integration tests cover payment events arriving during session attachment, simultaneous administrator retries, session expiry, stale holds, refunds, webhook delivery failures and retry idempotency.
- The payment session may expire before the 48-hour hold. A new payment-session issuance and extension policy is still [TBD]; no automatic second session is implemented.
- A customer booking-confirmation notification is still [TBD].

## Security and integration review — 8 October 2026
- GitHub Actions run 37774195832 passed 15 unit tests, ESLint and Next.js build before subsequent payment-safety changes.
- New cake payment-session creation now requires a Stripe sk_test_ key even if the workflow flag is enabled; this intentionally blocks production payment collection through the new path.
- The webhook confirmation SQL now checks that the reservation is still held and unexpired at database-write time. A hold that expires at the boundary is sent to manual review, not confirmed.
- npm ci previously reported 10 dependency advisories (9 high, 1 critical). The affected packages and runtime exposure have not yet been triaged; do not merge without an npm audit and remediation review.
- Still unverified: isolated Postgres migrations, transaction concurrency, signed Stripe webhook integration, expiry worker races, refund/exception handling, and email notifications. Do not enable CAKE_REQUEST_INTAKE_ENABLED, CAKE_CAPACITY_RESERVATIONS_ENABLED or CAKE_PAYMENT_WORKFLOW_ENABLED in production.

## Staging verification update — 9 October 2026
- Latest verified staging deployment for the communication test workflow: Vercel READY at commit f466e7794076743d9039ee43d6749badfc9a7022. READY means the deployment completed, not that database-backed requests or payments have passed integration testing.
- Separate cake-request communication templates and tests cover request receipt, payment invitation, confirmed booking, manual review, HTTPS links and HTML escaping. They are **not yet wired to delivery**. Never claim that customers receive these messages.
- The isolated staging database previously failed authentication and the staging snapshot fallback prevents operational testing. Database credentials and schema state must be verified before enabling request intake.
- Admin request refresh and decline confirmation were added; manual-review payment warning is shown to staff.
- The full Option B logo is deliberately deferred until final visual UAT by the site owner.

### Operational go/no-go evidence required
1. Confirm the database is an **isolated preview instance**, check connection and inspect applied migrations 013–015. Do not run migrations on the production database.
2. Confirm authentication and MFA, request intake validation and deduplication, concurrent weekly capacity reservations, expired holds and release behaviour.
3. Test Stripe **test-mode** Checkout creation, webhook signature validation, replay/idempotency, payment success, expired session, late success/manual review and reconciliation errors.
4. Implement a separate cake-request notification outbox and delivery controls. Only send booking confirmation after verified payment **and** confirmed reservation. Add opt-in/out and data-retention handling as applicable.
5. Resolve dependency audit findings, validate tests and build, document refund and cancellation operations, and secure explicit owner approval before enabling flags or merging to production.
