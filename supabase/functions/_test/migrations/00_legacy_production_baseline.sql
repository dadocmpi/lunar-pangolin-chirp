-- ============================================================================
-- Production-state baseline for the migrations.
--
-- Reproduces the objects that already exist in the LIVE database and that the
-- tracked migrations depend on. These are NOT created by any tracked migration:
--
--   auth.users        Supabase platform (all integrations FK to it)
--   storage.buckets   Supabase platform (kyc migration inserts a bucket)
--   storage.objects   Supabase platform (kyc migration adds RLS policies)
--   public.profiles   legacy table, read by the KYC gate RPCs (kyc migration)
--   public.services   legacy table, ALTERed by the payment migrations. Its live
--                     shape is (id, user_id, plan_name, account_id, status,
--                     balance, created_at) -- notably there is NO plan_id, so
--                     the payment migrations must ADD it before any index that
--                     keys on it. (This mirrors production; the earlier
--                     baseline wrongly declared plan_id, which hid the bug.)
--   public.payments / pending_payments / applications / payment_audit_log
--                     present in the live database but created out-of-band (no
--                     tracked migration records them). Emulated here so the
--                     chain is exercised against the real production shape.
--   supabase_realtime publication (tradovate migration adds tables to it)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name   text,
  account_id  text,
  status      text NOT NULL DEFAULT 'Active',
  balance     numeric,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  kyc_status  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Payment/application tables present in the live database (created out-of-band).
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'created','pending','processing','confirmed','failed','rejected',
    'refunded','disputed','canceled','pending_manual'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.pending_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan_id text, plan_name text,
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  network text, method text NOT NULL DEFAULT 'crypto',
  idempotency_key text,
  status text NOT NULL DEFAULT 'pending',
  status_enum text NOT NULL DEFAULT 'pending',
  account_id text, tx_hash text, confirmed_at timestamptz,
  verified_amount_cents bigint, verified_network text, verified_tx_hash text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  amount_usd numeric, account_size text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan_id text NOT NULL,
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  network text, method text NOT NULL,
  idempotency_key text NOT NULL,
  status payment_status NOT NULL DEFAULT 'created',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  verified_amount_cents bigint, verified_network text, verified_tx_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan_key text NOT NULL, full_name text NOT NULL, email text NOT NULL,
  residential_address_line1 text, residential_address_line2 text,
  city text, region text, postal_code text, country text NOT NULL, phone text,
  payment_status text, activation_status text NOT NULL DEFAULT 'pending',
  activated_by uuid REFERENCES auth.users(id), activated_at timestamptz,
  terms_accepted_at timestamptz, terms_version text,
  privacy_accepted_at timestamptz, privacy_version text,
  customer_note text, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_audit_log (
  id bigserial PRIMARY KEY,
  payment_table text NOT NULL DEFAULT 'pending_payments',
  payment_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  actor text NOT NULL, source text NOT NULL, event_id text NOT NULL,
  previous_status text, new_status text NOT NULL,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
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
