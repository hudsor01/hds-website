-- Migration: Production schema fixes
-- DI-01: Add indexes for query performance
-- DI-02: Fix email_engagement.ip_address from text to inet
-- DI-03: Drop unused testimonials.project_id orphan column
-- DI-05: Add FK constraints to lead_attribution and lead_notes
-- DI-07: Fix scheduled_emails.max_retries nullable

-- ============================================================================
-- DI-07: Fix max_retries NOT NULL
-- Must backfill NULLs before adding NOT NULL constraint
-- ============================================================================

UPDATE public.scheduled_emails
  SET max_retries = 3
  WHERE max_retries IS NULL;

ALTER TABLE public.scheduled_emails
  ALTER COLUMN max_retries SET NOT NULL;

-- ============================================================================
-- DI-02: Fix email_engagement.ip_address from text to inet
-- USING cast is required for production-safe type change
-- ============================================================================

ALTER TABLE public.email_engagement
  ALTER COLUMN ip_address TYPE inet USING ip_address::inet;

-- ============================================================================
-- DI-03: Drop unused orphan column testimonials.project_id
-- Verified: submitTestimonial never sets projectId
-- ============================================================================

ALTER TABLE public.testimonials
  DROP COLUMN IF EXISTS project_id;

-- ============================================================================
-- DI-05: Add FK constraints to lead_attribution and lead_notes
-- ============================================================================

ALTER TABLE public.lead_attribution
  ADD CONSTRAINT lead_attribution_lead_id_fk
  FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

ALTER TABLE public.lead_notes
  ADD CONSTRAINT lead_notes_lead_id_fk
  FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

-- ============================================================================
-- DI-01: Add indexes for query performance
-- ============================================================================

-- scheduled_emails: compound index on (status, scheduled_for) for pending job queries
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_pending
  ON public.scheduled_emails (status, scheduled_for);

-- scheduled_emails: index on recipient_email for recipient lookups
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_recipient
  ON public.scheduled_emails (recipient_email);

-- newsletter_subscribers: index on status for filtering active/unsubscribed
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status
  ON public.newsletter_subscribers (status);

-- blog_posts: compound index on (published, published_at) for public feed queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_published
  ON public.blog_posts (published, published_at);

-- blog_posts: index on author_id for author page queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id
  ON public.blog_posts (author_id);

-- testimonials: compound index on (published, featured) for public display queries
CREATE INDEX IF NOT EXISTS idx_testimonials_published
  ON public.testimonials (published, featured);

-- web_vitals: index on timestamp for time-range analytics queries
CREATE INDEX IF NOT EXISTS idx_web_vitals_timestamp
  ON public.web_vitals (timestamp);

-- calculator_leads: index on email for lead deduplication lookups
CREATE INDEX IF NOT EXISTS idx_calculator_leads_email
  ON public.calculator_leads (email);

-- ttl_calculations: index on created_at for TTL expiry queries
CREATE INDEX IF NOT EXISTS idx_ttl_calculations_created_at
  ON public.ttl_calculations (created_at);
