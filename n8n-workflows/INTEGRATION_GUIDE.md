# Hudson Digital Solutions - Integration Guide

Complete step-by-step guide for integrating n8n workflows with your Next.js application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Database Configuration](#database-configuration)
4. [Qdrant Configuration](#qdrant-configuration)
5. [n8n Workflow Import](#n8n-workflow-import)
6. [Next.js Integration](#nextjs-integration)
7. [Testing & Validation](#testing--validation)
8. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## Prerequisites

### Required Services (Already Running)

- ✅ PostgreSQL (Supabase)
- ✅ Redis
- ✅ n8n
- ✅ Traefik
- ✅ Ghost CMS
- ✅ Stirling-PDF
- ✅ Qdrant
- ✅ Ollama with Qwen3-VL-4B model
- ✅ Monitoring stack

### Required API Keys

- Resend API Key (for email sending)
- Discord Webhook URL (for notifications)
- Ghost Admin API Key (for SEO workflow)

### Required Tools

- `kubectl` (for Kubernetes operations)
- `psql` (PostgreSQL client)
- `curl` (for API testing)

---

## Infrastructure Setup

### 1. Verify All Services Are Running

```bash
# Check n8n
kubectl get pods -n automation | grep n8n

# Check Ollama
kubectl get pods -n ai-stack | grep ollama

# Check Qdrant
kubectl get pods -n ai-stack | grep qdrant

# Check PostgreSQL
kubectl get pods -n database | grep postgres

# Check Stirling-PDF
kubectl get pods -n tools | grep stirling-pdf
```

### 2. Get Service URLs

```bash
# Get n8n URL
kubectl get ingress -n automation

# Get Qdrant URL
kubectl get svc -n ai-stack | grep qdrant

# Get Ollama URL
kubectl get svc -n ai-stack | grep ollama
```

---

## Database Configuration

### 1. Connect to PostgreSQL

```bash
# Port-forward PostgreSQL (if needed)
kubectl port-forward -n database svc/postgresql 5432:5432

# Or use direct connection
psql -h your-supabase-host -U postgres -d postgres
```

### 2. Run Database Schema

```bash
psql -h your-supabase-host -U postgres -d postgres -f database-schema.sql
```

### 3. Verify Tables Created

```sql
-- List all tables
\dt

-- Check leads table structure
\d leads

-- Check sample data
SELECT COUNT(*) FROM leads;
SELECT COUNT(*) FROM completed_projects;
```

### 4. Create Database User for n8n (Optional)

```sql
-- Create dedicated n8n user
CREATE USER n8n_user WITH PASSWORD 'secure_password_here';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON leads TO n8n_user;
GRANT SELECT, INSERT ON lead_activity_log TO n8n_user;
GRANT SELECT, INSERT, UPDATE ON email_sequences TO n8n_user;
GRANT SELECT ON completed_projects TO n8n_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO n8n_user;
```

---

## Qdrant Configuration

### 1. Verify Qdrant is Accessible

```bash
# Port-forward Qdrant (if needed)
kubectl port-forward -n ai-stack svc/qdrant-service 6333:6333

# Check health
curl http://localhost:6333/health
```

### 2. Run Qdrant Setup Script

```bash
cd /home/user/hds-website/n8n-workflows

# Set Qdrant host (if different)
export QDRANT_HOST=http://qdrant-service.ai-stack:6333

# Run setup script
bash qdrant-setup.sh
```

### 3. Verify Collections Created

```bash
# List all collections
curl http://qdrant-service.ai-stack:6333/collections

# Check leads collection
curl http://qdrant-service.ai-stack:6333/collections/leads

# Check completed_projects collection
curl http://qdrant-service.ai-stack:6333/collections/completed_projects
```

---

## n8n Workflow Import

### 1. Access n8n Dashboard

```bash
# Get n8n URL from Traefik ingress
kubectl get ingress -n automation

# Or port-forward n8n
kubectl port-forward -n automation svc/n8n 5678:5678

# Open browser: http://localhost:5678 or https://n8n.yourdomain.com
```

### 2. Create Credentials

#### PostgreSQL (Supabase)

1. Go to **Settings** > **Credentials** > **New**
2. Select **Postgres**
3. Enter connection details:
   - Name: `Supabase PostgreSQL`
   - Host: `your-supabase-host.supabase.co`
   - Database: `postgres`
   - User: `postgres` (or `n8n_user` if created)
   - Password: `your_password`
   - Port: `5432`
   - SSL: `require`
4. Test connection and save

#### Resend API Key

1. Go to **Settings** > **Credentials** > **New**
2. Select **HTTP Header Auth**
3. Enter:
   - Name: `Resend API Key`
   - Header Name: `Authorization`
   - Value: `Bearer re_your_resend_api_key_here`
4. Save

#### Ghost Admin API Key (Workflow 05 only)

1. Go to **Settings** > **Credentials** > **New**
2. Select **HTTP Header Auth**
3. Enter:
   - Name: `Ghost Admin API Key`
   - Header Name: `Authorization`
   - Value: `Ghost your_ghost_admin_api_key_here`
4. Save

### 3. Set Environment Variables

In n8n settings or Kubernetes ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: n8n-env
  namespace: automation
data:
  DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/your_webhook_url"
  GHOST_API_URL: "https://your-ghost-instance.com"
```

Apply ConfigMap:

```bash
kubectl apply -f n8n-env-configmap.yaml

# Restart n8n to load new env vars
kubectl rollout restart deployment/n8n -n automation
```

### 4. Import Workflows

For each workflow file (01 through 06):

1. Go to **Workflows** in n8n
2. Click **Import from File**
3. Select workflow JSON file
4. Workflow will be imported in **inactive** state
5. Review webhook URLs generated
6. Click **Save**

### 5. Verify Credentials Mapping

For each imported workflow:

1. Open workflow
2. Click on nodes that require credentials (Postgres, Resend, Ghost)
3. Ensure correct credential is selected from dropdown
4. If credential ID doesn't match, manually select the correct one
5. Save workflow

### 6. Activate Workflows

Once all credentials are configured:

1. Open each workflow
2. Toggle **Active** switch to ON
3. Copy webhook URLs for integration

**Webhook URLs to copy:**

- Workflow 01: `https://n8n.yourdomain.com/webhook/hds-lead-capture`
- Workflow 02: `https://n8n.yourdomain.com/webhook/generate-proposal`
- Workflow 03: `https://n8n.yourdomain.com/webhook/check-duplicate`
- Workflow 04: No webhook (scheduled)
- Workflow 05: `https://n8n.yourdomain.com/webhook/ghost-publish`
- Workflow 06: `https://n8n.yourdomain.com/webhook/lead-magnet-capture`

---

## Next.js Integration

### 1. Add Environment Variables

Edit `.env.production`:

```bash
# n8n Webhook URLs
N8N_LEAD_CAPTURE_WEBHOOK=https://n8n.yourdomain.com/webhook/hds-lead-capture
N8N_DUPLICATE_CHECK_WEBHOOK=https://n8n.yourdomain.com/webhook/check-duplicate
N8N_LEAD_MAGNET_WEBHOOK=https://n8n.yourdomain.com/webhook/lead-magnet-capture
N8N_PROPOSAL_GENERATOR_WEBHOOK=https://n8n.yourdomain.com/webhook/generate-proposal
```

Update `src/env.ts`:

```typescript
export const env = createEnv({
  server: {
    // ... existing vars
    N8N_LEAD_CAPTURE_WEBHOOK: z.string().url(),
    N8N_DUPLICATE_CHECK_WEBHOOK: z.string().url(),
    N8N_LEAD_MAGNET_WEBHOOK: z.string().url(),
    N8N_PROPOSAL_GENERATOR_WEBHOOK: z.string().url(),
  },
  runtimeEnv: {
    // ... existing mappings
    N8N_LEAD_CAPTURE_WEBHOOK: process.env.N8N_LEAD_CAPTURE_WEBHOOK,
    N8N_DUPLICATE_CHECK_WEBHOOK: process.env.N8N_DUPLICATE_CHECK_WEBHOOK,
    N8N_LEAD_MAGNET_WEBHOOK: process.env.N8N_LEAD_MAGNET_WEBHOOK,
    N8N_PROPOSAL_GENERATOR_WEBHOOK: process.env.N8N_PROPOSAL_GENERATOR_WEBHOOK,
  },
});
```

### 2. Update Contact Form API Route

Edit `src/app/api/contact/route.ts`:

```typescript
import { env } from '@/env';

// ... existing validation code ...

// After successful validation, send to n8n
try {
  const n8nResponse = await fetch(env.N8N_LEAD_CAPTURE_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      company: validatedData.company,
      phone: validatedData.phone,
      message: validatedData.message,
      budget: validatedData.budget,
      timeline: validatedData.timeline,
      source: 'website-contact-form',
    }),
  });

  if (!n8nResponse.ok) {
    logger.error('n8n workflow failed', {
      status: n8nResponse.status,
      statusText: n8nResponse.statusText,
    });
  }

  const result = await n8nResponse.json();
  logger.info('Lead captured in n8n', { leadId: result.leadId });
} catch (error) {
  logger.error('Failed to send lead to n8n', error as Error);
  // Don't fail the request if n8n is down
}
```

### 3. Add Duplicate Check (Optional)

Before capturing lead, check for duplicates:

```typescript
// Check for duplicates before creating lead
const duplicateCheckResponse = await fetch(env.N8N_DUPLICATE_CHECK_WEBHOOK, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: validatedData.email,
    firstName: validatedData.firstName,
    lastName: validatedData.lastName,
    company: validatedData.company,
    message: validatedData.message,
  }),
});

const duplicateResult = await duplicateCheckResponse.json();
if (duplicateResult.duplicates?.length > 0) {
  logger.warn('Potential duplicate lead detected', {
    email: validatedData.email,
    duplicateCount: duplicateResult.duplicates.length,
  });
  // Decide whether to proceed or show warning to user
}
```

### 4. Update Lead Magnet Route

Edit `src/app/api/lead-magnet/route.ts`:

```typescript
import { env } from '@/env';

// ... existing validation code ...

// Send to n8n lead magnet workflow
const n8nResponse = await fetch(env.N8N_LEAD_MAGNET_WEBHOOK, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: validatedData.email,
    firstName: validatedData.firstName,
    lastName: validatedData.lastName,
    leadMagnet: validatedData.resourceType || 'paystub-generator',
    source: 'website-tool',
  }),
});

const result = await n8nResponse.json();
logger.info('Lead magnet capture sent to n8n', { leadId: result.leadId });
```

### 5. Configure Ghost Webhook

In your Ghost Admin Panel:

1. Go to **Settings** > **Integrations**
2. Click **+ Add custom integration**
3. Name: `n8n SEO Optimizer`
4. Add webhook:
   - Event: **Post published**
   - URL: `https://n8n.yourdomain.com/webhook/ghost-publish`
5. Save integration

### 6. Rebuild and Deploy

```bash
# Build Next.js app
npm run build

# Deploy to Vercel or your hosting
vercel --prod

# Or rebuild Docker image for Kubernetes
docker build -t hds-website:latest .
kubectl rollout restart deployment/hds-website
```

---

## Testing & Validation

### 1. Test Contact Form Lead Capture

```bash
curl -X POST https://n8n.yourdomain.com/webhook/hds-lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "company": "Test Corp",
    "phone": "555-0123",
    "message": "We need a custom e-commerce platform with inventory management. Budget around $50k, need it in 3 months.",
    "budget": "high_15k_50k",
    "timeline": "3_months",
    "source": "website-contact-form"
  }'
```

**Expected Results:**

1. JSON response with `leadId`
2. Lead inserted in PostgreSQL `leads` table
3. AI qualification score calculated
4. Embedding stored in Qdrant `leads` collection
5. If score >= 75: Discord notification sent
6. Welcome email sent via Resend

**Verification:**

```bash
# Check PostgreSQL
psql -h your-host -U postgres -c "SELECT * FROM leads WHERE email = 'test@example.com';"

# Check Qdrant
curl -X POST http://qdrant-service.ai-stack:6333/collections/leads/points/scroll \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'

# Check Discord for notification
# Check email inbox for welcome email
```

### 2. Test Duplicate Detection

```bash
# First, create a lead
curl -X POST https://n8n.yourdomain.com/webhook/hds-lead-capture \
  -H "Content-Type: application/json" \
  -d '{"email": "duplicate@example.com", "message": "Need web development", ...}'

# Wait 10 seconds for processing

# Then check for duplicate
curl -X POST https://n8n.yourdomain.com/webhook/check-duplicate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "duplicate@example.com",
    "message": "Need website development"
  }'
```

**Expected Results:**

- Returns array of similar leads with similarity scores
- Discord notification if duplicates found with > 85% similarity

### 3. Test Lead Magnet Capture

```bash
curl -X POST https://n8n.yourdomain.com/webhook/lead-magnet-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "leadmagnet@example.com",
    "firstName": "Lead",
    "lastName": "Magnet",
    "leadMagnet": "paystub-generator",
    "source": "website-tool"
  }'
```

**Expected Results:**

1. Lead upserted in PostgreSQL
2. Embedding stored in Qdrant
3. Personalized email sent with paystub generator nurture sequence
4. Discord notification sent

### 4. Test Proposal Generator

```bash
# First, get a lead_id from database
psql -h your-host -U postgres -c "SELECT id FROM leads LIMIT 1;"

# Then generate proposal
curl -X POST https://n8n.yourdomain.com/webhook/generate-proposal \
  -H "Content-Type: application/json" \
  -d '{"lead_id": 1}'
```

**Expected Results:**

1. Lead data fetched from PostgreSQL
2. Similar projects retrieved from Qdrant
3. AI generates custom proposal
4. Proposal converted to PDF by Stirling-PDF
5. Email sent with PDF attachment
6. Lead status updated to 'proposal_sent'
7. Discord notification sent

### 5. Test Ghost SEO Workflow

1. Publish a new blog post in Ghost
2. Webhook should trigger automatically
3. Check n8n execution logs
4. Verify Discord notification received with SEO report

### 6. Verify Weekly Re-scoring

```bash
# Manually trigger the workflow
# In n8n dashboard: Open workflow 04 > Click "Execute Workflow"

# Or wait until Sunday 9 AM for automatic execution
```

---

## Monitoring & Troubleshooting

### 1. Check n8n Execution Logs

```bash
# Access n8n dashboard
# Go to: Executions tab
# Filter by workflow name
# Review success/failure status
# Click on execution to see detailed logs
```

### 2. Check PostgreSQL Logs

```bash
# View PostgreSQL logs
kubectl logs -n database -l app=postgresql --tail=100

# Check for connection errors or query failures
```

### 3. Check Qdrant Logs

```bash
# View Qdrant logs
kubectl logs -n ai-stack -l app=qdrant --tail=100

# Check for vector insertion errors
```

### 4. Check Ollama Logs

```bash
# View Ollama logs
kubectl logs -n ai-stack -l app=ollama --tail=100

# Check for model loading or inference errors
```

### 5. Common Issues and Solutions

#### Issue: n8n workflow execution timeout

**Symptoms:** Workflow fails with timeout error after 60 seconds

**Solution:**
1. Open workflow in n8n
2. Click on AI/Ollama nodes
3. Increase timeout to 90000ms (90 seconds)
4. Save workflow

#### Issue: PostgreSQL connection refused

**Symptoms:** "connection refused" or "ECONNREFUSED" errors

**Solution:**
1. Verify PostgreSQL is running: `kubectl get pods -n database`
2. Check credentials in n8n
3. Test connection with psql
4. Check network policies in Kubernetes

#### Issue: Qdrant vector search returns no results

**Symptoms:** Duplicate detection or similar project search returns empty

**Solution:**
1. Verify vectors were inserted: `curl http://qdrant-service:6333/collections/leads`
2. Check vector dimensions match (768 for Qwen3-VL-4B)
3. Lower similarity threshold from 0.85 to 0.70
4. Re-run Qdrant setup script

#### Issue: Resend email not delivered

**Symptoms:** Workflow succeeds but email not received

**Solution:**
1. Check Resend dashboard for delivery status
2. Verify API key is correct
3. Check email address is valid
4. Check spam folder
5. Verify Resend domain is verified

#### Issue: Discord webhook 404 error

**Symptoms:** Discord notification fails with 404

**Solution:**
1. Regenerate Discord webhook URL in server settings
2. Update `DISCORD_WEBHOOK_URL` environment variable in n8n
3. Restart n8n: `kubectl rollout restart deployment/n8n -n automation`

### 6. Performance Monitoring

Monitor key metrics:

```sql
-- Average lead qualification score
SELECT AVG(qualification_score) as avg_score FROM leads;

-- Lead conversion funnel
SELECT status, COUNT(*) as count FROM leads GROUP BY status;

-- High-value leads (75+)
SELECT COUNT(*) as hot_leads FROM leads WHERE qualification_score >= 75;

-- Proposal conversion rate
SELECT
  COUNT(CASE WHEN proposal_sent_at IS NOT NULL THEN 1 END) as proposals_sent,
  COUNT(CASE WHEN status = 'won' THEN 1 END) as won_deals,
  ROUND(100.0 * COUNT(CASE WHEN status = 'won' THEN 1 END) /
    NULLIF(COUNT(CASE WHEN proposal_sent_at IS NOT NULL THEN 1 END), 0), 2) as conversion_rate
FROM leads;
```

### 7. Backup and Disaster Recovery

#### Backup PostgreSQL

```bash
# Dump database
kubectl exec -n database $(kubectl get pod -n database -l app=postgresql -o jsonpath='{.items[0].metadata.name}') -- \
  pg_dump -U postgres postgres > backup-$(date +%Y%m%d).sql

# Restore database
kubectl exec -i -n database $(kubectl get pod -n database -l app=postgresql -o jsonpath='{.items[0].metadata.name}') -- \
  psql -U postgres postgres < backup-20250109.sql
```

#### Backup Qdrant

```bash
# Create Qdrant snapshot
curl -X POST http://qdrant-service.ai-stack:6333/collections/leads/snapshots

# Download snapshot
curl -X GET http://qdrant-service.ai-stack:6333/collections/leads/snapshots/{snapshot_name} \
  -o qdrant-leads-backup.snapshot
```

#### Export n8n Workflows

```bash
# In n8n dashboard:
# 1. Open each workflow
# 2. Click "..." menu > Download
# 3. Save JSON files to safe location
# 4. Commit to git repository
```

---

## Next Steps

1. ✅ Complete infrastructure setup
2. ✅ Import and activate n8n workflows
3. ✅ Integrate with Next.js application
4. ✅ Test all workflows end-to-end
5. ⏭️ Monitor execution logs for 48 hours
6. ⏭️ Refine AI prompts based on results
7. ⏭️ Adjust email templates based on engagement
8. ⏭️ Scale gradually with real production traffic

---

## Support

For issues or questions:

- Review workflow execution logs in n8n
- Check application logs in Next.js
- Verify all services are running in Kubernetes
- Test API endpoints with curl
- Review Discord notifications for errors

---

## Additional Resources

- **n8n Documentation:** https://docs.n8n.io
- **Qdrant Documentation:** https://qdrant.tech/documentation
- **Ollama Documentation:** https://ollama.ai/docs
- **Resend Documentation:** https://resend.com/docs
- **Supabase Documentation:** https://supabase.com/docs
- **Next.js Documentation:** https://nextjs.org/docs

---

**Version:** 1.0.0
**Last Updated:** 2025-11-09
**Created for:** Hudson Digital Solutions
