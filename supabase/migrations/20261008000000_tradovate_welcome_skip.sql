-- ============================================================================
-- Tradovate first-run welcome screen — per-user skip persistence.
--
-- The welcome/connect screen is a SOFT gate: it shows before the dashboard
-- content on first access, but the user can "Skip for now". The skip must
-- persist server-side (not only localStorage) so the screen does not reappear
-- on every login / device.
--
-- Shape: one row per user, created only when they skip. Absence of a row means
-- "never skipped" (show the welcome screen again if still unconnected). This is
-- intentionally NOT a connection gate: no flag, no router guard, nothing here
-- blocks any route.
--
-- RLS: owner read-only. Writes happen only through the tradovate-status Edge
-- Function (service role, bound to the verified JWT user); authenticated roles
-- get no write policy at all, matching the integrations tables.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tradovate_welcome_state (
  user_id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  skipped_at     timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS tradovate_welcome_state_set_updated_at
  ON public.tradovate_welcome_state;
CREATE TRIGGER tradovate_welcome_state_set_updated_at
  BEFORE UPDATE ON public.tradovate_welcome_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tradovate_welcome_state ENABLE ROW LEVEL SECURITY;

-- Owner read-only. No insert/update/delete for authenticated roles.
DROP POLICY IF EXISTS tradovate_welcome_state_self_read ON public.tradovate_welcome_state;
CREATE POLICY tradovate_welcome_state_self_read ON public.tradovate_welcome_state
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS tradovate_welcome_state_no_insert ON public.tradovate_welcome_state;
CREATE POLICY tradovate_welcome_state_no_insert ON public.tradovate_welcome_state
  FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS tradovate_welcome_state_no_update ON public.tradovate_welcome_state;
CREATE POLICY tradovate_welcome_state_no_update ON public.tradovate_welcome_state
  FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS tradovate_welcome_state_no_delete ON public.tradovate_welcome_state;
CREATE POLICY tradovate_welcome_state_no_delete ON public.tradovate_welcome_state
  FOR DELETE TO authenticated USING (false);

-- Service-role RPCs, mirroring the KYC gate functions. The Edge Function
-- derives the user from the JWT and passes only that id.
CREATE OR REPLACE FUNCTION public.tradovate_welcome_skipped(p_user uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tradovate_welcome_state WHERE user_id = p_user
  );
$$;

CREATE OR REPLACE FUNCTION public.tradovate_welcome_skip(p_user uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.tradovate_welcome_state (user_id)
  VALUES (p_user)
  ON CONFLICT (user_id) DO UPDATE SET skipped_at = now();
$$;

REVOKE ALL ON FUNCTION public.tradovate_welcome_skipped(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tradovate_welcome_skip(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tradovate_welcome_skipped(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.tradovate_welcome_skip(uuid) TO service_role;
