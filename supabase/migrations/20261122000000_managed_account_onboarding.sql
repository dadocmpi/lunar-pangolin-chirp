-- ============================================================================
-- Managed-account onboarding — account-link requests.
--
-- The customer buys a Braxel package through the existing checkout, then asks
-- Braxel to link the external prop-firm account they intend to use. An
-- operator reviews every request manually.
--
-- Adds:
--   1. public.account_links        — one row per link request, with the
--                                    pending / in_review / approved / rejected /
--                                    suspended / disconnected lifecycle
--   2. RLS                         — owner SELECT only; operator SELECT all;
--                                    explicit deny for client INSERT/UPDATE/
--                                    DELETE (writes go through the JWT-verified
--                                    Edge Functions, like account_activations)
--   3. a partial unique index      — at most one open link per customer
--   4. payment_audit_log           — allow payment_table='account_links'
--
-- There is NO credential column: no broker password, no provider token, no
-- CID/secret. The external account login is an identifier, not a credential.
--
-- Idempotent and additive. Numeric order: after 20261121000000 (current head).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. account_links
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.account_links (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Firm id ('tradeify' | 'lucid'). Validated server-side against the
  -- configured affiliate firms; the firm list is configuration, not a table.
  firm              text NOT NULL,
  -- Braxel package. Derived server-side from the confirmed payment; never
  -- accepted from the request body.
  plan_id           text NOT NULL,
  -- The customer's account login/ID at the prop firm. NOT a password.
  account_login     text NOT NULL,
  note              text CHECK (note IS NULL OR length(note) <= 500),
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','in_review','approved','rejected','suspended','disconnected')),
  -- Operator note shown to the customer with a decision.
  operator_note     text CHECK (operator_note IS NULL OR length(operator_note) <= 500),
  -- Reason recorded when a link is suspended.
  suspension_reason text CHECK (suspension_reason IS NULL OR length(suspension_reason) <= 500),
  -- Mandatory acknowledgements captured at submit time (proof of consent).
  confirmed_ownership            boolean NOT NULL DEFAULT false,
  confirmed_external_rules       boolean NOT NULL DEFAULT false,
  confirmed_no_profit_guarantee  boolean NOT NULL DEFAULT false,
  confirmed_eligibility          boolean NOT NULL DEFAULT false,
  confirmed_data_delayed         boolean NOT NULL DEFAULT false,
  confirmed_payouts_provider     boolean NOT NULL DEFAULT false,
  confirmed_no_funds_held        boolean NOT NULL DEFAULT false,
  disclosures_version            text,
  submitted_at      timestamptz NOT NULL DEFAULT now(),
  reviewed_at       timestamptz,
  reviewed_by       text,
  connected_at      timestamptz,
  suspended_at      timestamptz,
  disconnected_at   timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS account_links_user_id_idx ON public.account_links (user_id);
CREATE INDEX IF NOT EXISTS account_links_status_idx  ON public.account_links (status);
CREATE INDEX IF NOT EXISTS account_links_firm_idx    ON public.account_links (firm);
CREATE INDEX IF NOT EXISTS account_links_created_at_idx ON public.account_links (created_at DESC);

-- One open link per customer. A rejected or disconnected row is closed, so the
-- customer may start again; a duplicate submit while one is open is refused by
-- the Edge Function and by this index.
CREATE UNIQUE INDEX IF NOT EXISTS account_links_one_open_per_user
  ON public.account_links (user_id)
  WHERE status IN ('pending','in_review','approved','suspended');

DROP TRIGGER IF EXISTS account_links_set_updated_at ON public.account_links;
CREATE TRIGGER account_links_set_updated_at
  BEFORE UPDATE ON public.account_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.account_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS account_links_owner_select ON public.account_links;
CREATE POLICY account_links_owner_select ON public.account_links
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS account_links_operator_select ON public.account_links;
CREATE POLICY account_links_operator_select ON public.account_links
  FOR SELECT TO authenticated
  -- Strict JSON boolean, mirroring isOperatorMeta in
  -- _shared/activation/operator.ts. A string "true" is not an operator.
  USING (
    jsonb_typeof(auth.jwt() -> 'app_metadata' -> 'operator') = 'boolean'
    AND (auth.jwt() -> 'app_metadata' ->> 'operator')::boolean IS TRUE
  );

DROP POLICY IF EXISTS account_links_no_client_insert ON public.account_links;
CREATE POLICY account_links_no_client_insert ON public.account_links
  FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS account_links_no_client_update ON public.account_links;
CREATE POLICY account_links_no_client_update ON public.account_links
  FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS account_links_no_client_delete ON public.account_links;
CREATE POLICY account_links_no_client_delete ON public.account_links
  FOR DELETE TO authenticated USING (false);

-- ---------------------------------------------------------------------------
-- 3. payment_audit_log: allow the 'account_links' payment_table value.
--    Drop whichever table CHECK exists and install one canonical constraint.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  c record;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payment_audit_log'
      AND column_name = 'payment_table'
  ) THEN
    FOR c IN
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'public.payment_audit_log'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) ~ 'payment_table'
    LOOP
      EXECUTE format(
        'ALTER TABLE public.payment_audit_log DROP CONSTRAINT %I', c.conname
      );
    END LOOP;

    ALTER TABLE public.payment_audit_log
      ADD CONSTRAINT payment_audit_log_table_repair_check
      CHECK (payment_table IN (
        'pending_payments','applications','payments',
        'account_activations','account_links'
      ));
  END IF;
END $$;
