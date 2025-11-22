-- Migration: Create scheduled_emails table
-- This replaces the in-memory email queue with a persistent Supabase table
-- Fixes memory leak and ensures email delivery reliability

CREATE TABLE IF NOT EXISTS public.scheduled_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  sequence_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  variables JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,

  -- Indexes for performance
  CONSTRAINT scheduled_emails_sequence_id_check CHECK (sequence_id IN (
    'standard-welcome',
    'standard-consultation-followup',
    'standard-long-term-nurture',
    'standard-high-intent'
  ))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status
  ON public.scheduled_emails(status);

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_scheduled_for
  ON public.scheduled_emails(scheduled_for)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_recipient
  ON public.scheduled_emails(recipient_email);

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_created_at
  ON public.scheduled_emails(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON public.scheduled_emails
  FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Enable insert for authenticated users" ON public.scheduled_emails
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Enable update for authenticated users" ON public.scheduled_emails
  FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE public.scheduled_emails IS 'Stores scheduled emails for delayed delivery. Replaces in-memory queue for reliability and scalability.';
COMMENT ON COLUMN public.scheduled_emails.sequence_id IS 'Email sequence identifier (e.g., standard-welcome, standard-consultation-followup)';
COMMENT ON COLUMN public.scheduled_emails.scheduled_for IS 'When the email should be sent (UTC timestamp)';
COMMENT ON COLUMN public.scheduled_emails.variables IS 'Template variables for email personalization (JSON object)';
COMMENT ON COLUMN public.scheduled_emails.status IS 'Email status: pending (awaiting send), sent (delivered), failed (error occurred)';
COMMENT ON COLUMN public.scheduled_emails.retry_count IS 'Number of send attempts made';
COMMENT ON COLUMN public.scheduled_emails.max_retries IS 'Maximum retry attempts before marking as failed';
