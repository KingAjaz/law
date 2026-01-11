-- Check if users exist in auth.users table
-- This shows all authenticated users

SELECT id, email, created_at, email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC;
