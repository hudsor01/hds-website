import { logger } from '@/lib/logger'
import { isResendConfigured } from '@/lib/resend-client'
import { contactFormSchema, scoreLeadFromContactData } from '@/lib/schemas/contact'
import { getClientIp } from '@/lib/request'
import type { NextRequest } from 'next/server'
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses'
import { withRateLimit } from '@/lib/api/rate-limit-wrapper'
import {
  checkForSecurityThreats,
  prepareEmailVariables,
  sendAdminNotification,
  sendWelcomeEmail,
  sendLeadNotifications,
  scheduleFollowUpEmails,
} from '@/lib/contact-service'

async function handleContactPost(request: NextRequest) {
  const logContext = { component: 'contact-form', timestamp: Date.now() };
  const clientIP = getClientIp(request);

  try {
    logger.info(`Contact form submission started - contact-form-${Date.now()}`, logContext)

    // Step 1: Parse and validate form data
    const rawData = await request.json()
    const validation = contactFormSchema.safeParse(rawData)

    if (!validation.success) {
      return validationErrorResponse(validation.error)
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
        await sendLeadNotifications(data, leadScore, logger)

        await scheduleFollowUpEmails(data, sequenceId, emailVariables, logger)

        logger.info('Contact form submission successful', {
          ...logContext,
          email: data.email,
          leadScore,
          sequenceId
        })

        return successResponse(undefined, "Thank you! Your message has been sent successfully.")
      } catch (emailError) {
        logger.error("Failed to send email", emailError)
        return errorResponse("Failed to send message. Please try again.", 500)
      }
    } else {
      // Test mode: schedule emails without email service
      await scheduleFollowUpEmails(data, sequenceId, emailVariables, logger)

      logger.info('Contact form submission successful (test mode)', {
        ...logContext,
        email: data.email,
        leadScore,
        sequenceId
      })

      return successResponse(undefined, "Form submitted successfully (test mode - email service not configured)")
    }
  } catch (error) {
    logger.error("Contact form error", error)
    return errorResponse("An unexpected error occurred. Please try again later.", 500)
  }
}

export const POST = withRateLimit(handleContactPost, 'contactForm');
