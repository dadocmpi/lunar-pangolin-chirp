-- ============================================================================
-- Close two client-side authorization holes in the account lifecycle.
--
-- 1. public.profiles — the owner UPDATE policy (20261011000000_client_profiles)
--    is row-scoped but NOT column-scoped, and Supabase grants table-wide
--    UPDATE to `authenticated` by default. Any signed-in user could therefore
--    PATCH their own row and set:
--        kyc_status      -> 'approved'   (kyc_status_for_user falls back to
--                                         this column, so it bypassed the
--                                         withdrawal KYC gate)
--        profile_completed -> true       (skip step 2 of the signup)
--        stripe_customer_id              (point checkout at another Customer)
--        terms_accepted_at               (rewrite consent evidence)
--    Fix: keep the row policies, but restrict the client's column privileges
--    to the only columns the dashboard legitimately writes (first/last name).
--    profile-submit and the auth trigger use the service role / SECURITY
--    DEFINER and are unaffected.
--
-- 2. public.services — no tracked migration ever enabled RLS on this table.
--    supabase_rls_fix.sql (an untracked manual script) granted authenticated
--    INSERT/UPDATE/DELETE on the caller's own rows, which would let a customer
--    insert or flip `activated`/`status`/`balance` and grant themselves a
--    plan. Fix: enable RLS, allow owner SELECT only, and deny every client
--    write. Activation stays server-side (service role) in the payment
--    functions.
--
-- Idempotent: safe to re-run. No row is read, rewritten or deleted.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles — row-scoped as before, but column-scoped for clients
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Legacy policies from the manual supabase_rls_fix.sql. The tracked
-- profiles_owner_* policies in 20261011000000_client_profiles stay in place.
DROP POLICY IF EXISTS "Users can only see their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only update their own profile" ON public.profiles;

REVOKE INSERT, UPDATE ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;

-- The dashboard's settings form upserts (id, first_name, last_name). Nothing
-- else on this table may be written with a customer JWT.
GRANT INSERT (id, first_name, last_name) ON public.profiles TO authenticated;
GRANT UPDATE (first_name, last_name) ON public.profiles TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. services — owner read only; no client write
-- ---------------------------------------------------------------------------
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Legacy permissive policies from supabase_rls_fix.sql.
DROP POLICY IF EXISTS "Users can only see their own services" ON public.services;
DROP POLICY IF EXISTS "Users can only insert their own services" ON public.services;
DROP POLICY IF EXISTS "Users can only update their own services" ON public.services;
DROP POLICY IF EXISTS "Users can only delete their own services" ON public.services;

DROP POLICY IF EXISTS services_owner_select ON public.services;
CREATE POLICY services_owner_select ON public.services
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Explicit denials: a customer can never create, edit or delete a service row.
DROP POLICY IF EXISTS services_no_client_insert ON public.services;
CREATE POLICY services_no_client_insert ON public.services
  FOR INSERT TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS services_no_client_update ON public.services;
CREATE POLICY services_no_client_update ON public.services
  FOR UPDATE TO anon, authenticated USING (false);

DROP POLICY IF EXISTS services_no_client_delete ON public.services;
CREATE POLICY services_no_client_delete ON public.services
  FOR DELETE TO anon, authenticated USING (false);

REVOKE INSERT, UPDATE, DELETE ON public.services FROM anon, authenticated;
GRANT SELECT ON public.services TO authenticated;
