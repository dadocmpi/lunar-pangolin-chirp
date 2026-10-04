#!/usr/bin/env bash
# Reproducible RLS + private-storage test for the KYC-on-withdrawal tables.
# Requires a running Docker daemon. Starts a throwaway Postgres, applies the
# Supabase auth/storage shim + the real migration, then runs the 2-user test.
set -u

CONTAINER="${RLS_CONTAINER:-rls-kyc-pg}"
PORT="${RLS_PORT:-55433}"
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
MIGRATION="$(ls "$ROOT"/supabase/migrations/*kyc_on_withdrawal*.sql | head -1)"
AI_MIGRATION="$(ls "$ROOT"/supabase/migrations/*ai_kyc_checks*.sql | head -1)"
REVIEW_MIGRATION="$(ls "$ROOT"/supabase/migrations/*withdrawal_manual_review*.sql | head -1)"
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
$DOCKER cp "$AI_MIGRATION" "$CONTAINER:/tmp/ai_migration.sql"
$DOCKER cp "$REVIEW_MIGRATION" "$CONTAINER:/tmp/review_migration.sql"
$DOCKER cp "$(dirname "$0")/10_rls_test.sql" "$CONTAINER:/tmp/10_rls_test.sql"

echo "Applying shim + migration..."
$DOCKER exec "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 -f /tmp/00_setup.sql
$DOCKER exec "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 -f /tmp/migration.sql
$DOCKER exec "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 -f /tmp/ai_migration.sql
$DOCKER exec "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 -f /tmp/review_migration.sql

# Supabase grants these table privileges; RLS filters the rows.
$DOCKER exec "$CONTAINER" psql -U postgres -q -c "
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA storage TO authenticated, service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;"

echo "Running 2-user assertions..."
OUT="$($DOCKER exec "$CONTAINER" psql -U postgres -f /tmp/10_rls_test.sql 2>&1)"
echo "$OUT" | grep -E "PASS|FAIL|\[|complete"

if echo "$OUT" | grep -q "FAIL"; then
  echo "KYC RLS test FAILED"
  $DOCKER rm -f "$CONTAINER" >/dev/null 2>&1
  exit 1
fi
$DOCKER rm -f "$CONTAINER" >/dev/null 2>&1
echo "KYC RLS test passed"
