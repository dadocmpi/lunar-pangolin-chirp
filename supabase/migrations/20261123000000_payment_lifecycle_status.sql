-- ============================================================================
-- Payment lifecycle statuses accepted by the database.
--
-- The Stripe webhook writes subscription lifecycle values into
-- pending_payments.status_enum (past_due, incomplete, incomplete_expired,
-- trialing, paused) and into applications.payment_status (past_due, ...).
-- Two schema shapes can still reject `past_due`:
--   * applications.payment_status created as the narrow payment_status ENUM
--     (the enum has no past_due value), and
--   * a pending_payments.status_enum CHECK that predates the lifecycle states.
--
-- This migration is ADDITIVE and IDEMPOTENT:
--   * no table/column is dropped and no row is modified
--   * applications.payment_status is widened to text only when it is still an
--     enum (value-preserving)
--   * any status_enum CHECK that does not allow `past_due` is replaced with the
--     full lifecycle CHECK
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. applications.payment_status must be free text.
--    The older chain typed it as the payment_status ENUM, which cannot hold
--    'payment_confirmed' or 'past_due'. Converting to text preserves values.
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
    ALTER TABLE public.applications
      ALTER COLUMN payment_status TYPE text USING payment_status::text;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. pending_payments.status_enum must accept every value the webhook writes.
--    Drop any CHECK that mentions status_enum but omits past_due, then ensure a
--    wide CHECK exists.
--
--    confirmed_at is written when a checkout is confirmed; add it defensively
--    for a table that predates the repair migration.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.pending_payments') IS NULL THEN
    RETURN;
  END IF;
  ALTER TABLE public.pending_payments
    ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
END $$;

DO $$
DECLARE
  c record;
BEGIN
  IF to_regclass('public.pending_payments') IS NULL THEN
    RETURN;
  END IF;

  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.pending_payments'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%status_enum%'
      AND pg_get_constraintdef(oid) NOT LIKE '%past_due%'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.pending_payments DROP CONSTRAINT %I', c.conname
    );
  END LOOP;
END $$;

DO $$
BEGIN
  IF to_regclass('public.pending_payments') IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.pending_payments'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%status_enum%'
      AND pg_get_constraintdef(oid) LIKE '%past_due%'
  ) THEN
    ALTER TABLE public.pending_payments
      ADD CONSTRAINT pending_payments_status_enum_lifecycle_check CHECK (status_enum IN (
        'created','pending','processing','confirmed','failed',
        'rejected','refunded','disputed','canceled','pending_manual',
        'past_due','incomplete','incomplete_expired','trialing','paused',
        'payment_confirmed'
      ));
  END IF;
END $$;
