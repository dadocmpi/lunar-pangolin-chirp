-- ============================================================================
-- Client profiles — two-step signup, saved customer data, checkout auto-fill.
--
-- Extends the pre-existing public.profiles table (its live shape is only
-- (id, created_at) plus the kyc_status column added by the KYC migration) with
-- the customer's contact and billing details, and a profile_completed flag the
-- login flow reads to send the user back to step 2 of the signup.
--
-- Adds:
--   1. profiles columns (additive, idempotent)
--   2. RLS — each user reads/edits only their own row
--   3. auth.users trigger — create the profile row on signup
--   4. updated_at trigger
--
-- Nothing is dropped or rewritten. Existing profile data is left untouched.
--
-- Numeric order: after 20261010000000 (the current migration head).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Columns
-- ---------------------------------------------------------------------------
-- first_name / last_name  the two fields the dashboard already reads and
--                         writes; add them so its existing upsert cannot fail.
-- full_name    the customer's full name (step 1 also stores it on auth metadata)
-- phone_country_code  dial code chosen in the selector, e.g. '+55'
-- phone        the national number, without the dial code
-- country      ISO 3166-1 alpha-2 country code ('BR', 'US', ...)
-- street/number/complement/city/state/postal_code  the billing address
-- profile_completed    false until step 2 is saved; drives the login redirect
-- stripe_customer_id   the Stripe Customer reused for checkout / receipts
-- terms_accepted_at / privacy_accepted_at  proof of consent (LGPD/GDPR)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name           text,
  ADD COLUMN IF NOT EXISTS last_name            text,
  ADD COLUMN IF NOT EXISTS full_name            text,
  ADD COLUMN IF NOT EXISTS phone_country_code   text,
  ADD COLUMN IF NOT EXISTS phone                text,
  ADD COLUMN IF NOT EXISTS country              text,
  ADD COLUMN IF NOT EXISTS street               text,
  ADD COLUMN IF NOT EXISTS number               text,
  ADD COLUMN IF NOT EXISTS complement           text,
  ADD COLUMN IF NOT EXISTS city                 text,
  ADD COLUMN IF NOT EXISTS state                text,
  ADD COLUMN IF NOT EXISTS postal_code          text,
  ADD COLUMN IF NOT EXISTS profile_completed    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_customer_id   text,
  ADD COLUMN IF NOT EXISTS terms_accepted_at    timestamptz,
  ADD COLUMN IF NOT EXISTS privacy_accepted_at  timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at           timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Accounts that already existed before this migration are treated as complete:
-- the two-step signup applies to NEW customers. Only rows with no full_name
-- (i.e. never filled in the new flow) are touched, so re-running this migration
-- never marks a half-finished new signup as complete.
UPDATE public.profiles
   SET profile_completed = true
 WHERE profile_completed = false
   AND full_name IS NULL;

-- ---------------------------------------------------------------------------
-- 2. RLS — owner read / insert / update only
--    The dashboard already upserts (id, first_name, last_name) from the
--    browser, so authenticated INSERT and UPDATE on the caller's own row must
--    stay allowed. Writes through the profile-submit Edge Function use the
--    service role and are scoped explicitly by user id.
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_owner_select ON public.profiles;
CREATE POLICY profiles_owner_select ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_owner_insert ON public.profiles;
CREATE POLICY profiles_owner_insert ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_owner_update ON public.profiles;
CREATE POLICY profiles_owner_update ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. Create the profile row when a user signs up, so profile_completed always
--    has a row to read and the client never has to INSERT before it can read.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- The step-1 terms checkbox is sent as metadata, so the consent is stamped
  -- at account creation even if the customer never finishes step 2.
  INSERT INTO public.profiles (id, full_name, terms_accepted_at, privacy_accepted_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    CASE WHEN (NEW.raw_user_meta_data ->> 'terms_accepted') = 'true' THEN now() END,
    CASE WHEN (NEW.raw_user_meta_data ->> 'terms_accepted') = 'true' THEN now() END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- ---------------------------------------------------------------------------
-- 4. updated_at trigger (set_updated_at is defined by the tradovate migration)
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
