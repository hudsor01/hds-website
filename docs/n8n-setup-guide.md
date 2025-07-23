# n8n Setup Guide for n8n.thehudsonfam.com

## Quick Setup Steps

### 1. Import Main Workflow

1. Go to https://n8n.thehudsonfam.com
2. Click **"+"** → **"Import from File"**
3. Upload `docs/n8n-workflow-template.json`
4. The main email queue handler will be created

### 2. Configure Resend Credentials

1. In n8n, go to **Settings** → **Credentials**
2. Click **"+ Add Credential"**
3. Search for **"Resend"** 
4. Add your Resend API key: `re_your_resend_api_key_here`
5. Name it: `Resend API`

### 3. Test the Main Webhook

The main webhook will be available at:
```
https://n8n.thehudsonfam.com/webhook/email-queue
```

Test it with curl:
```bash
curl -X POST https://n8n.thehudsonfam.com/webhook/email-queue \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send",
    "email": {
      "to": "test@example.com",
      "subject": "Test Email",
      "html": "<p>Hello from n8n!</p>"
    }
  }'
```

### 4. Create Sequence Workflows (Optional)

For advanced email sequences, create separate workflows:

**Standard Welcome Sequence:**
- Webhook path: `/webhook/email-sequence/standard-welcome`
- 4 emails over 14 days

**High-Value Consultation:**
- Webhook path: `/webhook/email-sequence/high-value-consultation` 
- 3 emails over 3 days (priority)

**Targeted Service:**
- Webhook path: `/webhook/email-sequence/targeted-service-consultation`
- 3 emails over 5 days

**Enterprise Nurture:**
- Webhook path: `/webhook/email-sequence/enterprise-nurture`
- 3 emails over 45 days

### 5. Update Your Environment Variables

Add to your `.env.local`:
```bash
N8N_WEBHOOK_URL=https://n8n.thehudsonfam.com/webhook/email-queue
N8N_API_KEY=optional_webhook_auth_key
```

### 6. Test Integration

Start your dev server:
```bash
npm run dev
```

Submit a contact form at: http://localhost:3000/contact

Check n8n execution logs to see if emails are being processed.

## Workflow Configuration Details

### Main Workflow: "Hudson Digital - Email Queue Handler"

**Nodes:**
1. **Webhook Trigger** - Receives contact form submissions
2. **Switch Node** - Routes based on action (send/schedule/sequence)
3. **Resend Node** - Sends emails via Resend API
4. **Wait Node** - Handles scheduled emails
5. **HTTP Request** - Triggers sequence workflows
6. **Response Nodes** - Returns success/error status

### Webhook Payload Format

```json
{
  "action": "send|schedule|sequence",
  "email": {
    "to": "recipient@example.com",
    "from": "Hudson Digital <noreply@hudsondigitalsolutions.com>",
    "subject": "Email Subject",
    "html": "<html>Email content</html>",
    "priority": "high|normal|low"
  },
  "sequence": {
    "name": "standard-welcome",
    "recipientEmail": "recipient@example.com", 
    "data": {
      "firstName": "John",
      "lastName": "Doe",
      "company": "Acme Corp"
    }
  }
}
```

## Monitoring & Debugging

### Check Workflow Executions
1. Go to **Executions** tab in n8n
2. Filter by workflow name
3. Click on executions to see detailed logs

### Common Issues
- **401 Unauthorized**: Check Resend API key
- **Webhook not found**: Ensure workflow is active
- **Template errors**: Check HTML template syntax

### Success Indicators
- ✅ Webhook receives payload
- ✅ Email sends via Resend
- ✅ Response returns success: true
- ✅ Admin notification received
- ✅ Client welcome email sent

## Next Steps

1. Import and test the main workflow
2. Configure Resend credentials  
3. Test with a real contact form submission
4. Monitor execution logs
5. Optionally create sequence workflows for advanced automation

The integration will gracefully fall back to direct Resend if n8n is unavailable, ensuring reliable email delivery.