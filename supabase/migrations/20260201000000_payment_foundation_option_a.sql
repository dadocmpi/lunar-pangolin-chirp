-- ============================================================================
-- Payment foundation — OPTION A
--   Extend pending_payments non-destructively. Keep it as the SINGLE source
--   of truth for both historical and future payment records.
--
--   This migration is IDEMPOTENT. It can be applied to a database that
--   already has data; it will not lose or rename any row, column, or table.
--
--   What it does (in order):
--     1. Creates the payment_status ENUM (no-op if it already exists).
--     2. Creates payment_audit_log (no-op if it already exists).
--     3. Creates the append-only trigger (CREATE OR REPLACE TRIGGER) and
--        unique (payment_table, payment_id, event_id) index on
--        payment_audit_log (no-op if they already exist).
--     4. Adds 6 additive, nullable columns to pending_payments.
--     5. Backfills the additive columns from the existing legacy columns.
--        Legacy columns are NEVER modified. The backfill is UPDATE-only
--        and uses WHERE <new column> IS NULL so it never overwrites values
--        written by the application.
--     6. Adds two additive columns to services.
--     7. Runs a read-only duplicate check on (user_id, idempotency_key)
--        in pending_payments. If duplicates exist, the migration ABORTS
--        with an explanatory error and does NOT change any row.
--     8. Creates the unique partial index pending_payments_user_idem_unique
--        ONLY after step 7 confirms no duplicates.
--     9. Runs a read-only duplicate check on (user_id, plan_name) in
--        services where status = 'Active'. If duplicates exist, ABORTS.
--    10. Creates the unique partial index services_user_plan_activated_unique
--        on (user_id, plan_name) WHERE activated = true. After the
--        migration this index contains zero rows because the default
--        for activated is false.
--    11. Enables RLS on payment_audit_log (no-op if already enabled).
--    12. Adds RLS policies on payment_audit_log (no-op if already present).
--    13. Creates the read_payment_status(text) RPC (CREATE OR REPLACE).
--    14. Creates the log_payment_event(...) RPC (CREATE OR REPLACE).
--
--   What it does NOT do:
--     - Does NOT drop, rename, truncate, or recreate any table.
--     - Does NOT drop or rename any column.
--     - Does NOT delete any row.
--     - Does NOT create a 'payments' table.
--     - Does NOT register a cron, scheduler, or webhook.
--     - Does NOT add any policy that denies existing reads on
--       pending_payments, services, or profiles.
--     - Does NOT add CASCADE to any foreign key.
--     - Does NOT cascade-delete from any table.
--     - Does NOT include a PAYMENTS_ENABLED gate in SQL.
--       Gate logic lives in the Edge Functions (application layer), not here.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. ENUM
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
-- 2. payment_audit_log (append-only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_audit_log (
  id               bigserial PRIMARY KEY,
  payment_table    text NOT NULL CHECK (payment_table IN ('pending_payments')),
  payment_id       text NOT NULL,
  user_id          uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  actor            text NOT NULL CHECK (actor IN ('system','user','admin','auto_confirm')),
  source           text NOT NULL CHECK (source IN ('wise','crypto','card','admin','test')),
  event_id         text NOT NULL,
  previous_status  payment_status,
  new_status       payment_status NOT NULL,
  reason           text NOT NULL CHECK (length(reason) <= 200),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION block_audit_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'payment_audit_log is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER payment_audit_log_no_update
  BEFORE UPDATE OR DELETE ON payment_audit_log
  FOR EACH ROW EXECUTE FUNCTION block_audit_mutation();

CREATE UNIQUE INDEX IF NOT EXISTS payment_audit_log_event_id_unique
  ON payment_audit_log (payment_table, payment_id, event_id);

-- ---------------------------------------------------------------------------
-- 3. Add additive columns to pending_payments
-- ---------------------------------------------------------------------------
ALTER TABLE pending_payments
  ADD COLUMN IF NOT EXISTS status_enum           payment_status,
  ADD COLUMN IF NOT EXISTS verified_amount_cents bigint,
  ADD COLUMN IF NOT EXISTS verified_network     text,
  ADD COLUMN IF NOT EXISTS verified_tx_hash    text,
  ADD COLUMN IF NOT EXISTS idempotency_key     text,
  ADD COLUMN IF NOT EXISTS amount_cents        bigint;

-- ---------------------------------------------------------------------------
-- 4. Backfill additive columns. Legacy columns are NEVER modified.
--    Each UPDATE is idempotent: WHERE <new column> IS NULL.
-- ---------------------------------------------------------------------------

-- 4a. status_enum backfill from the legacy text 'status' column.
UPDATE pending_payments
SET status_enum = CASE
  WHEN status ILIKE 'confirmed'             THEN 'confirmed'::payment_status
  WHEN status ILIKE 'pending'               THEN 'pending'::payment_status
  WHEN status ILIKE 'rejected'              THEN 'rejected'::payment_status
  WHEN status ILIKE 'refunded'             THEN 'refunded'::payment_status
  WHEN status ILIKE 'canceled'
       OR status ILIKE 'cancelled'           THEN 'canceled'::payment_status
  WHEN status ILIKE 'pending_manual'        THEN 'pending_manual'::payment_status
  WHEN status ILIKE 'processing'           THEN 'processing'::payment_status
  WHEN status ILIKE 'disputed'              THEN 'disputed'::payment_status
  WHEN status ILIKE 'created'               THEN 'created'::payment_status
  ELSE 'pending_manual'::payment_status
END
WHERE status_enum IS NULL;

-- 4b. amount_cents backfill. Tries amount_usd first, then account_size.
--     amount_cents is in USD cents to avoid float drift.
UPDATE pending_payments
SET amount_cents = CASE
  WHEN amount_usd IS NOT NULL
       AND amount_usd ~ '^[0-9]+(\.[0-9]+)?$'
    THEN round(amount_usd::numeric * 100)::bigint
  WHEN account_size IS NOT NULL
       AND account_size ~ '^[0-9]+(\.[0-9]+)?$'
    THEN round(account_size::numeric * 100)::bigint
  ELSE NULL
END
WHERE amount_cents IS NULL;

-- 4c. idempotency_key backfill. Legacy rows get a stable synthetic key.
UPDATE pending_payments
SET idempotency_key = 'legacy:' || id::text
WHERE idempotency_key IS NULL;

-- 4d. verified_* are populated only by the new admin path. NULL on legacy rows.

-- ---------------------------------------------------------------------------
-- 5. Duplicate check on (user_id, idempotency_key) BEFORE the unique index.
--    If any duplicates exist, the migration ABORTS without modifying data.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  dup_count integer;
BEGIN
  SELECT count(*) INTO dup_count FROM (
    SELECT user_id, idempotency_key
    FROM pending_payments
    WHERE idempotency_key IS NOT NULL
    GROUP BY user_id, idempotency_key
    HAVING count(*) > 1
  ) d;

  IF dup_count > 0 THEN
    RAISE EXCEPTION
      'Refusing to create pending_payments_user_idem_unique: % duplicate (user_id, idempotency_key) rows exist. No rows were modified or deleted. Reconcile manually: UPDATE pending_payments SET idempotency_key = NULL WHERE <predicate> for duplicates, then re-run the migration.',
      dup_count;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS pending_payments_user_idem_unique
  ON pending_payments (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 6. Add additive columns to services
-- ---------------------------------------------------------------------------
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS source_payment_id uuid,
  ADD COLUMN IF NOT EXISTS activated         boolean NOT NULL DEFAULT false;

-- ---------------------------------------------------------------------------
-- 7. Duplicate check on (user_id, plan_name) WHERE status = 'Active'.
--    Uses the LIVE legacy column, not the new activated column.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  dup_count integer;
BEGIN
  SELECT count(*) INTO dup_count FROM (
    SELECT user_id, plan_name
    FROM services
    WHERE status = 'Active'
    GROUP BY user_id, plan_name
    HAVING count(*) > 1
  ) d;

  IF dup_count > 0 THEN
    RAISE EXCEPTION
      'Refusing to create services_user_plan_activated_unique: % duplicate (user_id, plan_name) rows with status=''Active'' exist. No rows were modified or deleted. Reconcile manually: UPDATE services SET status = ''Inactive'' WHERE <predicate> to deactivate duplicates, then re-run the migration.',
      dup_count;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 8. Forward-looking unique partial index. Zero rows immediately after the
--    migration because every existing row has activated = false by default.
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS services_user_plan_activated_unique
  ON services (user_id, plan_name)
  WHERE activated = true;

-- ---------------------------------------------------------------------------
-- 9. RLS on payment_audit_log only. Existing tables' RLS is untouched.
-- ---------------------------------------------------------------------------
ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY payment_audit_log_self_read ON payment_audit_log
    FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY payment_audit_log_no_insert ON payment_audit_log
    FOR INSERT WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY payment_audit_log_no_update ON payment_audit_log
    FOR UPDATE USING (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY payment_audit_log_no_delete ON payment_audit_log
    FOR DELETE USING (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- 10. read_payment_status(text) RPC — read-only, user sees their own payment.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION read_payment_status(p_legacy_id text)
RETURNS TABLE (
  id             text,
  status         payment_status,
  plan_name      text,
  amount_cents   bigint,
  currency       text,
  network        text,
  method         text,
  created_at     timestamptz,
  updated_at     timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pp.id::text               AS id,
    pp.status_enum            AS status,
    pp.plan_name              AS plan_name,
    pp.amount_cents          AS amount_cents,
    'USD'::text              AS currency,
    pp.network               AS network,
    'wise'::text             AS method,
    pp.created_at            AS created_at,
    COALESCE(pp.confirmed_at, pp.created_at) AS updated_at
  FROM pending_payments pp
  WHERE pp.id = p_legacy_id
    AND pp.user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION read_payment_status(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION read_payment_status(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 11. log_payment_event(...) RPC — append-only audit writer.
--      Callable only by service_role (not by authenticated users).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_payment_event(
  p_payment_table    text,
  p_payment_id       text,
  p_actor           text,
  p_source          text,
  p_event_id        text,
  p_previous_status payment_status,
  p_new_status      payment_status,
  p_reason          text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF p_payment_table <> 'pending_payments' THEN
    RAISE EXCEPTION 'unknown payment_table: %', p_payment_table;
  END IF;

  SELECT user_id INTO v_user_id
  FROM pending_payments
  WHERE id = p_payment_id;

  INSERT INTO payment_audit_log (
    payment_table, payment_id, user_id, actor, source, event_id,
    previous_status, new_status, reason
  ) VALUES (
    p_payment_table, p_payment_id, v_user_id, p_actor, p_source, p_event_id,
    p_previous_status, p_new_status, left(p_reason, 200)
  );
END;
$$;

REVOKE ALL ON FUNCTION log_payment_event(
  text, text, text, text, text, payment_status, payment_status, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION log_payment_event(
  text, text, text, text, text, payment_status, payment_status, text
) TO service_role;