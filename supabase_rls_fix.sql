-- ============================================================================
-- DEPRECATED — DO NOT RUN.
--
-- This script used to enable RLS on public.services and public.profiles and
-- then grant `authenticated` INSERT/UPDATE/DELETE on its own rows. That made
-- client-side activation possible: a customer could insert or flip
-- `activated` / `status` / `balance` on a services row, and could rewrite
-- `profiles.kyc_status` (which the withdrawal gate falls back to).
--
-- Both tables are now secured by the tracked migration
--   supabase/migrations/20261012000000_secure_profile_and_services_rls.sql
-- which enables RLS, allows owner SELECT only, restricts profiles writes to
-- first/last name, and denies every client write to services.
--
-- The statements below are intentionally left inert so re-running this file
-- can never re-open the hole. Use `supabase db push` instead.
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'supabase_rls_fix.sql is deprecated; see 20261012000000_secure_profile_and_services_rls.sql';
END
$$;
