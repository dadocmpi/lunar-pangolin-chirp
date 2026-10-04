.PHONY: test test-payment test-payment-option-a test-tradovate test-tradovate-rls test-migrations typecheck build

# ---------------------------------------------------------------------------
# Local validation only. No deploy. No migration. No secrets.
# ---------------------------------------------------------------------------

# Deno test harness for the Option A payment foundation.
# Run:    make test
test:
	deno run -A supabase/functions/_test/run-tests.ts

# Alternative test harness (Option A explicitly named).
test-payment-option-a:
	deno run -A supabase/functions/_test/run-tests-option-a.ts

# Tradovate integration unit tests (PnL engine, rate limiting, auth/REST/crypto).
# No network, no DB, no secrets required.
test-tradovate:
	deno run -A supabase/functions/_test/tradovate-pnl-tests.ts
	deno run -A supabase/functions/_test/tradovate-rate-limit-tests.ts
	deno run -A supabase/functions/_test/tradovate-auth-rest-tests.ts
	deno run -A supabase/functions/_test/tradovate-sync-tests.ts
	deno run -A supabase/functions/_test/tradovate-dashboard-tests.ts
	deno run -A supabase/functions/_test/tradovate-welcome-tests.ts
	deno run -A supabase/functions/_test/tradovate-log-safety-tests.ts
	deno run -A supabase/functions/_test/tradovate-ownership-tests.ts
	deno run -A supabase/functions/_test/tradovate-e2e-demo-tests.ts
	deno run -A supabase/functions/_test/tradovate-connect-error-tests.ts
	deno run -A supabase/functions/_test/tradovate-account-environment-tests.ts
	deno run -A supabase/functions/_test/feature-flag-tests.ts

# Pending-migration apply-order + idempotency on a fresh Supabase Postgres.
# Needs sudo docker; reproduces the current production baseline then applies
# every pending migration in filename order.
test-migrations:
	bash supabase/functions/_test/migrations/apply-order.sh

# Row-level-security test. Needs Docker; see supabase/functions/_test/rls/.
test-tradovate-rls:
	bash supabase/functions/_test/rls/run.sh

# Front-end type check.
typecheck:
	npx tsc --noEmit

# Front-end production build.
build:
	npm run build