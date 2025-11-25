# n8n Workflow Setup Guide

This directory contains ready-to-import n8n workflow files for Hudson Digital Solutions website automation.

## Official Documentation

Based on the official n8n documentation:

- **Data Structure**: [Understanding n8n data structure](https://docs.n8n.io/data/data-structure/)
- **Export/Import Workflows**: [Workflow export and import guide](https://docs.n8n.io/workflows/export-import/)
- **HTTP Request Node**: [HTTP Request credentials](https://docs.n8n.io/integrations/builtin/credentials/httprequest/)

## Prerequisites

### 1. Install n8n

```bash
# Using npm
npm install -g n8n

# Or using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 2. Configure Credentials

Before importing workflows, you need to set up these credentials in n8n:

#### A. Hudson Digital API Auth (HTTP Header Auth)

1. Go to **Credentials** → **New Credential**
2. Select **Header Auth**
3. Configure:
   - **Name**: `Hudson Digital API Auth`
   - **Name** (header field): `Authorization`
   - **Value**: `Bearer YOUR_N8N_WEBHOOK_SECRET`

   Replace `YOUR_N8N_WEBHOOK_SECRET` with the value from your `.env.local` file.

#### B. Supabase Database (PostgreSQL)

Only needed for workflow #03 (Scheduled Email Campaign).

1. Go to **Credentials** → **New Credential**
2. Select **Postgres**
3. Configure:
   - **Name**: `Supabase Database`
   - **Host**: Your Supabase project URL (without https://)
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: Your Supabase database password
   - **Port**: `5432`
   - **SSL**: `Allow`

#### C. Slack API (Optional)

Only needed for workflow #05 (CRM to Website Sync).

1. Create a Slack App at https://api.slack.com/apps
2. Enable **Incoming Webhooks**
3. Add to workspace and get webhook URL
4. In n8n:
   - Go to **Credentials** → **New Credential**
   - Select **Slack API**
   - Enter your OAuth token or webhook URL

## Available Workflows

### 1. Create Lead from Webhook
**File**: `01-new-lead-from-webhook.json`

**Description**: Simple webhook that receives lead data and creates it in your system.

**Use Case**:
- Integrate with any external form
- Zapier alternative
- Custom lead sources

**Webhook URL**: `http://your-n8n-instance:5678/webhook/new-lead`

**Test with cURL**:
```bash
curl -X POST http://localhost:5678/webhook/new-lead \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "John Doe",
    "phone": "555-123-4567",
    "company": "Acme Corp",
    "source": "Website Form",
    "leadScore": 75
  }'
```

---

### 2. LinkedIn Lead to Email Sequence
**File**: `02-linkedin-lead-to-email-sequence.json`

**Description**: Captures LinkedIn lead gen form submissions, creates the lead, waits 1 hour, then triggers an email sequence.

**Use Case**:
- LinkedIn lead gen campaigns
- Automated follow-up for social leads
- Time-delayed nurturing

**Workflow**:
1. Receives LinkedIn webhook
2. Creates lead with score 80
3. Waits 1 hour
4. Triggers "calculator-hot-lead" email sequence

**Webhook URL**: `http://your-n8n-instance:5678/webhook/linkedin-lead`

**Test Payload**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "555-987-6543",
  "company": "Tech Startup Inc"
}
```

---

### 3. Weekly Email Campaign - Cold Leads
**File**: `03-scheduled-email-campaign.json`

**Description**: Runs every Monday at 9am, fetches cold leads from the last week, and sends them a nurture email with 5-minute delays between sends.

**Use Case**:
- Automated drip campaigns
- Re-engage cold leads
- Scheduled nurture sequences

**Schedule**: Every Monday at 9:00 AM (Cron: `0 9 * * 1`)

**Requirements**:
- Supabase database credentials
- Direct database access

**Customization**:
- Change cron expression in Schedule Trigger node
- Modify SQL query to target different lead segments
- Adjust wait time between emails
- Change email sequence ID

---

### 4. Update Lead Status from External Event
**File**: `04-update-lead-status.json`

**Description**: Webhook that updates lead status based on external events (e.g., CRM updates, customer actions).

**Use Case**:
- CRM → Website synchronization
- Update leads from external systems
- Automated status management

**Webhook URL**: `http://your-n8n-instance:5678/webhook/update-lead-status`

**Test Payload**:
```json
{
  "leadId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "contacted",
  "notes": "Had initial call, very interested in SaaS consulting"
}
```

**Conditional Logic**:
- If status = "contacted" → Sets `contacted: true`
- Otherwise → Only updates status and notes

---

### 5. CRM to Website Sync (Salesforce/HubSpot)
**File**: `05-crm-to-website-sync.json`

**Description**: Advanced workflow that receives CRM webhooks, filters for hot leads only, calculates a lead score, creates the lead in your website, and notifies your sales team on Slack.

**Use Case**:
- Salesforce → Website sync
- HubSpot → Website sync
- Any CRM webhook integration
- Real-time sales notifications

**Workflow**:
1. Receives CRM webhook
2. Filters for "Hot" leads only
3. Calculates lead score based on:
   - Annual revenue (>$1M = +15 points)
   - Employee count (>50 = +10 points)
   - Industry = Technology (+10 points)
   - Engagement score (>70 = +15 points)
4. Creates lead in website
5. Sends Slack notification to sales team

**Webhook URL**: `http://your-n8n-instance:5678/webhook/crm-webhook`

**Test Payload**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@bigtech.com",
  "phone": "555-111-2222",
  "company_name": "Big Tech Corp",
  "lead_status": "Hot",
  "annual_revenue": 5000000,
  "employee_count": 200,
  "industry": "Technology",
  "engagement_score": 85,
  "crm_source": "Salesforce"
}
```

**Customization**:
- Modify lead scoring logic in Code node
- Change Slack channel ID
- Add more filtering conditions
- Include additional CRM fields

---

## Importing Workflows

### Method 1: Via n8n UI (Recommended)

1. Open n8n (usually at `http://localhost:5678`)
2. Click **Workflows** in the top navigation
3. Click **Import from File**
4. Select the JSON file from this directory
5. Click **Import**
6. Update credential references if needed
7. Activate the workflow

### Method 2: Via cURL

```bash
curl -X POST http://localhost:5678/rest/workflows \
  -H "Content-Type: application/json" \
  -d @01-new-lead-from-webhook.json
```

## Configuration Steps

### 1. Update Credential IDs

After importing, you may need to update credential references:

1. Open the imported workflow
2. Click on any node that uses credentials
3. Select your configured credential from the dropdown
4. Save the workflow

### 2. Update URLs

If your website is not at `https://hudsondigitalsolutions.com`, update all HTTP Request node URLs:

1. Find all HTTP Request nodes
2. Change the URL to your domain
3. Save the workflow

### 3. Customize Workflow Parameters

Each workflow can be customized:

- **Timing**: Adjust Wait nodes and Schedule Trigger cron expressions
- **Email Sequences**: Change `sequenceId` values to use different sequences
- **Lead Scoring**: Modify scoring logic in Code nodes
- **Filtering**: Add or modify IF node conditions
- **Notifications**: Update Slack channel IDs or add Discord nodes

### 4. Test Webhooks

Before activating, test each webhook:

1. Activate the workflow
2. Copy the webhook URL from the Webhook node
3. Send a test request using cURL or Postman
4. Check the execution log for errors
5. Verify the lead was created in your dashboard

## Webhook Security

### Production Setup

1. **Use HTTPS**: Always use secure connections in production
2. **Authentication**: Our workflows use Bearer token authentication
3. **IP Whitelisting**: Configure your firewall to only accept requests from trusted sources
4. **Rate Limiting**: n8n has built-in rate limiting
5. **Monitoring**: Check execution logs regularly

### Testing Locally

For local testing with external webhooks:

1. Use [ngrok](https://ngrok.com/) to expose your local n8n:
   ```bash
   ngrok http 5678
   ```

2. Use the ngrok URL in your external integrations:
   ```
   https://abc123.ngrok.io/webhook/new-lead
   ```

## Troubleshooting

### Issue: "Unauthorized" Error

**Solution**:
- Check that your API credential has the correct Bearer token
- Verify the token matches `N8N_WEBHOOK_SECRET` in `.env.local`
- Ensure the Authorization header is properly formatted: `Bearer YOUR_TOKEN`

### Issue: Workflow Not Triggering

**Solution**:
- Ensure workflow is activated (toggle switch in top right)
- Check webhook URL is correct
- Verify the webhook path matches (case-sensitive)
- Review execution log for errors

### Issue: Database Connection Failed

**Solution**:
- Verify Supabase credentials are correct
- Check database password
- Ensure IP is whitelisted in Supabase settings
- Test connection in Postgres credential settings

### Issue: Lead Not Created

**Solution**:
- Check HTTP Request node response in execution log
- Verify JSON body structure matches API requirements
- Ensure all required fields are present
- Check website API logs for errors

### Issue: Slack Notification Not Sent

**Solution**:
- Verify Slack credential is configured
- Check channel ID is correct
- Ensure bot has permission to post in channel
- Test credential in Slack node settings

## Monitoring and Logs

### Execution Logs

View execution history:
1. Go to **Executions** in n8n
2. Filter by workflow name
3. Click on any execution to see details
4. Check each node's input/output data

### Error Notifications

Set up error notifications:
1. Go to **Settings** → **Workflow Settings**
2. Enable **Error Workflow**
3. Select or create an error handling workflow
4. Configure notification method (email, Slack, etc.)

## Advanced Tips

### 1. Variable Expressions

n8n uses expressions with `{{ }}` syntax:

```javascript
// Access previous node data
{{ $json.email }}

// Use multiple values
{{ $json.firstName }} {{ $json.lastName }}

// Conditional logic
{{ $json.leadScore > 70 ? 'hot' : 'cold' }}
```

### 2. Error Handling

Add error handling to workflows:
1. Add an **Error Trigger** node
2. Connect to notification node (Slack, email, etc.)
3. Configure retry logic in node settings

### 3. Batch Processing

For large datasets:
1. Use **Split In Batches** node
2. Add **Wait** nodes between batches
3. Use **Loop Over Items** for sequential processing

### 4. Data Transformation

Use **Code** node for complex transformations:

```javascript
const items = $input.all();

return items.map(item => {
  return {
    json: {
      ...item.json,
      fullName: `${item.json.firstName} ${item.json.lastName}`,
      leadScore: calculateScore(item.json)
    }
  };
});
```

## Production Deployment

### Recommended Setup

1. **Host n8n on dedicated server** (DigitalOcean, AWS, etc.)
2. **Use Docker for easy deployment**
3. **Set up SSL certificate** (Let's Encrypt)
4. **Configure backup** for workflows and credentials
5. **Use environment variables** for sensitive data
6. **Set up monitoring** (UptimeRobot, etc.)

### Docker Compose Example

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_secure_password
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PROTOCOL=https
      - NODE_ENV=production
    volumes:
      - ~/.n8n:/home/node/.n8n
```

## Support Resources

- **n8n Documentation**: https://docs.n8n.io/
- **n8n Community Forum**: https://community.n8n.io/
- **n8n GitHub**: https://github.com/n8n-io/n8n
- **Hudson Digital API Docs**: `/docs/n8n-integration.md`

## Next Steps

1. Import all 5 workflows
2. Configure credentials
3. Test each workflow with sample data
4. Customize for your specific needs
5. Activate workflows in production
6. Monitor execution logs
7. Iterate and improve based on results

---

**Questions or Issues?**

Contact: hello@hudsondigitalsolutions.com

**Last Updated**: November 23, 2024
