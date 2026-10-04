-- ============================================================================
-- Tradovate live account snapshot cache
-- ============================================================================
-- The dashboard needs a LIVE read of balance / positions / working orders from
-- the provider. Calling Tradovate on every render would be an anti-pattern
-- (their docs warn against repeated cashBalance calls), so the tradovate-
-- dashboard Edge Function stores the last normalized snapshot here and serves
-- it while it is younger than TRADOVATE_SNAPSHOT_TTL_SECONDS (default 20s).
-- A manual refresh passes ?fresh=1 to bypass the cache.
--
-- Security model (mirrors the rest of the Tradovate schema):
--   * one row per integration, owned by exactly one auth.users(id) through
--     integrations,
--   * authenticated users get SELECT on their OWN row and nothing else,
--   * all writes happen through the service role inside the Edge Function
--     (explicit WITH CHECK (false) deny policies for defense in depth).
--   * the payload is provider state only: it never contains credentials or
--     tokens (those stay in integration_credentials, server-only).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tradovate_account_snapshots (
  integration_id uuid PRIMARY KEY REFERENCES public.integrations(id) ON DELETE CASCADE,
  -- Normalized { balance, positions, orders, symbols } payload.
  payload        jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Any provider sub-read that failed on the last attempt, e.g. ["orders"].
  -- Lets the UI show an explicit "not available" state instead of fake data.
  warnings       jsonb NOT NULL DEFAULT '[]'::jsonb,
  fetched_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS tradovate_account_snapshots_set_updated_at
  ON public.tradovate_account_snapshots;
CREATE TRIGGER tradovate_account_snapshots_set_updated_at
  BEFORE UPDATE ON public.tradovate_account_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tradovate_account_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tradovate_account_snapshots_self_read
  ON public.tradovate_account_snapshots;
CREATE POLICY tradovate_account_snapshots_self_read
  ON public.tradovate_account_snapshots
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.integrations i
      WHERE i.id = tradovate_account_snapshots.integration_id
        AND i.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS tradovate_account_snapshots_no_insert
  ON public.tradovate_account_snapshots;
CREATE POLICY tradovate_account_snapshots_no_insert
  ON public.tradovate_account_snapshots
  FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS tradovate_account_snapshots_no_update
  ON public.tradovate_account_snapshots;
CREATE POLICY tradovate_account_snapshots_no_update
  ON public.tradovate_account_snapshots
  FOR UPDATE TO authenticated USING (false);

DROP POLICY IF EXISTS tradovate_account_snapshots_no_delete
  ON public.tradovate_account_snapshots
  FOR DELETE TO authenticated USING (false);

-- Realtime so a background refresh can push the new snapshot to the browser.
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tradovate_account_snapshots;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
