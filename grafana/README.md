# Grafana Dashboards

This directory contains Grafana dashboard JSON files for monitoring the Hudson Digital Solutions application.

## Available Dashboards

### Application Errors Dashboard
**File:** `dashboards/application-errors.json`

Monitors and visualizes application errors from the Supabase `error_logs` table.

**Panels:**
1. **Error Rate Over Time** - Timeseries chart showing errors per hour
2. **Errors by Type** - Bar chart of top 10 error types
3. **Errors by Route** - Bar chart of top 10 routes with most errors
4. **Error Level Distribution** - Pie chart showing fatal vs error breakdown
5. **Top Error Messages** - Table of most frequent errors grouped by fingerprint
6. **Recent Errors (Live Tail)** - Live table of the 50 most recent errors

## How to Import

### Option 1: Via Grafana UI
1. Log into your Grafana instance at `grafana.thehudsonfam.com`
2. Navigate to **Dashboards** → **Import**
3. Click **Upload JSON file**
4. Select `dashboards/application-errors.json`
5. Click **Import**

### Option 2: Via API
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d @dashboards/application-errors.json \
  https://grafana.thehudsonfam.com/api/dashboards/db
```

## Configuration

### Datasource UID
The dashboard is configured to use a PostgreSQL datasource with UID `supabase`.

**If your datasource UID is different:**
1. After importing, edit the dashboard
2. For each panel, click the panel title → **Edit**
3. Change the datasource to your Supabase PostgreSQL datasource
4. Save the dashboard

**To check your datasource UID:**
1. Go to **Connections** → **Data sources**
2. Click on your Supabase datasource
3. The UID is in the URL: `/datasources/edit/YOUR_UID`

### Time Range
- Default: Last 24 hours
- Auto-refresh: 1 minute
- Customizable via dashboard time picker

### Required Permissions
The Supabase user/role needs `SELECT` permission on the `error_logs` table:

```sql
GRANT SELECT ON error_logs TO grafana_user;
```

## Queries Used

All queries use Grafana's time macros for dynamic filtering:
- `$__timeFrom()` - Start of selected time range
- `$__timeTo()` - End of selected time range

### Example Query (Error Rate Over Time)
```sql
SELECT
  date_trunc('hour', created_at) as time,
  COUNT(*) as errors
FROM error_logs
WHERE created_at >= $__timeFrom() AND created_at <= $__timeTo()
GROUP BY 1
ORDER BY 1
```

## Troubleshooting

### No data showing
1. Verify the datasource is connected and working
2. Check the time range includes periods with errors
3. Verify the `error_logs` table has data:
   ```sql
   SELECT COUNT(*) FROM error_logs;
   ```

### Permission errors
Ensure the Grafana database user has SELECT permissions:
```sql
SELECT * FROM information_schema.table_privileges
WHERE table_name = 'error_logs';
```

### Wrong datasource UID
Edit each panel and select the correct Supabase datasource from the dropdown.

## Customization

Feel free to customize the dashboard:
- Add filters for environment, user, or error type
- Create alert rules for error rate thresholds
- Add panels for additional metrics
- Adjust time ranges and refresh intervals

## Related Files

- Error logging implementation: `src/lib/error-logger.ts`
- Database schema: `supabase/migrations/20250120000000_create_error_logs.sql`
- API endpoint: `src/app/api/log-error/route.ts`
