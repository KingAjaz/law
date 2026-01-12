-- Add INSERT policy for profiles to allow users to create their own profile
-- This fixes the RLS violation when creating profiles
-- Run this in Supabase SQL Editor if migration doesn't work

-- Drop policy if it exists (for re-running)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create the policy
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
