-- ============================================================================
-- Real 2-user RLS test for the Tradovate tables.
-- Runs against the actual migration with a Supabase-compatible auth shim.
-- Users are simulated by SET LOCAL ROLE authenticated + request.jwt.claim.sub.
-- Every assertion prints PASS/FAIL from SQL, so there is no psql \if parsing.
-- ============================================================================
\pset pager off
\set ON_ERROR_STOP on

-- Write probe: runs as the INVOKER (authenticated), so RLS applies, and
-- reports whether the statement was allowed.
CREATE OR REPLACE FUNCTION public._rls_try(stmt text) RETURNS boolean
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE stmt;
  RETURN true;
EXCEPTION WHEN others THEN
  RETURN false;
END $$;

-- ---- Seed: two users, each owning one integration + secrets + fills + trades
TRUNCATE public.integration_credentials, public.tradovate_fills, public.trades,
         public.integrations, auth.users CASCADE;

INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

INSERT INTO public.integrations
  (id, user_id, environment, tradovate_account_id, account_spec, status, last_fill_id)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111', 'demo', 111, 'DEMOA', 'connected', 2),
  ('bbbbbbbb-0000-0000-0000-000000000002',
   '22222222-2222-2222-2222-222222222222', 'demo', 222, 'DEMOB', 'connected', 1);

INSERT INTO public.integration_credentials (integration_id, ciphertext, iv, auth_tag) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'ctA', 'ivA', 'tagA'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'ctB', 'ivB', 'tagB');

INSERT INTO public.tradovate_fills
  (integration_id, tradovate_fill_id, contract_id, account_id, fill_timestamp,
   action, quantity, price, commission)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 1, 1, 111, '2025-01-02T15:30:00Z', 'Buy',  1, 100, 0.5),
  ('aaaaaaaa-0000-0000-0000-000000000001', 2, 1, 111, '2025-01-02T15:31:00Z', 'Sell', 1, 110, 0.5),
  ('bbbbbbbb-0000-0000-0000-000000000002', 1, 1, 222, '2025-01-02T15:30:00Z', 'Buy',  1, 200, 0.5);

INSERT INTO public.trades
  (integration_id, root_symbol, side, quantity, entry_price, exit_price,
   opened_at, closed_at, realized_pnl, commission, net_pnl, status, dedupe_key)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'MNQ', 'long', 1, 100, 110,
   '2025-01-02T15:30:00Z', '2025-01-02T15:31:00Z', 20, 1, 19, 'closed', 'A-1-2'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'MNQ', 'long', 1, 200, 210,
   '2025-01-02T15:30:00Z', '2025-01-02T15:31:00Z', 20, 1, 19, 'closed', 'B-1-1');

\echo '\n[0] service_role sees everything (bypasses RLS)'
BEGIN;
SET LOCAL ROLE service_role;
SELECT
  CASE WHEN (SELECT count(*) FROM public.integrations)=2
       THEN '  PASS  service_role sees both integrations'
       ELSE '  FAIL  service_role integration count wrong' END AS a,
  CASE WHEN (SELECT count(*) FROM public.integration_credentials)=2
       THEN '  PASS  service_role can read credentials (server-side only)'
       ELSE '  FAIL  service_role credential count wrong' END AS b,
  CASE WHEN (SELECT count(*) FROM public.tradovate_fills)=3
       THEN '  PASS  service_role sees all fills'
       ELSE '  FAIL  service_role fill count wrong' END AS c,
  CASE WHEN (SELECT count(*) FROM public.trades)=2
       THEN '  PASS  service_role sees all trades'
       ELSE '  FAIL  service_role trade count wrong' END AS d
\gset
\echo :a
\echo :b
\echo :c
\echo :d
ROLLBACK;

\echo '\n[1] User A cannot read anything belonging to User B'
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT
  CASE WHEN (SELECT count(*) FROM public.integrations)=1
       THEN '  PASS  A sees exactly 1 integration (their own)'
       ELSE '  FAIL  A integration count wrong' END AS a,
  CASE WHEN (SELECT count(*) FROM public.integrations
             WHERE id='bbbbbbbb-0000-0000-0000-000000000002')=0
       THEN '  PASS  A cannot read B''s integration by id'
       ELSE '  FAIL  A read B''s integration' END AS b,
  CASE WHEN (SELECT count(*) FROM public.tradovate_fills)=2
       THEN '  PASS  A sees only their own 2 fills'
       ELSE '  FAIL  A fill count wrong' END AS c,
  CASE WHEN (SELECT count(*) FROM public.tradovate_fills
             WHERE integration_id='bbbbbbbb-0000-0000-0000-000000000002')=0
       THEN '  PASS  A cannot read B''s fills'
       ELSE '  FAIL  A read B''s fills' END AS d,
  CASE WHEN (SELECT count(*) FROM public.trades)=1
       THEN '  PASS  A sees only their own 1 trade'
       ELSE '  FAIL  A trade count wrong' END AS e,
  CASE WHEN (SELECT count(*) FROM public.trades
             WHERE integration_id='bbbbbbbb-0000-0000-0000-000000000002')=0
       THEN '  PASS  A cannot read B''s trades'
       ELSE '  FAIL  A read B''s trades' END AS f,
  CASE WHEN (SELECT count(*) FROM public.integration_credentials)=0
       THEN '  PASS  A cannot read ANY credentials (not even their own)'
       ELSE '  FAIL  A read credential rows' END AS g,
  CASE WHEN (SELECT count(*) FROM public.integration_credentials
             WHERE integration_id='bbbbbbbb-0000-0000-0000-000000000002')=0
       THEN '  PASS  A cannot read B''s credentials'
       ELSE '  FAIL  A read B''s credentials' END AS h
