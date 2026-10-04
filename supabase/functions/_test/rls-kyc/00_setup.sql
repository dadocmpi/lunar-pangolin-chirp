-- Minimal Supabase-compatible shim so the real migration applies unchanged.
-- Covers auth.users, auth.uid(), the roles, and a storage schema/objects table
-- large enough for the bucket + object RLS policies in the KYC migration.

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY,
  email text
);

-- Supabase's auth.uid() reads the JWT sub claim from the request settings.
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

-- Supabase roles. service_role bypasses RLS; authenticated does not.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public, auth TO authenticated, service_role, anon;

-- ---------------------------------------------------------------------------
-- storage shim — buckets + objects + foldername(), matching Supabase's shape.
-- ---------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS storage;

CREATE TABLE IF NOT EXISTS storage.buckets (
  id     text PRIMARY KEY,
  name   text NOT NULL,
  public boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS storage.objects (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id  text NOT NULL REFERENCES storage.buckets(id),
  name       text NOT NULL,
  owner      uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Supabase's storage.foldername(name) splits the object path into folders.
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[]
LANGUAGE sql IMMUTABLE AS $$
  SELECT (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1]
$$;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA storage TO authenticated, service_role, anon;
GRANT ALL ON storage.objects, storage.buckets TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- profiles is referenced by the KYC gate fallback. Its live shape has NO
-- kyc_status column; the KYC migration adds it additively before the gate RPCs
-- read it. Declaring it here would hide that requirement.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
