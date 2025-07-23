-- Create leads table for storing contact information and attribution
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    lead_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    message TEXT,
    lead_score INTEGER DEFAULT 0,
    
    -- UTM Attribution
    utm_source VARCHAR(100) DEFAULT 'direct',
    utm_medium VARCHAR(100) DEFAULT 'none',
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    utm_term VARCHAR(255),
    
    -- Additional Attribution
    referrer TEXT,
    page_url TEXT,
    user_agent TEXT,
    ip_address VARCHAR(45),
    
    -- Form Data
    budget VARCHAR(100),
    timeline VARCHAR(100),
    services TEXT,
    
    -- Status and Tracking
    status VARCHAR(50) DEFAULT 'new',
    contact_count INTEGER DEFAULT 1,
    last_contact_date TIMESTAMP DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create lead_events table for tracking all interactions
CREATE TABLE IF NOT EXISTS lead_events (
    id SERIAL PRIMARY KEY,
    lead_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    
    -- UTM for this specific event
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_utm_source ON leads(utm_source);
CREATE INDEX idx_leads_utm_campaign ON leads(utm_campaign);
CREATE INDEX idx_leads_lead_score ON leads(lead_score DESC);

CREATE INDEX idx_lead_events_lead_id ON lead_events(lead_id);
CREATE INDEX idx_lead_events_email ON lead_events(email);
CREATE INDEX idx_lead_events_type ON lead_events(event_type);
CREATE INDEX idx_lead_events_created_at ON lead_events(created_at);

-- Create view for lead analytics
CREATE VIEW lead_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    utm_source,
    utm_medium,
    utm_campaign,
    COUNT(*) as lead_count,
    AVG(lead_score) as avg_lead_score,
    COUNT(CASE WHEN lead_score >= 70 THEN 1 END) as high_value_leads,
    COUNT(CASE WHEN status = 'converted' THEN 1 END) as conversions
FROM leads
GROUP BY DATE_TRUNC('day', created_at), utm_source, utm_medium, utm_campaign;

-- Create view for attribution report
CREATE VIEW attribution_report AS
SELECT 
    utm_source,
    utm_medium,
    utm_campaign,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN status = 'converted' THEN 1 END) as conversions,
    ROUND(COUNT(CASE WHEN status = 'converted' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as conversion_rate,
    AVG(lead_score) as avg_lead_score,
    COUNT(DISTINCT DATE_TRUNC('day', created_at)) as active_days
FROM leads
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY utm_source, utm_medium, utm_campaign
ORDER BY total_leads DESC;