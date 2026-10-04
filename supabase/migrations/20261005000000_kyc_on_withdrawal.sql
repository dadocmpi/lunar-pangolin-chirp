-- ============================================================================
-- KYC on withdrawal — schema, private document storage, server-side gate
-- ============================================================================
-- Adds:
--   1. kyc_submissions         — user-submitted identity documents + review state
--   2. withdrawal_requests     — withdrawal requests, created only when KYC approved
--   3. kyc_require_approved()  — SQL predicate the withdrawal function calls
--   4. RPCs: kyc_status_for_user(uuid), withdrawal_kyc_gate(uuid)
--   5. Private storage bucket 'kyc-documents' + owner-only policies
--   6. RLS policies (self-read; no authenticated write — writes go through the
--      service role behind a JWT-verified Edge Function)
--
-- Idempotent. No data is dropped. No policy denies existing reads on other
-- tables. The storage bucket is private: no public URL can ever resolve.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. kyc_submissions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','submitted','approved','rejected')),
  country           text,
  method            text,
  document_type     text,
  document_front_path text,   -- object path inside the private bucket
  document_back_path  text,
  selfie_path       text,
  review_reason     text CHECK (review_reason IS NULL OR length(review_reason) <= 500),
  reviewed_by       text,
  submitted_at      timestamptz,
  reviewed_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kyc_submissions_user_id_idx ON kyc_submissions (user_id);
CREATE INDEX IF NOT EXISTS kyc_submissions_status_idx ON kyc_submissions (status);

-- ---------------------------------------------------------------------------
-- 2. withdrawal_requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id   uuid,
  account_id   text,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  currency     text NOT NULL DEFAULT 'USD',
  method       text,
  destination  text,
  network      text,
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','processing','completed','rejected','canceled')),
  kyc_status_at_request text NOT NULL,  -- proof of the gate decision at request time
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS withdrawal_requests_user_id_idx ON withdrawal_requests (user_id);

-- ---------------------------------------------------------------------------
-- 3. Gate predicate + RPCs
-- ---------------------------------------------------------------------------
-- A user is KYC-approved only when their latest submission (or the profile
-- fallback) is 'approved'. SECURITY DEFINER so the Edge Function reads the
-- real value regardless of the caller's RLS grants. STABLE: no side effects.
CREATE OR REPLACE FUNCTION kyc_require_approved(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (s.status = 'approved')
       FROM kyc_submissions s
      WHERE s.user_id = p_user_id
      ORDER BY s.created_at DESC
      LIMIT 1),
    (SELECT (p.kyc_status = 'approved')
       FROM profiles p
      WHERE p.id = p_user_id),
    false
  );
$$;

CREATE OR REPLACE FUNCTION kyc_status_for_user(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT s.status
       FROM kyc_submissions s
      WHERE s.user_id = p_user_id
      ORDER BY s.created_at DESC
      LIMIT 1),
    (SELECT p.kyc_status
       FROM profiles p
      WHERE p.id = p_user_id),
    'pending'
  );
$$;

-- Convenience view of the gate for a given authenticated user. Still requires
-- an explicit user id argument; callers must pass auth.uid() server-side.
CREATE OR REPLACE FUNCTION withdrawal_kyc_gate(p_user_id uuid)
RETURNS TABLE (approved boolean, status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT kyc_require_approved(p_user_id), kyc_status_for_user(p_user_id);
$$;

REVOKE ALL ON FUNCTION kyc_require_approved(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION kyc_status_for_user(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION withdrawal_kyc_gate(uuid) FROM PUBLIC;
-- Server-side only: the service role (Edge Functions) may call these; no
-- client role can.
GRANT EXECUTE ON FUNCTION kyc_require_approved(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION kyc_status_for_user(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION withdrawal_kyc_gate(uuid) TO service_role;

-- ---------------------------------------------------------------------------
-- 4. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kyc_submissions_self_read ON kyc_submissions;
CREATE POLICY kyc_submissions_self_read ON kyc_submissions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS kyc_submissions_no_insert ON kyc_submissions;
CREATE POLICY kyc_submissions_no_insert ON kyc_submissions FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS kyc_submissions_no_update ON kyc_submissions;
CREATE POLICY kyc_submissions_no_update ON kyc_submissions FOR UPDATE USING (false);
DROP POLICY IF EXISTS kyc_submissions_no_delete ON kyc_submissions;
CREATE POLICY kyc_submissions_no_delete ON kyc_submissions FOR DELETE USING (false);

DROP POLICY IF EXISTS withdrawal_requests_self_read ON withdrawal_requests;
CREATE POLICY withdrawal_requests_self_read ON withdrawal_requests
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS withdrawal_requests_no_insert ON withdrawal_requests;
CREATE POLICY withdrawal_requests_no_insert ON withdrawal_requests FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS withdrawal_requests_no_update ON withdrawal_requests;
CREATE POLICY withdrawal_requests_no_update ON withdrawal_requests FOR UPDATE USING (false);
DROP POLICY IF EXISTS withdrawal_requests_no_delete ON withdrawal_requests;
CREATE POLICY withdrawal_requests_no_delete ON withdrawal_requests FOR DELETE USING (false);

-- ---------------------------------------------------------------------------
-- 5. Private storage bucket + owner-only object policies
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Object paths are '<user_id>/<uuid>.<ext>'. The first path segment must be
-- the caller's own uid, so a user can only touch their own objects.
DROP POLICY IF EXISTS kyc_docs_owner_insert ON storage.objects;
CREATE POLICY kyc_docs_owner_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS kyc_docs_owner_select ON storage.objects;
CREATE POLICY kyc_docs_owner_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS kyc_docs_owner_delete ON storage.objects;
CREATE POLICY kyc_docs_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- No authenticated UPDATE. Reviewers read through the service role only, via
-- short-lived signed URLs minted by kyc-action.
