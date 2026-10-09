BEGIN;
-- Independent from legacy customer_order and its payment events.
CREATE TABLE cake_request_payment (
  cake_request_id UUID PRIMARY KEY REFERENCES cake_request(cake_request_id),
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  currency_code TEXT NOT NULL DEFAULT 'SGD' CHECK (currency_code = 'SGD'),
  stripe_session_id TEXT UNIQUE,
  state TEXT NOT NULL DEFAULT 'quoted' CHECK (state IN ('quoted','payment_pending','paid','expired','manual_review')),
  paid_at_utc TIMESTAMPTZ,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE cake_request_payment_event (
  stripe_event_id TEXT PRIMARY KEY,
  cake_request_id UUID NOT NULL REFERENCES cake_request(cake_request_id),
  event_type TEXT NOT NULL,
  outcome TEXT NOT NULL,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMIT;
