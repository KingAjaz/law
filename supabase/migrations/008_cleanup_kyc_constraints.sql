-- Migration to clean up obsolete KYC constraints
-- Since the "KYC Form" is now just a "Client Information Form", we no longer require strict ID verification or contact numbers

-- 1. Remove the CHECK constraint on id_type
ALTER TABLE public.kyc_data DROP CONSTRAINT IF EXISTS kyc_data_id_type_check;

-- 2. Make previously required fields nullable
ALTER TABLE public.kyc_data 
  ALTER COLUMN phone_number DROP NOT NULL,
  ALTER COLUMN address DROP NOT NULL,
  ALTER COLUMN id_type DROP NOT NULL,
  ALTER COLUMN id_number DROP NOT NULL,
  ALTER COLUMN id_document_url DROP NOT NULL;

-- 3. Also make last_name nullable as we only collect "Company Name / Full Name" now in first_name
ALTER TABLE public.kyc_data
  ALTER COLUMN last_name DROP NOT NULL;
