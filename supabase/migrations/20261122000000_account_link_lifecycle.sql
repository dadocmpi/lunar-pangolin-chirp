-- ============================================================================
-- Account-link lifecycle — onboarding + managed-account product foundation.
--
-- Extends the existing public.account_activations table (20261010000000)
-- instead of replacing it. The operator review architecture, the RLS posture
-- and the private receipt bucket are unchanged.
--
-- Adds, idempotently:
--   1. The two lifecycle states the product needs beyond the original five:
--      'suspended' and 'disconnected'.
--   2. Server-derived package/payment linkage. The browser never supplies the
--      Braxel plan key, the plan name or the payment status: activation-submit
--      reads them from the confirmed payment row and copies them here.
--   3. Timestamps/reasons for connection, suspension and disconnection so the
--      audit trail has a durable record next to the append-only event log.
--
-- There is still NO broker credential column: no password, CID, secret, API
-- key or provider token. The external account login is an untrusted customer
-- claim, reviewed manually.
--
-- Numeric order: after 20261121000000 (the current migration head).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Additive columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.account_activations
  ADD COLUMN IF NOT EXISTS braxel_plan_key      text,
  ADD COLUMN IF NOT EXISTS braxel_plan_name     text,
  ADD COLUMN IF NOT EXISTS payment_id           text,
  ADD COLUMN IF NOT EXISTS payment_status       text,
  ADD COLUMN IF NOT EXISTS payment_verified_at  timestamptz,
  ADD COLUMN IF NOT EXISTS connected_at         timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_at         timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_reason     text,
  ADD COLUMN IF NOT EXISTS disconnected_at      timestamptz,
  ADD COLUMN IF NOT EXISTS disconnected_reason  text;

CREATE INDEX IF NOT EXISTS account_activations_payment_id_idx
  ON public.account_activations (payment_id);
CREATE INDEX IF NOT EXISTS account_activations_braxel_plan_key_idx
  ON public.account_activations (braxel_plan_key);

-- ---------------------------------------------------------------------------
-- 2. Widen the status vocabulary
--    The original inline CHECK is named account_activations_status_check.
--    DROP IF EXISTS + ADD keeps this idempotent on every re-apply.
-- ---------------------------------------------------------------------------
ALTER TABLE public.account_activations
  DROP CONSTRAINT IF EXISTS account_activations_status_check;
ALTER TABLE public.account_activations
  ADD CONSTRAINT account_activations_status_check
  CHECK (status IN (
    'pending','in_review','info_requested','approved','rejected',
    'suspended','disconnected'
  ));

-- ---------------------------------------------------------------------------
-- 3. Bounded operator-facing reasons (defence in depth; the Edge Functions
--    already cap free text at 500 characters).
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'account_activations_suspended_reason_len'
  ) THEN
    ALTER TABLE public.account_activations
      ADD CONSTRAINT account_activations_suspended_reason_len
      CHECK (suspended_reason IS NULL OR length(suspended_reason) <= 500);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'account_activations_disconnected_reason_len'
  ) THEN
    ALTER TABLE public.account_activations
      ADD CONSTRAINT account_activations_disconnected_reason_len
      CHECK (disconnected_reason IS NULL OR length(disconnected_reason) <= 500);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4. payment_audit_log already accepts payment_table='account_activations'
--    (20261010000000). No constraint change is needed here; lifecycle events
--    are appended by _shared/activation/audit.ts.
-- ---------------------------------------------------------------------------
