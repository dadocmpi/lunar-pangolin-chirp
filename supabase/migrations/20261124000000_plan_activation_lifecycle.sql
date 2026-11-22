-- ============================================================================
-- Plan activation lifecycle.
--
-- A verified payment must produce a durable, server-side activation record
-- before the customer is granted access. This migration adds that record and
-- nothing else:
--
--   1. public.plan_activations — one row per confirmed payment.
--      * status: activation_pending | active | suspended | disconnected
--      * a public Braxel account id (BRX-XXXXXXXX) generated server-side
--      * the activation email claim/sent timestamps used to send the
--        "account active" email EXACTLY ONCE (atomic claim token)
--   2. RLS — owner SELECT only, operator SELECT, explicit deny for every
--      client write. Writes go through the JWT-verified Edge Functions with
--      the service role, exactly like account_activations / kyc_submissions.
--   3. Widen the append-only payment_audit_log so it accepts
--      payment_table = 'plan_activations'.
--
-- Additive and idempotent: no table/column is dropped, no row is modified,
-- no credential column is added (no password, CID, secret, API key or
-- provider token).
--
-- Numeric order: after 20261123000000 (the current migration head).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. plan_activations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plan_activations (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- The confirmed pending_payments row this activation belongs to. Unique so a
  -- repeated webhook/reconciliation can never create a second activation.
  payment_id                      text NOT NULL,
  plan_key                        text NOT NULL,
  plan_name                       text NOT NULL,
  amount_cents                    bigint NOT NULL DEFAULT 0,
  currency                        text NOT NULL DEFAULT 'USD',
  method                          text,
  -- Server-generated public account reference shown to the customer.
  account_id                      text NOT NULL,
  status                          text NOT NULL DEFAULT 'activation_pending'
                                    CHECK (status IN (
                                      'activation_pending','active','suspended','disconnected'
                                    )),
  activated_at                    timestamptz,
  suspended_at                    timestamptz,
  suspended_reason                text CHECK (suspended_reason IS NULL OR length(suspended_reason) <= 500),
  disconnected_at                 timestamptz,
  disconnected_reason             text CHECK (disconnected_reason IS NULL OR length(disconnected_reason) <= 500),
  -- Exactly-once activation email. `activation_email_claim_token` makes the
  -- claim atomic across concurrent webhook deliveries: only one writer can
  -- move claimed_at from NULL to a token. sent_at is set only after delivery.
  activation_email_claimed_at     timestamptz,
  activation_email_claim_token    text,
  activation_email_sent_at        timestamptz,
  source                          text NOT NULL DEFAULT 'system'
                                    CHECK (source IN ('stripe','wise','crypto','admin','test','system')),
  created_at                      timestamptz NOT NULL DEFAULT now(),
  updated_at                      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT plan_activations_payment_unique UNIQUE (payment_id)
);

CREATE INDEX IF NOT EXISTS plan_activations_user_id_idx
  ON public.plan_activations (user_id);
CREATE INDEX IF NOT EXISTS plan_activations_status_idx
  ON public.plan_activations (status);
CREATE INDEX IF NOT EXISTS plan_activations_payment_id_idx
  ON public.plan_activations (payment_id);
CREATE INDEX IF NOT EXISTS plan_activations_created_at_idx
  ON public.plan_activations (created_at DESC);

DROP TRIGGER IF EXISTS plan_activations_set_updated_at ON public.plan_activations;
CREATE TRIGGER plan_activations_set_updated_at
  BEFORE UPDATE ON public.plan_activations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.plan_activations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plan_activations_owner_select ON public.plan_activations;
CREATE POLICY plan_activations_owner_select ON public.plan_activations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS plan_activations_operator_select ON public.plan_activations;
CREATE POLICY plan_activations_operator_select ON public.plan_activations
  FOR SELECT TO authenticated
  -- Strict boolean match, mirroring _shared/activation/operator.ts. A string
  -- "true" is not accepted.
  USING (
    jsonb_typeof(auth.jwt() -> 'app_metadata' -> 'operator') = 'boolean'
    AND (auth.jwt() -> 'app_metadata' ->> 'operator')::boolean IS TRUE
  );

DROP POLICY IF EXISTS plan_activations_no_client_insert ON public.plan_activations;
CREATE POLICY plan_activations_no_client_insert ON public.plan_activations
  FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS plan_activations_no_client_update ON public.plan_activations;
CREATE POLICY plan_activations_no_client_update ON public.plan_activations
  FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS plan_activations_no_client_delete ON public.plan_activations;
CREATE POLICY plan_activations_no_client_delete ON public.plan_activations
  FOR DELETE TO authenticated USING (false);

-- ---------------------------------------------------------------------------
-- 3. payment_audit_log: allow payment_table = 'plan_activations'.
--    Two constraint shapes can exist (the original named CHECK and the repair
--    CHECK). Widen whichever is present.
--    Operators are identified on every manual audit row. Nullable and
--    additive: system rows leave it NULL.
-- ---------------------------------------------------------------------------
ALTER TABLE public.payment_audit_log
  ADD COLUMN IF NOT EXISTS actor_id uuid;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_audit_log_table_repair_check'
  ) THEN
    ALTER TABLE public.payment_audit_log
      DROP CONSTRAINT payment_audit_log_table_repair_check;
    ALTER TABLE public.payment_audit_log
      ADD CONSTRAINT payment_audit_log_table_repair_check
      CHECK (payment_table IN (
        'pending_payments','applications','payments','account_activations','plan_activations'
      ));
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_audit_log_payment_table_check'
  ) THEN
    ALTER TABLE public.payment_audit_log
      DROP CONSTRAINT payment_audit_log_payment_table_check;
    ALTER TABLE public.payment_audit_log
      ADD CONSTRAINT payment_audit_log_payment_table_check
      CHECK (payment_table IN (
        'pending_payments','applications','payments','account_activations','plan_activations'
      ));
  END IF;
END $$;
