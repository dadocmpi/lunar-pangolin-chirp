-- ============================================================================
-- Real 2-user RLS test for the KYC-on-withdrawal tables + private bucket.
-- Runs against the actual migration with a Supabase-compatible shim.
-- ============================================================================
\pset pager off
\set ON_ERROR_STOP on

CREATE OR REPLACE FUNCTION public._rls_try(stmt text) RETURNS boolean
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE stmt;
  RETURN true;
EXCEPTION WHEN others THEN
  RETURN false;
END $$;

-- RLS-filtered UPDATE/DELETE do NOT raise; they affect 0 rows. This returns
-- the affected-row count so a "denied" write can be asserted as 0.
CREATE OR REPLACE FUNCTION public._rls_affected(stmt text) RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE n integer;
BEGIN
  EXECUTE stmt;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
EXCEPTION WHEN others THEN
  RETURN -1;
END $$;

TRUNCATE public.kyc_submissions, public.withdrawal_requests, public.profiles,
         auth.users CASCADE;

INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

INSERT INTO public.profiles (id, kyc_status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'approved'),
  ('22222222-2222-2222-2222-222222222222', 'pending');

INSERT INTO public.kyc_submissions
  (id, user_id, status, country, document_front_path, review_reason)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111', 'approved', 'PT',
   '11111111-1111-1111-1111-111111111111/front-aaa.jpg', NULL),
  ('bbbbbbbb-0000-0000-0000-000000000002',
   '22222222-2222-2222-2222-222222222222', 'rejected', 'ES',
   '22222222-2222-2222-2222-222222222222/front-bbb.jpg', 'blurry');

INSERT INTO public.withdrawal_requests
  (id, user_id, amount_cents, status, kyc_status_at_request)
VALUES
  ('cccccccc-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111', 50000, 'pending', 'approved');

INSERT INTO storage.objects (bucket_id, name) VALUES
  ('kyc-documents', '11111111-1111-1111-1111-111111111111/front-aaa.jpg'),
  ('kyc-documents', '22222222-2222-2222-2222-222222222222/front-bbb.jpg');

\echo '\n[0] service_role sees everything and can call the gate RPCs'
BEGIN;
SET LOCAL ROLE service_role;
SELECT
  CASE WHEN (SELECT count(*) FROM public.kyc_submissions)=2
       THEN '  PASS  service_role sees both submissions'
       ELSE '  FAIL  submission count wrong' END AS a,
  CASE WHEN (SELECT count(*) FROM public.withdrawal_requests)=1
       THEN '  PASS  service_role sees all withdrawal requests'
       ELSE '  FAIL  withdrawal count wrong' END AS b,
  CASE WHEN public.kyc_require_approved('11111111-1111-1111-1111-111111111111') IS TRUE
       THEN '  PASS  gate: A approved'
       ELSE '  FAIL  gate A wrong' END AS c,
  CASE WHEN public.kyc_require_approved('22222222-2222-2222-2222-222222222222') IS FALSE
       THEN '  PASS  gate: B not approved'
       ELSE '  FAIL  gate B wrong' END AS d,
  CASE WHEN public.kyc_status_for_user('22222222-2222-2222-2222-222222222222')='rejected'
       THEN '  PASS  status: B = rejected (latest submission wins over profile)'
       ELSE '  FAIL  status B wrong' END AS e
\gset
\echo :a
\echo :b
\echo :c
\echo :d
\echo :e
ROLLBACK;

\echo '\n[1] User A cannot read User B KYC data'
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT
  CASE WHEN (SELECT count(*) FROM public.kyc_submissions)=1
       THEN '  PASS  A sees exactly 1 submission (their own)'
       ELSE '  FAIL  A submission count wrong' END AS a,
  CASE WHEN (SELECT count(*) FROM public.kyc_submissions
             WHERE user_id='22222222-2222-2222-2222-222222222222')=0
       THEN '  PASS  A cannot read B''s submission'
       ELSE '  FAIL  A read B''s submission' END AS b,
  CASE WHEN (SELECT count(*) FROM public.kyc_submissions
             WHERE review_reason IS NOT NULL)=0
       THEN '  PASS  A cannot read B''s rejection reason'
       ELSE '  FAIL  A read B''s reason' END AS c,
  CASE WHEN (SELECT count(*) FROM public.withdrawal_requests)=1
       THEN '  PASS  A sees only their own withdrawal request'
       ELSE '  FAIL  A withdrawal count wrong' END AS d
\gset
\echo :a
\echo :b
\echo :c
\echo :d
ROLLBACK;

\echo '\n[2] Private storage: A can only touch their own objects'
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT
  CASE WHEN (SELECT count(*) FROM storage.objects) = 1
       THEN '  PASS  A sees only their own object'
       ELSE '  FAIL  A sees unexpected object count' END AS a,
  CASE WHEN (SELECT count(*) FROM storage.objects
             WHERE name LIKE '22222222%') = 0
       THEN '  PASS  A cannot read B''s object'
       ELSE '  FAIL  A read B''s object' END AS b,
  CASE WHEN public._rls_try($$
         INSERT INTO storage.objects (bucket_id, name)
         VALUES ('kyc-documents',
                 '11111111-1111-1111-1111-111111111111/front-self.jpg')$$)
       THEN '  PASS  A can upload an object under their own uid'
       ELSE '  FAIL  A could not upload own object' END AS c,
  CASE WHEN NOT public._rls_try($$
         INSERT INTO storage.objects (bucket_id, name)
         VALUES ('kyc-documents',
                 '22222222-2222-2222-2222-222222222222/front-evil.jpg')$$)
       THEN '  PASS  A cannot upload under B''s uid (path forgery blocked)'
       ELSE '  FAIL  A uploaded into B''s folder' END AS d,
  CASE WHEN public._rls_affected($$
         DELETE FROM storage.objects WHERE name LIKE '22222222%'$$) = 0
       THEN '  PASS  A cannot delete B''s object (0 rows affected)'
       ELSE '  FAIL  A deleted B''s object' END AS e
