# Resend Email Setup

This guide covers the setup and configuration of Resend for email functionality in Hudson Digital Solutions.

## Features

- Contact form email notifications
- Newsletter welcome emails
- Lead magnet delivery
- Administrative notifications

## Setup Instructions

### 1. Create Resend Account

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain in the Resend dashboard
3. Create an API key

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Resend API Configuration
RESEND_API_KEY=your-resend-api-key

# Email addresses
RESEND_FROM_EMAIL=noreply@yourdomain.com
CONTACT_EMAIL=hello@yourdomain.com
```

### 3. Domain Verification

1. Log into Resend dashboard
2. Go to Domains section
3. Add your domain
4. Add the provided DNS records (SPF, DKIM, DMARC)
5. Wait for verification (usually within minutes)

## API Usage

### Contact Form (/api/contact)

Handles contact form submissions and sends email notifications:

```typescript
await resend.emails.send({
  from: process.env.RESEND_FROM_EMAIL,
  to: process.env.CONTACT_EMAIL,
  replyTo: formData.email,
  subject: `New Contact Form: ${formData.service}`,
  html: emailHtml,
})
```

### Newsletter Subscription (/api/newsletter)

Sends welcome emails to new subscribers:

```typescript
await sendEmail({
  from: process.env.RESEND_FROM_EMAIL,
  to: email,
  subject: 'Welcome to Hudson Digital Solutions Newsletter',
  html: welcomeHtml,
})
```

### Lead Magnet Download (/api/lead-magnet)

Delivers resource links and notifications:

```typescript
await sendEmail({
  from: process.env.RESEND_FROM_EMAIL,
  to: email,
  subject: `Your Resource: ${resource.title}`,
  html: emailHtml,
})
```

## Email Module (/lib/email/resend.ts)

The centralized email sending module provides:

- Type-safe email payload validation
- Structured error handling
- Default sender configuration
- Attachment support

### Usage Example

```typescript
import { sendEmail } from '@/lib/email/resend'

const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Test Email',
  html: '<p>Hello from Resend!</p>',
  // Optional fields
  from: 'custom@yourdomain.com',
  replyTo: 'reply@yourdomain.com',
  attachments: [{
    filename: 'document.pdf',
    content: base64Content,
  }]
})

if (result.success) {
  console.log('Email sent successfully')
} else {
  console.error('Email failed:', result.error)
}
```

## Monitoring and Logs

1. View email activity in Resend dashboard
2. Monitor delivery status and open rates
3. Debug failed emails with detailed error logs
4. Set up webhooks for delivery notifications (optional)

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Verify API key is correct
   - Check domain verification status
   - Ensure sender email matches verified domain

2. **Emails going to spam**
   - Complete SPF, DKIM, and DMARC setup
   - Use appropriate subject lines
   - Include unsubscribe links in marketing emails

3. **Rate limits**
   - Free tier: 3,000 emails/month, 100/day
   - Monitor usage in Resend dashboard
   - Implement rate limiting if needed

### Error Handling

The email module returns structured errors:

```typescript
{
  success: false,
  error: 'Failed to send email',
  details: 'Detailed error message'
}
```

## Production Considerations

1. **Email Templates**: Consider using React Email or MJML for consistent templates
2. **Error Recovery**: Implement retry logic for transient failures
3. **Monitoring**: Set up alerts for delivery failures
4. **Testing**: Use Resend's test mode for development

## Migration from SendGrid

If migrating from SendGrid:

1. Update all API routes to use new Resend module
2. Update environment variables
3. Migrate any marketing lists to new platform
4. Update deployment configurations

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Node.js SDK](https://github.com/resendlabs/resend-node)
- [React Email Templates](https://react.email)
- [Email Best Practices](https://resend.com/docs/knowledge-base/best-practices)