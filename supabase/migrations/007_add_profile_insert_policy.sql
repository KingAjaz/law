-- Add INSERT policy for profiles to allow users to create their own profile
-- This fixes the RLS violation when creating profiles

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
