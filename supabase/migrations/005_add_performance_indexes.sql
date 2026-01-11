-- Performance optimization indexes
-- This migration adds composite and additional indexes for common query patterns

-- Contracts table indexes
-- Composite index for user dashboard: filtering by user_id and ordering by created_at
CREATE INDEX IF NOT EXISTS idx_contracts_user_id_created_at_desc 
  ON public.contracts(user_id, created_at DESC);

-- Composite index for lawyer dashboard: filtering by lawyer_id and ordering by created_at
CREATE INDEX IF NOT EXISTS idx_contracts_lawyer_id_created_at_desc 
  ON public.contracts(lawyer_id, created_at DESC)
  WHERE lawyer_id IS NOT NULL;

-- Composite index for admin filtering by status and ordering
CREATE INDEX IF NOT EXISTS idx_contracts_status_created_at_desc 
  ON public.contracts(status, created_at DESC);

-- Index for payment_status filtering (used in admin dashboard)
CREATE INDEX IF NOT EXISTS idx_contracts_payment_status 
  ON public.contracts(payment_status);

-- Composite index for admin filtering by payment_status and ordering
CREATE INDEX IF NOT EXISTS idx_contracts_payment_status_created_at_desc 
  ON public.contracts(payment_status, created_at DESC);

-- Composite index for common admin queries: status + payment_status + ordering
CREATE INDEX IF NOT EXISTS idx_contracts_status_payment_status_created_at_desc 
  ON public.contracts(status, payment_status, created_at DESC);

-- Index for pricing_tier filtering (if frequently used in queries)
CREATE INDEX IF NOT EXISTS idx_contracts_pricing_tier 
  ON public.contracts(pricing_tier);

-- Index for created_at ordering (general purpose)
CREATE INDEX IF NOT EXISTS idx_contracts_created_at_desc 
  ON public.contracts(created_at DESC);

-- Profiles table indexes
-- Composite index for admin listing users/lawyers by role and ordering
CREATE INDEX IF NOT EXISTS idx_profiles_role_created_at_desc 
  ON public.profiles(role, created_at DESC);

-- Composite index for kyc_completed filtering with role (admin queries)
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_completed_role 
  ON public.profiles(kyc_completed, role);

-- Index for email lookups (already has UNIQUE constraint, but explicit index helps)
CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON public.profiles(email);

-- KYC Data table indexes
-- Composite index for admin KYC listing: filtering by status and ordering
CREATE INDEX IF NOT EXISTS idx_kyc_data_status_created_at_desc 
  ON public.kyc_data(status, created_at DESC);

-- Index for reviewed_by (for tracking admin reviews)
CREATE INDEX IF NOT EXISTS idx_kyc_data_reviewed_by 
  ON public.kyc_data(reviewed_by)
  WHERE reviewed_by IS NOT NULL;

-- Payments table indexes
-- Composite index for user payment history: filtering by user_id and ordering
CREATE INDEX IF NOT EXISTS idx_payments_user_id_created_at_desc 
  ON public.payments(user_id, created_at DESC);

-- Composite index for contract payment history: filtering by contract_id and ordering
CREATE INDEX IF NOT EXISTS idx_payments_contract_id_created_at_desc 
  ON public.payments(contract_id, created_at DESC);

-- Index for payment status filtering
CREATE INDEX IF NOT EXISTS idx_payments_status 
  ON public.payments(status);

-- Composite index for status filtering with ordering
CREATE INDEX IF NOT EXISTS idx_payments_status_created_at_desc 
  ON public.payments(status, created_at DESC);

-- Contact Messages table indexes
-- Composite index for unread messages: filtering by read status and ordering
CREATE INDEX IF NOT EXISTS idx_contact_messages_read_created_at_desc 
  ON public.contact_messages(read, created_at DESC);

-- Index for email lookups (for admin searching contact messages)
CREATE INDEX IF NOT EXISTS idx_contact_messages_email 
  ON public.contact_messages(email);

-- Note: paystack_reference already has UNIQUE constraint which creates an index
-- Note: Primary keys automatically create indexes, so id columns are already indexed
