# Cake request workflow — release gates

This work is intentionally additive. Do not replace the production Stripe checkout until the request-and-approval flow is verified.

## Current implementation
- Public bespoke page with feature-flagged request form.
- POST /api/cake-requests validates and stores requests when CAKE_REQUEST_INTAKE_ENABLED=true.
- Admin GET /api/admin/cake-requests lists recent requests.
- Admin PATCH accepts only reviewing or declined with optimistic version matching.
- Migrations 013 and 014 define requests, weekly capacity and reservation structures.
- No administrator approval, capacity reservation, payment link, customer notifications, or confirmation is implemented yet.

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
