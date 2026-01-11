-- Make user an admin
-- Replace the email with your actual email

UPDATE profiles 
SET role = 'admin' 
WHERE email = 'ajalaayodeji125@gmail.com';

-- Verify the update (optional - to check if it worked)
SELECT id, email, role, full_name 
FROM profiles 
WHERE email = 'ajalaayodeji125@gmail.com';
