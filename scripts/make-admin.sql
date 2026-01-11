-- Script to make a user an admin
-- Replace 'your-email@example.com' with the actual email of the user you want to make admin
-- Run this in Supabase SQL Editor

UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, role, full_name 
FROM profiles 
WHERE email = 'your-email@example.com';
