-- ============================================================================
-- Production-state baseline for the PENDING migrations.
--
-- Represents the objects that already exist in production and that the five
-- pending migrations depend on. These are NOT created by any pending migration:
--
--   auth.users        Supabase platform (all integrations FK to it)
--   storage.buckets   Supabase platform (kyc migration inserts a bucket)
--   storage.objects   Supabase platform (kyc migration adds RLS policies)
--   public.profiles   legacy table, read by the KYC gate RPCs (kyc migration)
--   public.services   legacy table, ALTERed by the already-applied payments
--                     migrations; included so "current production" is faithful
--   supabase_realtime publication (tradovate migration adds tables to it)
--
-- The pending migrations do NOT reference payments/pending_payments, so those
-- are omitted. A full production clone also has them; they are irrelevant to
-- whether the pending set applies cleanly.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id     text,
  plan_name   text,
  status      text NOT NULL DEFAULT 'Active',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  kyc_status  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- The realtime publication exists in every Supabase project and is not created
-- by a migration, so recreate it for a faithful baseline.
DO $$ BEGIN
  CREATE PUBLICATION supabase_realtime;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- Platform schema shims.
--
-- The bare supabase/postgres image tracks an older Storage/auth schema than a
-- current hosted project. Bring these up to the current platform shape so the
-- KYC storage migration applies unchanged:
--   * storage.buckets.public         (hosted Supabase has it; used by the
--                                     kyc-documents bucket INSERT)
--   * storage.foldername(text)       (used by the object RLS policies)
--   * auth.jwt()                    (used by the operator RLS policies)
-- ---------------------------------------------------------------------------
ALTER TABLE storage.buckets
  ADD COLUMN IF NOT EXISTS public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS file_size_limit bigint,
  ADD COLUMN IF NOT EXISTS allowed_mime_types text[];

CREATE OR REPLACE FUNCTION storage.foldername(name text) RETURNS text[]
LANGUAGE plpgsql AS $$
DECLARE
  _parts text[];
BEGIN
  _parts := string_to_array(name, '/');
  RETURN _parts[1:array_length(_parts, 1) - 1];
END $$;

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  )
$$;
