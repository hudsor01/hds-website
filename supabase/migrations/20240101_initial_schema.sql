-- Create contact submissions table
CREATE TABLE public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    meta_data JSONB
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous insert" ON public.contact_submissions
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON public.contact_submissions
FOR ALL TO service_role
USING (true);

-- Add indexes
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at);
CREATE INDEX idx_contact_submissions_email ON public.contact_submissions(email);