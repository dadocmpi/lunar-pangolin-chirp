.PHONY: test test-payment test-payment-option-a typecheck build

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

# Front-end type check.
typecheck:
	npx tsc --noEmit

# Front-end production build.
build:
	npm run build