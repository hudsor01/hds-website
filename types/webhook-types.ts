/**
 * Cal.com Webhook TypeScript definitions
 * Based on official Cal.com webhook documentation
 */

export type CalWebhookTriggerEvent = 
  | 'BOOKING_CREATED'
  | 'BOOKING_CANCELLED' 
  | 'BOOKING_RESCHEDULED'
  | 'MEETING_STARTED'
  | 'MEETING_ENDED'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_COMPLETED'
  | 'FORM_SUBMITTED'

export interface CalWebhookPayload {
  triggerEvent: CalWebhookTriggerEvent
  createdAt: string
  payload: {
    // Booking details
    id?: number
    uid?: string
    title?: string
    description?: string
    startTime?: string
    endTime?: string
    status?: 'ACCEPTED' | 'PENDING' | 'CANCELLED'
    
    // Attendee information
    attendees?: Array<{
      email: string
      name: string
      timeZone: string
    }>
    
    // Organizer information
    organizer?: {
      email: string
      name: string
      timeZone: string
    }
    
    // Event type details
    eventType?: {
      id: number
      title: string
      slug: string
      length: number
    }
    
    // Payment information (if applicable)
    payment?: {
      id: string
      amount: number
      currency: string
      status: string
    }
    
    // Additional metadata
    metadata?: Record<string, unknown>
    responses?: Record<string, unknown>
  }
}

export interface CalWebhookRequest {
  headers: {
    'x-cal-signature'?: string
    'content-type': string
  }
  body: CalWebhookPayload
}

export interface CalWebhookResponse {
  success: boolean
  message?: string
  error?: string
}

export interface WebhookConfig {
  secret?: string
  enabled: boolean
  url: string
  events: CalWebhookTriggerEvent[]
}

export interface WebhookVerificationResult {
  valid: boolean
  error?: string
}