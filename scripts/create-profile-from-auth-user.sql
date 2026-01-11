-- Create profile for an existing auth user
-- Replace 'user-email@example.com' with the actual email from auth.users
-- First, check auth.users to get the correct email, then use it here

-- Get the user ID from auth.users
DO $$
DECLARE
  user_id_var UUID;
  user_email_var TEXT;
BEGIN
  -- Get user ID and email (replace with your email)
  SELECT id, email INTO user_id_var, user_email_var
  FROM auth.users
  WHERE email = 'your-email@example.com'
  LIMIT 1;

  IF user_id_var IS NOT NULL THEN
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      user_id_var,
      user_email_var,
      COALESCE((SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = user_id_var), 
               split_part(user_email_var, '@', 1)),
      'user'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = user_email_var,
      updated_at = NOW();
    
    RAISE NOTICE 'Profile created/updated for user: %', user_email_var;
  ELSE
    RAISE NOTICE 'User not found in auth.users';
  END IF;
END $$;

-- Verify the profile was created
SELECT id, email, role, full_name 
FROM profiles 
WHERE email = 'your-email@example.com';
