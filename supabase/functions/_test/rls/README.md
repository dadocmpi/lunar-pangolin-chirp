# RLS test harness (Tradovate tables)

Reproduces a real 2-user row-level-security test for the Tradovate tables
against the actual migration, without a Supabase instance.

It runs a stock Postgres, adds a tiny Supabase-compatible shim
(`auth.users`, `auth.uid()` reading `request.jwt.claim.sub`, and the
`authenticated` / `service_role` / `anon` roles), applies the real migration
`supabase/migrations/20261004000000_tradovate_integration.sql`, seeds two
users, then asserts isolation.

## Run

```bash
docker run -d --name rls-pg -e POSTGRES_PASSWORD=postgres -p 55432:5432 postgres:16-alpine
# apply the shim, then the migration
docker exec rls-pg psql -U postgres -f /tmp/00_setup.sql
docker exec rls-pg psql -U postgres -f /tmp/migration.sql
# Supabase grants table privileges to these roles; RLS then filters rows.
docker exec rls-pg psql -U postgres -c "
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public._rls_try(text) TO authenticated;"
docker exec rls-pg psql -U postgres -f /tmp/10_rls_test.sql
```

`10_rls_test.sql` creates `public._rls_try(text)` itself. Copy `00_setup.sql`,
the migration, and `10_rls_test.sql` into the container before running.

## What it proves

- `service_role` reads everything (the Edge Function path).
- User A sees only their own integration / fills / trades.
- User A cannot read anything owned by user B.
- No authenticated role can read `integration_credentials` at all.
- Authenticated roles cannot INSERT/UPDATE/DELETE any of the four tables.
- RLS is enabled on all four tables and every authenticated write policy
  denies.

`_rls_try` is `SECURITY INVOKER`, so the statement it runs executes with the
caller's RLS context.
