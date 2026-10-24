-- ============================================================================
-- TradersPost onboarding — the customer confirms they subscribed to OUR
-- strategy in their own TradersPost account.
--
-- Execution is done by the CUSTOMER, in THEIR OWN account, with TradersPost.
-- Braxel never operates the account and never stores a broker credential: the
-- customer types their firm login only inside TradersPost, never here.
--
-- This migration is ADDITIVE and idempotent. It adds two nullable columns to
-- public.account_activations:
--   strategy_confirmed_at  — when the customer pressed "I subscribed to the
--                            strategy". Shown to the operator.
--   strategy_confirmed_by  — the JWT user id that confirmed (audit aid).
--
-- There is NO credential column of any kind. RLS on account_activations is
-- row-scoped, so the existing owner-read / operator-read / no-client-write
-- policies already cover the new columns; no new policy is required. Writes
-- come from the JWT-verified activation-strategy-confirm Edge Function only.
--
-- Numeric order: after 20261011000000.
-- ============================================================================

ALTER TABLE public.account_activations
  ADD COLUMN IF NOT EXISTS strategy_confirmed_at timestamptz;

ALTER TABLE public.account_activations
  ADD COLUMN IF NOT EXISTS strategy_confirmed_by text;

-- ---------------------------------------------------------------------------
-- payment_audit_log: allow the 'activation' source for the customer's own
-- strategy-confirmation event (no payment is involved, so 'stripe' would be
-- misleading). Widen whichever named constraint is present, mirroring the
-- pattern in 20261010000000_account_activation.sql.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_audit_log_source_repair_check'
  ) THEN
    ALTER TABLE public.payment_audit_log
      DROP CONSTRAINT payment_audit_log_source_repair_check;
    ALTER TABLE public.payment_audit_log
      ADD CONSTRAINT payment_audit_log_source_repair_check
      CHECK (source IN ('wise','crypto','card','admin','test','stripe','auto_confirm','activation'));
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_audit_log_source_check'
  ) THEN
    ALTER TABLE public.payment_audit_log
      DROP CONSTRAINT payment_audit_log_source_check;
    ALTER TABLE public.payment_audit_log
      ADD CONSTRAINT payment_audit_log_source_check
      CHECK (source IN ('wise','crypto','card','admin','test','stripe','auto_confirm','activation'));
  END IF;
END $$;
