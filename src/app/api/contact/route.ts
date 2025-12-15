import { logger } from '@/lib/logger'
import { recordContactFormSubmission } from '@/lib/metrics'
import { notifyHighValueLead } from '@/lib/notifications'
import { unifiedRateLimiter } from '@/lib/rate-limiter'
import { isResendConfigured } from '@/lib/resend-client'
import { scheduleEmailSequence } from '@/lib/scheduled-emails'
import { contactFormSchema, scoreLeadFromContactData, type ContactFormData } from '@/lib/schemas/contact'
import { getClientIp } from '@/lib/utils/request'
import type { NextRequest } from 'next/server'
import { LEAD_QUALITY_THRESHOLDS } from '@/lib/constants/lead-scoring'
import {
  checkForSecurityThreats,
  prepareEmailVariables,
  sendAdminNotification,
  sendWelcomeEmail,
} from '@/lib/services/contact-service'

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Send notifications for high-value leads (Slack/Discord)
 */
async function sendLeadNotifications(
  data: ContactFormData,
  leadScore: number,
): Promise<void> {
  try {
    await notifyHighValueLead({
      leadId: `contact-${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      service: data.service,
      budget: data.budget,
      timeline: data.timeline,
      leadScore: leadScore,
      leadQuality: leadScore >= LEAD_QUALITY_THRESHOLDS.HOT ? 'hot' : leadScore >= LEAD_QUALITY_THRESHOLDS.WARM ? 'warm' : 'cold',
      source: 'Contact Form',
    })
  } catch (error) {
    logger.error("Failed to send lead notifications", error)
  }
}

/**
 * Schedule follow-up email sequence
 */
async function scheduleFollowUpEmails(
  data: ContactFormData,
  sequenceId: string,
  emailVariables: ReturnType<typeof prepareEmailVariables>,
): Promise<void> {
  try {
    await scheduleEmailSequence(
      data.email,
      `${data.firstName} ${data.lastName}`,
      sequenceId,
      emailVariables
    )
  } catch (error) {
    logger.error("Failed to schedule email sequence", {
      error,
      email: data.email,
      sequenceId
    })
  }
}

export async function POST(request: NextRequest) {
  const logContext = { component: 'contact-form', timestamp: Date.now() };

  try {
    logger.info(`Contact form submission started - contact-form-${Date.now()}`, logContext)

    // Step 1: Rate limiting
    const clientIP = getClientIp(request)
    const isAllowed = await unifiedRateLimiter.checkLimit(clientIP, 'contactForm')

    if (!isAllowed) {
      return Response.json({
        success: false,
        error: "Too many requests. Please try again in 15 minutes."
      }, { status: 429 })
    }

    // Step 2: Parse and validate form data
    const rawData = await request.json()
    const validation = contactFormSchema.safeParse(rawData)

    if (!validation.success) {
      return Response.json({
        success: false,
        error: "Invalid form data",
        message: validation.error.issues[0]?.message
      }, { status: 400 })
    }

    const data = validation.data

    // Step 3: Security check (monitoring only)
    checkForSecurityThreats(data, clientIP, logger)

    // Step 4: Calculate lead score and prepare email data
    const leadScoring = scoreLeadFromContactData(data)
    const leadScore = leadScoring.score
    const sequenceId = leadScoring.sequenceType
    const emailVariables = prepareEmailVariables(data)

    // Step 5: Send emails and notifications
    if (isResendConfigured()) {
      try {
        await sendAdminNotification(data, leadScore, sequenceId, logger)
        await sendWelcomeEmail(data, sequenceId, emailVariables, logger)
        await sendLeadNotifications(data, leadScore)

        recordContactFormSubmission(true)
        await scheduleFollowUpEmails(data, sequenceId, emailVariables)

        logger.info('Contact form submission successful', {
          ...logContext,
          email: data.email,
          leadScore,
          sequenceId
        })

        return Response.json({
          success: true,
          message: "Thank you! Your message has been sent successfully."
        })
      } catch (emailError) {
        logger.error("Failed to send email", emailError)
        recordContactFormSubmission(false)
        return Response.json({
          success: false,
          error: "Failed to send message. Please try again."
        }, { status: 500 })
      }
    } else {
      // Test mode: schedule emails without email service
      await scheduleFollowUpEmails(data, sequenceId, emailVariables)
      recordContactFormSubmission(true)

      logger.info('Contact form submission successful (test mode)', {
        ...logContext,
        email: data.email,
        leadScore,
        sequenceId
      })

      return Response.json({
        success: true,
        message: "Form submitted successfully (test mode - email service not configured)"
      })
    }
  } catch (error) {
    logger.error("Contact form error", error)
    recordContactFormSubmission(false)
    return Response.json({
      success: false,
      error: "An unexpected error occurred. Please try again later."
    }, { status: 500 })
  }
}
