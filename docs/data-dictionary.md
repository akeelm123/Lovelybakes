# Order data dictionary

PostgreSQL OLTP storage. Apply versioned migration files through the deployment migration process; this migration has not been applied. Set database sessions to UTC. No card details or administrator credentials are stored.

| Table | Purpose | Surrogate primary key | Sensitive columns |
| --- | --- | --- | --- |
| customer_order | Customer contact, delivery, payment reference and fulfilment state | customer_order_id (UUID) | customer_name, customer_email, customer_phone, delivery_address: PII; payment_provider_reference: sensitive transaction reference |
| customer_order_item | Immutable product and price snapshots per order | customer_order_item_id (UUID) | Linked order reference is confidential |

Both tables use created_at_utc (TIMESTAMPTZ); customer_order also has updated_at_utc. Monetary values are integer Singapore cents. customer_order_item.customer_order_id references customer_order. All customer contact and address fields must be replaced with synthetic values before any non-production import; replace payment references too. Use synthetic-only test fixtures. Retention and deletion policy remain subject to business/privacy review.

## customer_notification

Durable transactional-email outbox and delivery history. UUID surrogate key; links to `customer_order`; stores the versioned template key, recipient, delivery state, attempt count, next retry time, provider reference, bounded error code, and UTC lifecycle timestamps. `recipient_email` is PII and `provider_reference` is sensitive. Both must be masked in non-production copies. The unique order/template/version key prevents duplicate customer messages.

## data_retention_policy

Versioned operational policy for customer-order retention. UUID surrogate key; stores a bounded retention period, UTC update time, and the administrator subject that changed it. `updated_by_subject` is administrator PII and must be masked outside production.

## customer_data_erasure_event

Immutable proof that customer contact and fulfilment details were erased from a terminal order. UUID surrogate key; links once to the retained order and records the reason, UTC execution time, and administrator subject. `executed_by_subject` is administrator PII and must be masked outside production. The event deliberately contains no deleted customer values.


## Catalog and administration

| Table | Purpose | Surrogate primary key | Sensitive columns |
| --- | --- | --- | --- |
| product | Product description, integer SGD price, local image reference, publishing state and optimistic edit version | product_id (UUID) | None; draft content is internal |
| product_image | Normalized WebP bytes for catalog photographs | product_image_id (UUID) | content may contain incidental PII; treat as PII until reviewed; never copy real uploads to non-production without approval |
| administrator_event | Append-only application audit records of product changes and image uploads | administrator_event_id (UUID) | actor_subject: PII (pseudonymous Google subject); replace with synthetic subjects in non-production |

product.product_image_id optionally references product_image; static curated images use image_path without an uploaded image row. product has created_at_utc and updated_at_utc. product_image has created_at_utc. administrator_event has occurred_at_utc. All are TIMESTAMPTZ; sessions must use UTC. Images contain no preserved EXIF/location metadata. Google subjects are logged instead of emails. Use synthetic photographs and subjects in non-production. No authentication secrets, passwords, or identity tokens are stored in these tables.

## site_content
One storefront content document, with saved draft and published snapshots.

| Column | Meaning | Classification |
| --- | --- | --- |
| site_content_id | UUID surrogate primary key | Internal |
| page_key | Unique storefront page identifier | Internal |
| draft_content | Validated text, approved image paths and HTTPS links | Public marketing content; no customer PII |
| published_content | Public version of the content, nullable before first publication | Public |
| version | Optimistic concurrency version | Internal |
| created_at_utc | Creation time, UTC | Internal |
| updated_at_utc | Last save time, UTC | Internal |
| published_at_utc | Last publication time, UTC | Internal |

`product_image` now also supplies website section images and the logo. Existing PII rules on `administrator_event.actor_subject` continue to apply to content audit events. Do not put customer data in marketing content.

## ordering_rule
Singleton operational rules for the storefront. UUID surrogate key; `rule_key` is the unique business key. Boolean fulfilment flags, integer SGD cents, bounded lead/advance day counts, public instructions and DATE[] blackout dates. `created_at_utc` and `updated_at_utc` are UTC. No PII.

## order_status_event
Immutable order fulfilment history. UUID surrogate key; foreign key to `customer_order`; previous/next statuses; UTC occurrence time. `actor_subject` is administrator PII and must be masked outside production. Customer-order additions: `fulfilment_method`, `requested_for_date` (calendar DATE), `order_notes` (customer PII), `delivery_fee_cents`, and optimistic `version`. Non-production orders must use synthetic identities and addresses.

## payment_event
Immutable Stripe webhook-processing ledger. UUID surrogate key; unique `(provider, external_event_id)` enforces idempotency. Links to `customer_order`, records event type, processed/ignored outcome, and `occurred_at_utc`. External event IDs are sensitive transaction references and must be replaced in non-production copies. `customer_order.checkout_request_key` is a customer-generated UUID used only to prevent duplicate orders; it is confidential and unique.

## administrator_mfa_state

Durable replay and lockout state for the administrator authenticator challenge. `administrator_mfa_state_id` is the UUID surrogate primary key. `administrator_subject` is a pseudonymous Google identifier classified as PII and must be replaced in non-production copies. Failed-attempt count, lock expiry in UTC, last accepted TOTP step, creation time in UTC and update time in UTC support replay prevention and a distributed fifteen-minute lockout. The authenticator secret is never stored in the database.
