BEGIN;

CREATE TABLE payment_refund (
  payment_refund_id UUID PRIMARY KEY,
  customer_order_id UUID NOT NULL REFERENCES customer_order(customer_order_id),
  provider TEXT NOT NULL CHECK (provider IN ('stripe')),
  provider_refund_reference TEXT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency_code CHAR(3) NOT NULL CHECK (currency_code = 'SGD'),
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 500),
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed')),
  requested_by_subject TEXT NOT NULL,
  failure_code TEXT,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at_utc TIMESTAMPTZ,
  UNIQUE (provider, provider_refund_reference)
);

CREATE INDEX payment_refund_order_created
  ON payment_refund(customer_order_id, created_at_utc);

COMMIT;
