-- Fix Storage RLS Policies for KYC Uploads
-- This script creates/updates RLS policies to allow KYC document uploads

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can read contracts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all files" ON storage.objects;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload files to kyc-documents/ folder
-- File path format: kyc-documents/{user_id}-{timestamp}.{ext}
CREATE POLICY "Users can upload KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND name LIKE 'kyc-documents/%'
  AND storage.filename(name) LIKE auth.uid()::text || '-%'
);

-- Allow authenticated users to read files from kyc-documents/ folder
CREATE POLICY "Users can read their own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND name LIKE 'kyc-documents/%'
  AND storage.filename(name) LIKE auth.uid()::text || '-%'
);

-- Allow authenticated users to upload contract files
CREATE POLICY "Users can upload contracts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (name LIKE 'contracts/%' OR name LIKE 'reviewed-contracts/%')
);

-- Allow authenticated users to read contract files
CREATE POLICY "Users can read contracts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (
    name LIKE 'contracts/%' 
    OR name LIKE 'reviewed-contracts/%'
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
