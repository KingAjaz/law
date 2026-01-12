-- Lookup script to find where a UUID appears in the database
-- Usage: Replace '9ca88aaa-c950-4a11-87a4-eff7e27bd7f2' with your target ID

-- Set the ID to search for
\set target_id '9ca88aaa-c950-4a11-87a4-eff7e27bd7f2'

-- Check in profiles table
SELECT 'profiles' as table_name, id, email, full_name, role, kyc_completed, created_at
FROM public.profiles
WHERE id = :'target_id';

-- Check in auth.users (if accessible)
SELECT 'auth.users' as table_name, id, email, created_at
FROM auth.users
WHERE id = :'target_id'::uuid;

-- Check in kyc_data table
SELECT 'kyc_data' as table_name, id, user_id, first_name, last_name, status, created_at
FROM public.kyc_data
WHERE id = :'target_id'::uuid
   OR user_id = :'target_id'::uuid;

-- Check in contracts table
SELECT 'contracts' as table_name, id, user_id, lawyer_id, title, status, payment_status, pricing_tier, created_at
FROM public.contracts
WHERE id = :'target_id'::uuid
   OR user_id = :'target_id'::uuid
   OR lawyer_id = :'target_id'::uuid
   OR payment_id = :'target_id'::uuid;

-- Check in payments table
SELECT 'payments' as table_name, id, user_id, contract_id, amount, status, paystack_reference, created_at
FROM public.payments
WHERE id = :'target_id'::uuid
   OR user_id = :'target_id'::uuid
   OR contract_id = :'target_id'::uuid;

-- Check in pricing_tiers table
SELECT 'pricing_tiers' as table_name, id, tier, name, price, active, created_at
FROM public.pricing_tiers
WHERE id = :'target_id'::uuid;

-- Summary: Check all tables at once
SELECT 
  'Summary' as section,
  'profiles' as table_name,
  COUNT(*) as count
FROM public.profiles WHERE id = :'target_id'::uuid
UNION ALL
SELECT 
  'Summary',
  'kyc_data',
  COUNT(*)
FROM public.kyc_data WHERE id = :'target_id'::uuid OR user_id = :'target_id'::uuid
UNION ALL
SELECT 
  'Summary',
  'contracts',
  COUNT(*)
FROM public.contracts WHERE id = :'target_id'::uuid OR user_id = :'target_id'::uuid OR lawyer_id = :'target_id'::uuid OR payment_id = :'target_id'::uuid
UNION ALL
SELECT 
  'Summary',
  'payments',
  COUNT(*)
FROM public.payments WHERE id = :'target_id'::uuid OR user_id = :'target_id'::uuid OR contract_id = :'target_id'::uuid
UNION ALL
SELECT 
  'Summary',
  'pricing_tiers',
  COUNT(*)
FROM public.pricing_tiers WHERE id = :'target_id'::uuid;
