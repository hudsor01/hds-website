# Connect to Your Existing Prometheus/Grafana

Since you already have Prometheus and Grafana running on your LAN, here's how to connect them to this project:

## 1. Add This Project to Your Existing Prometheus

Add this to your existing `prometheus.yml` on your server:

```yaml
scrape_configs:
  # Add this job to your existing configuration
  - job_name: 'hds-website'
    static_configs:
      - targets: ['YOUR_MACHINE_IP:3000']  # Replace with your dev machine's LAN IP
    metrics_path: '/api/metrics'
    scrape_interval: 15s
```

Then reload Prometheus config:
```bash
# On your Prometheus server
curl -X POST http://localhost:9090/-/reload
```

## 2. Verify Metrics Are Being Scraped

1. Open your Prometheus UI: `http://YOUR_PROMETHEUS_SERVER:9090`
2. Go to Status → Targets
3. Look for `hds-website` - it should show as "UP"
4. Go to Graph and try querying: `hds_contact_form_submissions_total`

## 3. Import Dashboard to Your Existing Grafana

1. Open your Grafana: `http://YOUR_GRAFANA_SERVER:3000`
2. Go to Dashboards → Import
3. Copy and paste this JSON:

```json
{
  "dashboard": {
    "id": null,
    "title": "Hudson Digital Solutions - Business Metrics",
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
        "type": "graph",
        "title": "Contact Form Submissions",
        "targets": [
          {
            "expr": "sum(rate(hds_contact_form_submissions_total[1h])) by (status)",
            "legendFormat": "{{status}}"
          }
        ]
      },
      {
        "id": 2,
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0},
        "type": "stat",
        "title": "High Value Leads (24h)",
        "targets": [
          {
            "expr": "sum(increase(hds_contact_form_submissions_total{lead_type=\"high_value\"}[24h]))"
          }
        ]
      },
      {
        "id": 3,
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8},
        "type": "graph",
        "title": "Lead Score Distribution",
        "targets": [
          {
            "expr": "histogram_quantile(0.5, sum(rate(hds_contact_form_lead_score_bucket[1h])) by (le))",
            "legendFormat": "Median Score"
          },
          {
            "expr": "histogram_quantile(0.75, sum(rate(hds_contact_form_lead_score_bucket[1h])) by (le))",
            "legendFormat": "75th Percentile"
          }
        ]
      },
      {
        "id": 4,
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 8},
        "type": "graph",
        "title": "API Response Times",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(hds_http_request_duration_seconds_bucket{route=\"/api/contact\"}[5m])) by (le))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "id": 5,
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 16},
        "type": "graph",
        "title": "Email Success Rate",
        "targets": [
          {
            "expr": "sum(rate(hds_email_sent_total[1h])) by (status)",
            "legendFormat": "{{status}}"
          }
        ]
      },
      {
        "id": 6,
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 16},
        "type": "graph",
        "title": "Security Events",
        "targets": [
          {
            "expr": "sum(rate(hds_security_events_total[5m])) by (type)",
            "legendFormat": "{{type}}"
          }
        ]
      }
    ]
  }
}
```

## 4. Create Web Vitals Dashboard

Import this as a second dashboard for performance metrics:

```json
{
  "dashboard": {
    "id": null,
    "title": "Hudson Digital Solutions - Web Vitals",
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
        "type": "graph",
        "title": "Largest Contentful Paint (LCP)",
        "targets": [
          {
            "expr": "histogram_quantile(0.75, sum(rate(hds_web_vitals_lcp_seconds_bucket[5m])) by (page, le))",
            "legendFormat": "{{page}}"
          }
        ]
      },
      {
        "id": 2,
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0},
        "type": "graph",
        "title": "Cumulative Layout Shift (CLS)",
        "targets": [
          {
            "expr": "histogram_quantile(0.75, sum(rate(hds_web_vitals_cls_bucket[5m])) by (page, le))",
            "legendFormat": "{{page}}"
          }
        ]
      },
      {
        "id": 3,
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8},
        "type": "graph",
        "title": "First Input Delay (FID)",
        "targets": [
          {
            "expr": "histogram_quantile(0.75, sum(rate(hds_web_vitals_fid_milliseconds_bucket[5m])) by (page, le))",
            "legendFormat": "{{page}}"
          }
        ]
      },
      {
        "id": 4,
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 8},
        "type": "stat",
        "title": "Application Errors",
        "targets": [
          {
            "expr": "sum(rate(hds_application_errors_total[5m]))"
          }
        ]
      }
    ]
  }
}
```

## 5. Test The Connection

1. Start your dev server: `npm run dev`
2. Visit: `http://localhost:3000/api/metrics` - you should see raw metrics
3. Submit a test contact form
4. Check your Grafana dashboards - data should appear within 15-30 seconds

## Available Metrics

Your app now exports these metrics:

- `hds_contact_form_submissions_total` - Contact form submissions
- `hds_contact_form_lead_score` - Lead score histogram
- `hds_email_sent_total` - Email success/failure
- `hds_web_vitals_*` - LCP, FID, CLS, TTFB, FCP
- `hds_http_request_duration_seconds` - API performance
- `hds_security_events_total` - Security events
- `hds_application_errors_total` - App errors

## Production Setup

When you deploy to production, update your Prometheus config:

```yaml
- job_name: 'hds-website-prod'
  static_configs:
    - targets: ['hudsondigitalsolutions.com']
  metrics_path: '/api/metrics'
  scheme: https
```

That's it! Your existing monitoring stack will now collect metrics from this project.