# Storage RLS Policy Setup via Supabase Dashboard

## Problem
You're getting "must be owner of table objects" error when trying to run SQL scripts for storage RLS policies. This is because storage policies need to be created through the Supabase Dashboard UI, not SQL.

## Solution: Create Policies via Dashboard

### Step 1: Go to Storage Policies
1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click on **Storage** in the left sidebar
4. Click on the **`documents`** bucket (the one you created)
5. Click on the **Policies** tab

### Step 2: Create Upload Policy for KYC Documents

1. Click **"New Policy"** or **"Add Policy"**
2. Select **"Create a policy from scratch"** (or similar option)
3. Configure the policy:

   **Policy Name:** `Users can upload KYC documents`
   
   **Allowed Operation:** `INSERT`
   
   **Target Roles:** `authenticated`
   
   **Policy Definition (USING expression):** Leave empty (not needed for INSERT)
   
   **Policy Definition (WITH CHECK expression):**
   ```sql
   bucket_id = 'documents' AND name LIKE 'kyc-documents/%'
   ```

4. Click **"Review"** or **"Save"**

### Step 3: Create Read Policy for KYC Documents

1. Click **"New Policy"** again
2. Select **"Create a policy from scratch"**
3. Configure the policy:

   **Policy Name:** `Users can read KYC documents`
   
   **Allowed Operation:** `SELECT`
   
   **Target Roles:** `authenticated`
   
   **Policy Definition (USING expression):**
   ```sql
   bucket_id = 'documents' AND name LIKE 'kyc-documents/%'
   ```
   
   **Policy Definition (WITH CHECK expression):** Leave empty (not needed for SELECT)

4. Click **"Review"** or **"Save"**

### Step 4: Test It
After creating the policies:
1. Go back to your KYC page
2. Try uploading an ID document again
3. It should work now!

## Alternative: Use Supabase CLI (Advanced)

If you have Supabase CLI set up with proper permissions, you can use the service role key to run the SQL scripts. However, for most users, the Dashboard UI method above is simpler and safer.

## Notes

- The policies created via Dashboard are the same as the SQL scripts, just created through the UI
- These policies allow any authenticated user to upload/read files in the `kyc-documents/` folder
- For production, you may want more restrictive policies (checking user IDs in filenames), but this simple version works for testing
