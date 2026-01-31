# Error Monitoring Alerting Configuration

This directory contains configuration for sending **grouped, throttled email alerts** for application errors from the error monitoring system.

## Overview

The alerting architecture consists of:

1. **Application** - Logs errors to Neon `error_logs` table with fingerprints for grouping
2. **Prometheus** - Queries error metrics and evaluates alert rules
3. **Alertmanager** - Groups alerts by fingerprint and sends batched email notifications

## Key Features

- **Grouped Alerts** - Similar errors are batched together, NOT sent individually
- **Throttled Notifications** - Wait 5 minutes to collect similar errors before alerting
- **De-duplication** - Don't re-alert for same error group within 1 hour
- **Fatal Error Fast-Path** - Critical errors alert within 1 minute
- **HTML Email Templates** - Rich formatting with links to admin panel and Grafana

## Files

- `alertmanager-config.yaml` - Alertmanager routing and receiver configuration
- `prometheus-rules.yaml` - Prometheus alert rule definitions
- `README.md` - This file

## Setup Instructions

### 1. Configure SMTP Credentials

Create a Kubernetes secret for SMTP authentication:

```bash
# On your K3s cluster
kubectl create secret generic alertmanager-smtp \
  --from-literal=smtp_password='your-smtp-password' \
  -n monitoring
```

Update the `smarthost` in `alertmanager-config.yaml` with your SMTP server details.

### 2. Update Alertmanager Configuration

The configuration in `alertmanager-config.yaml` should be **merged** into your existing Alertmanager config.

**Option A: Edit ConfigMap directly**

```bash
kubectl edit configmap alertmanager-kube-prometheus-stack-alertmanager -n monitoring
```

Add the `route` and `receivers` sections from `alertmanager-config.yaml`.

**Option B: Update Helm values**

If using Helm, update your `values.yaml`:

```yaml
alertmanager:
  config:
    route:
      receiver: 'error-email-digest'
      group_by: ['alertname', 'fingerprint', 'error_type']
      group_wait: 5m
      group_interval: 1h
      repeat_interval: 4h
      routes:
        - match:
            severity: fatal
          receiver: 'fatal-immediate'
          group_wait: 1m
          group_interval: 15m
          repeat_interval: 1h

    receivers:
      - name: 'error-email-digest'
        email_configs:
          - to: 'hudsor01@icloud.com'
            from: 'alerts@thehudsonfam.com'
            smarthost: 'smtp.example.com:587'
            # ... rest of config from alertmanager-config.yaml

      - name: 'fatal-immediate'
        email_configs:
          # ... config from alertmanager-config.yaml
```

Then apply:

```bash
helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring \
  -f values.yaml
```

### 3. Deploy Prometheus Alert Rules

Create a PrometheusRule custom resource:

```bash
kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: application-error-rules
  namespace: monitoring
  labels:
    prometheus: kube-prometheus-stack-prometheus
    role: alert-rules
spec:
  groups:
$(cat prometheus-rules.yaml | sed 's/^/    /')
EOF
```

Or if using Helm, add to `values.yaml`:

```yaml
prometheus:
  prometheusSpec:
    additionalScrapeConfigs: []
    ruleSelector:
      matchLabels:
        role: alert-rules
```

Then create the rule file as a ConfigMap.

### 4. Verify Configuration

Check that Alertmanager loaded the config:

```bash
# Check Alertmanager pods are running
kubectl get pods -n monitoring | grep alertmanager

# Check config was applied
kubectl logs -n monitoring alertmanager-kube-prometheus-stack-alertmanager-0 | grep "Completed loading of configuration"
```

Check that Prometheus loaded the rules:

```bash
# Access Prometheus UI
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090

# Navigate to http://localhost:9090/rules
# You should see "application-errors" rule group
```

## How Alert Grouping Works

### Standard Errors (5-minute batching)

1. Error occurs in application
2. Error logged to `error_logs` with fingerprint
3. Prometheus scrapes metrics and evaluates rules every 1 minute
4. Alert fires and is sent to Alertmanager
5. Alertmanager **waits 5 minutes** (`group_wait`) to collect similar alerts
6. After 5 minutes, sends **one email** with all grouped errors
7. If more errors with same fingerprint occur, **no new email** for 1 hour (`group_interval`)
8. If still firing after 4 hours, sends reminder (`repeat_interval`)

### Fatal Errors (1-minute fast-path)

1. Fatal error occurs in application
2. Prometheus evaluates rule (fires immediately, `for: 0m`)
3. Alertmanager waits only **1 minute** to group
4. Sends urgent email to `fatal-immediate` receiver
5. Re-alerts every 15 minutes if still firing

### Example Timeline

```
00:00 - Error A occurs (fingerprint: abc123)
00:01 - Error A occurs again (same fingerprint)
00:03 - Error A occurs again (same fingerprint)
00:05 - Alertmanager sends ONE email: "3 errors in Error A"
00:10 - Error A occurs again
00:15 - Error A occurs again
       - No email sent (within 1-hour group_interval)
01:06 - Error A occurs again
       - New email sent (1 hour has passed)
```

## Testing Alerts

### Test Alert Rule Evaluation

```bash
# Port-forward to Prometheus
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090

# Navigate to http://localhost:9090/graph
# Run query to see if metrics exist:
app_errors_total

# Check if rules are firing:
# Navigate to http://localhost:9090/alerts
```

### Test Alertmanager Grouping

