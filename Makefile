.PHONY: test test-payment test-payment-option-a test-tradovate typecheck build

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
	deno run -A supabase/functions/_test/tradovate-guard-tests.ts

# Front-end type check.
typecheck:
	npx tsc --noEmit

# Front-end production build.
build:
	npm run build