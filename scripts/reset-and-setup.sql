-- WARNING: This script will DROP all tables and recreate them
-- Only use this if you're in development and don't have important data
-- Run this in Supabase SQL Editor

-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.contracts CASCADE;
DROP TABLE IF EXISTS public.kyc_data CASCADE;
DROP TABLE IF EXISTS public.pricing_tiers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;

-- Now run the full migration
-- Copy and paste the ENTIRE contents of supabase/migrations/001_initial_schema.sql here
-- OR run it separately after this script completes

-- Note: After dropping, you MUST run 001_initial_schema.sql to recreate everything
