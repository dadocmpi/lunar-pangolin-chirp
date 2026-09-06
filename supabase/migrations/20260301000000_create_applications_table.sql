-- ============================================================================
-- Applications table for pre-registration data
-- ============================================================================
-- This table stores the customer's application information before payment.
-- After payment confirmation, the application is linked to a payment record
-- and awaits manual activation by an operator.

-- Create the applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    plan_key TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    residential_address_line1 TEXT,
    residential_address_line2 TEXT,
    city TEXT,
    region TEXT,
    postal_code TEXT,
    country TEXT NOT NULL,
    phone TEXT,
    payment_status payment_status, -- Reuses the payment_status ENUM from payments table
    activation_status TEXT NOT NULL DEFAULT 'pending', -- pending, activation_pending, account_active, rejected, manual_review
    activated_by UUID REFERENCES auth.users(id),
    activated_at TIMESTAMPTZ,
    terms_accepted_at TIMESTAMPTZ NOT NULL,
    terms_version TEXT NOT NULL,
    privacy_accepted_at TIMESTAMPTZ NOT NULL,
    privacy_version TEXT NOT NULL,
    customer_note TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add check constraint for activation_status
ALTER TABLE applications
    ADD CONSTRAINT applications_activation_status_check
    CHECK (activation_status IN ('pending', 'activation_pending', 'account_active', 'rejected', 'manual_review'));

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications(user_id);
CREATE INDEX IF NOT EXISTS applications_plan_key_idx ON applications(plan_key);
CREATE INDEX IF NOT EXISTS applications_activation_status_idx ON applications(activation_status);
CREATE INDEX IF NOT EXISTS applications_payment_status_idx ON applications(payment_status);

-- Alter payment_audit_log to allow 'applications' in payment_table check constraint
-- Note: This assumes the payment_audit_log table already exists from the payment foundation migration.
-- We are altering the check constraint to include 'applications' as a valid payment_table.
DO $$
BEGIN
    -- Check if the constraint exists and alter it to include 'applications'
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'payment_audit_log_payment_table_check'
          AND table_name = 'payment_audit_log'
    ) THEN
        ALTER TABLE payment_audit_log
            DROP CONSTRAINT payment_audit_log_payment_table_check,
            ADD CONSTRAINT payment_audit_log_payment_table_check
            CHECK (payment_table IN ('pending_payments', 'applications'));
    END IF;
END $$;