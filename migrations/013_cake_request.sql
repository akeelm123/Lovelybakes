BEGIN;
-- Additive request intake. Existing customer_order and Stripe payment tables are unchanged.
CREATE TABLE cake_request (
  cake_request_id UUID PRIMARY KEY,
  submission_key UUID NOT NULL UNIQUE,
  customer_name TEXT NOT NULL CHECK (char_length(customer_name) BETWEEN 1 AND 120),
  customer_email TEXT NOT NULL CHECK (char_length(customer_email) BETWEEN 3 AND 254),
  customer_phone TEXT NOT NULL CHECK (char_length(customer_phone) BETWEEN 8 AND 20),
  requested_for_date DATE NOT NULL,
  fulfilment_preference TEXT NOT NULL CHECK (fulfilment_preference IN ('collection', 'delivery')),
  occasion TEXT NOT NULL DEFAULT '',
  cake_details TEXT NOT NULL CHECK (char_length(cake_details) BETWEEN 10 AND 3000),
  allergy_notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','reviewing','approved','declined','cancelled')),
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX cake_request_status_created ON cake_request(status, created_at_utc DESC);
CREATE INDEX cake_request_date ON cake_request(requested_for_date);
COMMIT;
