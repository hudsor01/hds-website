import { logger } from '@/lib/logger'
import { unifiedRateLimiter } from '@/lib/rate-limiter'
import { isResendConfigured } from '@/lib/resend-client'
import { contactFormSchema, scoreLeadFromContactData } from '@/lib/schemas/contact'
import { getClientIp } from '@/lib/utils/request'
import type { NextRequest } from 'next/server'
import {
  checkForSecurityThreats,
  prepareEmailVariables,
  sendAdminNotification,
  sendWelcomeEmail,
  scheduleFollowUpEmails,
} from '@/lib/services/contact-service'

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

        await scheduleFollowUpEmails(data, sequenceId, emailVariables, logger)

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
        return Response.json({
          success: false,
          error: "Failed to send message. Please try again."
        }, { status: 500 })
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

      return Response.json({
        success: true,
        message: "Form submitted successfully (test mode - email service not configured)"
      })
    }
  } catch (error) {
    logger.error("Contact form error", error)
    return Response.json({
      success: false,
      error: "An unexpected error occurred. Please try again later."
    }, { status: 500 })
  }
}
