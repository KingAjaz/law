# Fix "relation already exists" Error

You're getting this error because the database tables already exist, but the migration is trying to create them again.

## Quick Fix Option 1: Just Fix the Trigger (Recommended)

If the tables exist but account creation isn't working, the trigger function is likely missing or broken.

1. Go to Supabase Dashboard → **SQL Editor**
2. Open the file: `scripts/fix-missing-trigger.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **Run**
6. You should see: "✅ Trigger created successfully!"

Then try creating an account again.

## Quick Fix Option 2: Check What's Missing First

1. Go to Supabase Dashboard → **SQL Editor**
2. Open the file: `scripts/check-database-setup.sql`
3. Copy and run it to see what exists
4. Based on the results, use the appropriate fix script

## Full Reset (Only if you have NO important data)

⚠️ **WARNING**: This will DELETE all data! Only use in development.

1. Go to Supabase Dashboard → **SQL Editor**
2. Open the file: `scripts/reset-and-setup.sql`
3. Copy and run it (this drops all tables)
4. Then run the full migration: `supabase/migrations/001_initial_schema.sql`

## Most Likely Solution

Since you're getting "relation already exists", the tables are there but the trigger function might not be working. 

**Try Option 1 first** - just run `scripts/fix-missing-trigger.sql`. This is the safest and should fix the issue without losing any data.

## After Fixing

1. Try creating an account at http://localhost:3000/signup
2. Check if the profile is created in Supabase Dashboard → Table Editor → profiles
3. If it works, you're all set!

## Still Having Issues?

Check:
- Browser console for error messages
- Supabase Dashboard → Logs → Database logs
- Supabase Dashboard → Authentication → Users (see if user was created)
- Supabase Dashboard → Table Editor → profiles (see if profile was created)
