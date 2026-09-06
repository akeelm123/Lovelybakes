BEGIN;
CREATE TABLE data_retention_policy (
  data_retention_policy_id UUID PRIMARY KEY,
  policy_key TEXT NOT NULL UNIQUE CHECK (policy_key = 'customer_order'),
  retention_days INTEGER NOT NULL CHECK (retention_days BETWEEN 30 AND 2555),
  version INTEGER NOT NULL DEFAULT 1,
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by_subject TEXT NOT NULL
);
CREATE TABLE customer_data_erasure_event (
  customer_data_erasure_event_id UUID PRIMARY KEY,
  customer_order_id UUID NOT NULL REFERENCES customer_order(customer_order_id),
  reason TEXT NOT NULL CHECK (reason IN ('retention_policy','customer_request')),
  executed_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_by_subject TEXT NOT NULL,
  UNIQUE (customer_order_id)
);
INSERT INTO data_retention_policy (data_retention_policy_id,policy_key,retention_days,updated_by_subject)
VALUES ('d6765dd4-769f-5f18-b8e5-8bb40fd0d453','customer_order',180,'migration_009');
COMMIT;
