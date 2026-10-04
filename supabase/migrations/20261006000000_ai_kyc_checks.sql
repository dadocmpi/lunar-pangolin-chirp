-- ============================================================================
-- AI KYC check audit trail.
--
-- Every AI decision is recorded with the model output, the decision, the
-- provider and the confidence. The row is bound to the authenticated user
-- (user_id) and references the submission it evaluated. Only the service role
-- may read or write it: a user can never see the raw model output, and no
-- client can insert a forged "approved" row.
--
-- The AI never writes the authoritative status directly for approvals that
-- require a human: the decision is stored here and, when auto-approved, the
-- submission status is updated in the same server-side transaction path.
-- ============================================================================

CREATE TABLE IF NOT EXISTS kyc_ai_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES kyc_submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  provider text NOT NULL,
  model text,
  decision text NOT NULL CHECK (decision IN ('approved', 'manual_review', 'rejected')),
  confidence numeric,
  checks jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_output jsonb,
  reason text,
  malformed boolean NOT NULL DEFAULT false,
  provider_unavailable boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kyc_ai_checks_user_idx ON kyc_ai_checks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS kyc_ai_checks_submission_idx ON kyc_ai_checks (submission_id);

ALTER TABLE kyc_ai_checks ENABLE ROW LEVEL SECURITY;

-- No client policy at all: only the service role (Edge Functions) may touch
-- this table. Absence of a permissive policy means authenticated/anonymous
-- roles read and write nothing.
REVOKE ALL ON TABLE kyc_ai_checks FROM anon, authenticated;
