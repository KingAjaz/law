# Supabase Storage Setup

To enable file uploads, you need to create a storage bucket in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new bucket named `documents`
4. Set it to **Public** (or configure RLS policies as needed)
5. Add the following RLS policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow lawyers to read assigned contract files
CREATE POLICY "Lawyers can read assigned contracts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM contracts
    WHERE lawyer_id = auth.uid()
    AND (original_file_url LIKE '%' || name OR reviewed_file_url LIKE '%' || name)
  )
);

-- Allow admins to read all files
CREATE POLICY "Admins can read all files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Folder Structure

The storage bucket should have the following folder structure:
- `contracts/` - Original contract uploads
- `reviewed-contracts/` - Reviewed documents uploaded by lawyers
- `kyc-documents/` - KYC verification documents
