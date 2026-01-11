-- Create profiles for all existing auth.users that don't have profiles
-- This will create profiles for users that were created before the trigger was set up

INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  au.id,
  COALESCE(au.email, ''),
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    au.raw_user_meta_data->>'display_name',
    split_part(COALESCE(au.email, ''), '@', 1)
  ) as full_name,
  'user' as role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify profiles were created
SELECT id, email, role, full_name, created_at
FROM profiles 
ORDER BY created_at DESC;
