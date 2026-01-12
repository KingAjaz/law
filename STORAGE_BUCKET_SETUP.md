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

### Step 2: Configure RLS Policies (Optional but Recommended)

After creating the bucket, you can add Row Level Security (RLS) policies for better security. Go to **Storage > Policies** and add the policies from `supabase/storage-setup.md`, or run this SQL in the SQL Editor:

```sql
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload KYC documents
CREATE POLICY "Users can upload KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND name LIKE 'kyc-documents/%'
  AND (storage.foldername(name))[2] LIKE auth.uid()::text || '-%'
);

-- Allow users to read their own KYC documents
CREATE POLICY "Users can read their own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND name LIKE 'kyc-documents/%'
  AND (storage.foldername(name))[2] LIKE auth.uid()::text || '-%'
);

-- Allow users to upload contract files
CREATE POLICY "Users can upload contracts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (name LIKE 'contracts/%' OR name LIKE 'reviewed-contracts/%')
);

-- Allow users to read contract files
CREATE POLICY "Users can read contracts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (
    name LIKE 'contracts/%' 
    OR name LIKE 'reviewed-contracts/%'
    OR name LIKE 'kyc-documents/%'
  )
);

-- Allow admins to read all files
CREATE POLICY "Admins can read all files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**Note:** For a quick fix, you can skip the RLS policies and just make the bucket public. You can add security policies later.

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
