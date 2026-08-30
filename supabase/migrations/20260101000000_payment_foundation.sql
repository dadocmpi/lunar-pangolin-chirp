-- ============================================================================
-- Payment foundation migration
-- ============================================================================
-- Adds:
--   1. Strict payment status enum
--   2. payments table (server-side source of truth)
--   3. Idempotency constraints (user_id, idempotency_key) and
--      (user_id, plan_id, activated) where activated = true
--   4. payment_audit_log table (append-only, never updated, never deleted)
--   5. services table additions (source_payment_id, activated)
--   6. RLS policies (no public read/write)
--   7. Helper RPC: read_payment_status(p_payment_id) — used by payment-status
--      endpoint to return only the fields a user is allowed to see.
-- ============================================================================

-- Drop in reverse dependency order so this is idempotent in dev.
DROP TABLE IF EXISTS payment_audit_log CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP FUNCTION IF EXISTS read_payment_status(text) CASCADE;

-- ---------------------------------------------------------------------------
-- Enum
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'created',
    'pending',
    'processing',
    'confirmed',
    'failed',
    'rejected',
    'refunded',
    'disputed',
    'canceled',
    'pending_manual'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
CREATE TABLE payments (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan_id               text NOT NULL,
  amount_cents          bigint NOT NULL CHECK (amount_cents > 0),
  currency              text NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  network               text,                       -- BTC/TRC20/etc. (nullable for Wise)
  method                text NOT NULL CHECK (method IN ('wise','crypto','card')),
  idempotency_key       text NOT NULL,
  status                payment_status NOT NULL DEFAULT 'created',
  metadata              jsonb NOT NULL DEFAULT '{}'::jsonb,
  verified_amount_cents bigint,
  verified_network      text,
  verified_tx_hash      text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payments_user_idem_unique
    UNIQUE (user_id, idempotency_key)
);

CREATE INDEX payments_user_id_idx ON payments (user_id);
CREATE INDEX payments_status_idx ON payments (status);
CREATE INDEX payments_plan_id_idx ON payments (plan_id);

-- ---------------------------------------------------------------------------
-- payment_audit_log (append-only)
-- ---------------------------------------------------------------------------
CREATE TABLE payment_audit_log (
  id              bigserial PRIMARY KEY,
  payment_id      uuid NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  actor           text NOT NULL CHECK (actor IN ('system','user','admin','auto_confirm')),
  source          text NOT NULL CHECK (source IN ('wise','crypto','card','admin','test')),
  event_id        text NOT NULL,
  previous_status payment_status,
  new_status      payment_status NOT NULL,
  reason          text NOT NULL CHECK (length(reason) <= 200),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Block updates/deletes on the audit log. Inserts only.
CREATE OR REPLACE FUNCTION block_audit_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'payment_audit_log is append-only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_audit_log_no_update ON payment_audit_log;
CREATE TRIGGER payment_audit_log_no_update
  BEFORE UPDATE OR DELETE ON payment_audit_log
  FOR EACH ROW EXECUTE FUNCTION block_audit_mutation();

CREATE INDEX payment_audit_log_payment_id_idx ON payment_audit_log (payment_id);
CREATE UNIQUE INDEX payment_audit_log_event_id_unique
  ON payment_audit_log (payment_id, event_id);

-- ---------------------------------------------------------------------------
-- services: add source_payment_id and activated
-- ---------------------------------------------------------------------------
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS source_payment_id uuid REFERENCES payments(id),
  ADD COLUMN IF NOT EXISTS activated boolean NOT NULL DEFAULT false;

-- A user can have at most one ACTIVE service per plan. This is the second
-- layer of defense against accidental duplicate activations.
CREATE UNIQUE INDEX services_user_plan_activated_unique
  ON services (user_id, plan_id)
  WHERE activated = true;

-- ---------------------------------------------------------------------------
-- Helper RPC used by payment-status Edge Function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION read_payment_status(p_payment_id text)
RETURNS TABLE (
  id uuid,
  status payment_status,
  plan_id text,
  amount_cents bigint,
  currency text,
  network text,
  method text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, status, plan_id, amount_cents, currency, network, method, created_at, updated_at
  FROM payments
  WHERE id = p_payment_id::uuid
    AND user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION read_payment_status(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION read_payment_status(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own payments (no write).
CREATE POLICY payments_self_read ON payments
  FOR SELECT USING (user_id = auth.uid());

-- No public write to payments. All writes go through service role.
CREATE POLICY payments_no_insert ON payments FOR INSERT WITH CHECK (false);
CREATE POLICY payments_no_update ON payments FOR UPDATE USING (false);
CREATE POLICY payments_no_delete ON payments FOR DELETE USING (false);

-- Users can read their own audit log.
CREATE POLICY payment_audit_log_self_read ON payment_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM payments p WHERE p.id = payment_audit_log.payment_id AND p.user_id = auth.uid())
  );

CREATE POLICY payment_audit_log_no_write ON payment_audit_log FOR INSERT WITH CHECK (false);
CREATE POLICY payment_audit_log_no_update ON payment_audit_log FOR UPDATE USING (false);
CREATE POLICY payment_audit_log_no_delete ON payment_audit_log FOR DELETE USING (false);