# Prometheus Configuration for Development & Production

## Development Setup (Current)

Your Prometheus is currently configured to scrape from:
```yaml
- job_name: "hds-website"
  static_configs:
    - targets: ["192.168.3.1:3000"]  # Your dev machine
  metrics_path: "/api/metrics"
  scrape_interval: 15s
```

## Production Setup

When you deploy to production, update your Prometheus config on dev-server:

```yaml
# Keep both dev and prod for comparison
- job_name: "hds-website-dev"
  static_configs:
    - targets: ["192.168.3.1:3000"]  # Your dev machine
  metrics_path: "/api/metrics"
  scrape_interval: 30s

- job_name: "hds-website-prod"
  static_configs:
    - targets: ["hudsondigitalsolutions.com"]
  metrics_path: "/api/metrics"
  scheme: https
  scrape_interval: 30s
  # Optional: Add authentication for production
  # authorization:
  #   type: Bearer
  #   credentials: 'your-metrics-token-here'
```

## Environment-Based Security

### 1. Add to your `.env.production`:
```env
# Metrics endpoint protection
METRICS_AUTH_TOKEN=generate-a-secure-token-here
METRICS_ALLOWED_IPS=100.73.235.44
```

### 2. Update `/src/app/api/metrics/route.ts`:
```typescript
export async function GET(request: NextRequest) {
  // Production security
  if (process.env.NODE_ENV === 'production') {
    // Check IP whitelist
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip');
    const allowedIPs = process.env.METRICS_ALLOWED_IPS?.split(',') || [];
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    // Check auth token
    if (process.env.METRICS_AUTH_TOKEN) {
      const authHeader = request.headers.get('authorization');
      const expectedToken = `Bearer ${process.env.METRICS_AUTH_TOKEN}`;
      if (authHeader !== expectedToken) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }
  }
  
  // ... rest of metrics endpoint
}
```

## Deployment Checklist

### When Deploying to Vercel:

1. **Set Environment Variables:**
   ```bash
   vercel env add METRICS_AUTH_TOKEN
   vercel env add METRICS_ALLOWED_IPS
   ```

2. **Update Prometheus on dev-server:**
   ```bash
   ssh dev-server
   vim /home/dev-server/docker/tenantflow-monitoring/prometheus.yml
   # Add the production job
   docker exec tenantflow-prometheus kill -HUP 1
   ```

3. **Update Grafana Dashboards:**
   - Add filter by job name to distinguish dev vs prod
   - Create separate dashboard for production metrics

## Multi-Environment Dashboard

In Grafana, use variables to switch between environments:

1. **Dashboard Settings** → **Variables** → **New**
2. Name: `environment`
3. Type: `Query`
4. Query: `label_values(up, job)`
5. Regex: `/hds-website.*/`

Then in your panels, use:
```promql
hds_contact_form_submissions_total{job="$environment"}
```

## Automatic Environment Detection

You can also make your metrics include environment labels:

In `/src/lib/metrics.ts`:
```typescript
// Add environment label to all metrics
const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
const hostname = process.env.VERCEL_URL || 'localhost';

export const contactFormSubmissions = new Counter({
  name: 'hds_contact_form_submissions_total',
  help: 'Total number of contact form submissions',
  labelNames: ['status', 'lead_type', 'environment', 'hostname'],
});

// When recording:
contactFormSubmissions.inc({ 
  status, 
  lead_type: leadType,
  environment,
  hostname
});
```

This way you can filter in Grafana by:
- `{environment="prod"}` - Production only
- `{environment="dev"}` - Development only
- `{hostname="hudsondigitalsolutions.com"}` - Specific deployment