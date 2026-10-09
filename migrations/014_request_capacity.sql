BEGIN;
-- Capacity reservations are separate from legacy paid orders.
-- This migration alone does not enable or enforce reservations.
CREATE TABLE cake_capacity_week (
  week_start_date DATE PRIMARY KEY,
  slot_limit INTEGER NOT NULL CHECK (slot_limit >= 0),
  paused BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE cake_capacity_reservation (
  reservation_id UUID PRIMARY KEY,
  cake_request_id UUID NOT NULL UNIQUE REFERENCES cake_request(cake_request_id),
  week_start_date DATE NOT NULL REFERENCES cake_capacity_week(week_start_date),
  slots INTEGER NOT NULL CHECK (slots BETWEEN 1 AND 20),
  state TEXT NOT NULL CHECK (state IN ('held','confirmed','released','expired')),
  expires_at_utc TIMESTAMPTZ,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((state = 'held' AND expires_at_utc IS NOT NULL) OR state <> 'held')
);
CREATE INDEX cake_capacity_reservation_week ON cake_capacity_reservation(week_start_date, state);
COMMIT;
