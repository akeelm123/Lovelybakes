BEGIN;
CREATE TABLE customer_order (
  customer_order_id UUID PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending_payment', 'paid', 'preparing', 'ready', 'fulfilled', 'cancelled')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('visa', 'paynow')),
  total_amount_cents BIGINT NOT NULL CHECK (total_amount_cents > 0),
  currency_code TEXT NOT NULL CHECK (currency_code = 'SGD'),
  payment_provider_reference TEXT UNIQUE,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE customer_order_item (
  customer_order_item_id UUID PRIMARY KEY,
  customer_order_id UUID NOT NULL REFERENCES customer_order(customer_order_id),
  product_reference TEXT NOT NULL,
  product_name_snapshot TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  unit_price_cents BIGINT NOT NULL CHECK (unit_price_cents > 0),
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX customer_order_status_created ON customer_order(status, created_at_utc DESC);
CREATE INDEX customer_order_item_order ON customer_order_item(customer_order_id);
COMMIT;
