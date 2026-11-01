-- ============================================================================
-- Fix the signup profile trigger so full_name and the terms/privacy acceptance
-- timestamps are actually written at account creation.
--
-- Root cause: auth.users already had a trigger `on_auth_user_created`
-- (public.handle_new_user, which inserts (id, first_name)). Postgres fires
-- multiple AFTER INSERT triggers in NAME order, so `on_auth_user_created` ran
-- BEFORE `on_auth_user_created_profile`. The legacy trigger created the row,
-- then our trigger's `INSERT ... ON CONFLICT (id) DO NOTHING` became a no-op:
-- full_name and terms_accepted_at/privacy_accepted_at stayed NULL even though
-- the customer had accepted the terms in step 1.
--
-- The trigger now upserts and only fills the columns the legacy trigger leaves
-- empty, so it is correct no matter which trigger fires first, and re-running
-- it never overwrites data the customer already saved.
--
-- Numeric order: after 20261011000000 (the current migration head).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Upsert instead of insert-ignore
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, terms_accepted_at, privacy_accepted_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    CASE WHEN (NEW.raw_user_meta_data ->> 'terms_accepted') = 'true' THEN now() END,
    CASE WHEN (NEW.raw_user_meta_data ->> 'terms_accepted') = 'true' THEN now() END
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
        -- COALESCE keeps the FIRST acceptance; a later signup path cannot move it.
        terms_accepted_at = COALESCE(public.profiles.terms_accepted_at, EXCLUDED.terms_accepted_at),
        privacy_accepted_at = COALESCE(public.profiles.privacy_accepted_at, EXCLUDED.privacy_accepted_at);
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. Backfill consent for accounts created while the trigger was a no-op.
--    Only rows still missing the stamp are touched; the account creation time
--    is the closest server-clock proxy for when the customer accepted.
-- ---------------------------------------------------------------------------
UPDATE public.profiles p
   SET terms_accepted_at = COALESCE(p.terms_accepted_at, u.created_at),
       privacy_accepted_at = COALESCE(p.privacy_accepted_at, u.created_at),
       full_name = COALESCE(NULLIF(p.full_name, ''), u.raw_user_meta_data ->> 'full_name')
  FROM auth.users u
 WHERE u.id = p.id
   AND (u.raw_user_meta_data ->> 'terms_accepted') = 'true'
   AND (p.terms_accepted_at IS NULL OR p.privacy_accepted_at IS NULL
        OR p.full_name IS NULL OR p.full_name = '');
