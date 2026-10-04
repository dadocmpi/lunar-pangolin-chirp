-- ============================================================================
-- Withdrawal manual-review threshold.
--
-- An approved withdrawal whose amount reaches KYC_MANUAL_REVIEW_THRESHOLD_CENTS
-- is stored with status 'manual_review' instead of 'pending' so an operator
-- must release it. This migration widens the status check and records the flag
-- explicitly. Safe to run on an environment where the table already exists.
-- ============================================================================

ALTER TABLE withdrawal_requests
  DROP CONSTRAINT IF EXISTS withdrawal_requests_status_check;

ALTER TABLE withdrawal_requests
  ADD CONSTRAINT withdrawal_requests_status_check
  CHECK (status IN ('pending','manual_review','processing','completed','rejected','canceled'));

ALTER TABLE withdrawal_requests
  ADD COLUMN IF NOT EXISTS manual_review boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS withdrawal_requests_manual_review_idx
  ON withdrawal_requests (manual_review) WHERE manual_review;
