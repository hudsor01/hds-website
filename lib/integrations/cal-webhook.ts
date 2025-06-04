/**
 * Cal.com Webhook Integration
 * Handles webhook verification, processing, and business logic integration
 */

import crypto from 'crypto'
import { logger } from '@/lib/logger'
import type { CalWebhookPayload, WebhookVerificationResult } from '@/types/webhook-types'

/**
 * Verify Cal.com webhook payload using HMAC SHA256
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): WebhookVerificationResult {
  try {
    if (!signature || !secret) {
      return { valid: false, error: 'Missing signature or secret' }
    }

    // Cal.com sends signature as: sha256=<hash>
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')}`

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )

    return { valid: isValid }
  } catch (error) {
    logger.error('Webhook signature verification failed', { error })
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

/**
 * Process booking created webhook
 */
export async function processBookingCreated(payload: CalWebhookPayload) {
  const { payload: booking } = payload

  logger.info('Processing booking created', {
    bookingId: booking.id,
    bookingUid: booking.uid,
    eventType: booking.eventType?.title,
    attendeeEmail: booking.attendees?.[0]?.email,
  })

  try {
    // 1. Store booking in database (if using database)
    // await storeBooking(booking)

    // 2. Send confirmation email to client
    if (booking.attendees?.[0]?.email) {
      await sendBookingConfirmationEmail({
        email: booking.attendees[0].email,
        name: booking.attendees[0].name,
        booking: {
          title: booking.title || '',
          startTime: booking.startTime || '',
          endTime: booking.endTime || '',
          description: booking.description || '',
        },
      })
    }

    // 3. Send notification to admin
    await sendAdminBookingNotification({
      bookingUid: booking.uid || '',
      attendeeName: booking.attendees?.[0]?.name || 'Unknown',
      attendeeEmail: booking.attendees?.[0]?.email || '',
      eventType: booking.eventType?.title || 'Consultation',
      startTime: booking.startTime || '',
    })

    // 4. Add to CRM or lead tracking
    await addToLeadTracking({
      email: booking.attendees?.[0]?.email || '',
      name: booking.attendees?.[0]?.name || '',
      source: 'cal.com_booking',
      eventType: booking.eventType?.title || '',
      metadata: {
        bookingUid: booking.uid,
        bookingId: booking.id,
        responses: booking.responses,
      },
    })

    // 5. Trigger email sequence for consultation follow-up
    if (booking.eventType?.slug === 'consultation') {
      await triggerConsultationSequence({
        email: booking.attendees?.[0]?.email || '',
        name: booking.attendees?.[0]?.name || '',
        consultationDate: booking.startTime || '',
      })
    }

    return { success: true }
  } catch (error) {
    logger.error('Failed to process booking created webhook', {
      error,
      bookingId: booking.id,
    })
    throw error
  }
}

/**
 * Process booking cancelled webhook
 */
export async function processBookingCancelled(payload: CalWebhookPayload) {
  const { payload: booking } = payload

  logger.info('Processing booking cancelled', {
    bookingId: booking.id,
    bookingUid: booking.uid,
  })

  try {
    // 1. Update booking status in database
    // await updateBookingStatus(booking.uid, 'CANCELLED')

    // 2. Send cancellation confirmation to client
    if (booking.attendees?.[0]?.email) {
      await sendCancellationEmail({
        email: booking.attendees[0].email,
        name: booking.attendees[0].name,
        booking: {
          title: booking.title || '',
          originalStartTime: booking.startTime || '',
        },
      })
    }

    // 3. Notify admin of cancellation
    await sendAdminCancellationNotification({
      bookingUid: booking.uid || '',
      attendeeName: booking.attendees?.[0]?.name || 'Unknown',
      attendeeEmail: booking.attendees?.[0]?.email || '',
      eventType: booking.eventType?.title || 'Consultation',
      originalStartTime: booking.startTime || '',
    })

    // 4. Trigger re-engagement email sequence
    if (booking.attendees?.[0]?.email) {
      await triggerReengagementSequence({
        email: booking.attendees[0].email,
        name: booking.attendees[0].name,
        cancelledEventType: booking.eventType?.title || '',
      })
    }

    return { success: true }
  } catch (error) {
    logger.error('Failed to process booking cancelled webhook', {
      error,
      bookingId: booking.id,
    })
    throw error
  }
}

