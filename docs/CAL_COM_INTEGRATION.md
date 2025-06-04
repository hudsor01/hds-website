# Cal.com Integration - Complete Implementation Guide

## Overview

Hudson Digital Solutions now features a **complete, production-ready Cal.com integration** that includes:

- ✅ **Enhanced Embed Widgets** with full event handling
- ✅ **Webhook Automation** for booking lifecycle management  
- ✅ **Email Sequence Integration** for automated follow-ups
- ✅ **CRM Lead Tracking** for business automation
- ✅ **TypeScript Safety** with comprehensive type definitions
- ✅ **Error Handling & Recovery** for reliable operation
- ✅ **Security** with webhook signature verification

## Features Implemented

### 1. Enhanced Cal.com Embed Widget

**Location**: `/components/booking/cal-com-widget.tsx`

**Features**:
- Complete embed event handling (eventTypeSelected, bookingSuccessful, linkReady, etc.)
- Loading states and error recovery
- Proper TypeScript types and accessibility
- Responsive design with error fallbacks

**Usage**:
```tsx
import { CalComWidget, ConsultationBooking } from '@/components/booking/cal-com-widget'

// Basic widget
<CalComWidget 
  calLink="your-username/consultation"
  onBookingSuccessful={(event) => {
    // Handle successful booking
    console.log('Booking created:', event.detail.data)
  }}
/>

// Complete consultation interface  
<ConsultationBooking />
```

### 2. Webhook Automation System

**Location**: `/app/api/webhooks/cal/route.ts`

**Features**:
- Secure webhook signature verification (HMAC SHA256)
- Complete booking lifecycle handling (created, cancelled, rescheduled)
- Email automation triggers
- CRM integration hooks
- Comprehensive error handling and logging

**Supported Events**:
- `BOOKING_CREATED` → Confirmation emails + lead tracking
- `BOOKING_CANCELLED` → Cancellation emails + re-engagement sequences
- `BOOKING_RESCHEDULED` → Reschedule confirmations + admin notifications
- `MEETING_STARTED/ENDED` → Analytics tracking
- `PAYMENT_INITIATED/COMPLETED` → Payment processing
- `FORM_SUBMITTED` → Custom form handling

### 3. Business Logic Integration

**Location**: `/lib/integrations/cal-webhook.ts`

**Integrations**:
- **Email Automation**: Connects with existing Resend email system
- **Lead Tracking**: Adds bookings to CRM/lead scoring system  
- **Email Sequences**: Triggers consultation follow-up sequences
- **Admin Notifications**: Real-time booking alerts
- **Analytics**: Conversion and booking tracking

## Setup Instructions

### Step 1: Environment Configuration

Add to your `.env.local`:

```bash
# Basic Cal.com configuration
NEXT_PUBLIC_CAL_LINK=your-username/consultation

# Webhook security (recommended for production)
CAL_WEBHOOK_SECRET=your-webhook-secret-for-signature-verification
```

### Step 2: Cal.com Webhook Setup

