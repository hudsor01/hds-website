-- Hudson Digital Solutions - PostgreSQL Schema
-- Database schema for lead management, analytics, and automation workflows
-- Compatible with Supabase PostgreSQL

-- ============================================
-- LEADS TABLE
-- ============================================
-- Stores all captured leads from website, tools, and forms
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,

  -- Contact Information
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(255),
  phone VARCHAR(50),

  -- Lead Source and Type
  source VARCHAR(100) DEFAULT 'website-contact-form',
  lead_magnet_type VARCHAR(100), -- paystub-generator, ttl-calculator, etc.

  -- Original Inquiry
  message TEXT,
  budget VARCHAR(50), -- low_under_5k, medium_5k_15k, high_15k_50k, enterprise_50k_plus
  timeline VARCHAR(50), -- asap, 1_month, 3_months, 6_months_plus
  service_interest VARCHAR(100), -- web_dev, automation, consulting, etc.

  -- AI Analysis Results
  ai_intent VARCHAR(100), -- web_development, automation, consulting, etc.
  ai_summary TEXT,
  ai_urgency VARCHAR(50), -- urgent, moderate, low
  ai_budget_signal VARCHAR(50), -- enterprise_50k_plus, high_15k_50k, etc.
  ai_pain_points TEXT,
  ai_technical_complexity VARCHAR(50), -- high, medium, low
  qualification_score INTEGER DEFAULT 0 CHECK (qualification_score >= 0 AND qualification_score <= 100),

  -- Lead Status Tracking
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, proposal_sent, negotiating, won, lost, lead_magnet

  -- Proposal Information
  proposal_generated_at TIMESTAMP,
  proposal_content TEXT,
  proposal_sent_at TIMESTAMP,

  -- Engagement Tracking
  last_contacted_at TIMESTAMP,
  next_followup_at TIMESTAMP,
  engagement_score INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT leads_email_key UNIQUE (email)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_qualification_score ON leads(qualification_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at_trigger
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION update_leads_updated_at();

-- ============================================
-- CUSTOM_EVENTS TABLE
-- ============================================
-- Stores analytics events from website and applications
CREATE TABLE IF NOT EXISTS custom_events (
  id BIGSERIAL PRIMARY KEY,

  -- Event Details
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(100) DEFAULT 'general',
  event_label VARCHAR(255),
  event_value NUMERIC(10, 2),

  -- Session Information
  session_id VARCHAR(255),
  user_id VARCHAR(255),

  -- Metadata
  metadata JSONB,

  -- Timestamps
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_custom_events_event_name ON custom_events(event_name);
CREATE INDEX IF NOT EXISTS idx_custom_events_timestamp ON custom_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_custom_events_session_id ON custom_events(session_id);
CREATE INDEX IF NOT EXISTS idx_custom_events_user_id ON custom_events(user_id);

-- ============================================
-- PAGE_ANALYTICS TABLE
-- ============================================
-- Stores page view analytics and performance metrics
CREATE TABLE IF NOT EXISTS page_analytics (
  id BIGSERIAL PRIMARY KEY,

  -- Page Information
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  referrer VARCHAR(500),

  -- Session Information
  session_id VARCHAR(255),
  user_id VARCHAR(255),

  -- Device and Location
  user_agent TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),

  -- Performance Metrics
  load_time INTEGER, -- milliseconds
  time_on_page INTEGER, -- seconds
  scroll_depth INTEGER, -- percentage

  -- Timestamps
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for page analytics
CREATE INDEX IF NOT EXISTS idx_page_analytics_page_path ON page_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_page_analytics_timestamp ON page_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_page_analytics_session_id ON page_analytics(session_id);

-- ============================================
-- WEB_VITALS TABLE
-- ============================================
-- Stores Core Web Vitals performance metrics
CREATE TABLE IF NOT EXISTS web_vitals (
  id BIGSERIAL PRIMARY KEY,

  -- Page Information
  page_path VARCHAR(500) NOT NULL,

  -- Core Web Vitals Metrics
  metric_name VARCHAR(50) NOT NULL, -- LCP, FID, CLS, FCP, TTFB, INP
  metric_value NUMERIC(10, 3) NOT NULL,
  metric_rating VARCHAR(20), -- good, needs-improvement, poor

  -- Session Information
  session_id VARCHAR(255),

  -- Device Context
  device_type VARCHAR(50),
  connection_type VARCHAR(50),

  -- Timestamps
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for web vitals analysis
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_path ON web_vitals(page_path);
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_timestamp ON web_vitals(timestamp DESC);

-- ============================================
-- COMPLETED_PROJECTS TABLE
-- ============================================
-- Stores portfolio projects for AI proposal generation similarity search
CREATE TABLE IF NOT EXISTS completed_projects (
  id BIGSERIAL PRIMARY KEY,

  -- Project Details
  project_name VARCHAR(255) NOT NULL,
  client_name VARCHAR(255),
  industry VARCHAR(100),
  service_type VARCHAR(100), -- web_development, automation, consulting, etc.

  -- Project Scope
  description TEXT,
  technologies_used TEXT[],
  key_features TEXT[],

  -- Project Metrics
  budget_range VARCHAR(50),
  duration_weeks INTEGER,
  team_size INTEGER,

  -- Results
  results_achieved TEXT,
  client_testimonial TEXT,

  -- Media
  featured_image VARCHAR(500),
  case_study_url VARCHAR(500),

  -- Timestamps
  completed_at DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for project searches
CREATE INDEX IF NOT EXISTS idx_completed_projects_industry ON completed_projects(industry);
CREATE INDEX IF NOT EXISTS idx_completed_projects_service_type ON completed_projects(service_type);
CREATE INDEX IF NOT EXISTS idx_completed_projects_completed_at ON completed_projects(completed_at DESC);

-- ============================================
-- EMAIL_SEQUENCES TABLE
-- ============================================
-- Tracks automated email sequence delivery
CREATE TABLE IF NOT EXISTS email_sequences (
  id BIGSERIAL PRIMARY KEY,

  -- Lead Reference
  lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,

  -- Email Details
  sequence_name VARCHAR(100) NOT NULL, -- welcome, consultation_followup, nurture
  email_subject VARCHAR(255),
  email_body TEXT,

  -- Delivery Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, opened, clicked, bounced, failed
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,

  -- Resend Information
  resend_email_id VARCHAR(255),

  -- Timestamps
  scheduled_for TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for email tracking
CREATE INDEX IF NOT EXISTS idx_email_sequences_lead_id ON email_sequences(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_status ON email_sequences(status);
CREATE INDEX IF NOT EXISTS idx_email_sequences_scheduled_for ON email_sequences(scheduled_for);

-- ============================================
-- LEAD_ACTIVITY_LOG TABLE
-- ============================================
-- Audit log for all lead interactions and status changes
CREATE TABLE IF NOT EXISTS lead_activity_log (
  id BIGSERIAL PRIMARY KEY,

  -- Lead Reference
  lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,

  -- Activity Details
  activity_type VARCHAR(100) NOT NULL, -- status_change, email_sent, proposal_sent, note_added, etc.
  activity_description TEXT,

  -- Changes Tracking
  old_value TEXT,
  new_value TEXT,

  -- Actor
  performed_by VARCHAR(100), -- system, admin, workflow_name

  -- Metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_lead_activity_log_lead_id ON lead_activity_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activity_log_activity_type ON lead_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_lead_activity_log_created_at ON lead_activity_log(created_at DESC);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample completed projects for AI proposal generation
INSERT INTO completed_projects (project_name, client_name, industry, service_type, description, technologies_used, budget_range, duration_weeks, results_achieved, completed_at)
VALUES
  ('E-Commerce Platform Rebuild', 'TechRetail Inc', 'retail', 'web_development', 'Complete rebuild of legacy e-commerce platform with modern stack', ARRAY['Next.js', 'PostgreSQL', 'Stripe', 'Vercel'], 'high_15k_50k', 12, 'Increased conversion rate by 34%, reduced page load time by 60%', '2024-08-15'),
  ('Marketing Automation System', 'GrowthCo', 'marketing', 'automation', 'Custom n8n workflows for lead nurturing and campaign management', ARRAY['n8n', 'PostgreSQL', 'Resend', 'Qdrant'], 'medium_5k_15k', 8, 'Saved 20 hours/week, increased lead conversion by 25%', '2024-09-20'),
  ('SaaS Dashboard Development', 'DataViz Pro', 'saas', 'web_development', 'Real-time analytics dashboard with data visualization', ARRAY['Next.js', 'Supabase', 'Recharts', 'Vercel'], 'high_15k_50k', 10, 'Delivered 2 weeks ahead of schedule, 98% customer satisfaction', '2024-10-05')
ON CONFLICT DO NOTHING;

-- ============================================
-- VIEWS (Optional - for reporting)
-- ============================================

-- High-value leads view
CREATE OR REPLACE VIEW high_value_leads AS
SELECT
  id,
  email,
  first_name,
  last_name,
  company,
  qualification_score,
  ai_budget_signal,
  status,
  created_at,
  EXTRACT(DAY FROM (NOW() - created_at)) as days_since_created
FROM leads
WHERE qualification_score >= 75
  AND status NOT IN ('won', 'lost')
ORDER BY qualification_score DESC;

-- Lead conversion funnel view
CREATE OR REPLACE VIEW lead_funnel AS
SELECT
  status,
  COUNT(*) as count,
  AVG(qualification_score) as avg_score,
  AVG(EXTRACT(DAY FROM (NOW() - created_at))) as avg_days_in_status
FROM leads
GROUP BY status
ORDER BY
  CASE status
    WHEN 'new' THEN 1
    WHEN 'contacted' THEN 2
    WHEN 'qualified' THEN 3
    WHEN 'proposal_sent' THEN 4
    WHEN 'negotiating' THEN 5
    WHEN 'won' THEN 6
    WHEN 'lost' THEN 7
    ELSE 8
  END;

-- Performance analytics view
CREATE OR REPLACE VIEW page_performance_summary AS
SELECT
  page_path,
  COUNT(*) as total_views,
  AVG(load_time) as avg_load_time,
  AVG(time_on_page) as avg_time_on_page,
  AVG(scroll_depth) as avg_scroll_depth,
  DATE_TRUNC('day', timestamp) as date
FROM page_analytics
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY page_path, DATE_TRUNC('day', timestamp)
ORDER BY total_views DESC;

-- ============================================
-- ROW LEVEL SECURITY (Optional - if using Supabase Auth)
-- ============================================

-- Enable RLS on sensitive tables
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE lead_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (allow all operations)
-- CREATE POLICY "Service role has full access to leads"
--   ON leads FOR ALL
--   USING (auth.role() = 'service_role');

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant permissions to n8n database user (if using separate user)
-- GRANT SELECT, INSERT, UPDATE ON leads TO n8n_user;
-- GRANT SELECT, INSERT ON lead_activity_log TO n8n_user;
-- GRANT SELECT, INSERT, UPDATE ON email_sequences TO n8n_user;
-- GRANT SELECT ON completed_projects TO n8n_user;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Hudson Digital Solutions database schema created successfully!';
  RAISE NOTICE 'Tables created: leads, custom_events, page_analytics, web_vitals, completed_projects, email_sequences, lead_activity_log';
  RAISE NOTICE 'Views created: high_value_leads, lead_funnel, page_performance_summary';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Configure Qdrant collections (run qdrant-setup.sh)';
  RAISE NOTICE '2. Import n8n workflows';
  RAISE NOTICE '3. Configure n8n credentials';
  RAISE NOTICE '4. Test workflows with sample data';
END $$;
