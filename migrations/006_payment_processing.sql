BEGIN;
ALTER TABLE customer_order ADD COLUMN checkout_request_key UUID UNIQUE;
CREATE TABLE payment_event (
  payment_event_id UUID PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('stripe')),
  external_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  customer_order_id UUID REFERENCES customer_order(customer_order_id),
  processing_outcome TEXT NOT NULL CHECK (processing_outcome IN ('processed', 'ignored')),
  occurred_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, external_event_id)
);
CREATE INDEX payment_event_order_occurred ON payment_event(customer_order_id, occurred_at_utc);
COMMIT;
