# Diagnosing "Database Error Saving New User" Issue

This error usually occurs when the database migration hasn't been run or the trigger function isn't working correctly.

## Quick Fix Steps

### Step 1: Check if Migration Was Run

1. Go to your Supabase Dashboard
2. Navigate to **Table Editor**
3. Check if you see a `profiles` table
4. If the table doesn't exist, the migration hasn't been run

### Step 2: Verify the Trigger Function Exists

1. In Supabase Dashboard, go to **Database** → **Functions**
2. Look for a function called `handle_new_user`
3. If it doesn't exist, the migration needs to be run

### Step 3: Run/Re-run the Migration

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Open the file: `supabase/migrations/001_initial_schema.sql`
4. **Copy the ENTIRE file** (all 296 lines)
5. Paste into SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for "Success. No rows returned" message

### Step 4: Verify the Trigger Was Created

Run this query in SQL Editor to check if the trigger exists:

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

You should see one row with the trigger details.

### Step 5: Test Profile Creation Manually (Optional)

To test if the trigger works, you can manually check:

```sql
-- Check if profiles table exists and has the right structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

## Common Issues and Solutions

### Issue 1: Migration Partially Run

**Symptom**: Some tables exist but trigger doesn't work

**Solution**: Re-run the entire migration. The migration uses `CREATE OR REPLACE` so it's safe to run again.

### Issue 2: RLS Policy Blocking

**Symptom**: User is created in `auth.users` but profile isn't created

**Solution**: The trigger function uses `SECURITY DEFINER` which should bypass RLS, but if you still have issues, you might need to add a policy. However, this shouldn't be necessary with SECURITY DEFINER.

### Issue 3: Email Already Exists

**Symptom**: Error about unique constraint violation on email

**Solution**: The user already exists. Check `auth.users` table or try a different email.

## Quick Fix SQL Script

If the trigger isn't working, you can manually create it with this script:

```sql
-- First, ensure the function exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
BEGIN
  -- Extract full_name from metadata
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    NEW.user_metadata->>'full_name',
    NEW.user_metadata->>'name',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    user_full_name,
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = COALESCE(NEW.email, profiles.email),
    full_name = COALESCE(NULLIF(user_full_name, ''), profiles.full_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Still Not Working?

1. Check the browser console for the exact error message
2. Check Supabase Dashboard → Logs → Database logs for detailed errors
3. Verify your `.env.local` has the correct Supabase credentials
4. Make sure you've restarted your dev server after setting environment variables
