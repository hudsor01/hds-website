/**
 * Cal.com Webhook Handler
 * 
 * Handles Cal.com booking events and syncs them to Supabase
 * Supports all major Cal.com webhook event types
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { calSupabase } from '@/lib/integrations/cal-supabase-wrapper'

// Webhook signature verification (if Cal.com provides it)
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!signature || !secret) return true // Skip if no signature provided
  
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(payload)
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify'],
    )
    
    const expectedSignature = await crypto.subtle.sign('HMAC', key, data)
    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    return signature === expectedHex
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get headers
    const headersList = headers()
    const signature = headersList.get('x-cal-signature') || headersList.get('x-webhook-signature')
    const eventType = headersList.get('x-cal-event-type')
    
    // Get raw body for signature verification
    const body = await request.text()
    
    // Verify webhook signature if configured
    const webhookSecret = process.env.CAL_COM_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const isValid = await verifyWebhookSignature(body, signature, webhookSecret)
      if (!isValid) {
        console.error('Invalid webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 },
        )
      }
    }

    // Parse the event data
    let eventData
    try {
      eventData = JSON.parse(body)
    } catch (error) {
      console.error('Invalid JSON in webhook payload:', error)
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 },
      )
    }

    // Log the incoming webhook for debugging
    console.log('Cal.com webhook received:', {
      type: eventType || eventData.type,
      timestamp: new Date().toISOString(),
      bookingId: eventData.data?.id || eventData.id,
    })

    // Handle the webhook event
    const result = await calSupabase.handleWebhook(eventData)

    if (!result.success) {
      console.error('Error processing webhook:', result.error)
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 500 },
      )
    }

    // Additional processing based on event type
    const event = eventData.type || eventType
    await handleEventSideEffects(event, eventData.data || eventData)

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully', 
    })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// Handle side effects for different event types
async function handleEventSideEffects(eventType: string, bookingData: any) {
  try {
    switch (eventType) {
      case 'BOOKING_CREATED':
        await handleBookingCreated(bookingData)
        break

      case 'BOOKING_RESCHEDULED':
        await handleBookingRescheduled(bookingData)
        break

      case 'BOOKING_CANCELLED':
        await handleBookingCancelled(bookingData)
        break

      case 'BOOKING_PAID':
        await handleBookingPaid(bookingData)
        break

      case 'BOOKING_REQUESTED':
        await handleBookingRequested(bookingData)
        break

      default:
        console.log(`No side effects handler for event type: ${eventType}`)
    }
  } catch (error) {
    console.error(`Error handling side effects for ${eventType}:`, error)
    // Don't throw here - we don't want to fail the webhook response
  }
}

// Side effect handlers
async function handleBookingCreated(bookingData: any) {
  console.log('New booking created:', bookingData.id)
  
  // Here you could:
  // - Send confirmation email
  // - Create calendar events
  // - Update CRM
  // - Send notifications to team
  // - Track analytics
  
  // Example: Send notification to admin
  // await sendAdminNotification('New booking created', bookingData)
}

async function handleBookingRescheduled(bookingData: any) {
  console.log('Booking rescheduled:', bookingData.id)
  
  // Here you could:
  // - Send rescheduling confirmation
  // - Update calendar events
  // - Notify team of changes
}

async function handleBookingCancelled(bookingData: any) {
  console.log('Booking cancelled:', bookingData.id)
  
  // Here you could:
  // - Send cancellation confirmation
  // - Free up calendar slots
  // - Update analytics
  // - Process refunds if applicable
}

async function handleBookingPaid(bookingData: any) {
  console.log('Booking payment received:', bookingData.id)
  
  // Here you could:
  // - Send payment confirmation
  // - Update booking status
  // - Trigger fulfillment processes
  // - Update financial records
}

async function handleBookingRequested(bookingData: any) {
  console.log('Booking requested (pending approval):', bookingData.id)
  
  // Here you could:
  // - Send approval request to admin
  // - Create pending calendar placeholder
  // - Send confirmation to attendee
}

// GET endpoint for webhook verification (some services require this)
export async function GET() {
  return NextResponse.json({ 
    message: 'Cal.com webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}

// Webhook configuration instructions
export const metadata = {
  description: `
Cal.com Webhook Configuration:

1. Go to your Cal.com settings
2. Navigate to Webhooks section  
3. Add new webhook with URL: ${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/cal
4. Select events: BOOKING_CREATED, BOOKING_RESCHEDULED, BOOKING_CANCELLED, BOOKING_PAID
5. Optional: Set webhook secret in CAL_COM_WEBHOOK_SECRET environment variable
6. Test the webhook to ensure it's working

Supported Events:
- BOOKING_CREATED: New booking confirmed
- BOOKING_RESCHEDULED: Booking time changed
- BOOKING_CANCELLED: Booking cancelled by attendee or organizer
- BOOKING_PAID: Payment received for booking
- BOOKING_REQUESTED: Booking pending approval
`,
}