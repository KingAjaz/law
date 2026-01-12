-- Simple Storage RLS Policy Fix for KYC Uploads
-- This is a simpler version that allows all authenticated users to upload to kyc-documents/
-- Use this if you want to test quickly, then use fix-storage-rls-kyc.sql for production

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own KYC documents" ON storage.objects;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload files to kyc-documents/ folder
-- This is a simpler policy - allows any authenticated user to upload to kyc-documents/
CREATE POLICY "Users can upload KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND name LIKE 'kyc-documents/%'
);

-- Allow authenticated users to read files from kyc-documents/ folder
-- For now, allowing all authenticated users to read (you can make this more restrictive later)
CREATE POLICY "Users can read KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND name LIKE 'kyc-documents/%'
);
