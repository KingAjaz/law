-- List all users in the profiles table
-- This will help you find your user ID and email

SELECT id, email, role, full_name, created_at
FROM profiles 
ORDER BY created_at DESC;
