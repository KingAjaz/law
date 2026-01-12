# Storage Bucket Setup - Quick Fix

## Problem
If you see "bucket not available" when uploading files (KYC documents, contracts, etc.), you need to create the storage bucket in Supabase.

## Solution: Create the Storage Bucket

### Step 1: Create the Bucket
1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click on **Storage** in the left sidebar
4. Click the **"New bucket"** button (or **"Create bucket"**)
5. Enter the bucket name: **`documents`** (must be exactly this name)
6. Set the bucket to **Public** (toggle the "Public bucket" switch to ON)
   - This allows file access via public URLs
   - You can configure RLS policies later for more security
7. Click **"Create bucket"**

### Step 2: Configure RLS Policies (Required!)

After creating the bucket, you **must** add Row Level Security (RLS) policies or uploads will fail with "new row violates row-level security policy".

**⚠️ Important:** Storage RLS policies cannot be created via SQL in the dashboard (you'll get a "must be owner of table objects" error). You need to create them through the Supabase Dashboard UI.

**Follow the guide in `STORAGE_RLS_SETUP_DASHBOARD.md` for step-by-step instructions on creating policies via the Dashboard UI.**

**Quick Summary:**
1. Go to **Storage** → Click on **`documents`** bucket → **Policies** tab
2. Create a policy for **INSERT** operations:
   - Name: `Users can upload KYC documents`
   - Operation: `INSERT`
   - Role: `authenticated`
   - WITH CHECK: `bucket_id = 'documents' AND name LIKE 'kyc-documents/%'`
3. Create a policy for **SELECT** operations:
   - Name: `Users can read KYC documents`
   - Operation: `SELECT`
   - Role: `authenticated`
   - USING: `bucket_id = 'documents' AND name LIKE 'kyc-documents/%'`

## Test It
After creating the bucket:
1. Go back to your KYC page
2. Try uploading an ID document again
3. It should work now!

## Folder Structure
The bucket will automatically create these folders as files are uploaded:
- `kyc-documents/` - KYC verification documents (user IDs, passports, etc.)
- `contracts/` - Original contract uploads
- `reviewed-contracts/` - Reviewed documents uploaded by lawyers
