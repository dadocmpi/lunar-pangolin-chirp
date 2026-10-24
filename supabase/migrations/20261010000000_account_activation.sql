-- ============================================================================
-- Account activation — customer buys the account at the prop firm, then asks
-- Braxel to activate the signals plan.
--
-- Adds:
--   1. account_activations        — one row per activation request
--   2. RLS                        — owner read-only; operator read; no direct
--                                   client write (writes go through the
--                                   JWT-verified activation-submit Edge Function,
--                                   exactly like kyc_submissions /
--                                   withdrawal_requests)
--   3. private bucket 'activation-receipts' + owner-only object policies
--   4. payment_audit_log          — allow payment_table='account_activations'
--
-- Idempotent. Nothing is dropped or rewritten. No broker credential column
-- exists anywhere: the customer never submits a broker password / CID / secret.
--
-- Numeric order: after 20261009000000 (the current migration head).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. account_activations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.account_activations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Firm id ('tradeify' | 'lucid'). Validated server-side against the
  -- configured affiliate firms; no FK because the firm list is configuration,
  -- not a table.
  firm              text NOT NULL,
  plan_name         text NOT NULL,
  -- The customer's account login/ID at the prop firm. NOT a password.
  account_login     text NOT NULL,
  purchase_email    text NOT NULL,
  -- Object path inside the private bucket; never a public URL.
  receipt_path      text,
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','in_review','info_requested','approved','rejected')),
  -- Operator note shown to the customer when a decision or info request is made.
  operator_note     text CHECK (operator_note IS NULL OR length(operator_note) <= 500),
  -- Mandatory confirmations captured at submit time (proof of consent).
  confirmed_ownership       boolean NOT NULL DEFAULT false,
  confirmed_responsibility  boolean NOT NULL DEFAULT false,
  confirmed_firm_rules      boolean NOT NULL DEFAULT false,
  confirmed_risk            boolean NOT NULL DEFAULT false,
  submitted_at      timestamptz NOT NULL DEFAULT now(),
  reviewed_at       timestamptz,
  reviewed_by       text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS account_activations_user_id_idx ON public.account_activations (user_id);
CREATE INDEX IF NOT EXISTS account_activations_status_idx  ON public.account_activations (status);
CREATE INDEX IF NOT EXISTS account_activations_firm_idx    ON public.account_activations (firm);
CREATE INDEX IF NOT EXISTS account_activations_created_at_idx ON public.account_activations (created_at DESC);

DROP TRIGGER IF EXISTS account_activations_set_updated_at ON public.account_activations;
CREATE TRIGGER account_activations_set_updated_at
  BEFORE UPDATE ON public.account_activations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. RLS
--    The browser creates its own activation through the authenticated
--    activation-submit Edge Function (service role, bound to the verified JWT
--    user). Authenticated roles therefore get SELECT on their own rows only,
--    and explicit deny for direct INSERT/UPDATE/DELETE — the same posture as
--    kyc_submissions and withdrawal_requests. Operators may read every row.
-- ---------------------------------------------------------------------------
ALTER TABLE public.account_activations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS account_activations_owner_select ON public.account_activations;
CREATE POLICY account_activations_owner_select ON public.account_activations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS account_activations_operator_select ON public.account_activations;
CREATE POLICY account_activations_operator_select ON public.account_activations
  FOR SELECT TO authenticated
  -- Strict boolean match, mirroring the server-side isOperatorMeta predicate in
  -- _shared/activation/operator.ts. The payments-table policy casts with
  -- `::boolean`, which would also accept the string "true"; this one requires a
  -- real JSON boolean so the DB and the Edge Function agree exactly.
  USING (
    jsonb_typeof(auth.jwt() -> 'app_metadata' -> 'operator') = 'boolean'
    AND (auth.jwt() -> 'app_metadata' ->> 'operator')::boolean IS TRUE
  );

DROP POLICY IF EXISTS account_activations_no_client_insert ON public.account_activations;
CREATE POLICY account_activations_no_client_insert ON public.account_activations
  FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS account_activations_no_client_update ON public.account_activations;
CREATE POLICY account_activations_no_client_update ON public.account_activations
  FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS account_activations_no_client_delete ON public.account_activations;
CREATE POLICY account_activations_no_client_delete ON public.account_activations
  FOR DELETE TO authenticated USING (false);

-- ---------------------------------------------------------------------------
-- 3. Private storage bucket + owner-only object policies
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('activation-receipts', 'activation-receipts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Object paths are '<user_id>/<uuid>.<ext>'. The first path segment must be the
-- caller's own uid, so a user can only touch their own objects.
DROP POLICY IF EXISTS activation_receipts_owner_insert ON storage.objects;
CREATE POLICY activation_receipts_owner_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'activation-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS activation_receipts_owner_select ON storage.objects;
CREATE POLICY activation_receipts_owner_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'activation-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS activation_receipts_owner_delete ON storage.objects;
CREATE POLICY activation_receipts_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'activation-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- No authenticated UPDATE. Operators read receipts through the service role
-- only, via short-lived signed URLs minted by activation-review.

-- ---------------------------------------------------------------------------
-- 4. payment_audit_log: allow the 'account_activations' payment_table value.
--    The repair migration installed *_repair_check constraints; an older chain
--    installed the original named constraints. Widen whichever is present.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_audit_log_table_repair_check'
  ) THEN
    ALTER TABLE public.payment_audit_log
      DROP CONSTRAINT payment_audit_log_table_repair_check;
    ALTER TABLE public.payment_audit_log
      ADD CONSTRAINT payment_audit_log_table_repair_check
      CHECK (payment_table IN ('pending_payments','applications','payments','account_activations'));
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_audit_log_payment_table_check'
  ) THEN
    ALTER TABLE public.payment_audit_log
      DROP CONSTRAINT payment_audit_log_payment_table_check;
    ALTER TABLE public.payment_audit_log
      ADD CONSTRAINT payment_audit_log_payment_table_check
      CHECK (payment_table IN ('pending_payments','applications','account_activations'));
  END IF;
END $$;
