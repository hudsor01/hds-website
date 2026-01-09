-- Migration: Fix RLS policies for scheduled_emails and lead_notes
-- These tables should only be accessible via service_role (backend) not authenticated users

-- ============================================================================
-- scheduled_emails: Restrict to service_role only
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.scheduled_emails;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.scheduled_emails;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.scheduled_emails;

-- Create service_role only policies
CREATE POLICY "Service role can read scheduled_emails"
  ON public.scheduled_emails FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert scheduled_emails"
  ON public.scheduled_emails FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update scheduled_emails"
  ON public.scheduled_emails FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete scheduled_emails"
  ON public.scheduled_emails FOR DELETE
  TO service_role
  USING (true);

-- ============================================================================
-- lead_notes: Restrict to service_role only (admin access via backend)
-- ============================================================================

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Enable all operations for admins" ON public.lead_notes;

-- Create service_role only policies
CREATE POLICY "Service role can read lead_notes"
  ON public.lead_notes FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert lead_notes"
  ON public.lead_notes FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update lead_notes"
  ON public.lead_notes FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete lead_notes"
  ON public.lead_notes FOR DELETE
  TO service_role
  USING (true);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON POLICY "Service role can read scheduled_emails" ON public.scheduled_emails
IS 'Only backend services (cron jobs, APIs) should access scheduled emails';

COMMENT ON POLICY "Service role can read lead_notes" ON public.lead_notes
IS 'Lead notes are admin-only via authenticated API routes using service_role';
