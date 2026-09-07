BEGIN;
CREATE TABLE administrator_mfa_state (
  administrator_mfa_state_id UUID PRIMARY KEY,
  administrator_subject TEXT NOT NULL UNIQUE,
  failed_attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempt_count BETWEEN 0 AND 5),
  locked_until_utc TIMESTAMPTZ,
  last_accepted_step BIGINT NOT NULL DEFAULT -1,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMIT;