1. Go to [Cal.com Settings → Webhooks](https://app.cal.com/settings/webhooks)
2. Add new webhook:
   - **URL**: `https://yourdomain.com/api/webhooks/cal`
   - **Events**: Select `BOOKING_CREATED`, `BOOKING_CANCELLED`, `BOOKING_RESCHEDULED`
   - **Secret**: Set a strong secret and add to `CAL_WEBHOOK_SECRET`
3. Test the webhook to ensure it's working

### Step 3: Verify Installation

Test your webhook endpoint:
```bash
curl https://yourdomain.com/api/webhooks/cal
```

Expected response:
```json
{
  "status": "healthy",
  "service": "cal-webhook-enhanced", 
  "version": "2.0",
  "features": ["Enhanced signature verification", "Complete business logic integration", ...]
}
```

## Integration Examples

### Basic Booking Widget

```tsx
import { CalComWidget } from '@/components/booking/cal-com-widget'

export function BookingPage() {
  return (
    <CalComWidget
      calLink="your-username/consultation"
      theme="light"
      onBookingSuccessful={(event) => {
        // Redirect to thank you page
        router.push('/booking/success')
      }}
      onEventTypeSelected={(event) => {
        // Track analytics
        analytics.track('Cal.com Event Type Selected', {
          eventType: event.detail.data.eventType
        })
      }}
    />
  )
}
```

### Complete Consultation Flow

```tsx
import { ConsultationBooking } from '@/components/booking/cal-com-widget'

export function ConsultationPage() {
  return (
    <div className="container mx-auto py-12">
      <ConsultationBooking />
    </div>
  )
}
```

### Custom Event Handling

```tsx
<CalComWidget
  calLink="your-username/consultation"
  onAllEvents={(event) => {
    // Send all Cal.com events to analytics
    analytics.track('Cal.com Event', {
      type: event.detail.type,
      data: event.detail.data,
      namespace: event.detail.namespace
    })
  }}
  onBookingSuccessful={(event) => {
    // Custom success handling
    const bookingData = event.detail.data
    
    // Track conversion
    analytics.track('Consultation Booked', {
      eventType: bookingData.eventType,
      attendeeEmail: bookingData.attendee?.email
    })
    
    // Show custom success message
    toast.success('Consultation booked successfully!')
    
    // Redirect after delay
    setTimeout(() => router.push('/booking/success'), 2000)
  }}
/>
```

## Webhook Event Processing

When a booking is created, the system automatically:

1. **Validates** webhook signature for security
2. **Stores** booking information (if database integration is enabled)
3. **Sends** confirmation email to client
4. **Notifies** admin of new booking
5. **Adds** lead to CRM/tracking system
6. **Triggers** email sequence for consultation follow-up

### Email Integration Points

The webhook system includes integration hooks for:

```typescript
// Booking confirmation email
await sendBookingConfirmationEmail({
  email: attendee.email,
  name: attendee.name,
  booking: bookingDetails
})

// Admin notification
await sendAdminBookingNotification({
  attendeeName: attendee.name,
  eventType: booking.eventType.title,
  startTime: booking.startTime
})

// Email sequence trigger
await triggerConsultationSequence({
  email: attendee.email,
  consultationDate: booking.startTime
})
```

## Security Features

### Webhook Signature Verification

All webhooks are verified using HMAC SHA256:

```typescript
const verification = verifyWebhookSignature(
  rawPayload, 
  signature, 
  process.env.CAL_WEBHOOK_SECRET
)

if (!verification.valid) {
  return NextResponse.json(
    { error: 'Invalid signature' }, 
    { status: 401 }
  )
}
```

### Error Handling

Comprehensive error handling includes:
- **Payload validation** with Zod schemas
- **Graceful degradation** for failed webhooks
- **Structured logging** for debugging
- **Retry logic** (handled by Cal.com)

## Analytics Integration

Track booking events:

```typescript
// Event type selection
analytics.track('Cal.com Event Type Selected', {
  eventType: event.detail.data.eventType,
  timestamp: new Date()
})

// Successful booking
analytics.track('Consultation Booked', {
  source: 'cal.com',
  eventType: bookingData.eventType,
  value: consultationValue // e.g., $299
})
```

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Verify webhook URL is accessible externally
   - Check Cal.com webhook configuration
   - Review server logs for errors

2. **Signature verification failed**
   - Ensure `CAL_WEBHOOK_SECRET` matches Cal.com configuration
   - Check that secret is properly base64 encoded

3. **Embed widget not loading**
   - Verify `NEXT_PUBLIC_CAL_LINK` is correct
   - Check browser console for script loading errors
   - Ensure Cal.com link is publicly accessible

### Debug Mode

Enable debug logging:

```bash
DEBUG_MODE=true
```

Check webhook health:

```bash
curl https://yourdomain.com/api/webhooks/cal
```

## Migration from Basic Integration

If upgrading from a basic Cal.com integration:

1. **Backup** existing configuration
2. **Update** components to use new `CalComWidget`
3. **Configure** webhook endpoint
4. **Test** booking flow end-to-end
5. **Monitor** webhook logs for proper operation

## Production Considerations

### Required Environment Variables

```bash
# Production webhook security
CAL_WEBHOOK_SECRET=strong-webhook-secret

# Email integration
RESEND_API_KEY=your-resend-key
CONTACT_EMAIL=admin@yourdomain.com

# Basic configuration
NEXT_PUBLIC_CAL_LINK=your-username/consultation
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Performance Optimization

- Cal.com script is loaded asynchronously
- Event listeners are cleaned up automatically
- Webhook processing is non-blocking
- Error recovery prevents booking disruption

## Future Enhancements

Planned improvements:
- [ ] Cal.com Platform integration with `@calcom/atoms`
- [ ] Managed user OAuth authentication
- [ ] Advanced booking flows with custom UI
- [ ] Payment integration with booking fees
- [ ] Multi-calendar support
- [ ] Advanced analytics dashboard

---

**Status**: ✅ **PRODUCTION READY**

This integration provides enterprise-grade Cal.com functionality with complete business automation. All booking events are properly handled, tracked, and integrated with your existing business systems.