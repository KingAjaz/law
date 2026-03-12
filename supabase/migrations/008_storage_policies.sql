-- Create documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for the documents bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload files to the documents bucket
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (auth.uid() = owner OR owner IS NULL)
);

-- Allow authenticated users to view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (auth.uid() = owner OR owner IS NULL)
);

-- Allow public to view documents (since bucket is public)
CREATE POLICY "Public can view documents"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'documents'
);

-- Allow admins to manage all documents
CREATE POLICY "Admins can manage all documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
