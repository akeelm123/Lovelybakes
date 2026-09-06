BEGIN;
CREATE TABLE customer_notification (
  customer_notification_id UUID PRIMARY KEY,
  customer_order_id UUID NOT NULL REFERENCES customer_order(customer_order_id),
  template_key TEXT NOT NULL CHECK (template_key IN ('order_confirmed','order_preparing','order_ready','order_fulfilled','order_cancelled')),
  template_version INTEGER NOT NULL CHECK (template_version > 0),
  recipient_email TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending','sent','failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  provider_reference TEXT,
  last_error_code TEXT,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at_utc TIMESTAMPTZ,
  UNIQUE (customer_order_id, template_key, template_version)
);
CREATE INDEX customer_notification_delivery_queue ON customer_notification(delivery_status, next_attempt_at_utc);
CREATE INDEX customer_notification_order_created ON customer_notification(customer_order_id, created_at_utc);
COMMIT;