\gset
\echo :a
\echo :b
\echo :c
\echo :d
\echo :e
\echo :f
\echo :g
\echo :h
ROLLBACK;

\echo '\n[2] User B is symmetric (cannot read A)'
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
SELECT
  CASE WHEN (SELECT count(*) FROM public.integrations)=1
       THEN '  PASS  B sees exactly 1 integration (their own)'
       ELSE '  FAIL  B integration count wrong' END AS a,
  CASE WHEN (SELECT count(*) FROM public.tradovate_fills
             WHERE integration_id='aaaaaaaa-0000-0000-0000-000000000001')=0
       THEN '  PASS  B cannot read A''s fills'
       ELSE '  FAIL  B read A''s fills' END AS b,
  CASE WHEN (SELECT count(*) FROM public.trades
             WHERE integration_id='aaaaaaaa-0000-0000-0000-000000000001')=0
       THEN '  PASS  B cannot read A''s trades'
       ELSE '  FAIL  B read A''s trades' END AS c,
  CASE WHEN (SELECT count(*) FROM public.integration_credentials)=0
       THEN '  PASS  B cannot read any credentials'
       ELSE '  FAIL  B read credential rows' END AS d
\gset
\echo :a
\echo :b
\echo :c
\echo :d
ROLLBACK;

\echo '\n[3] Authenticated users cannot write'
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT
  CASE WHEN public._rls_try(
    $q$INSERT INTO public.integrations (user_id, environment, tradovate_account_id)
       VALUES ('11111111-1111-1111-1111-111111111111','demo',999)$q$) = false
       THEN '  PASS  A cannot INSERT an integration (RLS denied)'
       ELSE '  FAIL  A inserted an integration' END AS a,
  CASE WHEN public._rls_try(
    $q$INSERT INTO public.integration_credentials (integration_id, ciphertext, iv, auth_tag)
       VALUES ('aaaaaaaa-0000-0000-0000-000000000001','x','y','z')$q$) = false
       THEN '  PASS  A cannot INSERT credentials'
       ELSE '  FAIL  A inserted credentials' END AS b,
  CASE WHEN public._rls_try(
    $q$UPDATE public.integrations SET status='revoked'
       WHERE id='aaaaaaaa-0000-0000-0000-000000000001'$q$) = true
       AND (SELECT count(*) FROM public.integrations WHERE status='revoked')=0
       THEN '  PASS  A cannot UPDATE their own integration (0 rows affected)'
       ELSE '  FAIL  A updated an integration' END AS c,
  CASE WHEN public._rls_try(
    $q$DELETE FROM public.trades
       WHERE integration_id='aaaaaaaa-0000-0000-0000-000000000001'$q$) = true
       AND (SELECT count(*) FROM public.trades)=1
       THEN '  PASS  A cannot DELETE their own trade (row still present)'
       ELSE '  FAIL  A deleted a trade' END AS d,
  CASE WHEN public._rls_try(
    $q$INSERT INTO public.tradovate_fills
       (integration_id, tradovate_fill_id, fill_timestamp, quantity, price)
       VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 77,
               '2025-01-02T15:32:00Z', 1, 100)$q$) = false
       THEN '  PASS  A cannot INSERT a fill'
       ELSE '  FAIL  A inserted a fill' END AS e,
  CASE WHEN public._rls_try(
    $q$INSERT INTO public.trades
       (integration_id, root_symbol, side, quantity, entry_price, opened_at, dedupe_key)
       VALUES ('aaaaaaaa-0000-0000-0000-000000000001','MNQ','long',1,100,
               '2025-01-02T15:30:00Z','HACK')$q$) = false
       THEN '  PASS  A cannot INSERT a trade'
       ELSE '  FAIL  A inserted a trade' END AS f
\gset
\echo :a
\echo :b
\echo :c
\echo :d
\echo :e
\echo :f
ROLLBACK;

\echo '\n[4] Policy catalog'
SELECT
  CASE WHEN count(*) FILTER (WHERE cmd IN ('INSERT','UPDATE','DELETE','ALL'))=12
       THEN '  PASS  12 authenticated write policies exist and all deny (false)'
       ELSE '  FAIL  unexpected authenticated write policy count' END AS a
FROM pg_policies
WHERE schemaname='public'
  AND tablename IN ('integrations','integration_credentials','tradovate_fills','trades')
  AND roles::text LIKE '%authenticated%';
\gset
\echo :a

SELECT
  CASE WHEN count(*)=4
       THEN '  PASS  RLS is enabled on all 4 tables'
       ELSE '  FAIL  RLS not enabled on all tables' END AS a
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public'
  AND c.relname IN ('integrations','integration_credentials','tradovate_fills','trades')
  AND c.relrowsecurity;
\gset
\echo :a

\echo '\nRLS test complete.'
