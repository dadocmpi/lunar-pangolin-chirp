-- ============================================================================
-- Repair migration: create the payment/application tables required by the
-- live Edge Functions.
--
-- Context: the live project is missing public.applications,
-- public.pending_payments, public.payments and public.payment_audit_log, so
-- application-submit fails at its INSERT with PGRST205 / relation does not
-- exist. An earlier migration chain also altered pending_payments before ever
-- creating it, so the chain could not be replayed from scratch.
--
-- This migration is ADDITIVE and IDEMPOTENT:
--   * no DROP TABLE / DROP COLUMN
--   * no DELETE / TRUNCATE
--   * no destructive changes to existing data
--   * does not touch profiles
--   * does not alter services business behaviour (no new columns are added to
--     services here; the payment functions that reference services use columns
--     managed by other migrations)
--   * safe to apply to the existing live database
--
-- It creates, in dependency order:
--   1. enum types (only if missing)
--   2. pending_payments
--   3. payments
--   4. payment_audit_log
--   5. applications
--
-- Column sets were derived from the actual source of application-submit,
-- stripe-checkout, stripe-webhook, payment-status, activate-account,
-- application-activate, application-reject, operator-action, operator-
-- notification, the frontend pages that read these tables directly
-- (Checkout, CheckoutSuccess, OperatorDashboard), and the shared helpers in
-- supabase/functions/_shared/.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. ENUM TYPES (created only when absent)
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
-- 1b. RECONCILE A PARTIAL APPLICATION OF THE OLDER CHAIN
--     An earlier migration (20260301000000) created applications.payment_status
--     as the payment_status ENUM, which cannot hold the 'payment_confirmed' or
--     'past_due' values the functions write. If that table already exists with
--     an enum column, widen it to text. This preserves every existing value and
--     is a no-op on a fresh database.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'applications'
      AND column_name = 'payment_status'
      AND data_type = 'USER-DEFINED'
  ) THEN
    ALTER TABLE applications
      ALTER COLUMN payment_status TYPE text USING payment_status::text;
  END IF;
END $$;

-- The old test-payment migration added a CHECK limiting status_enum to the 10
-- canonical values. Stripe writes lifecycle values (past_due, incomplete,
-- incomplete_expired, trialing, paused), so that constraint is dropped after the
-- table is created below. See step 2b.

-- ---------------------------------------------------------------------------
-- 2. pending_payments
--    Columns used by stripe-checkout (insert), stripe-webhook (insert/update),
--    payment-status, activate-account, operator-action, the option_a helpers,
--    crypto-confirmation, and CheckoutSuccess.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pending_payments (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan_id                text,
  plan_name              text,
  amount_cents           bigint NOT NULL DEFAULT 0,
  currency               text NOT NULL DEFAULT 'USD',
  network                text,
  method                 text NOT NULL DEFAULT 'crypto',
  idempotency_key        text,
  -- legacy text status kept for backwards compatibility; the canonical value
  -- lives in status_enum.
  status                 text NOT NULL DEFAULT 'pending',
  -- Canonical status. Free text: the code writes both the 10 canonical enum
  -- values and Stripe lifecycle states (past_due, incomplete, trialing,
  -- paused). A CHECK keeps obviously wrong values out without breaking the
  -- Stripe renewal flow.
  status_enum            text NOT NULL DEFAULT 'pending'
                           CHECK (status_enum IN (
                             'created','pending','processing','confirmed','failed',
                             'rejected','refunded','disputed','canceled','pending_manual',
                             'past_due','incomplete','incomplete_expired','trialing','paused',
                             'payment_confirmed'
                           )),
  account_id             text,
  tx_hash                text,
  confirmed_at           timestamptz,
  verified_amount_cents  bigint,
  verified_network       text,
  verified_tx_hash       text,
  metadata               jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- Legacy compatibility: the original payment_foundation migration referenced
-- amount_usd and account_size on this table. Add them only if absent so the
-- optional backfill migration can run unchanged.
ALTER TABLE pending_payments
  ADD COLUMN IF NOT EXISTS amount_usd   numeric,
  ADD COLUMN IF NOT EXISTS account_size text;

-- 2b. Drop the narrow legacy status CHECK if a previous migration installed it,
--     then install the wider repair CHECK (idempotent via pg_constraint check).
ALTER TABLE pending_payments
  DROP CONSTRAINT IF EXISTS pending_payments_status_enum_check;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pending_payments_status_enum_repair_check'
  ) THEN
    ALTER TABLE pending_payments
      ADD CONSTRAINT pending_payments_status_enum_repair_check CHECK (status_enum IN (
        'created','pending','processing','confirmed','failed',
        'rejected','refunded','disputed','canceled','pending_manual',
        'past_due','incomplete','incomplete_expired','trialing','paused',
        'payment_confirmed'
      ));
  END IF;
