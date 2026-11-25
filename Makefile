.PHONY: test test-payment test-payment-option-a test-tradovate test-tradovate-rls test-activation test-onboarding test-activation-rls test-migrations test-security test-stripe test-checkout test-plan-selection test-payment-activation test-support-chat typecheck build

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
	deno run -A supabase/functions/_test/tradovate-performance-tests.ts
	deno run -A supabase/functions/_test/feature-flag-tests.ts
	deno run -A supabase/functions/_test/activation-submit-tests.ts
	deno run -A supabase/functions/_test/activation-review-tests.ts
	deno run -A supabase/functions/_test/profile-tests.ts


# AI support chatbot (grounded answers, refusals, escalation, timeout,
# rate limiting, no privileged action, 11 locales). No network, no DB, no key.
test-support-chat:
	deno run -A supabase/functions/_test/support-chat-tests.ts

# Security contract tests (signed KYC tokens, bounded bodies, CORS allowlist,
# rate limiter, operator-only endpoints). No network, no DB, no secrets.
test-security:
	node scripts/check-security-contract.mjs

# Single-page checkout + payment-method orchestration (profile prefill,
# address validation, Stripe plan/amount/currency, crypto asset gating, Wise
# pending/fake-success rules, duplicate/expired states, 11 locales, responsive
# and accessibility contract). No network, no DB.
test-checkout:
	deno run -A supabase/functions/_test/checkout-redesign-tests.ts
	deno run -A supabase/functions/_test/plan-selection-prefill-tests.ts

# Authenticated plan selection -> /checkout: four plans, profile prefill,
# missing fields, edits, login round-trip, no duplicate application, locales.
test-plan-selection:
	deno run -A supabase/functions/_test/plan-selection-prefill-tests.ts

# Stripe confirmation hardening (DB lifecycle status, validated confirmation,
# lost-event reconciliation). No network, no DB, no secrets.
test-stripe:
	deno run -A supabase/functions/_test/stripe-confirmation-tests.ts

# Client-profile unit tests (two-step signup validation, billing sanitization,
# Stripe customer wiring, no password/card storage). No network, no DB.
test-profile:
	deno run -A supabase/functions/_test/profile-tests.ts

# Account-activation unit tests (submit validation, operator predicate,
# status state machine, migration/function wiring). No network, no DB.
test-activation:
	deno run -A supabase/functions/_test/activation-submit-tests.ts
	deno run -A supabase/functions/_test/activation-review-tests.ts
	deno run -A supabase/functions/_test/onboarding-tests.ts
	deno run -A supabase/functions/_test/payment-activation-tests.ts

# Production checkout -> payment status -> activation -> email contract.
# Profile prefill, forged webhook, wrong amount/currency/Price ID, duplicate
# webhook, reconciliation, manual review, email-once, refund/dispute,
# cross-user, operator authorization and all 11 locales. No network, no DB.
test-payment-activation:
	deno run -A supabase/functions/_test/payment-activation-tests.ts

# Customer onboarding + managed-account lifecycle (entitlement, duplicate,
# suspended/disconnected, execution kill switch, refund/cancel).
test-onboarding:
	deno run -A supabase/functions/_test/onboarding-tests.ts

# Account-activation RLS + private receipt bucket test. Needs Docker.
test-activation-rls:
	bash supabase/functions/_test/rls-activation/run.sh

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