```bash
# Port-forward to Alertmanager
kubectl port-forward -n monitoring svc/kube-prometheus-stack-alertmanager 9093:9093

# Navigate to http://localhost:9093
# You should see alerts grouped by fingerprint
```

### Send Test Alert

```bash
# Create a test alert
kubectl exec -n monitoring alertmanager-kube-prometheus-stack-alertmanager-0 -- \
  amtool alert add \
    --alertmanager.url=http://localhost:9093 \
    --annotation=message="Test error message" \
    --label=severity=warning \
    --label=alertname=HighErrorRate \
    --label=fingerprint=test123 \
    --label=error_type=TestError \
    --label=route=/test \
    test_alert
```

Check your email after 5 minutes.

## Silencing Alerts

### Silence All Alerts for Maintenance

```bash
# Port-forward to Alertmanager
kubectl port-forward -n monitoring svc/kube-prometheus-stack-alertmanager 9093:9093

# Create 2-hour silence
amtool silence add \
  --alertmanager.url=http://localhost:9093 \
  --author="Richard Hudson" \
  --comment="Maintenance window" \
  --duration=2h \
  alertname=~".+"
```

### Silence Specific Error Type

```bash
# Silence database errors for 1 hour
amtool silence add \
  --alertmanager.url=http://localhost:9093 \
  --author="Richard Hudson" \
  --comment="Database maintenance" \
  --duration=1h \
  error_type=DatabaseError
```

### List Active Silences

```bash
amtool silence query \
  --alertmanager.url=http://localhost:9093
```

### Remove Silence

```bash
# Get silence ID
amtool silence query --alertmanager.url=http://localhost:9093

# Expire silence
amtool silence expire <silence-id> \
  --alertmanager.url=http://localhost:9093
```

## Email Customization

### Update Email Templates

The email templates use Go templating with Alertmanager context.

**Available variables:**
- `.GroupLabels` - Labels used for grouping
- `.Alerts.Firing` - Currently firing alerts
- `.Alerts.Resolved` - Recently resolved alerts
- `.StartsAt` - When alert started firing
- `.EndsAt` - When alert resolved

**Example: Add error count to subject**

```yaml
headers:
  Subject: '[Hudson Digital] {{ .Alerts.Firing | len }}x {{ .GroupLabels.error_type }} errors'
```

**Example: Add resolved errors section**

```yaml
html: |
  {{ if gt (len .Alerts.Resolved) 0 }}
  <h3>Resolved Errors</h3>
  {{ range .Alerts.Resolved }}
  <div style="background: #d4edda; border-left: 4px solid #28a745;">
    <strong>{{ .Labels.error_type }}</strong> - Resolved at {{ .EndsAt.Format "15:04 MST" }}
  </div>
  {{ end }}
  {{ end }}
```

### Change Alert Thresholds

Edit `prometheus-rules.yaml` and update the `expr` values:

```yaml
# Lower threshold for high error rate
- alert: HighErrorRate
  expr: |
    sum(increase(app_errors_total[5m])) > 5  # Changed from 10 to 5
```

Apply changes:

```bash
kubectl apply -f prometheus-rules.yaml
```

## Troubleshooting

### Not Receiving Emails

1. **Check SMTP credentials are correct:**
   ```bash
   kubectl get secret alertmanager-smtp -n monitoring -o yaml
   ```

2. **Check Alertmanager logs for SMTP errors:**
   ```bash
   kubectl logs -n monitoring alertmanager-kube-prometheus-stack-alertmanager-0 | grep -i smtp
   ```

3. **Verify email config is loaded:**
   ```bash
   kubectl port-forward -n monitoring svc/kube-prometheus-stack-alertmanager 9093:9093
   # Navigate to http://localhost:9093/#/status
   # Check "Config" section for your receivers
   ```

### Receiving Too Many Emails

Increase grouping intervals in `alertmanager-config.yaml`:

```yaml
route:
  group_wait: 10m      # Increased from 5m
  group_interval: 2h   # Increased from 1h
  repeat_interval: 8h  # Increased from 4h
```

### Alerts Not Firing

1. **Check Prometheus can see metrics:**
   ```bash
   kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090
   # Navigate to http://localhost:9090/graph
   # Query: app_errors_total
   ```

2. **Check alert rules are loaded:**
   ```bash
   # Navigate to http://localhost:9090/rules
   # Look for "application-errors" group
   ```

3. **Check alert evaluation:**
   ```bash
   # Navigate to http://localhost:9090/alerts
   # See which rules are pending/firing
   ```

### Emails Going to Spam

1. Set up SPF/DKIM/DMARC records for `alerts@thehudsonfam.com`
2. Use a dedicated email service (SendGrid, SES, Mailgun)
3. Add `Reply-To` header in email config:
   ```yaml
   headers:
     Subject: '[Hudson Digital] Error Alert'
     Reply-To: 'hudsor01@icloud.com'
   ```

## Security Considerations

- SMTP credentials stored in Kubernetes secret (encrypted at rest if cluster encryption enabled)
- Email templates do not expose sensitive data (database credentials, API keys)
- Consider using TLS for SMTP connection (`smtp.example.com:465`)
- Restrict admin panel access to authenticated users only
- Use firewall rules to restrict who can access Alertmanager UI

## Next Steps

1. Set up Grafana dashboard for error visualization
2. Configure Slack/Discord webhooks for real-time notifications
3. Implement PagerDuty integration for critical alerts
4. Add runbook links to alert annotations
5. Create playbooks for common error scenarios
