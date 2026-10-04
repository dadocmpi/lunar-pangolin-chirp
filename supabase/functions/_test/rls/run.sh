#!/usr/bin/env bash
# Reproducible RLS test for the Tradovate tables.
# Requires a running Docker daemon. Starts a throwaway Postgres, applies the
# Supabase auth shim + the real migration, then runs the 2-user isolation test.
set -u

CONTAINER="${RLS_CONTAINER:-rls-pg}"
PORT="${RLS_PORT:-55432}"
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
MIGRATION="$(ls "$ROOT"/supabase/migrations/*tradovate_integration*.sql | head -1)"
DOCKER="docker"
docker info >/dev/null 2>&1 || DOCKER="sudo docker"

echo "Starting Postgres container '$CONTAINER'..."
$DOCKER rm -f "$CONTAINER" >/dev/null 2>&1
$DOCKER run -d --name "$CONTAINER" \
  -e POSTGRES_PASSWORD=postgres -p "${PORT}:5432" postgres:16-alpine >/dev/null
for _ in $(seq 1 30); do
  $DOCKER exec "$CONTAINER" pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done

$DOCKER cp "$(dirname "$0")/00_setup.sql" "$CONTAINER:/tmp/00_setup.sql"
$DOCKER cp "$MIGRATION" "$CONTAINER:/tmp/migration.sql"
$DOCKER cp "$(dirname "$0")/10_rls_test.sql" "$CONTAINER:/tmp/10_rls_test.sql"

echo "Applying auth shim + migration..."
$DOCKER exec "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 -f /tmp/00_setup.sql
$DOCKER exec "$CONTAINER" psql -U postgres -q -c "CREATE PUBLICATION supabase_realtime;"
$DOCKER exec "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 -f /tmp/migration.sql

# Supabase grants these table privileges; RLS filters the rows.
$DOCKER exec "$CONTAINER" psql -U postgres -q -c "
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;"

echo "Running 2-user RLS assertions..."
# 10_rls_test.sql creates public._rls_try(text) itself; functions are EXECUTE-able
# by PUBLIC by default, so the authenticated role can call it.
OUT="$($DOCKER exec "$CONTAINER" psql -U postgres -f /tmp/10_rls_test.sql 2>&1)"
echo "$OUT" | grep -E "PASS|FAIL|NOTE|\[|complete"

if echo "$OUT" | grep -q "FAIL"; then
  echo "RLS test FAILED"
  $DOCKER rm -f "$CONTAINER" >/dev/null 2>&1
  exit 1
fi
$DOCKER rm -f "$CONTAINER" >/dev/null 2>&1
echo "RLS test passed"
