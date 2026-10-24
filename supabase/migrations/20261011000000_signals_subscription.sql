-- ============================================================================
-- Signals-plan subscription (Stripe) on top of the account activation.
--
-- The customer buys the evaluation/funded account at the prop firm, requests
-- activation, and an operator approves it. The monthly signals fee is then
-- billed as a Stripe subscription. The plan is ACTIVE only when Stripe's
-- webhook confirms the payment, and it goes INACTIVE the moment the payment
-- fails or the subscription is cancelled. The status always comes from the
-- webhook, never from the browser.
--
-- This migration is ADDITIVE and idempotent. It adds subscription bookkeeping
-- columns to the existing public.account_activations table. It does NOT drop or
-- rewrite anything, and it adds NO credential column of any kind: the customer
-- never submits a broker password / CID / secret anywhere in this flow.
--
-- The existing row-level policies on account_activations (owner read-only,
-- operator read, no direct client write) already cover the new columns, since
-- RLS is row-scoped; no new policy is required. Writes come from the
-- service-role stripe-webhook only.
--
-- Numeric order: after 20261010000000 (the current migration head).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Subscription bookkeeping columns.
--    subscription_status is the single source of truth for whether the signals
--    plan is active. 'none' means the customer has not started a subscription.
-- ---------------------------------------------------------------------------
ALTER TABLE public.account_activations
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'none';

ALTER TABLE public.account_activations
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

ALTER TABLE public.account_activations
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

ALTER TABLE public.account_activations
  ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz;

ALTER TABLE public.account_activations
  ADD COLUMN IF NOT EXISTS subscription_updated_at timestamptz;

-- Constrain the value set. Installed only when absent so a re-run is a no-op.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'account_activations_subscription_status_check'
  ) THEN
    ALTER TABLE public.account_activations
      ADD CONSTRAINT account_activations_subscription_status_check
      CHECK (subscription_status IN (
        'none','pending','active','past_due','canceled','incomplete','unpaid'
      ));
  END IF;
END $$;

-- Look up the activation from a Stripe event by subscription / customer id.
CREATE INDEX IF NOT EXISTS account_activations_stripe_subscription_idx
  ON public.account_activations (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS account_activations_stripe_customer_idx
  ON public.account_activations (stripe_customer_id);
