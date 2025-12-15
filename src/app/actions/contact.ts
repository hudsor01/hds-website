'use server'

import { headers } from "next/headers"
import { isResendConfigured } from "@/lib/resend-client"
import { unifiedRateLimiter } from "@/lib/rate-limiter"
import { recordContactFormSubmission } from "@/lib/metrics"
import { getClientIpFromHeaders } from "@/lib/utils/request"
import { scheduleEmailSequence } from "@/lib/scheduled-emails"
import { contactFormSchema, scoreLeadFromContactData, type ContactFormData, type LeadScoring } from "@/lib/schemas/contact"
import { createServerLogger, castError, type Logger } from "@/lib/logger"
import { notifyHighValueLead } from "@/lib/notifications"
import { LEAD_QUALITY_THRESHOLDS } from "@/lib/constants/lead-scoring"
import {
  checkForSecurityThreats,
  prepareEmailVariables,
  sendAdminNotification,
  sendWelcomeEmail,
} from "@/lib/services/contact-service"

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Send notifications for high-value leads (Slack/Discord)
 */
async function sendLeadNotifications(
  data: ContactFormData,
  leadScore: number,
  logger: Logger
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
    logger.error("Failed to send lead notifications", castError(error))
  }
}

/**
 * Schedule follow-up email sequence
 */
async function scheduleFollowUpEmails(
  data: ContactFormData,
  sequenceId: LeadScoring['sequenceType'],
  emailVariables: ReturnType<typeof prepareEmailVariables>,
  logger: Logger
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
      error: castError(error),
      email: data.email,
      sequenceId
    })
  }
}

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