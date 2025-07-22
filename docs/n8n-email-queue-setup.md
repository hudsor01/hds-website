# n8n Email Queue Integration Setup

This document explains how to set up the n8n email queue system for automated email sequences.

## Overview

The email queue integration provides:
- Intelligent email sequence selection based on form data
- Reliable email delivery with queue management
- Automatic retry mechanisms for failed emails
- Graceful fallback to direct Resend integration

## Architecture

1. **Contact form submission** → triggers webhook to n8n
2. **n8n processes** → email queue and sequences
3. **Fallback mechanism** → direct Resend if n8n unavailable

## n8n Workflows Required

### 1. Email Queue Processor Workflow

**Webhook URL**: `https://your-n8n-instance.com/webhook/email-queue`

**Payload Structure**:
```json
{
  "action": "send" | "schedule" | "sequence",
  "email": {
    "to": "recipient@example.com",
    "from": "Hudson Digital <noreply@hudsondigitalsolutions.com>",
    "subject": "Email Subject",
    "html": "<html>Email content</html>",
    "priority": "high" | "normal" | "low",
    "metadata": {
      "source": "contact-form",
      "formId": "main-contact",
      "sequenceId": "high-value-consultation"
    }
  },
  "sequence": {
    "name": "high-value-consultation",
    "recipientEmail": "recipient@example.com",
    "data": {
      "firstName": "John",
      "lastName": "Doe",
      "company": "Acme Corp"
    }
  }
}
```

**Workflow Logic**:
1. **Webhook Trigger** receives payload
2. **Switch Node** routes based on `action` field
3. **Email Send Branch** processes immediate emails
4. **Schedule Branch** adds delays and schedules future emails
5. **Sequence Branch** triggers multi-step email sequences

### 2. Email Sequence Workflows

Create separate workflows for each sequence type:

#### Standard Welcome Sequence (`standard-welcome`)
- Email 1: Immediate welcome email
- Email 2: Value proposition (3 days later)
- Email 3: Case studies (7 days later)
- Email 4: Free audit offer (14 days later)

#### High-Value Consultation (`high-value-consultation`)
- Email 1: Priority response (immediate)
- Email 2: Enterprise proposal (1 day later)
- Email 3: Exclusive offer (3 days later)

#### Targeted Service Consultation (`targeted-service-consultation`)
- Email 1: Service-specific followup (immediate)
- Email 2: Targeted proposal (2 days later)
- Email 3: Service-specific offer (5 days later)

#### Enterprise Nurture (`enterprise-nurture`)
- Email 1: Best practices (7 days later)
- Email 2: Infrastructure scaling (21 days later)
- Email 3: ROI analysis (45 days later)

## Environment Variables

Add these to your environment:

```bash
# n8n Integration (Optional - for email queue)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/email-queue
N8N_API_KEY=your_n8n_webhook_api_key
```

## n8n Workflow Setup Instructions

### Step 1: Create Email Queue Webhook

1. Create new workflow in n8n
2. Add **Webhook** node:
   - Method: POST
   - Path: `email-queue`
   - Response: JSON
3. Add **Switch** node with conditions:
   - `{{ $json.action === "send" }}`
   - `{{ $json.action === "schedule" }}`
   - `{{ $json.action === "sequence" }}`

### Step 2: Configure Email Sending

1. Add **Resend** node (or your preferred email service)
2. Configure with your API key
3. Map fields from webhook payload:
   - To: `{{ $json.email.to }}`
   - From: `{{ $json.email.from }}`
   - Subject: `{{ $json.email.subject }}`
   - HTML: `{{ $json.email.html }}`

### Step 3: Add Queue Management

1. Add **Database** node to store queued emails
2. Add **Wait** node for scheduling delays
3. Add **Error Handling** with retry logic
4. Add **Webhook Response** node with success/failure status

### Step 4: Create Sequence Workflows

For each email sequence:

1. Create new workflow with webhook trigger
2. Add delay nodes between emails
3. Map template data from webhook payload
4. Include conditional logic for personalization

### Step 5: Testing

Use the test endpoint to verify integration:

```bash
# Test immediate email
curl -X POST https://your-n8n-instance.com/webhook/email-queue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "action": "send",
    "email": {
      "to": "test@example.com",
      "subject": "Test Email",
      "html": "<p>Test message</p>"
    }
  }'

# Test email sequence
curl -X POST https://your-n8n-instance.com/webhook/email-queue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "action": "sequence",
    "sequence": {
      "name": "standard-welcome",
      "recipientEmail": "test@example.com",
      "data": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  }'
```

## Monitoring & Debugging

### Logs to Monitor

1. **Application logs** for n8n connection status
2. **n8n execution logs** for workflow errors
3. **Email delivery status** from your email provider
4. **Fallback triggers** when n8n is unavailable

### Common Issues

1. **Webhook timeout**: Increase timeout in n8n settings
2. **Rate limiting**: Add delays between email sends
3. **Authentication errors**: Verify API keys are correct
4. **Template rendering**: Check for undefined variables

## Benefits

1. **Reliability**: Queue ensures emails aren't lost
2. **Scalability**: n8n handles high volume email processing
3. **Flexibility**: Easy to modify sequences without code changes
4. **Monitoring**: Visual workflow monitoring in n8n
5. **Fallback**: Graceful degradation to Resend if needed

## Security Considerations

1. Use HTTPS for all webhook URLs
2. Implement API key authentication
3. Validate webhook payloads
4. Rate limit webhook endpoints
5. Monitor for suspicious activity

## Next Steps

1. Set up n8n instance (cloud or self-hosted)
2. Create the workflows as described above
3. Configure environment variables
4. Test the integration thoroughly
5. Monitor email delivery and sequence performance

For support with n8n setup, contact the development team or refer to the [n8n documentation](https://docs.n8n.io/).