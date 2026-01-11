-- Diagnostic script to check database setup
-- Run this in Supabase SQL Editor to see what exists

-- Check if profiles table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public')
    THEN '✅ profiles table exists'
    ELSE '❌ profiles table does NOT exist'
  END as profiles_table_status;

-- Check if handle_new_user function exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user' AND routine_schema = 'public')
    THEN '✅ handle_new_user function exists'
    ELSE '❌ handle_new_user function does NOT exist'
  END as function_status;

-- Check if trigger exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created' 
      AND event_object_table = 'users'
      AND event_object_schema = 'auth'
    )
    THEN '✅ on_auth_user_created trigger exists'
    ELSE '❌ on_auth_user_created trigger does NOT exist'
  END as trigger_status;

-- Show trigger details if it exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
