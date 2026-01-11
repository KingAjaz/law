-- Fix infinite recursion in RLS policies
-- This script creates a helper function that can check admin role without recursion
-- Run this in Supabase SQL Editor

-- Create a helper function to check if user is admin (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a helper function to check if user is lawyer
CREATE OR REPLACE FUNCTION public.is_lawyer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id AND role = 'lawyer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all KYC data" ON public.kyc_data;
DROP POLICY IF EXISTS "Admins can view all contracts" ON public.contracts;
DROP POLICY IF EXISTS "Admins can update all contracts" ON public.contracts;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all pricing tiers" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Admins can update pricing tiers" ON public.pricing_tiers;

-- Recreate policies using the helper function (no recursion)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all KYC data"
  ON public.kyc_data FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all contracts"
  ON public.contracts FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all contracts"
  ON public.contracts FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all pricing tiers"
  ON public.pricing_tiers FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update pricing tiers"
  ON public.pricing_tiers FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Verify functions were created
SELECT 
  '✅ Functions created successfully!' as status,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name IN ('is_admin', 'is_lawyer');
