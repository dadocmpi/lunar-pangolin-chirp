# ============================================================================
# Braxel Markets — Option A Makefile
#
# Test:
#   make test-option-a
#     Runs the Deno test harness for Option A.
#     STATUS: NOT EXECUTED until this command is run.
#
# Migration (operator action required):
#   1. Run the pre-checks in: tests/payment-foundation-option-a.md
#   2. Apply the migration in the Supabase SQL editor:
#      supabase/migrations/20260201000000_payment_foundation_option_a.sql
#   3. Do NOT run "make migrate" — it is not implemented.
#
# Deploy (operator action required):
#   supabase functions deploy wise-checkout
#   supabase functions deploy crypto-checkout
#   supabase functions deploy crypto-confirmation
#   supabase functions deploy payment-status
#
# Environment variables (operator action required in Supabase Edge Function Secrets):
#   PAYMENTS_ENABLED         = "true"  (to enable payments)
#   ADMIN_SECRET            = <your-secret>
#   KYC_ACTION_SECRET       = <your-secret>
#   EXCHANGERATE_API_KEY   = <your-key>  (optional, for live FX rates)
#   RESEND_API_KEY         = <your-key>  (for email)
# ============================================================================

.PHONY: test-option-a

test-option-a:
	@echo "Running Option A test harness..."
	@echo "STATUS: NOT EXECUTED until this command is run."
	deno run -A supabase/functions/_test/run-tests-option-a.ts

# Doc target (static — no execution)
docs:
	@echo "See tests/payment-foundation-option-a.md for test report."
	@echo "See tests/payment-foundation.md for Option B report (not executed)."