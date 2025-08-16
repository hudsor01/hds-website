# Prometheus & Grafana Monitoring Setup

This guide explains how to set up Prometheus and Grafana monitoring for the Hudson Digital Solutions website.

## Architecture Overview

```
Your App → Metrics Endpoint (/api/metrics) → Prometheus → Grafana Dashboard
```

## Metrics Available

### HTTP Metrics
- `hds_http_request_duration_seconds` - Request duration histogram
- `hds_http_requests_total` - Total request counter

### Business Metrics
- `hds_contact_form_submissions_total` - Contact form submissions
- `hds_contact_form_lead_score` - Lead score distribution
- `hds_contact_form_processing_seconds` - Processing time
- `hds_conversion_events_total` - Conversion tracking

### Performance Metrics
- `hds_web_vitals_lcp_seconds` - Largest Contentful Paint
- `hds_web_vitals_fid_milliseconds` - First Input Delay
- `hds_web_vitals_cls` - Cumulative Layout Shift
- `hds_web_vitals_ttfb_milliseconds` - Time to First Byte
- `hds_web_vitals_fcp_seconds` - First Contentful Paint

### Email Metrics
- `hds_email_sent_total` - Emails sent counter
- `hds_email_queue_size` - Current queue size

### Security Metrics
- `hds_security_events_total` - Security events
- `hds_rate_limit_hits_total` - Rate limiting hits

### Application Health
- `hds_application_errors_total` - Application errors
- `hds_active_users` - Active users gauge
- `hds_page_views_total` - Page view counter

## Prometheus Configuration

### 1. Install Prometheus

```bash
# Using Docker
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /path/to/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

### 2. Configure prometheus.yml

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'hds-website'
    static_configs:
      - targets: ['your-domain.com']
    metrics_path: '/api/metrics'
    scheme: https
    # Optional: Add authentication if configured
    # bearer_token: 'your-metrics-token'
```

### 3. For Local Development

```yaml
scrape_configs:
  - job_name: 'hds-website-dev'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
    scheme: http
```

## Grafana Configuration

### 1. Install Grafana

```bash
# Using Docker
docker run -d \
  --name grafana \
  -p 3001:3000 \
  grafana/grafana
```

### 2. Add Prometheus Data Source

1. Log into Grafana (default: admin/admin)
2. Go to Configuration → Data Sources
3. Add Prometheus data source
4. Set URL: `http://prometheus:9090` (or your Prometheus URL)
5. Save & Test

### 3. Import Dashboard

Create a new dashboard with these panels:

#### Request Rate Panel
```promql
rate(hds_http_requests_total[5m])
```

#### Request Duration Panel
```promql
histogram_quantile(0.95, 
  rate(hds_http_request_duration_seconds_bucket[5m])
)
```

#### Contact Form Submissions
```promql
sum(rate(hds_contact_form_submissions_total[1h])) by (status, lead_type)
```

#### Lead Score Distribution
```promql
histogram_quantile(0.5, 
  rate(hds_contact_form_lead_score_bucket[24h])
)
```

#### Web Vitals - LCP
```promql
histogram_quantile(0.75, 
  rate(hds_web_vitals_lcp_seconds_bucket[5m])
) by (page)
```

#### Error Rate
```promql
sum(rate(hds_application_errors_total[5m])) by (type, severity)
```

#### Email Success Rate
```promql
sum(rate(hds_email_sent_total[1h])) by (type, status)
```

## Environment Configuration

### 1. Add Metrics Authentication (Optional)

Add to your `.env.local`:

```env
# Metrics endpoint authentication
METRICS_AUTH_TOKEN=your-secure-token-here
```

### 2. Generate Token

```bash
openssl rand -base64 32
```

### 3. Configure Prometheus Authentication

In `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'hds-website'
    bearer_token: 'your-secure-token-here'
    # ... rest of config
```

## Testing the Setup

### 1. Verify Metrics Endpoint

```bash
# Local
curl http://localhost:3000/api/metrics

# With auth
curl -H "Authorization: Bearer your-token" https://your-domain.com/api/metrics
```

### 2. Check Prometheus Targets

Visit: `http://localhost:9090/targets`

All targets should show as "UP".

### 3. Query in Prometheus

Visit: `http://localhost:9090/graph`

Try query: `hds_contact_form_submissions_total`

## Alert Rules

### Example Prometheus Alert Rules

Create `alert_rules.yml`:

```yaml
groups:
  - name: hds_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(hds_application_errors_total[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High error rate detected
          
      - alert: ContactFormDown
        expr: up{job="hds-website"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Contact form endpoint is down
          
      - alert: HighLeadScore
        expr: hds_contact_form_lead_score > 80
        for: 1m
        labels:
          severity: info
        annotations:
          summary: High-value lead received
```

## Dashboard JSON

Here's a starter Grafana dashboard JSON you can import:

```json
{
  "dashboard": {
    "title": "Hudson Digital Solutions Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(hds_http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Contact Form Conversions",
        "targets": [
          {
            "expr": "sum(increase(hds_contact_form_submissions_total[1h]))",
            "legendFormat": "Total Submissions"
          }
        ]
      },
      {
        "title": "Lead Score Distribution",
        "targets": [
          {
            "expr": "histogram_quantile(0.5, rate(hds_contact_form_lead_score_bucket[24h]))",
            "legendFormat": "Median Score"
          }
        ]
      }
    ]
  }
}
```

## Production Deployment

### Using Docker Compose

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    
  grafana:
    image: grafana/grafana
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=your-secure-password

volumes:
  prometheus_data:
  grafana_data:
```

### Using Kubernetes

See `/docs/k8s-monitoring.yaml` for Kubernetes deployment manifests.

## Troubleshooting

### Metrics Not Appearing

1. Check endpoint: `curl localhost:3000/api/metrics`
2. Verify Prometheus can reach your app
3. Check Prometheus logs: `docker logs prometheus`

### High Memory Usage

Adjust retention in `prometheus.yml`:

```yaml
global:
  scrape_interval: 30s  # Increase interval
  
# In docker run command
--storage.tsdb.retention.time=7d  # Reduce retention
```

### Authentication Issues

1. Verify token matches in both `.env` and `prometheus.yml`
2. Check header format: `Authorization: Bearer <token>`

## Monitoring Best Practices

1. **Set appropriate scrape intervals** - 15s for production, 30s for dev
2. **Use labels wisely** - Don't create high cardinality metrics
3. **Implement rate limiting** on metrics endpoint if public
4. **Regular cleanup** - Remove unused metrics
5. **Alert fatigue** - Only alert on actionable items
6. **Dashboard organization** - Group related metrics
7. **Document thresholds** - What values are normal vs concerning

## Integration with Existing Monitoring

If you already have Prometheus/Grafana:

1. Add scrape config to existing Prometheus
2. Import provided dashboard panels
3. Merge alert rules with existing rules
4. Use consistent naming conventions

## Next Steps

1. Set up Alertmanager for notifications
2. Configure long-term storage (Thanos, Cortex)
3. Add custom business metrics
4. Integrate with PagerDuty/Slack
5. Set up distributed tracing (Jaeger/Tempo)