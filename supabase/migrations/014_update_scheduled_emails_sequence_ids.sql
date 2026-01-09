-- Migration: Update scheduled_emails sequence_id constraint
-- Adds all email sequence IDs for calculator and contact form sequences

-- Drop the existing constraint
ALTER TABLE public.scheduled_emails
DROP CONSTRAINT IF EXISTS scheduled_emails_sequence_id_check;

-- Add the updated constraint with all valid sequence IDs
ALTER TABLE public.scheduled_emails
ADD CONSTRAINT scheduled_emails_sequence_id_check CHECK (sequence_id IN (
  'standard-welcome',
  'standard-consultation-followup',
  'standard-long-term-nurture',
  'standard-high-intent',
  'calculator-hot-lead',
  'calculator-follow-up',
  'high-value-consultation',
  'targeted-service-consultation',
  'enterprise-nurture'
));

COMMENT ON CONSTRAINT scheduled_emails_sequence_id_check ON public.scheduled_emails
IS 'Validates email sequence identifiers to match application schema';
