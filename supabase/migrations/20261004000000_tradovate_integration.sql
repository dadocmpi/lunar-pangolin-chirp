-- ============================================================================
-- Tradovate integration foundation
-- ============================================================================
-- Adds:
--   1. integrations            — one row per (user, environment, Tradovate
--                                account). Holds sync cursor + health status.
--   2. integration_credentials — AES-256-GCM ciphertext for the Tradovate
--                                username/password + cid/sec. Never readable by
--                                the browser: no authenticated policy at all.
--   3. tradovate_fills         — immutable raw fills, idempotent on
--                                UNIQUE(integration_id, tradovate_fill_id).
--   4. trades                  — reconstructed round-trip trades produced by
--                                the isomorphic PnL engine (recomputable).
--
-- Security model:
--   * Every row is owned by exactly one auth.users(id) through integrations.
--   * Authenticated users get SELECT on their own integrations / fills /
--     trades and NOTHING else. Credentials are invisible to authenticated
--     roles entirely.
--   * All writes (credential upsert, fill ingestion, trade rebuild, cursor
--     advance) happen through the service role inside Edge Functions, which
--     bypasses RLS. Explicit WITH CHECK (false) policies make the "no user
--     write" intent enforced even if a future policy is added by accident.
--
-- NOT YET VERIFIED against the real Tradovate service. The schema follows the
-- documented /fill/list and /account/list response shapes.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Shared updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- integrations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.integrations (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider             text NOT NULL DEFAULT 'tradovate'
                         CHECK (provider = 'tradovate'),
  environment          text NOT NULL CHECK (environment IN ('demo','live')),
  -- Tradovate numeric ids are 64-bit; keep them as bigint, not uuid.
  tradovate_user_id    bigint,
  tradovate_account_id bigint NOT NULL,
  account_spec         text,                       -- e.g. "DEMO12345"
  label                text,                       -- user-facing nickname
  status               text NOT NULL DEFAULT 'pending'
                         CHECK (status IN (
                           'pending',       -- credentials stored, not yet verified
                           'connected',     -- token valid, API access works
                           'expired',       -- token expired and renewal failed
                           'api_disabled',  -- account exists but API access is off
                           'invalid_credentials',
                           'error',         -- transient/provider failure
                           'revoked'        -- user disconnected; row soft-deleted
                         )),
  last_error_code      text,
  last_error_message   text,                       -- redacted, never a secret
  token_expires_at     timestamptz,
  last_connected_at    timestamptz,
  last_verified_at     timestamptz,
  -- Incremental polling cursor: highest tradovate_fill_id persisted so far.
  last_fill_id         bigint NOT NULL DEFAULT 0,
  last_synced_at       timestamptz,
  sync_locked_at       timestamptz,                -- advisory lock for cron runs
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT integrations_owner_unique
    UNIQUE (user_id, provider, environment, tradovate_account_id)
);

CREATE INDEX IF NOT EXISTS integrations_user_id_idx
  ON public.integrations (user_id);
CREATE INDEX IF NOT EXISTS integrations_status_idx
  ON public.integrations (status);