/**
 * Process booking rescheduled webhook
 */
export async function processBookingRescheduled(payload: CalWebhookPayload) {
  const { payload: booking } = payload

  logger.info('Processing booking rescheduled', {
    bookingId: booking.id,
    bookingUid: booking.uid,
  })

  try {
    // 1. Update booking in database
    // await updateBooking(booking)

    // 2. Send reschedule confirmation to client
    if (booking.attendees?.[0]?.email) {
      await sendRescheduleConfirmationEmail({
        email: booking.attendees[0].email,
        name: booking.attendees[0].name,
        booking: {
          title: booking.title || '',
          newStartTime: booking.startTime || '',
          newEndTime: booking.endTime || '',
        },
      })
    }

    // 3. Notify admin of reschedule
    await sendAdminRescheduleNotification({
      bookingUid: booking.uid || '',
      attendeeName: booking.attendees?.[0]?.name || 'Unknown',
      attendeeEmail: booking.attendees?.[0]?.email || '',
      eventType: booking.eventType?.title || 'Consultation',
      newStartTime: booking.startTime || '',
    })

    return { success: true }
  } catch (error) {
    logger.error('Failed to process booking rescheduled webhook', {
      error,
      bookingId: booking.id,
    })
    throw error
  }
}

// Email integration functions (placeholder implementations)
async function sendBookingConfirmationEmail(data: {
  email: string
  name: string
  booking: {
    title: string
    startTime: string
    endTime: string
    description: string
  }
}) {
  // TODO: Integrate with existing email system (Resend)
  logger.info('Sending booking confirmation email', { email: data.email })
}

async function sendAdminBookingNotification(data: {
  bookingUid: string
  attendeeName: string
  attendeeEmail: string
  eventType: string
  startTime: string
}) {
  // TODO: Integrate with existing admin notification system
  logger.info('Sending admin booking notification', { attendeeEmail: data.attendeeEmail })
}

async function addToLeadTracking(data: {
  email: string
  name: string
  source: string
  eventType: string
  metadata: Record<string, unknown>
}) {
  // TODO: Integrate with existing CRM/lead tracking system
  logger.info('Adding to lead tracking', { email: data.email, source: data.source })
}

async function triggerConsultationSequence(data: {
  email: string
  name: string
  consultationDate: string
}) {
  // TODO: Integrate with existing email sequence system
  logger.info('Triggering consultation email sequence', { email: data.email })
}

async function sendCancellationEmail(data: {
  email: string
  name: string
  booking: {
    title: string
    originalStartTime: string
  }
}) {
  // TODO: Integrate with existing email system
  logger.info('Sending cancellation email', { email: data.email })
}

async function sendAdminCancellationNotification(data: {
  bookingUid: string
  attendeeName: string
  attendeeEmail: string
  eventType: string
  originalStartTime: string
}) {
  // TODO: Integrate with existing admin notification system
  logger.info('Sending admin cancellation notification', { attendeeEmail: data.attendeeEmail })
}

async function triggerReengagementSequence(data: {
  email: string
  name: string
  cancelledEventType: string
}) {
  // TODO: Integrate with existing email sequence system
  logger.info('Triggering re-engagement sequence', { email: data.email })
}

async function sendRescheduleConfirmationEmail(data: {
  email: string
  name: string
  booking: {
    title: string
    newStartTime: string
    newEndTime: string
  }
}) {
  // TODO: Integrate with existing email system
  logger.info('Sending reschedule confirmation email', { email: data.email })
}

async function sendAdminRescheduleNotification(data: {
  bookingUid: string
  attendeeName: string
  attendeeEmail: string
  eventType: string
  newStartTime: string
}) {
  // TODO: Integrate with existing admin notification system
  logger.info('Sending admin reschedule notification', { attendeeEmail: data.attendeeEmail })
}