\gset
\echo :a
\echo :b
\echo :c
\echo :d
\echo :e
ROLLBACK;

\echo '\n[3] Authenticated users cannot write KYC / withdrawal rows'
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT
  CASE WHEN NOT public._rls_try($$
         INSERT INTO public.kyc_submissions (user_id) VALUES
         ('11111111-1111-1111-1111-111111111111')$$)
       THEN '  PASS  A cannot INSERT a submission'
       ELSE '  FAIL  A inserted a submission' END AS a,
  CASE WHEN public._rls_affected($$
         UPDATE public.kyc_submissions SET status='approved'$$) = 0
       THEN '  PASS  A cannot update their own KYC status (0 rows affected)'
       ELSE '  FAIL  A updated KYC status' END AS b,
  CASE WHEN NOT public._rls_try($$
         INSERT INTO public.withdrawal_requests
           (user_id, amount_cents, kyc_status_at_request)
         VALUES ('11111111-1111-1111-1111-111111111111', 10, 'approved')$$)
       THEN '  PASS  A cannot INSERT a withdrawal request directly'
       ELSE '  FAIL  A inserted a withdrawal request' END AS c
\gset
\echo :a
\echo :b
\echo :c
ROLLBACK;

\echo '\n[4] Gate RPCs are not callable by the client role'
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT
  CASE WHEN NOT public._rls_try($$
         SELECT public.kyc_require_approved('11111111-1111-1111-1111-111111111111')$$)
       THEN '  PASS  A cannot call kyc_require_approved (server-only)'
       ELSE '  FAIL  A called the gate RPC' END AS a,
  CASE WHEN NOT public._rls_try($$
         SELECT public.kyc_status_for_user('22222222-2222-2222-2222-222222222222')$$)
       THEN '  PASS  A cannot call kyc_status_for_user'
       ELSE '  FAIL  A called the status RPC' END AS b
\gset
\echo :a
\echo :b
ROLLBACK;

\echo '\n[5] RLS enabled on both tables; bucket is private'
SELECT
  CASE WHEN (SELECT bool_and(relrowsecurity) FROM pg_class
             WHERE relname IN ('kyc_submissions','withdrawal_requests'))
       THEN '  PASS  RLS enabled on both tables'
       ELSE '  FAIL  RLS not enabled everywhere' END AS a,
  CASE WHEN (SELECT public FROM storage.buckets WHERE id='kyc-documents') = false
       THEN '  PASS  kyc-documents bucket is private'
       ELSE '  FAIL  bucket is public' END AS b
\gset
\echo :a
\echo :b

\echo '\n[6] AI check audit table (kyc_ai_checks) is server-only'
-- Seed one AI check per user through the service role.
INSERT INTO public.kyc_ai_checks (submission_id, user_id, provider, decision, confidence, checks, reason)
SELECT id, user_id, 'gemini', 'manual_review', 0.5, '{}'::jsonb, 'seeded'
  FROM public.kyc_submissions;
SELECT
  CASE WHEN (SELECT count(*) FROM public.kyc_ai_checks) = 2
       THEN '  PASS  service_role sees both AI checks'
       ELSE '  FAIL  service_role AI check count wrong' END AS a
\gset
\echo :a

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT
  CASE WHEN (SELECT count(*) FROM public.kyc_ai_checks) = 0
       THEN '  PASS  A sees no AI checks (not even their own)'
       ELSE '  FAIL  A can read AI checks' END AS a,
  CASE WHEN NOT public._rls_try($$
         INSERT INTO public.kyc_ai_checks (submission_id, user_id, provider, decision)
         SELECT id, user_id, 'forged', 'approved' FROM public.kyc_submissions LIMIT 1$$)
       THEN '  PASS  A cannot insert a forged AI approval'
       ELSE '  FAIL  A inserted a forged AI approval' END AS b,
  CASE WHEN public._rls_affected($$
         UPDATE public.kyc_ai_checks SET decision='approved'$$) = 0
       THEN '  PASS  A cannot update an AI decision'
       ELSE '  FAIL  A updated an AI decision' END AS c
\gset
\echo :a
\echo :b
\echo :c
ROLLBACK;

SELECT
  CASE WHEN (SELECT bool_and(relrowsecurity) FROM pg_class WHERE relname='kyc_ai_checks')
       THEN '  PASS  RLS enabled on kyc_ai_checks'
       ELSE '  FAIL  RLS not enabled on kyc_ai_checks' END AS a
\gset
\echo :a

\echo '\n[7] Manual-review status/column applied'
SELECT
  CASE WHEN EXISTS (
         SELECT 1 FROM pg_constraint
          WHERE conname = 'withdrawal_requests_status_check'
            AND pg_get_constraintdef(oid) LIKE '%manual_review%')
       THEN '  PASS  status check accepts manual_review'
       ELSE '  FAIL  status check missing manual_review' END AS a,
  CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.columns
          WHERE table_name='withdrawal_requests' AND column_name='manual_review')
       THEN '  PASS  manual_review column exists'
       ELSE '  FAIL  manual_review column missing' END AS b
\gset
\echo :a
\echo :b

\echo '\nKYC RLS test complete.'
