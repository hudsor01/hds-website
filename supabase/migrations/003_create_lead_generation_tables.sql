-- Migration: Create lead generation and analytics tables
-- This adds support for calculators, enhanced email tracking, lead attribution,
-- FAQ interactions, and location-based SEO

-- ============================================================================
-- TABLE: calculator_leads
-- Stores lead information from interactive calculators (ROI, Cost Estimator, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.calculator_leads (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Lead information
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  phone TEXT,

  -- Calculator details
  calculator_type TEXT NOT NULL CHECK (calculator_type IN (
    'roi-calculator',
    'cost-estimator',
    'performance-calculator',
    'custom-calculator'
  )),

  -- Calculation data (stored as JSONB for flexibility)
  inputs JSONB NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '{}',

  -- Lead scoring and qualification
  lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
  lead_quality TEXT CHECK (lead_quality IN ('hot', 'warm', 'cold')),

  -- Tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer TEXT,
  landing_page TEXT,
  ip_address INET,
  user_agent TEXT,

  -- Follow-up tracking
  contacted BOOLEAN NOT NULL DEFAULT false,
  contacted_at TIMESTAMP WITH TIME ZONE,
  converted BOOLEAN NOT NULL DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  conversion_value NUMERIC(10, 2),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calculator_leads_email
  ON public.calculator_leads(email);

CREATE INDEX IF NOT EXISTS idx_calculator_leads_type
  ON public.calculator_leads(calculator_type);

CREATE INDEX IF NOT EXISTS idx_calculator_leads_created
  ON public.calculator_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_calculator_leads_score
  ON public.calculator_leads(lead_score DESC)
  WHERE lead_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calculator_leads_quality
  ON public.calculator_leads(lead_quality)
  WHERE lead_quality IN ('hot', 'warm');

CREATE INDEX IF NOT EXISTS idx_calculator_leads_utm_source
  ON public.calculator_leads(utm_source)
  WHERE utm_source IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.calculator_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to read calculator leads"
  ON public.calculator_leads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public insert for calculator leads"
  ON public.calculator_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE public.calculator_leads IS 'Stores leads captured from interactive calculators with full attribution data';
COMMENT ON COLUMN public.calculator_leads.calculator_type IS 'Type of calculator used (roi-calculator, cost-estimator, performance-calculator)';
COMMENT ON COLUMN public.calculator_leads.inputs IS 'User inputs to the calculator as JSON object';
COMMENT ON COLUMN public.calculator_leads.results IS 'Calculator results as JSON object';
COMMENT ON COLUMN public.calculator_leads.lead_score IS 'Calculated lead score from 0-100 based on inputs and behavior';


-- ============================================================================
-- TABLE: email_engagement
-- Tracks email opens, clicks, bounces, and unsubscribes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.email_engagement (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Email identification
  email TEXT NOT NULL,
  sequence_id TEXT NOT NULL,
  step_id TEXT,
  message_id TEXT, -- Resend message ID for correlation

  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'sent',
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'complained',
    'unsubscribed'
  )),

  -- Event metadata
  event_data JSONB DEFAULT '{}',
  link_url TEXT, -- For click events
  user_agent TEXT,
  ip_address INET,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_engagement_email
  ON public.email_engagement(email);

CREATE INDEX IF NOT EXISTS idx_email_engagement_sequence
  ON public.email_engagement(sequence_id);

CREATE INDEX IF NOT EXISTS idx_email_engagement_type
  ON public.email_engagement(event_type);

CREATE INDEX IF NOT EXISTS idx_email_engagement_created
  ON public.email_engagement(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_engagement_message
  ON public.email_engagement(message_id)
  WHERE message_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.email_engagement ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to read email engagement"
  ON public.email_engagement
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to insert email engagement"
  ON public.email_engagement
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE public.email_engagement IS 'Tracks all email engagement events (opens, clicks, bounces, etc.)';
COMMENT ON COLUMN public.email_engagement.event_type IS 'Type of event: sent, delivered, opened, clicked, bounced, complained, unsubscribed';
COMMENT ON COLUMN public.email_engagement.link_url IS 'URL that was clicked (only for click events)';


-- ============================================================================
-- TABLE: lead_attribution
-- Tracks lead source attribution and marketing campaign performance
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lead_attribution (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Lead correlation
  lead_id UUID, -- Can reference calculator_leads or other lead sources
  email TEXT NOT NULL,

  -- Attribution data
  source TEXT, -- organic, paid, referral, direct, social, email
  medium TEXT,
  campaign TEXT,
  term TEXT,
  content TEXT,

  -- Full UTM parameters (for reporting)
  utm_params JSONB DEFAULT '{}',

  -- Page information
  referrer TEXT,
  landing_page TEXT NOT NULL,
  current_page TEXT,

  -- Session information
  session_id TEXT,
  visit_count INTEGER DEFAULT 1,

  -- Device/browser info
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  os TEXT,

  -- Conversion tracking
  converted BOOLEAN NOT NULL DEFAULT false,
  conversion_type TEXT,
  conversion_value NUMERIC(10, 2),
  time_to_conversion INTERVAL,

  -- Timestamps
  first_visit_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_visit_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_attribution_email
  ON public.lead_attribution(email);

CREATE INDEX IF NOT EXISTS idx_lead_attribution_source
  ON public.lead_attribution(source);

CREATE INDEX IF NOT EXISTS idx_lead_attribution_campaign
  ON public.lead_attribution(campaign)
  WHERE campaign IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lead_attribution_converted
  ON public.lead_attribution(converted, converted_at DESC)
  WHERE converted = true;

CREATE INDEX IF NOT EXISTS idx_lead_attribution_first_visit
  ON public.lead_attribution(first_visit_at DESC);

-- Enable Row Level Security
ALTER TABLE public.lead_attribution ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to read attribution"
  ON public.lead_attribution
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public insert for attribution"
  ON public.lead_attribution
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE public.lead_attribution IS 'Tracks lead source attribution and marketing campaign performance';
COMMENT ON COLUMN public.lead_attribution.source IS 'Traffic source: organic, paid, referral, direct, social, email';
COMMENT ON COLUMN public.lead_attribution.time_to_conversion IS 'Time between first visit and conversion';


-- ============================================================================
-- TABLE: faq_interactions
-- Tracks FAQ page interactions for content optimization
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.faq_interactions (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FAQ details
  faq_id TEXT NOT NULL,
  faq_category TEXT,
  question_text TEXT NOT NULL,

  -- Interaction type
  action TEXT NOT NULL CHECK (action IN (
    'viewed',
    'expanded',
    'helpful_yes',
    'helpful_no',
    'shared',
    'searched'
  )),

  -- Context
  page_url TEXT,
  search_query TEXT, -- If user searched to find this FAQ

  -- Session tracking
  session_id TEXT,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_faq_interactions_faq_id
  ON public.faq_interactions(faq_id);

CREATE INDEX IF NOT EXISTS idx_faq_interactions_action
  ON public.faq_interactions(action);

CREATE INDEX IF NOT EXISTS idx_faq_interactions_created
  ON public.faq_interactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_faq_interactions_category
  ON public.faq_interactions(faq_category)
  WHERE faq_category IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.faq_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public insert for FAQ interactions"
  ON public.faq_interactions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read FAQ interactions"
  ON public.faq_interactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Comments
COMMENT ON TABLE public.faq_interactions IS 'Tracks FAQ page interactions to identify popular questions and improve content';
COMMENT ON COLUMN public.faq_interactions.action IS 'User action: viewed, expanded, helpful_yes, helpful_no, shared, searched';


-- ============================================================================
-- TABLE: location_pages
-- Stores location-specific content for local SEO
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.location_pages (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,

  -- Location details
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'USA',
  zip_code TEXT,

  -- Geographic coordinates for schema markup
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),

  -- Content
  title TEXT NOT NULL,
  meta_description TEXT,
  hero_text TEXT,
  content JSONB DEFAULT '{}', -- Flexible content structure

  -- Local customization
  local_testimonials TEXT[], -- IDs of testimonials from this area
  local_case_studies TEXT[], -- IDs of case studies from this area
  service_areas TEXT[], -- Nearby cities/neighborhoods served

  -- SEO
  og_image_url TEXT,
  schema_markup JSONB, -- Pre-generated LocalBusiness schema

  -- Status
  published BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,

  -- Analytics
  view_count INTEGER NOT NULL DEFAULT 0,
  lead_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT location_pages_slug_check CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_location_pages_slug
  ON public.location_pages(slug);

CREATE INDEX IF NOT EXISTS idx_location_pages_published
  ON public.location_pages(published)
  WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_location_pages_city_state
  ON public.location_pages(city, state)
  WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_location_pages_coordinates
  ON public.location_pages(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.location_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to published locations"
  ON public.location_pages
  FOR SELECT
  USING (published = true);

CREATE POLICY "Allow authenticated users to read all locations"
  ON public.location_pages
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_location_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER location_pages_updated_at_trigger
  BEFORE UPDATE ON public.location_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_location_pages_updated_at();

-- Comments
COMMENT ON TABLE public.location_pages IS 'Location-specific pages for local SEO with customized content and schema markup';
COMMENT ON COLUMN public.location_pages.schema_markup IS 'Pre-generated LocalBusiness JSON-LD schema';
COMMENT ON COLUMN public.location_pages.service_areas IS 'Array of nearby cities/neighborhoods served from this location';


-- ============================================================================
-- ALTER: projects table
-- Add video testimonials and additional metadata
-- ============================================================================
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS testimonial_video_url TEXT,
  ADD COLUMN IF NOT EXISTS testimonial_text TEXT,
  ADD COLUMN IF NOT EXISTS testimonial_author TEXT,
  ADD COLUMN IF NOT EXISTS testimonial_author_title TEXT,
  ADD COLUMN IF NOT EXISTS results_metrics JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS technologies TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS project_duration TEXT,
  ADD COLUMN IF NOT EXISTS team_size INTEGER,
  ADD COLUMN IF NOT EXISTS challenges TEXT[],
  ADD COLUMN IF NOT EXISTS solutions TEXT[];

-- Add check constraint for industry
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_industry_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_industry_check CHECK (
    industry IS NULL OR industry IN (
      'Healthcare',
      'Legal',
      'Real Estate',
      'Professional Services',
      'Restaurant & Hospitality',
      'E-Commerce',
      'Education',
      'Finance',
      'Technology',
      'Non-Profit',
      'Other'
    )
  );

-- Create index for industry filtering
CREATE INDEX IF NOT EXISTS idx_projects_industry
  ON public.projects(industry)
  WHERE published = true AND industry IS NOT NULL;

-- Comments
COMMENT ON COLUMN public.projects.testimonial_video_url IS 'URL to video testimonial (YouTube, Vimeo, etc.)';
COMMENT ON COLUMN public.projects.results_metrics IS 'Detailed project results as JSON (e.g., {"traffic_increase": "250%", "conversion_rate": "+180%"})';
COMMENT ON COLUMN public.projects.industry IS 'Industry/vertical this project serves';
COMMENT ON COLUMN public.projects.technologies IS 'Detailed technology stack (can differ from tech_stack for more granularity)';


-- ============================================================================
-- VIEWS: Useful analytics views
-- ============================================================================

-- View: Lead funnel by source
CREATE OR REPLACE VIEW public.lead_funnel_by_source AS
SELECT
  la.source,
  COUNT(DISTINCT la.email) as total_visits,
  COUNT(DISTINCT CASE WHEN cl.id IS NOT NULL THEN la.email END) as calculator_completions,
  COUNT(DISTINCT CASE WHEN la.converted = true THEN la.email END) as conversions,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN cl.id IS NOT NULL THEN la.email END) /
    NULLIF(COUNT(DISTINCT la.email), 0),
    2
  ) as calculator_conversion_rate,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN la.converted = true THEN la.email END) /
    NULLIF(COUNT(DISTINCT la.email), 0),
    2
  ) as overall_conversion_rate
FROM public.lead_attribution la
LEFT JOIN public.calculator_leads cl ON la.email = cl.email
GROUP BY la.source
ORDER BY conversions DESC;

COMMENT ON VIEW public.lead_funnel_by_source IS 'Marketing funnel metrics aggregated by traffic source';


-- View: Email sequence performance
CREATE OR REPLACE VIEW public.email_sequence_performance AS
SELECT
  sequence_id,
  COUNT(*) as total_sent,
  COUNT(DISTINCT CASE WHEN event_type = 'opened' THEN email END) as unique_opens,
  COUNT(DISTINCT CASE WHEN event_type = 'clicked' THEN email END) as unique_clicks,
  COUNT(DISTINCT CASE WHEN event_type = 'unsubscribed' THEN email END) as unsubscribes,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN event_type = 'opened' THEN email END) /
    NULLIF(COUNT(DISTINCT email), 0),
    2
  ) as open_rate,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN event_type = 'clicked' THEN email END) /
    NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'opened' THEN email END), 0),
    2
  ) as click_through_rate
