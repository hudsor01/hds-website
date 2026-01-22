-- Migration: Enable RLS on all tables with basic policies
-- This establishes the security foundation for the Neon database
--
-- Policy Strategy:
-- 1. All tables have RLS enabled
-- 2. Public content tables (case_studies, testimonials, projects, help_articles) allow public read
-- 3. Admin/internal tables restrict to owner role
-- 4. Write operations require owner role (server-side only)

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================

ALTER TABLE public.calculator_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonial_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ttl_calculations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PUBLIC CONTENT: Read access for everyone
-- ============================================================================

-- Case Studies: Public read for published content
CREATE POLICY "Public read published case studies"
  ON public.case_studies FOR SELECT
  USING (published = true);

-- Testimonials: Public read for published content
CREATE POLICY "Public read published testimonials"
  ON public.testimonials FOR SELECT
  USING (published = true);

-- Projects: Public read for published content
CREATE POLICY "Public read published projects"
  ON public.projects FOR SELECT
  USING (published = true);

-- Help Articles: Public read for published content
CREATE POLICY "Public read published help articles"
  ON public.help_articles FOR SELECT
  USING (published = true);

-- ============================================================================
-- OWNER POLICIES: Full access for database owner (server-side operations)
-- ============================================================================

-- The neondb_owner role has full access to all tables
-- These policies ensure server-side code using the owner credentials works

-- Calculator Leads
CREATE POLICY "Owner full access calculator_leads"
  ON public.calculator_leads FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Lead Attribution
CREATE POLICY "Owner full access lead_attribution"
  ON public.lead_attribution FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Lead Notes
CREATE POLICY "Owner full access lead_notes"
  ON public.lead_notes FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Leads
CREATE POLICY "Owner full access leads"
  ON public.leads FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Case Studies (owner can also read unpublished)
CREATE POLICY "Owner full access case_studies"
  ON public.case_studies FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Testimonials (owner can also read unpublished)
CREATE POLICY "Owner full access testimonials"
  ON public.testimonials FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Testimonial Requests
CREATE POLICY "Owner full access testimonial_requests"
  ON public.testimonial_requests FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Help Articles (owner can also read unpublished)
CREATE POLICY "Owner full access help_articles"
  ON public.help_articles FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Web Vitals
CREATE POLICY "Owner full access web_vitals"
  ON public.web_vitals FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Custom Events
CREATE POLICY "Owner full access custom_events"
  ON public.custom_events FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Page Analytics
CREATE POLICY "Owner full access page_analytics"
  ON public.page_analytics FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Conversion Funnel
CREATE POLICY "Owner full access conversion_funnel"
  ON public.conversion_funnel FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- AB Test Results
CREATE POLICY "Owner full access ab_test_results"
  ON public.ab_test_results FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Scheduled Emails
CREATE POLICY "Owner full access scheduled_emails"
  ON public.scheduled_emails FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Newsletter Subscribers
CREATE POLICY "Owner full access newsletter_subscribers"
  ON public.newsletter_subscribers FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Email Engagement
CREATE POLICY "Owner full access email_engagement"
  ON public.email_engagement FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Projects (owner can also read unpublished)
CREATE POLICY "Owner full access projects"
  ON public.projects FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Error Logs
CREATE POLICY "Owner full access error_logs"
  ON public.error_logs FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Cron Logs
CREATE POLICY "Owner full access cron_logs"
  ON public.cron_logs FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Webhook Logs
CREATE POLICY "Owner full access webhook_logs"
  ON public.webhook_logs FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- API Logs
CREATE POLICY "Owner full access api_logs"
  ON public.api_logs FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- Processing Queue
CREATE POLICY "Owner full access processing_queue"
  ON public.processing_queue FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- TTL Calculations
CREATE POLICY "Owner full access ttl_calculations"
  ON public.ttl_calculations FOR ALL
  TO neondb_owner
  USING (true) WITH CHECK (true);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON POLICY "Public read published case studies" ON public.case_studies
IS 'Allow anonymous read access to published case studies for public website';

COMMENT ON POLICY "Public read published testimonials" ON public.testimonials
IS 'Allow anonymous read access to published testimonials for public website';

COMMENT ON POLICY "Public read published projects" ON public.projects
IS 'Allow anonymous read access to published projects for portfolio pages';

COMMENT ON POLICY "Public read published help articles" ON public.help_articles
IS 'Allow anonymous read access to published help articles for help center';
