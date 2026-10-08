# Cake request workflow — release gates

This work is intentionally additive. Do not replace the production Stripe checkout until the request-and-approval flow is verified.

## Current implementation
- Public bespoke page with feature-flagged request form.
- POST /api/cake-requests validates and stores requests when CAKE_REQUEST_INTAKE_ENABLED=true.
- Admin GET /api/admin/cake-requests lists recent requests.
- Admin PATCH accepts only reviewing or declined with optimistic version matching.
- Migrations 013 and 014 define requests, weekly capacity and reservation structures.
- Admin capacity holds and quote storage are implemented behind separate feature flags. A dedicated Stripe-signed webhook reconciliation handler exists but has no payment-session creation path yet. No payment link is issued or sent, and customer notifications remain unimplemented.

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
