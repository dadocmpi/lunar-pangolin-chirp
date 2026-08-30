-- ============================================================================
-- Test payment mode migration
-- Adds the schema required for test-mode Wise + crypto checkouts,
-- a TEST-only admin confirmation, and a read-only payment-status RPC.
--
-- This migration is safe to apply in test mode. It does NOT add:
--   - any production wallet, bank, or PSP integration
--   - any cron, scheduler, or webhook
--   - any production activation path
--
-- Apply with:  psql "$DATABASE_URL" -f supabase/migrations/20260202000000_test_payment_mode.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- pending_payments — extend existing table (created in 20260101000000)
-- ---------------------------------------------------------------------------
ALTER TABLE pending_payments
  ADD COLUMN IF NOT EXISTS plan_id          text,
  ADD COLUMN IF NOT EXISTS plan_name        text,
  ADD COLUMN IF NOT EXISTS amount_cents     bigint,
  ADD COLUMN IF NOT EXISTS currency         text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS network          text,
  ADD COLUMN IF NOT EXISTS method           text NOT NULL DEFAULT 'crypto',
  ADD COLUMN IF NOT EXISTS status_enum      text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS idempotency_key  text,
  ADD COLUMN IF NOT EXISTS metadata         jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS verified_amount_cents bigint,
  ADD COLUMN IF NOT EXISTS verified_network text,
  ADD COLUMN IF NOT EXISTS verified_tx_hash text,
  ADD COLUMN IF NOT EXISTS updated_at       timestamptz NOT NULL DEFAULT now();

-- Backfill plan_id from plan_name if needed (no-op when not present)
UPDATE pending_payments
   SET plan_id = lower(regexp_replace(coalesce(plan_name, 'starter'), '[^a-zA-Z]+', '', 'g'))
 WHERE plan_id IS NULL;

-- Canonical 10-status enum CHECK constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pending_payments_status_enum_check'
  ) THEN
    ALTER TABLE pending_payments
      ADD CONSTRAINT pending_payments_status_enum_check CHECK (status_enum IN (
        'created','pending','processing','confirmed','failed',
        'rejected','refunded','disputed','canceled','pending_manual'
      ));
  END IF;
END$$;

-- Idempotency: one row per (user_id, idempotency_key) when idempotency_key is set
CREATE UNIQUE INDEX IF NOT EXISTS pending_payments_user_idem_uniq
  ON pending_payments (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Test-payments are filterable for the admin path
CREATE INDEX IF NOT EXISTS pending_payments_is_test_idx
  ON pending_payments ((metadata->>'is_test'))
  WHERE metadata->>'is_test' = 'true';

-- ---------------------------------------------------------------------------
-- services — add test-only columns
-- ---------------------------------------------------------------------------
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS is_test                  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS managed_capital_label    text NOT NULL DEFAULT 'REAL',
  ADD COLUMN IF NOT EXISTS source_payment_id        uuid;

-- Unique partial index: one TEST service per (user_id, plan_id)
CREATE UNIQUE INDEX IF NOT EXISTS services_test_user_plan_uniq
  ON services (user_id, plan_id)
  WHERE activated = true AND is_test = true;

-- ---------------------------------------------------------------------------
-- payment_audit_log — append-only audit trail
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_audit_log (
  id                bigserial PRIMARY KEY,
  payment_id        uuid NOT NULL,
  actor             text NOT NULL,
  source            text NOT NULL,
  event_id          text NOT NULL,
  previous_status   text,
  new_status        text NOT NULL,
  reason            text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS payment_audit_log_payment_event_uniq
  ON payment_audit_log (payment_id, event_id);

-- Block UPDATE and DELETE so the log is append-only
CREATE OR REPLACE FUNCTION payment_audit_log_no_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'payment_audit_log is append-only';
END$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_audit_log_no_update ON payment_audit_log;
CREATE TRIGGER payment_audit_log_no_update
  BEFORE UPDATE ON payment_audit_log
  FOR EACH ROW EXECUTE FUNCTION payment_audit_log_no_mutation();

DROP TRIGGER IF EXISTS payment_audit_log_no_delete ON payment_audit_log;
CREATE TRIGGER payment_audit_log_no_delete
  BEFORE DELETE ON payment_audit_log
  FOR EACH ROW EXECUTE FUNCTION payment_audit_log_no_mutation();

ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payment_audit_log_service_insert ON payment_audit_log;
CREATE POLICY payment_audit_log_service_insert ON payment_audit_log
  FOR INSERT TO service_role WITH CHECK (true);
DROP POLICY IF EXISTS payment_audit_log_service_select ON payment_audit_log;
CREATE POLICY payment_audit_log_service_select ON payment_audit_log
  FOR SELECT TO service_role USING (true);

-- ---------------------------------------------------------------------------
-- read_payment_status RPC — called by payment-status Edge Function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION read_payment_status(p_legacy_id text)
RETURNS TABLE (
  id            uuid,
  status        text,
  plan_id       text,
  plan_name     text,
  amount_cents  bigint,
  currency      text,
  network       text,
  method        text,
  created_at    timestamptz,
  updated_at    timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  RETURN QUERY
    SELECT
      pp.id,
      pp.status_enum,
      pp.plan_id,
      pp.plan_name,
      pp.amount_cents,
      pp.currency,
      pp.network,
      pp.method,
      pp.created_at,
      pp.updated_at
    FROM pending_payments pp
    WHERE pp.id::text = p_legacy_id
      AND pp.user_id = v_uid
    LIMIT 1;
END$$;

REVOKE ALL ON FUNCTION read_payment_status(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION read_payment_status(text) TO service_role;