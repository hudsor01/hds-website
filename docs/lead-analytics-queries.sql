-- Useful queries for lead analytics and reporting

-- 1. Top performing campaigns by lead quality
SELECT 
    utm_campaign,
    utm_source,
    utm_medium,
    COUNT(*) as leads,
    AVG(lead_score) as avg_score,
    COUNT(CASE WHEN lead_score >= 70 THEN 1 END) as high_quality_leads
FROM leads
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY utm_campaign, utm_source, utm_medium
ORDER BY high_quality_leads DESC, avg_score DESC;

-- 2. Lead conversion funnel by source
SELECT 
    utm_source,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
    COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified,
    COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted,
    ROUND(COUNT(CASE WHEN status = 'converted' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as conversion_rate
FROM leads
GROUP BY utm_source
ORDER BY conversion_rate DESC;

-- 3. Recent high-value leads (last 7 days)
SELECT 
    name,
    email,
    company,
    lead_score,
    budget,
    timeline,
    utm_source || '/' || utm_medium || '/' || utm_campaign as attribution,
    created_at
FROM leads
WHERE created_at >= NOW() - INTERVAL '7 days'
    AND lead_score >= 70
ORDER BY created_at DESC;

-- 4. Lead velocity (leads per day over last 30 days)
SELECT 
    DATE(created_at) as date,
    COUNT(*) as leads_created,
    COUNT(CASE WHEN lead_score >= 70 THEN 1 END) as high_value_leads,
    COUNT(CASE WHEN utm_source != 'direct' THEN 1 END) as attributed_leads
FROM leads
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 5. Multi-touch attribution (leads who visited multiple times)
SELECT 
    l.email,
    l.name,
    l.company,
    l.contact_count,
    l.lead_score,
    STRING_AGG(DISTINCT e.utm_source || '/' || e.utm_medium, ', ') as touchpoints,
    COUNT(DISTINCT e.utm_campaign) as campaigns_touched
FROM leads l
JOIN lead_events e ON l.lead_id = e.lead_id
WHERE l.contact_count > 1
GROUP BY l.email, l.name, l.company, l.contact_count, l.lead_score
ORDER BY l.contact_count DESC;

-- 6. ROI by campaign (requires cost data)
SELECT 
    utm_campaign,
    COUNT(*) as leads,
    COUNT(CASE WHEN status = 'converted' THEN 1 END) as conversions,
    AVG(lead_score) as avg_quality,
    -- Add campaign cost data when available
    -- cost_per_lead = campaign_cost / COUNT(*)
    -- roi = (revenue - campaign_cost) / campaign_cost * 100
    created_at::date as date
FROM leads
WHERE utm_campaign IS NOT NULL AND utm_campaign != ''
GROUP BY utm_campaign, created_at::date
ORDER BY conversions DESC;

-- 7. Lead source diversity (prevent over-reliance on one channel)
SELECT 
    utm_source,
    COUNT(*) as leads,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM leads WHERE created_at >= NOW() - INTERVAL '30 days')::numeric * 100, 2) as percentage
FROM leads
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY utm_source
ORDER BY percentage DESC;

-- 8. Weekly performance summary
SELECT 
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) as total_leads,
    COUNT(DISTINCT utm_source) as source_diversity,
    AVG(lead_score) as avg_quality,
    COUNT(CASE WHEN lead_score >= 70 THEN 1 END) as high_value_count,
    COUNT(CASE WHEN status = 'converted' THEN 1 END) as conversions
FROM leads
WHERE created_at >= NOW() - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;