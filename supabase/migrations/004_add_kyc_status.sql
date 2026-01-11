-- Add status column to KYC data table for admin verification workflow
-- Note: This migration should be run after 001_initial_schema.sql

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'kyc_data'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.kyc_data
    ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
    
    -- Update existing KYC records - if kyc_completed is true in profiles, mark as approved
    UPDATE public.kyc_data
    SET status = 'approved'
    WHERE EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = kyc_data.user_id
      AND profiles.kyc_completed = TRUE
    );
    
    -- For remaining records, keep as pending
    UPDATE public.kyc_data
    SET status = 'pending'
    WHERE status IS NULL;
  ELSE
    RAISE NOTICE 'Column status already exists in kyc_data table';
  END IF;
END $$;

-- Add reviewed_by and reviewed_at columns for tracking admin reviews
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'kyc_data'
    AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE public.kyc_data
    ADD COLUMN reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
  ELSE
    RAISE NOTICE 'Column reviewed_by already exists in kyc_data table';
  END IF;
END $$;

-- Add rejection_reason column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'kyc_data'
    AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE public.kyc_data
    ADD COLUMN rejection_reason TEXT;
  ELSE
    RAISE NOTICE 'Column rejection_reason already exists in kyc_data table';
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_kyc_data_status ON public.kyc_data(status);
CREATE INDEX IF NOT EXISTS idx_kyc_data_created_at ON public.kyc_data(created_at DESC);
