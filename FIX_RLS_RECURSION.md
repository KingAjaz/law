# Fix "Infinite Recursion Detected in Policy" Error

This error occurs when RLS policies on the `profiles` table query the `profiles` table itself to check admin role, causing infinite recursion.

## Quick Fix

Run this SQL script in Supabase Dashboard → SQL Editor:

1. Go to Supabase Dashboard → **SQL Editor**
2. Open the file: `scripts/fix-rls-recursion.sql`
3. Copy the **entire contents** of the file
4. Paste into SQL Editor
5. Click **Run**

This will:
- Create helper functions (`is_admin()` and `is_lawyer()`) that bypass RLS using `SECURITY DEFINER`
- Replace all recursive policies with non-recursive versions using these functions

## Why This Happens

The problem is in policies like this:
```sql
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles  -- ❌ This queries profiles again!
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

When checking if a user can view profiles, it queries profiles, which triggers the same policy check, which queries profiles again... infinite loop!

## The Solution

We create helper functions with `SECURITY DEFINER` that bypass RLS:

```sql
CREATE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

Then policies use this function instead:
```sql
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));  -- ✅ No recursion!
```

## After Running the Fix

1. Test that users can still view their own profiles
2. Test that admins can view all profiles
3. The error should be resolved