END $$;

-- Indexes used by the functions' lookups.
CREATE INDEX IF NOT EXISTS pending_payments_user_id_idx     ON pending_payments (user_id);
CREATE INDEX IF NOT EXISTS pending_payments_status_enum_idx ON pending_payments (status_enum);
CREATE INDEX IF NOT EXISTS pending_payments_method_idx      ON pending_payments (method);
CREATE INDEX IF NOT EXISTS pending_payments_created_at_idx  ON pending_payments (created_at DESC);

-- Idempotency: one row per (user_id, idempotency_key) when the key is set.
CREATE UNIQUE INDEX IF NOT EXISTS pending_payments_user_idem_unique
  ON pending_payments (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Test-payment filtering for the admin path (metadata.is_test).
CREATE INDEX IF NOT EXISTS pending_payments_is_test_idx
  ON pending_payments ((metadata->>'is_test'))
  WHERE metadata->>'is_test' = 'true';

-- ---------------------------------------------------------------------------
-- 3. payments
--    Columns used by the payments helper (_shared/payments.ts) and
--    crypto-auto-confirm. This is the historical/normalised payment record.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan_id                text NOT NULL,
  amount_cents           bigint NOT NULL CHECK (amount_cents >= 0),
  currency               text NOT NULL DEFAULT 'USD',
  network                text,
  method                 text NOT NULL CHECK (method IN ('wise','crypto','card')),
  idempotency_key        text NOT NULL,
  status                 payment_status NOT NULL DEFAULT 'created',
  metadata               jsonb NOT NULL DEFAULT '{}'::jsonb,
  verified_amount_cents  bigint,
  verified_network       text,
  verified_tx_hash       text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payments_user_idem_unique UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS payments_user_id_idx    ON payments (user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx     ON payments (status);
CREATE INDEX IF NOT EXISTS payments_plan_id_idx    ON payments (plan_id);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments (created_at DESC);

-- ---------------------------------------------------------------------------
-- 4. payment_audit_log (append-only)
--    Columns used by stripe-webhook, application-activate, application-reject,
--    operator-action and the option_a audit helper. Two writers exist:
--      * direct inserts with payment_table = 'pending_payments' | 'applications'
--      * the log_payment_event RPC (payment_table = 'pending_payments')
--    actor values in the code: system, operator, admin, auto_confirm.
--    source values in the code: stripe, admin, crypto, wise, auto_confirm.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_audit_log (
  id               bigserial PRIMARY KEY,
  payment_table    text NOT NULL DEFAULT 'pending_payments'
                     CHECK (payment_table IN ('pending_payments','applications','payments')),
  payment_id       text NOT NULL,
  user_id          uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  actor            text NOT NULL
                     CHECK (actor IN ('system','user','admin','auto_confirm','operator')),
  source           text NOT NULL
                     CHECK (source IN ('wise','crypto','card','admin','test','stripe','auto_confirm')),
  event_id         text NOT NULL,
  previous_status  text,
  new_status       text NOT NULL,
  reason           text NOT NULL DEFAULT '' CHECK (length(reason) <= 200),
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Some environments created the table without payment_table/user_id. Add them
-- only when absent so both writer shapes work against the same table.
ALTER TABLE payment_audit_log
  ADD COLUMN IF NOT EXISTS payment_table text NOT NULL DEFAULT 'pending_payments',
  ADD COLUMN IF NOT EXISTS user_id       uuid REFERENCES auth.users(id) ON DELETE RESTRICT;

-- Reconcile constraints left by the older chain. The old payment_foundation
-- migration restricted actor/source/payment_table to narrower value sets than
-- the functions now write (e.g. actor 'operator', source 'stripe'). Drop those
-- narrow CHECK constraints when present; the repair CHECKs are installed below.
ALTER TABLE payment_audit_log
  DROP CONSTRAINT IF EXISTS payment_audit_log_actor_check,
  DROP CONSTRAINT IF EXISTS payment_audit_log_source_check,
  DROP CONSTRAINT IF EXISTS payment_audit_log_payment_table_check;

-- payment_id is text in the repair schema because writers pass either
-- pending_payments ids or applications ids. Widen it if an older migration
-- created it as uuid, and drop the FK to payments that no longer matches.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payment_audit_log'
      AND column_name = 'payment_id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE payment_audit_log
      ALTER COLUMN payment_id TYPE text USING payment_id::text;
  END IF;
END $$;
ALTER TABLE payment_audit_log
  DROP CONSTRAINT IF EXISTS payment_audit_log_payment_id_fkey;

-- Install the repair CHECKs (idempotent via pg_constraint lookups).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_audit_log_actor_repair_check'
  ) THEN
    ALTER TABLE payment_audit_log
      ADD CONSTRAINT payment_audit_log_actor_repair_check
      CHECK (actor IN ('system','user','admin','auto_confirm','operator'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_audit_log_source_repair_check'
  ) THEN
    ALTER TABLE payment_audit_log
      ADD CONSTRAINT payment_audit_log_source_repair_check
      CHECK (source IN ('wise','crypto','card','admin','test','stripe','auto_confirm'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_audit_log_table_repair_check'
  ) THEN
    ALTER TABLE payment_audit_log
      ADD CONSTRAINT payment_audit_log_table_repair_check
      CHECK (payment_table IN ('pending_payments','applications','payments'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS payment_audit_log_payment_id_idx
  ON payment_audit_log (payment_id);
CREATE INDEX IF NOT EXISTS payment_audit_log_created_at_idx
  ON payment_audit_log (created_at DESC);

-- Idempotency for webhook-driven audit rows: one row per (payment_table,
-- payment_id, event_id). Kept as a plain index creation with IF NOT EXISTS so
-- it is a no-op when an equivalent index already exists.
CREATE UNIQUE INDEX IF NOT EXISTS payment_audit_log_event_id_unique
  ON payment_audit_log (payment_table, payment_id, event_id);

-- Append-only enforcement: block UPDATE and DELETE for every role.
CREATE OR REPLACE FUNCTION block_audit_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'payment_audit_log is append-only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_audit_log_no_update ON payment_audit_log;
CREATE TRIGGER payment_audit_log_no_update
  BEFORE UPDATE OR DELETE ON payment_audit_log
  FOR EACH ROW EXECUTE FUNCTION block_audit_mutation();

-- ---------------------------------------------------------------------------
-- 5. applications
--    Columns written by application-submit (insert) and stripe-webhook /
--    activate-account / application-activate / application-reject (update).
--    Read directly by Checkout, OperatorDashboard and the functions.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan_key                    text NOT NULL,
  full_name                   text NOT NULL,
  email                       text NOT NULL,
  residential_address_line1   text,
  residential_address_line2   text,
  city                        text,
  region                      text,
  postal_code                 text,
  country                     text NOT NULL,
  phone                       text,
  -- payment_status uses free text: the code writes canonical enum values,
  -- 'payment_confirmed' and Stripe lifecycle values such as 'past_due'.
  payment_status              text NOT NULL DEFAULT 'pending',
  -- Activation is manual and operator-only. 'activation_pending' is set by the
  -- Stripe webhook on a confirmed payment; 'account_active'/'rejected' are set
  -- by operator actions.
  activation_status           text NOT NULL DEFAULT 'pending'
                                CHECK (activation_status IN (
                                  'pending','activation_pending','account_active',
                                  'rejected','manual_review'
                                )),
  activated_by                uuid REFERENCES auth.users(id),
  activated_at                timestamptz,
  terms_accepted_at           timestamptz,
  terms_version               text,
  privacy_accepted_at         timestamptz,
  privacy_version             text,
  customer_note               text,
  metadata                    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS applications_user_id_idx           ON applications (user_id);
CREATE INDEX IF NOT EXISTS applications_plan_key_idx          ON applications (plan_key);
CREATE INDEX IF NOT EXISTS applications_activation_status_idx ON applications (activation_status);
CREATE INDEX IF NOT EXISTS applications_payment_status_idx    ON applications (payment_status);
CREATE INDEX IF NOT EXISTS applications_created_at_idx        ON applications (created_at DESC);

-- Defensive completion for a table created by the older chain. Each of these is
-- a no-op on a fresh database and only fills genuine gaps.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS metadata      jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS customer_note text,
  ADD COLUMN IF NOT EXISTS region        text,
  ADD COLUMN IF NOT EXISTS updated_at    timestamptz NOT NULL DEFAULT now();

-- ---------------------------------------------------------------------------
-- 6. RLS
--
--    Threat model: the frontend uses the anon/authenticated key to read its own
--    rows. Every write to these tables is performed by Edge Functions using the
--    service role, which bypasses RLS. Therefore:
--      * users may SELECT only their own rows;
--      * users may NOT insert/update/delete (cannot confirm their own payment,
--        cannot activate their own account, cannot forge audit rows);
--      * the service role retains full access for server-side operations.
-- ---------------------------------------------------------------------------

ALTER TABLE pending_payments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;

-- pending_payments: owner read only.
DROP POLICY IF EXISTS pending_payments_owner_select ON pending_payments;
CREATE POLICY pending_payments_owner_select ON pending_payments
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- payments: owner read only.
DROP POLICY IF EXISTS payments_owner_select ON payments;
CREATE POLICY payments_owner_select ON payments
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- applications: owner read only. (Operator tooling reads via the service role;
-- a separate application-level operator check gates the operator functions.)
DROP POLICY IF EXISTS applications_owner_select ON applications;
CREATE POLICY applications_owner_select ON applications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- payment_audit_log: owner read only, but only for rows that carry a user_id.
-- Service role (used by all writers) bypasses RLS entirely.
DROP POLICY IF EXISTS payment_audit_log_owner_select ON payment_audit_log;
CREATE POLICY payment_audit_log_owner_select ON payment_audit_log
  FOR SELECT TO authenticated USING (user_id IS NOT NULL AND user_id = auth.uid());

-- Operator read access. The operator dashboard is a frontend page that reads
-- these tables directly, so it needs a policy. Only users whose JWT carries
-- app_metadata.operator = true are treated as operators; this mirrors the
-- operator check enforced server-side in application-activate.
DROP POLICY IF EXISTS applications_operator_select ON applications;
CREATE POLICY applications_operator_select ON applications
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'operator')::boolean IS TRUE);

DROP POLICY IF EXISTS pending_payments_operator_select ON pending_payments;
CREATE POLICY pending_payments_operator_select ON pending_payments
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'operator')::boolean IS TRUE);

-- Explicit deny policies for client-side writes. These are documentation of
-- intent; RLS already denies by default with no permissive INSERT/UPDATE/DELETE
-- policy. They make the "users cannot confirm/activate" rule explicit.
DROP POLICY IF EXISTS pending_payments_no_client_write ON pending_payments;
CREATE POLICY pending_payments_no_client_write ON pending_payments
  FOR INSERT TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS applications_no_client_write ON applications;
CREATE POLICY applications_no_client_write ON applications
  FOR INSERT TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS applications_no_client_update ON applications;
CREATE POLICY applications_no_client_update ON applications
  FOR UPDATE TO anon, authenticated USING (false);

DROP POLICY IF EXISTS payment_audit_log_no_client_insert ON payment_audit_log;
CREATE POLICY payment_audit_log_no_client_insert ON payment_audit_log
  FOR INSERT TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS payment_audit_log_no_client_update ON payment_audit_log;
CREATE POLICY payment_audit_log_no_client_update ON payment_audit_log
  FOR UPDATE TO anon, authenticated USING (false);

DROP POLICY IF EXISTS payment_audit_log_no_client_delete ON payment_audit_log;
CREATE POLICY payment_audit_log_no_client_delete ON payment_audit_log
  FOR DELETE TO anon, authenticated USING (false);