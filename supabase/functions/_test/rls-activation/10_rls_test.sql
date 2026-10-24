-- ============================================================================
-- Real 2-user RLS test for account_activations + the private receipt bucket.
-- Runs against the real migration with a Supabase-compatible shim.
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

TRUNCATE public.account_activations, auth.users CASCADE;

INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

INSERT INTO public.account_activations
  (id, user_id, firm, plan_name, account_login, purchase_email, receipt_path, status, operator_note)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111', 'tradeify', '50K Evaluation',
   'ABC-111', 'alice@example.com',
   '11111111-1111-1111-1111-111111111111/receipt-a.pdf', 'pending', NULL),
  ('bbbbbbbb-0000-0000-0000-000000000002',
   '22222222-2222-2222-2222-222222222222', 'lucid', '100K Funded',
   'XYZ-222', 'bob@example.com',
   '22222222-2222-2222-2222-222222222222/receipt-b.png', 'approved', 'secret operator note');

INSERT INTO storage.objects (bucket_id, name) VALUES
  ('activation-receipts', '11111111-1111-1111-1111-111111111111/receipt-a.pdf'),
  ('activation-receipts', '22222222-2222-2222-2222-222222222222/receipt-b.png');

\echo '\n[0] service_role sees everything'
BEGIN;
SET LOCAL ROLE service_role;
SELECT
  CASE WHEN (SELECT count(*) FROM public.account_activations)=2
       THEN '  PASS  service_role sees both activations'
       ELSE '  FAIL  activation count wrong' END AS a,
  CASE WHEN (SELECT count(*) FROM storage.objects)=2
       THEN '  PASS  service_role sees both receipts'
       ELSE '  FAIL  receipt count wrong' END AS b
\gset
\echo :a
\echo :b
ROLLBACK;

\echo '\n[1] User A sees only their own activation'
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT
  CASE WHEN (SELECT count(*) FROM public.account_activations)=1
       THEN '  PASS  A sees exactly 1 activation (their own)'
       ELSE '  FAIL  A activation count wrong' END AS a,
  CASE WHEN (SELECT count(*) FROM public.account_activations
             WHERE user_id='22222222-2222-2222-2222-222222222222')=0
       THEN '  PASS  A cannot read B''s activation'
       ELSE '  FAIL  A read B''s activation' END AS b,
  CASE WHEN (SELECT count(*) FROM public.account_activations
             WHERE operator_note IS NOT NULL)=0
       THEN '  PASS  A cannot read B''s operator note'
       ELSE '  FAIL  A read B''s operator note' END AS c
\gset
\echo :a
\echo :b
\echo :c
ROLLBACK;

\echo '\n[2] Private storage: A can only touch their own receipt'
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT
  CASE WHEN (SELECT count(*) FROM storage.objects) = 1
       THEN '  PASS  A sees only their own receipt'
       ELSE '  FAIL  A sees unexpected receipt count' END AS a,
  CASE WHEN (SELECT count(*) FROM storage.objects
             WHERE name LIKE '22222222%') = 0
       THEN '  PASS  A cannot read B''s receipt'
       ELSE '  FAIL  A read B''s receipt' END AS b,
  CASE WHEN public._rls_try($$
         INSERT INTO storage.objects (bucket_id, name)
         VALUES ('activation-receipts',
                 '11111111-1111-1111-1111-111111111111/receipt-self.jpg')$$)
       THEN '  PASS  A can upload a receipt under their own uid'
       ELSE '  FAIL  A could not upload own receipt' END AS c,
  CASE WHEN NOT public._rls_try($$
         INSERT INTO storage.objects (bucket_id, name)
         VALUES ('activation-receipts',
                 '22222222-2222-2222-2222-222222222222/receipt-evil.jpg')$$)
       THEN '  PASS  A cannot upload under B''s uid (path forgery blocked)'
       ELSE '  FAIL  A uploaded into B''s folder' END AS d,
  CASE WHEN public._rls_affected($$
         DELETE FROM storage.objects WHERE name LIKE '22222222%'$$) = 0
       THEN '  PASS  A cannot delete B''s receipt (0 rows affected)'
       ELSE '  FAIL  A deleted B''s receipt' END AS e
\gset
\echo :a
\echo :b
\echo :c
\echo :d
\echo :e
ROLLBACK;

\echo '\n[3] Authenticated users cannot write activation rows directly'
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT
  CASE WHEN NOT public._rls_try($$
         INSERT INTO public.account_activations
           (user_id, firm, plan_name, account_login, purchase_email)
         VALUES ('11111111-1111-1111-1111-111111111111','tradeify','50K','A','a@b.co')$$)
       THEN '  PASS  A cannot INSERT an activation directly'
       ELSE '  FAIL  A inserted an activation' END AS a,
  CASE WHEN public._rls_affected($$
         UPDATE public.account_activations SET status='approved'$$) = 0
       THEN '  PASS  A cannot self-approve (0 rows affected)'
       ELSE '  FAIL  A self-approved' END AS b,
  CASE WHEN public._rls_affected($$
         DELETE FROM public.account_activations$$) = 0
       THEN '  PASS  A cannot delete an activation (0 rows affected)'
       ELSE '  FAIL  A deleted an activation' END AS c
\gset
\echo :a
\echo :b
\echo :c
ROLLBACK;

\echo '\n[4] Operator (app_metadata.operator=true) reads every activation'
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims',
  '{"app_metadata":{"operator":true}}', true);
SELECT
  CASE WHEN (SELECT count(*) FROM public.account_activations)=2
       THEN '  PASS  operator sees all activations'
       ELSE '  FAIL  operator activation count wrong' END AS a
\gset
\echo :a
ROLLBACK;

\echo '\n[5] A non-operator flag does NOT grant operator reads'
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims',
  '{"app_metadata":{"operator":"true"}}', true);
SELECT
  CASE WHEN (SELECT count(*) FROM public.account_activations)=1
       THEN '  PASS  string "true" is not an operator (sees only own)'
       ELSE '  FAIL  string operator flag granted full read' END AS a
\gset
\echo :a
ROLLBACK;

\echo '\n[6] RLS enabled and the receipt bucket is private'
SELECT
  CASE WHEN (SELECT relrowsecurity FROM pg_class WHERE relname='account_activations')
       THEN '  PASS  RLS enabled on account_activations'
       ELSE '  FAIL  RLS not enabled' END AS a,
  CASE WHEN (SELECT public FROM storage.buckets WHERE id='activation-receipts') = false
       THEN '  PASS  activation-receipts bucket is private'
       ELSE '  FAIL  bucket is public' END AS b
\gset
\echo :a
\echo :b

\echo '\n[7] Schema has no broker-credential column'
SELECT
  CASE WHEN NOT EXISTS (
         SELECT 1 FROM information_schema.columns
          WHERE table_name='account_activations'
            AND column_name ~* 'password|cid|secret')
       THEN '  PASS  no password/cid/secret column exists'
       ELSE '  FAIL  a credential column exists' END AS a
\gset
\echo :a

\echo '\nActivation RLS test complete.'
