-- Ensure the update_updated_at_column function exists (in case migration 001 wasn't run)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Contact Messages table
CREATE TABLE public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index for better query performance
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_read ON public.contact_messages(read);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact messages (public contact form)
CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to view contact messages
-- Note: After running migration 001_initial_schema.sql, you may want to update this
-- to only allow admins by dropping and recreating with admin check
CREATE POLICY "Authenticated users can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to update contact messages
-- Note: After running migration 001_initial_schema.sql, you may want to update this
-- to only allow admins by dropping and recreating with admin check
CREATE POLICY "Authenticated users can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (auth.uid() IS NOT NULL);
