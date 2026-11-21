-- ============================================================================
-- Consent evidence — record WHICH policy revision was accepted.
--
-- The two-step signup already stamps profiles.terms_accepted_at /
-- privacy_accepted_at with the server clock (auth trigger and profile-submit).
-- This migration adds the missing policy/version reference so a consent record
-- is (timestamp + version), not a timestamp alone.
--
-- Design:
--   * public.legal_policy_versions holds the CURRENT version per legal document.
--     It is seeded with 'draft' because the legal pages are still drafts with
--     [PLACEHOLDER] values. The owner updates a row when the lawyer approves a
--     revision; no code change is needed.
--   * A BEFORE INSERT/UPDATE trigger on public.profiles copies the current
--     version into the row when an acceptance timestamp is present and the
--     version is still null. The first acceptance is never overwritten, and the
--     value is always written by the database — the browser never supplies it.
--   * The table is service-role only: RLS is enabled with no policy and the
--     client roles are revoked, so customers cannot read or rewrite versions.
--
-- Idempotent and additive. Existing consent timestamps are left untouched and
-- their version stays null: backfilling a version for a past consent would
-- fabricate evidence.
--
-- Numeric order: after 20261012000000 (the current migration head).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Current policy versions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.legal_policy_versions (
  document    text PRIMARY KEY,
  version     text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.legal_policy_versions IS
  'Current version of each legal document. Read by the profiles consent trigger; service-role only.';

INSERT INTO public.legal_policy_versions (document, version)
VALUES
  ('terms', 'draft'),
  ('privacy', 'draft'),
  ('disclaimer', 'draft')
ON CONFLICT (document) DO NOTHING;

ALTER TABLE public.legal_policy_versions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.legal_policy_versions FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Consent version columns on profiles
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_version   text,
  ADD COLUMN IF NOT EXISTS privacy_version text;

-- ---------------------------------------------------------------------------
-- 3. Stamp the current version whenever an acceptance is recorded
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.stamp_profile_consent_versions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_terms_version   text;
  v_privacy_version text;
BEGIN
  IF NEW.terms_accepted_at IS NOT NULL AND NEW.terms_version IS NULL THEN
    IF TG_OP = 'INSERT' THEN
      SELECT version INTO v_terms_version
        FROM public.legal_policy_versions
       WHERE document = 'terms';
      NEW.terms_version := v_terms_version;
    ELSIF OLD.terms_accepted_at IS NULL THEN
      SELECT version INTO v_terms_version
        FROM public.legal_policy_versions
       WHERE document = 'terms';
      NEW.terms_version := v_terms_version;
    END IF;
  END IF;

  IF NEW.privacy_accepted_at IS NOT NULL AND NEW.privacy_version IS NULL THEN
    IF TG_OP = 'INSERT' THEN
      SELECT version INTO v_privacy_version
        FROM public.legal_policy_versions
       WHERE document = 'privacy';
      NEW.privacy_version := v_privacy_version;
    ELSIF OLD.privacy_accepted_at IS NULL THEN
      SELECT version INTO v_privacy_version
        FROM public.legal_policy_versions
       WHERE document = 'privacy';
      NEW.privacy_version := v_privacy_version;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_stamp_consent_versions ON public.profiles;
CREATE TRIGGER profiles_stamp_consent_versions
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.stamp_profile_consent_versions();
