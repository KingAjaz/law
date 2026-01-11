-- Migration: Allow payment before file upload
-- This allows users to pay first, then upload their contract file

-- Make original_file_url nullable (contract can be created without file initially)
-- Note: If column already allows NULL, this won't error
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' 
    AND column_name = 'original_file_url' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.contracts 
      ALTER COLUMN original_file_url DROP NOT NULL;
  END IF;
END $$;

-- Add new status: awaiting_upload (after payment, before file upload)
-- Update status check constraint
ALTER TABLE public.contracts 
  DROP CONSTRAINT IF EXISTS contracts_status_check;

ALTER TABLE public.contracts 
  ADD CONSTRAINT contracts_status_check CHECK (
    status IN (
      'awaiting_payment',
      'awaiting_upload',      -- NEW: Payment confirmed, waiting for file upload
      'payment_confirmed',    -- File uploaded, payment confirmed
      'assigned_to_lawyer',
      'under_review',
      'completed'
    )
  );

-- Update CONTRACT_STATUS_LABELS would need to be updated in constants.ts too
-- But that's a TypeScript file, not a migration
