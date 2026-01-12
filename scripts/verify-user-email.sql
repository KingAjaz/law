-- Script to manually verify a user's email (DEVELOPMENT ONLY)
-- Usage: Replace 'user@example.com' with the actual email address

-- Verify email for a specific user
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com'
  AND email_confirmed_at IS NULL;

-- Verify all unverified users (USE WITH CAUTION - DEVELOPMENT ONLY)
-- Uncomment the line below to verify all users at once
-- UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()) WHERE email_confirmed_at IS NULL;

-- Check verification status for all users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Verified'
    ELSE 'Not Verified'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- Check verification status for specific user
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Verified'
    ELSE 'Not Verified'
  END as status
FROM auth.users
WHERE email = 'user@example.com';
