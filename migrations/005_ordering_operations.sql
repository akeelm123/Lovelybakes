BEGIN;
CREATE TABLE ordering_rule (
  ordering_rule_id UUID PRIMARY KEY,
  rule_key TEXT NOT NULL UNIQUE CHECK (rule_key = 'storefront'),
  collection_enabled BOOLEAN NOT NULL,
  delivery_enabled BOOLEAN NOT NULL,
  delivery_fee_cents INTEGER NOT NULL CHECK (delivery_fee_cents BETWEEN 0 AND 10000),
  minimum_order_cents INTEGER NOT NULL CHECK (minimum_order_cents BETWEEN 0 AND 1000000),
  lead_time_days INTEGER NOT NULL CHECK (lead_time_days BETWEEN 1 AND 90),
  maximum_advance_days INTEGER NOT NULL CHECK (maximum_advance_days BETWEEN lead_time_days AND 365),
  collection_instructions TEXT NOT NULL CHECK (length(collection_instructions) BETWEEN 1 AND 500),
  delivery_area TEXT NOT NULL CHECK (length(delivery_area) BETWEEN 1 AND 500),
  blackout_dates DATE[] NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (collection_enabled OR delivery_enabled)
);
INSERT INTO ordering_rule (ordering_rule_id, rule_key, collection_enabled, delivery_enabled, delivery_fee_cents, minimum_order_cents, lead_time_days, maximum_advance_days, collection_instructions, delivery_area)
VALUES ('f05bf2da-571a-48dc-934e-298a81747d9b', 'storefront', true, false, 0, 3000, 5, 90, 'Collection details are confirmed after an order is accepted.', 'Delivery is currently unavailable.');
ALTER TABLE customer_order ADD COLUMN fulfilment_method TEXT CHECK (fulfilment_method IN ('collection', 'delivery'));
ALTER TABLE customer_order ADD COLUMN requested_for_date DATE;
ALTER TABLE customer_order ADD COLUMN order_notes TEXT CHECK (order_notes IS NULL OR length(order_notes) <= 1000);
ALTER TABLE customer_order ADD COLUMN delivery_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (delivery_fee_cents BETWEEN 0 AND 10000);
ALTER TABLE customer_order ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
CREATE TABLE order_status_event (
  order_status_event_id UUID PRIMARY KEY,
  customer_order_id UUID NOT NULL REFERENCES customer_order(customer_order_id),
  from_status TEXT CHECK (from_status IS NULL OR from_status IN ('pending_payment', 'paid', 'preparing', 'ready', 'fulfilled', 'cancelled')),
  to_status TEXT NOT NULL CHECK (to_status IN ('pending_payment', 'paid', 'preparing', 'ready', 'fulfilled', 'cancelled')),
  actor_subject TEXT NOT NULL,
  occurred_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX order_status_event_order_occurred ON order_status_event(customer_order_id, occurred_at_utc);
COMMIT;
