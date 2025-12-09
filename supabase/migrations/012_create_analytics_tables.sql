-- Create analytics tables for comprehensive tracking
-- Migration: 012_create_analytics_tables.sql

-- Create leads table for newsletter subscriptions and lead management
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    source TEXT NOT NULL DEFAULT 'unknown',
    status TEXT NOT NULL DEFAULT 'new',
    message TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create web_vitals table for performance metrics
CREATE TABLE IF NOT EXISTS public.web_vitals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    rating TEXT CHECK (rating IN ('good', 'needs-improvement', 'poor')),
    page_path TEXT NOT NULL,
    user_agent TEXT,
    session_id TEXT
);

-- Create custom_events table for analytics events
CREATE TABLE IF NOT EXISTS public.custom_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    session_id TEXT,
    user_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_analytics table for page view tracking
CREATE TABLE IF NOT EXISTS public.page_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_path TEXT NOT NULL,
    session_id TEXT,
    referrer TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversion_funnel table for conversion tracking
CREATE TABLE IF NOT EXISTS public.conversion_funnel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funnel_name TEXT NOT NULL,
    step_name TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    session_id TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing tables using DO blocks
DO $$
BEGIN
    -- Add columns to leads table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'consent_marketing') THEN
        ALTER TABLE public.leads ADD COLUMN consent_marketing BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'consent_analytics') THEN
        ALTER TABLE public.leads ADD COLUMN consent_analytics BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'lead_score') THEN
        ALTER TABLE public.leads ADD COLUMN lead_score INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'company') THEN
        ALTER TABLE public.leads ADD COLUMN company TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'phone') THEN
        ALTER TABLE public.leads ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'updated_at') THEN
        ALTER TABLE public.leads ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add columns to web_vitals table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_vitals' AND column_name = 'created_at') THEN
        ALTER TABLE public.web_vitals ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_vitals' AND column_name = 'device_type') THEN
        ALTER TABLE public.web_vitals ADD COLUMN device_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_vitals' AND column_name = 'connection_type') THEN
        ALTER TABLE public.web_vitals ADD COLUMN connection_type TEXT;
    END IF;

    -- Add columns to custom_events table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_events' AND column_name = 'event_category') THEN
        ALTER TABLE public.custom_events ADD COLUMN event_category TEXT DEFAULT 'general';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_events' AND column_name = 'event_label') THEN
        ALTER TABLE public.custom_events ADD COLUMN event_label TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_events' AND column_name = 'event_value') THEN
        ALTER TABLE public.custom_events ADD COLUMN event_value NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_events' AND column_name = 'metadata') THEN
        ALTER TABLE public.custom_events ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;

    -- Add columns to page_analytics table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_analytics' AND column_name = 'user_id') THEN
        ALTER TABLE public.page_analytics ADD COLUMN user_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_analytics' AND column_name = 'device_type') THEN
        ALTER TABLE public.page_analytics ADD COLUMN device_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_analytics' AND column_name = 'browser') THEN
        ALTER TABLE public.page_analytics ADD COLUMN browser TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_analytics' AND column_name = 'os') THEN
        ALTER TABLE public.page_analytics ADD COLUMN os TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_analytics' AND column_name = 'country') THEN
        ALTER TABLE public.page_analytics ADD COLUMN country TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_analytics' AND column_name = 'city') THEN
        ALTER TABLE public.page_analytics ADD COLUMN city TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_analytics' AND column_name = 'duration') THEN
        ALTER TABLE public.page_analytics ADD COLUMN duration INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_analytics' AND column_name = 'bounce') THEN
        ALTER TABLE public.page_analytics ADD COLUMN bounce BOOLEAN DEFAULT false;
    END IF;

    -- Add columns to conversion_funnel table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversion_funnel' AND column_name = 'user_id') THEN
        ALTER TABLE public.conversion_funnel ADD COLUMN user_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversion_funnel' AND column_name = 'time_to_complete') THEN
        ALTER TABLE public.conversion_funnel ADD COLUMN time_to_complete INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversion_funnel' AND column_name = 'metadata') THEN
        ALTER TABLE public.conversion_funnel ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- Create indexes for better query performance (only for columns that exist)
DO $$
BEGIN
    -- Leads table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'email') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'source') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'status') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'created_at') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'lead_score') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON public.leads(lead_score)';
    END IF;

    -- Web vitals table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_vitals' AND column_name = 'metric_type') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_type ON public.web_vitals(metric_type)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_vitals' AND column_name = 'page_path') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_web_vitals_page_path ON public.web_vitals(page_path)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_vitals' AND column_name = 'created_at') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at ON public.web_vitals(created_at)';
    END IF;

    -- Custom events table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_events' AND column_name = 'event_name') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_custom_events_event_name ON public.custom_events(event_name)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_events' AND column_name = 'event_category') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_custom_events_category ON public.custom_events(event_category)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_events' AND column_name = 'session_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_custom_events_session_id ON public.custom_events(session_id)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_events' AND column_name = 'timestamp') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_custom_events_timestamp ON public.custom_events(timestamp)';
    END IF;

    -- Page analytics table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_analytics' AND column_name = 'page_path') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_analytics_page_path ON public.page_analytics(page_path)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_analytics' AND column_name = 'session_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_analytics_session_id ON public.page_analytics(session_id)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_analytics' AND column_name = 'timestamp') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_analytics_timestamp ON public.page_analytics(timestamp)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_analytics' AND column_name = 'user_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_analytics_user_id ON public.page_analytics(user_id)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_analytics' AND column_name = 'country') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_analytics_country ON public.page_analytics(country)';
    END IF;

    -- Conversion funnel table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversion_funnel' AND column_name = 'funnel_name') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_conversion_funnel_funnel_name ON public.conversion_funnel(funnel_name)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversion_funnel' AND column_name = 'session_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_conversion_funnel_session_id ON public.conversion_funnel(session_id)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversion_funnel' AND column_name = 'completed_at') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_conversion_funnel_completed_at ON public.conversion_funnel(completed_at)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversion_funnel' AND column_name = 'user_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_conversion_funnel_user_id ON public.conversion_funnel(user_id)';
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_funnel ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your authentication requirements)
-- For leads table - allow inserts for newsletter signups, restrict reads to authenticated users
CREATE POLICY "Allow public inserts to leads" ON public.leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads on leads" ON public.leads
    FOR SELECT USING (auth.role() = 'authenticated');

-- For web_vitals - allow public inserts (for performance tracking)
CREATE POLICY "Allow public inserts to web_vitals" ON public.web_vitals
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads on web_vitals" ON public.web_vitals
    FOR SELECT USING (auth.role() = 'authenticated');

-- For custom_events - allow public inserts (for analytics)
CREATE POLICY "Allow public inserts to custom_events" ON public.custom_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads on custom_events" ON public.custom_events
    FOR SELECT USING (auth.role() = 'authenticated');

-- For page_analytics - allow public inserts (for page tracking)
CREATE POLICY "Allow public inserts to page_analytics" ON public.page_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads on page_analytics" ON public.page_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

-- For conversion_funnel - allow public inserts (for funnel tracking)
CREATE POLICY "Allow public inserts to conversion_funnel" ON public.conversion_funnel
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads on conversion_funnel" ON public.conversion_funnel
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to leads table
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
