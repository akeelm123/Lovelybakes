BEGIN;
-- Dedicated cake-request notification outbox. No email is sent by this migration.
-- Separate from legacy customer_order notifications and payment processing.
CREATE TABLE cake_request_notification (
  notification_id UUID PRIMARY KEY,
  cake_request_id UUID NOT NULL REFERENCES cake_request(cake_request_id),
  message_type TEXT NOT NULL CHECK (message_type IN ('request_received','payment_invitation','booking_confirmed','manual_review')),
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','sent','failed','cancelled')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  provider_reference TEXT,
  last_error_code TEXT,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at_utc TIMESTAMPTZ,
  UNIQUE(cake_request_id, message_type)
);
CREATE INDEX cake_request_notification_due
  ON cake_request_notification(next_attempt_at_utc, created_at_utc)
  WHERE status IN ('pending','failed');
COMMIT;