DROP TRIGGER IF EXISTS integrations_set_updated_at ON public.integrations;
CREATE TRIGGER integrations_set_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- integration_credentials (encrypted at rest, server-only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.integration_credentials (
  integration_id uuid PRIMARY KEY REFERENCES public.integrations(id) ON DELETE CASCADE,
  -- AES-256-GCM. ciphertext is base64(iv || ciphertext || authTag) is NOT
  -- stored as one blob: we keep the three parts separate so a future KMS or
  -- envelope-encryption migration can move them independently.
  ciphertext     text NOT NULL,
  iv             text NOT NULL,
  auth_tag       text NOT NULL,
  key_version    integer NOT NULL DEFAULT 1,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS integration_credentials_set_updated_at
  ON public.integration_credentials;
CREATE TRIGGER integration_credentials_set_updated_at
  BEFORE UPDATE ON public.integration_credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- tradovate_fills (immutable raw fills)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tradovate_fills (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id     uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  tradovate_fill_id  bigint NOT NULL,
  order_id           bigint,
  contract_id        bigint,
  account_id         bigint,
  -- Timestamp as reported by Tradovate, normalized to UTC at ingestion.
  fill_timestamp     timestamptz NOT NULL,
  trade_date         date,
  action             text CHECK (action IN ('Buy','Sell')),
  quantity           integer NOT NULL,
  price              numeric(20, 8) NOT NULL,
  active             boolean NOT NULL DEFAULT true,
  commission         numeric(20, 8) NOT NULL DEFAULT 0,
  raw                jsonb NOT NULL DEFAULT '{}'::jsonb,
  inserted_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tradovate_fills_idempotent
    UNIQUE (integration_id, tradovate_fill_id)
);

CREATE INDEX IF NOT EXISTS tradovate_fills_integration_time_idx
  ON public.tradovate_fills (integration_id, fill_timestamp);
CREATE INDEX IF NOT EXISTS tradovate_fills_integration_id_idx
  ON public.tradovate_fills (integration_id, tradovate_fill_id);

-- ---------------------------------------------------------------------------
-- trades (reconstructed; recomputable from fills, so safe to rebuild)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trades (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  account_id     bigint,
  root_symbol    text NOT NULL,
  symbol         text,
  side           text NOT NULL CHECK (side IN ('long','short')),
  quantity       integer NOT NULL,
  entry_price    numeric(20, 8) NOT NULL,
  exit_price     numeric(20, 8),
  opened_at      timestamptz NOT NULL,
  closed_at      timestamptz,
  realized_pnl   numeric(20, 8) NOT NULL DEFAULT 0,
  commission     numeric(20, 8) NOT NULL DEFAULT 0,
  net_pnl        numeric(20, 8) NOT NULL DEFAULT 0,
  status         text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  method         text NOT NULL DEFAULT 'fifo' CHECK (method IN ('fifo','weighted_average')),
  fill_ids       jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Deterministic natural key so a rebuild upserts instead of duplicating.
  dedupe_key     text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trades_dedupe_unique UNIQUE (integration_id, dedupe_key)
);

CREATE INDEX IF NOT EXISTS trades_integration_idx
  ON public.trades (integration_id);
CREATE INDEX IF NOT EXISTS trades_integration_closed_idx
  ON public.trades (integration_id, closed_at);

DROP TRIGGER IF EXISTS trades_set_updated_at ON public.trades;
CREATE TRIGGER trades_set_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.integrations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradovate_fills         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades                  ENABLE ROW LEVEL SECURITY;

-- integrations: owner read-only.
DROP POLICY IF EXISTS integrations_self_read ON public.integrations;
CREATE POLICY integrations_self_read ON public.integrations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS integrations_no_insert ON public.integrations;
CREATE POLICY integrations_no_insert ON public.integrations
  FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS integrations_no_update ON public.integrations;
CREATE POLICY integrations_no_update ON public.integrations
  FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS integrations_no_delete ON public.integrations;
CREATE POLICY integrations_no_delete ON public.integrations
  FOR DELETE TO authenticated USING (false);

-- integration_credentials: NO authenticated policy at all. The browser can
-- never read ciphertext (nor should it need to). Service role bypasses RLS.
-- Explicit deny policies are added for defense in depth.
DROP POLICY IF EXISTS integration_credentials_no_read ON public.integration_credentials;
CREATE POLICY integration_credentials_no_read ON public.integration_credentials
  FOR SELECT TO authenticated USING (false);
DROP POLICY IF EXISTS integration_credentials_no_insert ON public.integration_credentials;
CREATE POLICY integration_credentials_no_insert ON public.integration_credentials
  FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS integration_credentials_no_update ON public.integration_credentials;
CREATE POLICY integration_credentials_no_update ON public.integration_credentials
  FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS integration_credentials_no_delete ON public.integration_credentials;
CREATE POLICY integration_credentials_no_delete ON public.integration_credentials
  FOR DELETE TO authenticated USING (false);

-- tradovate_fills: owner read-only, gated through integration ownership.
DROP POLICY IF EXISTS tradovate_fills_self_read ON public.tradovate_fills;
CREATE POLICY tradovate_fills_self_read ON public.tradovate_fills
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.integrations i
      WHERE i.id = tradovate_fills.integration_id
        AND i.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS tradovate_fills_no_insert ON public.tradovate_fills;
CREATE POLICY tradovate_fills_no_insert ON public.tradovate_fills
  FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS tradovate_fills_no_update ON public.tradovate_fills;
CREATE POLICY tradovate_fills_no_update ON public.tradovate_fills
  FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS tradovate_fills_no_delete ON public.tradovate_fills;
CREATE POLICY tradovate_fills_no_delete ON public.tradovate_fills
  FOR DELETE TO authenticated USING (false);

-- trades: owner read-only, gated through integration ownership.
DROP POLICY IF EXISTS trades_self_read ON public.trades;
CREATE POLICY trades_self_read ON public.trades
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.integrations i
      WHERE i.id = trades.integration_id
        AND i.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS trades_no_insert ON public.trades;
CREATE POLICY trades_no_insert ON public.trades
  FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS trades_no_update ON public.trades;
CREATE POLICY trades_no_update ON public.trades
  FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS trades_no_delete ON public.trades;
CREATE POLICY trades_no_delete ON public.trades
  FOR DELETE TO authenticated USING (false);

-- ---------------------------------------------------------------------------
-- Realtime: expose reconstructed trades to the owning user's client.
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tradovate_fills;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
