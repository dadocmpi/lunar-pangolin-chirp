#!/usr/bin/env bash
# Fresh-DB migration apply test.
#
# Reproduces "supabase db push" against a database at the CURRENT PRODUCTION
# state, using the real supabase/postgres image (it ships the auth, storage,
# extensions and roles that Supabase migrations depend on).
#
#   1. start a fresh supabase/postgres container
#   2. apply the production baseline (the real live schema: legacy services
#      without plan_id, plus the out-of-band payment/application tables)
#   3. apply every migration in filename order
#   4. re-apply them to prove idempotency
#   5. report PASS/FAIL
set -u

CONTAINER="${MIG_CONTAINER:-mig-pg}"
PORT="${MIG_PORT:-55433}"
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
DOCKER="docker"
sudo docker info >/dev/null 2>&1 && DOCKER="sudo docker"

echo "Starting fresh Supabase Postgres ('$CONTAINER')..."
$DOCKER rm -f "$CONTAINER" >/dev/null 2>&1
$DOCKER run -d --name "$CONTAINER" -e POSTGRES_PASSWORD=postgres \
  -p "${PORT}:5432" supabase/postgres:15.8.1.085 >/dev/null

echo "Waiting for readiness..."
# The image runs an init sequence that restarts postgres, so pg_isready alone
# can report ready too early. Require a real query to succeed twice in a row.
ready=0
for _ in $(seq 1 90); do
  if $DOCKER exec -e PGPASSWORD=postgres "$CONTAINER" psql -U supabase_admin -d postgres -Atc "SELECT 1" >/dev/null 2>&1; then
    sleep 3
    if $DOCKER exec -e PGPASSWORD=postgres "$CONTAINER" psql -U supabase_admin -d postgres -Atc "SELECT 1" >/dev/null 2>&1; then
      ready=1; break
    fi
  fi
  sleep 1
done
if [ $ready -ne 1 ]; then
  echo "postgres never became ready"; $DOCKER logs --tail 20 "$CONTAINER"; exit 1
fi

echo "Preflight: Supabase schemas/roles present?"
$DOCKER exec -e PGPASSWORD=postgres "$CONTAINER" psql -U supabase_admin -d postgres -Atc \
  "SELECT 'schemas: ' || string_agg(nspname, ',') FROM pg_namespace WHERE nspname IN ('auth','storage','extensions','vault','net','cron');"
$DOCKER exec -e PGPASSWORD=postgres "$CONTAINER" psql -U supabase_admin -d postgres -Atc \
  "SELECT 'roles: ' || string_agg(rolname, ',') FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role');"

apply() {
  local f="$1"
  echo "--- applying $(basename "$f")"
  $DOCKER cp "$f" "$CONTAINER:/tmp/$(basename "$f")" >/dev/null
  $DOCKER exec -e PGPASSWORD=postgres "$CONTAINER" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -q -f "/tmp/$(basename "$f")" 2>&1
  local rc=$?
  if [ $rc -ne 0 ]; then echo "APPLY FAILED: $(basename "$f") (exit $rc)"; exit 1; fi
}

# The baseline every migration assumes already exists in production. It now
# also emulates the live payment/application tables (created out-of-band) and
# the real legacy services shape (plan_name, no plan_id), so the payment
# migrations are exercised against the true production precondition.
PROD_FILES=""

echo; echo "===== [1] Apply CURRENT PRODUCTION state (baseline objects) ====="
apply "$ROOT/supabase/functions/_test/migrations/00_legacy_production_baseline.sql"
echo "Production baseline applied."

echo; echo "===== [2] Apply PENDING migrations (branch), filename order ====="
PENDING=$(git -C "$ROOT" diff --name-only origin/main...HEAD -- supabase/migrations/ | sort)
echo "Pending order:"; echo "$PENDING" | sed 's/^/  /'
for f in $PENDING; do apply "$ROOT/$f"; done

echo; echo "===== [3] Re-apply PENDING migrations (idempotency check) ====="
for f in $PENDING; do apply "$ROOT/$f"; done
echo "Idempotent re-apply OK."

echo; echo "===== [4] Verify resulting objects ====="
$DOCKER exec -e PGPASSWORD=postgres "$CONTAINER" psql -U supabase_admin -d postgres -Atc \
  "SELECT 'tables: ' || string_agg(tablename, ',') FROM pg_tables WHERE schemaname='public' AND tablename IN ('integrations','integration_credentials','tradovate_fills','trades','kyc_submissions','withdrawal_requests','kyc_ai_checks');"
$DOCKER exec -e PGPASSWORD=postgres "$CONTAINER" psql -U supabase_admin -d postgres -Atc \
  "SELECT 'rls_enabled: ' || count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('integrations','integration_credentials','tradovate_fills','trades') AND c.relrowsecurity;"
$DOCKER exec -e PGPASSWORD=postgres "$CONTAINER" psql -U supabase_admin -d postgres -Atc \
  "SELECT 'withdrawal_status_check: ' || pg_get_constraintdef(oid) FROM pg_constraint WHERE conname LIKE '%withdrawal_requests_status%' LIMIT 1;"
$DOCKER exec -e PGPASSWORD=postgres "$CONTAINER" psql -U supabase_admin -d postgres -Atc \
  "SELECT 'tradovate-sync cron job: ' || count(*) FROM cron.job WHERE jobname='tradovate-sync';" 2>&1 || true

echo; echo "MIGRATION APPLY TEST PASSED"
$DOCKER rm -f "$CONTAINER" >/dev/null 2>&1
