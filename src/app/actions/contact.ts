'use server'

import { headers } from "next/headers"
import { isResendConfigured } from "@/lib/resend-client"
import { unifiedRateLimiter } from "@/lib/rate-limiter"
import { recordContactFormSubmission } from "@/lib/metrics"
import { getClientIpFromHeaders } from "@/lib/utils/request"
import { contactFormSchema, scoreLeadFromContactData } from "@/lib/schemas/contact"
import { createServerLogger } from "@/lib/logger"
import { castError } from '@/lib/utils/errors'
import {
  checkForSecurityThreats,
  prepareEmailVariables,
  sendAdminNotification,
  sendWelcomeEmail,
  sendLeadNotifications,
  scheduleFollowUpEmails,
} from "@/lib/services/contact-service"

export type ContactFormState = {
  success?: boolean
  error?: string
  message?: string
}

// TODO: ANTI-PATTERN - GOD FUNCTION (95 lines, 11 responsibilities)
// This function violates Single Responsibility Principle
// Break into: validateSubmission(), scoreLead(), sendNotifications(), scheduleFollowUps()
// See BACKEND_CODE_REVIEW.md for detailed refactoring plan
export async function submitContactForm(
  _prevState: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  const logger = createServerLogger(`contact-form-${Date.now()}`);

  try {
    logger.info('Contact form submission started');

    // Step 1: Rate limiting
    const headersList = await headers()
    const clientIP = getClientIpFromHeaders(headersList)
    const isAllowed = await unifiedRateLimiter.checkLimit(clientIP, 'contactForm')

    if (!isAllowed) {
      return {
        success: false,
        error: "Too many requests. Please try again in 15 minutes."
      }
    }

    // Step 2: Parse and validate form data
    const rawData = Object.fromEntries(formData.entries())
    const validation = contactFormSchema.safeParse(rawData)

    if (!validation.success) {
      return {
        success: false,
        error: "Invalid form data",
        message: validation.error.issues[0]?.message
      }
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

        recordContactFormSubmission(true)
        await scheduleFollowUpEmails(data, sequenceId, emailVariables, logger)

        logger.info('Contact form submission successful', {
          email: data.email,
          leadScore,
          sequenceId
        });

        return {
          success: true,
          message: "Thank you! Your message has been sent successfully."
        }
      } catch (emailError) {
        logger.error("Failed to send email", castError(emailError))
        recordContactFormSubmission(false)
        return {
          success: false,
          error: "Failed to send message. Please try again."
        }
      }
    } else {
      // Test mode: schedule emails without email service
      await scheduleFollowUpEmails(data, sequenceId, emailVariables, logger)
      recordContactFormSubmission(true)

      logger.info('Contact form submission successful (test mode)', {
        email: data.email,
        leadScore,
        sequenceId
      });

      return {
        success: true,
        message: "Form submitted successfully (test mode - email service not configured)"
      }
    }
  } catch (error) {
    logger.error("Contact form error", castError(error))
    recordContactFormSubmission(false)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later."
    }
  }
}
