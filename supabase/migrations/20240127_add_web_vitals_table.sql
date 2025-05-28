-- Add web vitals tracking table for Core Web Vitals monitoring
-- This table stores real user monitoring (RUM) data for performance analytics

CREATE TABLE IF NOT EXISTS web_vitals (
    id BIGSERIAL PRIMARY KEY,
    
    -- Metric identification
    metric_name VARCHAR(10) NOT NULL CHECK (metric_name IN ('LCP', 'FID', 'CLS', 'FCP', 'TTFB')),
    metric_value NUMERIC(10,3) NOT NULL CHECK (metric_value >= 0),
    metric_rating VARCHAR(20) NOT NULL CHECK (metric_rating IN ('good', 'needs-improvement', 'poor')),
    metric_id VARCHAR(255) NOT NULL, -- Web Vitals metric ID
    
    -- Page context
    page_path VARCHAR(500) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    
    -- Device/browser context
    user_agent TEXT,
    connection_type VARCHAR(20),
    device_memory INTEGER,
    client_ip INET,
    
    -- Timestamps
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT web_vitals_metric_check CHECK (
        (metric_name = 'LCP' AND metric_value <= 10000) OR
        (metric_name = 'FID' AND metric_value <= 5000) OR
        (metric_name = 'CLS' AND metric_value <= 1) OR
        (metric_name = 'FCP' AND metric_value <= 10000) OR
        (metric_name = 'TTFB' AND metric_value <= 10000)
    )
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_web_vitals_timestamp ON web_vitals(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_path ON web_vitals(page_path);
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_session_id ON web_vitals(session_id);
CREATE INDEX IF NOT EXISTS idx_web_vitals_rating ON web_vitals(metric_rating);
CREATE INDEX IF NOT EXISTS idx_web_vitals_composite ON web_vitals(metric_name, page_path, timestamp DESC);

-- Add partitioning by month for better performance (PostgreSQL 12+)
-- This helps with large datasets and query performance
CREATE TABLE IF NOT EXISTS web_vitals_y2024m01 PARTITION OF web_vitals
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE IF NOT EXISTS web_vitals_y2024m02 PARTITION OF web_vitals
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Add more partitions as needed...

-- Create a function to automatically create monthly partitions
CREATE OR REPLACE FUNCTION create_monthly_partition(
    table_name TEXT,
    start_date DATE
) RETURNS VOID AS $$
DECLARE
    partition_name TEXT;
    end_date DATE;
BEGIN
    partition_name := table_name || '_y' || EXTRACT(YEAR FROM start_date) || 'm' || LPAD(EXTRACT(MONTH FROM start_date)::TEXT, 2, '0');
    end_date := start_date + INTERVAL '1 month';
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;

-- Create view for performance analytics
CREATE OR REPLACE VIEW web_vitals_summary AS
SELECT 
    metric_name,
    page_path,
    DATE_TRUNC('day', timestamp) as date,
    COUNT(*) as sample_count,
    AVG(metric_value) as avg_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY metric_value) as median_value,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value) as p75_value,
    PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY metric_value) as p90_value,
    MIN(metric_value) as min_value,
    MAX(metric_value) as max_value,
    COUNT(CASE WHEN metric_rating = 'good' THEN 1 END) as good_count,
    COUNT(CASE WHEN metric_rating = 'needs-improvement' THEN 1 END) as needs_improvement_count,
    COUNT(CASE WHEN metric_rating = 'poor' THEN 1 END) as poor_count,
    COUNT(DISTINCT session_id) as unique_sessions
FROM web_vitals
GROUP BY metric_name, page_path, DATE_TRUNC('day', timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admin only)
CREATE POLICY "Admin can view all web vitals" ON web_vitals
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for service role (for API inserts)
CREATE POLICY "Service role can insert web vitals" ON web_vitals
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON web_vitals TO authenticated;
GRANT SELECT ON web_vitals_summary TO authenticated;
GRANT ALL ON web_vitals TO service_role;

-- Add comments for documentation
COMMENT ON TABLE web_vitals IS 'Stores Core Web Vitals metrics for real user monitoring (RUM)';
COMMENT ON COLUMN web_vitals.metric_name IS 'Web Vital metric name: LCP, FID, CLS, FCP, TTFB';
COMMENT ON COLUMN web_vitals.metric_value IS 'Metric value in milliseconds (except CLS which is unitless)';
COMMENT ON COLUMN web_vitals.metric_rating IS 'Performance rating based on Google thresholds';
COMMENT ON COLUMN web_vitals.session_id IS 'Browser session identifier for grouping metrics';
COMMENT ON COLUMN web_vitals.page_path IS 'URL path where the metric was measured';

-- Create trigger to automatically create partitions
CREATE OR REPLACE FUNCTION auto_create_partition()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_monthly_partition('web_vitals', DATE_TRUNC('month', NEW.timestamp)::DATE);
    RETURN NEW;
EXCEPTION WHEN duplicate_table THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_partition_trigger
    BEFORE INSERT ON web_vitals
    FOR EACH ROW EXECUTE FUNCTION auto_create_partition();