FROM public.email_engagement
WHERE event_type IN ('sent', 'opened', 'clicked', 'unsubscribed')
GROUP BY sequence_id
ORDER BY unique_opens DESC;

COMMENT ON VIEW public.email_sequence_performance IS 'Email engagement metrics by sequence';


-- View: Top performing FAQs
CREATE OR REPLACE VIEW public.top_performing_faqs AS
SELECT
  faq_id,
  question_text,
  faq_category,
  COUNT(*) as total_interactions,
  COUNT(CASE WHEN action = 'viewed' THEN 1 END) as views,
  COUNT(CASE WHEN action = 'expanded' THEN 1 END) as expansions,
  COUNT(CASE WHEN action = 'helpful_yes' THEN 1 END) as helpful_yes,
  COUNT(CASE WHEN action = 'helpful_no' THEN 1 END) as helpful_no,
  ROUND(
    100.0 * COUNT(CASE WHEN action = 'helpful_yes' THEN 1 END) /
    NULLIF(COUNT(CASE WHEN action IN ('helpful_yes', 'helpful_no') THEN 1 END), 0),
    2
  ) as helpfulness_score
FROM public.faq_interactions
GROUP BY faq_id, question_text, faq_category
ORDER BY total_interactions DESC
LIMIT 50;

COMMENT ON VIEW public.top_performing_faqs IS 'Most interacted-with FAQs with helpfulness scores';
