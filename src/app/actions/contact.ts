'use server'

import { headers } from "next/headers"
import { EMAIL_CONFIG } from "@/lib/config/email"
import { getResendClient, isResendConfigured } from "@/lib/resend-client"
import { unifiedRateLimiter } from "@/lib/rate-limiter"
import { recordContactFormSubmission } from "@/lib/metrics"
import { escapeHtml, detectInjectionAttempt } from "@/lib/utils"
import { getClientIpFromHeaders } from "@/lib/utils/request"
import { getEmailSequences, processEmailTemplate } from "@/lib/email-utils"
import { scheduleEmailSequence } from "@/lib/scheduled-emails"
import { contactFormSchema, scoreLeadFromContactData, type ContactFormData, type LeadScoring } from "@/lib/schemas/contact"
import { resendEmailResponseSchema } from "@/lib/schemas/external"
import { createServerLogger, castError, type Logger } from "@/lib/logger"
import { notifyHighValueLead } from "@/lib/notifications"

// ================================
// HELPER FUNCTIONS
// ================================

// TODO: DUPLICATION - Extract to src/lib/services/contact-service.ts
// This entire function is duplicated in api/contact/route.ts
/**
 * Check for suspicious content in form fields
 */
function checkForSecurityThreats(
  data: ContactFormData,
  clientIP: string,
  logger: Logger
): boolean {
  const fieldsToCheck = [
    data.firstName,
    data.lastName,
    data.email,
    data.message,
    data.company,
  ].filter(Boolean)

  const hasSuspiciousContent = fieldsToCheck.some((field) =>
    detectInjectionAttempt(field as string)
  )

  if (hasSuspiciousContent) {
    logger.warn("Potential injection attempt detected", { clientIP })
  }

  return hasSuspiciousContent
}

// TODO: DUPLICATION - Extract to src/lib/services/contact-service.ts
// Duplicated in api/contact/route.ts
/**
 * Prepare email template variables from form data
 */
function prepareEmailVariables(data: ContactFormData) {
  return {
    firstName: data.firstName,
    lastName: data.lastName || "",
    company: data.company || "your business",
    service: data.service || "web development",
    email: data.email,
  }
}

// TODO: DUPLICATION - Extract to src/lib/services/email-service.ts
// Duplicated in api/contact/route.ts (85+ lines)
/**
 * Send admin notification email
 */
async function sendAdminNotification(
  data: ContactFormData,
  leadScore: number,
  sequenceId: LeadScoring['sequenceType'],
  logger: Logger
): Promise<boolean> {
  if (!isResendConfigured()) {return false}

  try {
    const response = await getResendClient().emails.send({
      from: EMAIL_CONFIG.FROM_ADMIN,
      to: [EMAIL_CONFIG.TO_ADMIN],
      subject: `New Project Inquiry - ${data.firstName} ${data.lastName} (Score: ${leadScore})`,
      html: generateAdminNotificationHTML(data, leadScore, sequenceId),
    })

    const validation = resendEmailResponseSchema.safeParse(response.data)
    if (!validation.success) {
      logger.warn('Admin email response validation failed', {
        errors: validation.error.issues,
      })
    }
    return true
  } catch (error) {
    logger.error("Failed to send admin notification", castError(error))
    return false
  }
}

// TODO: DUPLICATION - Extract to src/lib/services/email-service.ts
// Duplicated in api/contact/route.ts
/**
 * Send welcome email to prospect
 */
async function sendWelcomeEmail(
  data: ContactFormData,
  sequenceId: LeadScoring['sequenceType'],
  emailVariables: ReturnType<typeof prepareEmailVariables>,
  logger: Logger
): Promise<boolean> {
  if (!isResendConfigured()) {return false}

  const sequences = getEmailSequences()
  const sequence = sequences[sequenceId as keyof typeof sequences]
  if (!sequence) {return false}

  try {
    const processedContent = processEmailTemplate(sequence.content, emailVariables)
    const processedSubject = processEmailTemplate(sequence.subject, emailVariables)

    const response = await getResendClient().emails.send({
      from: EMAIL_CONFIG.FROM_PERSONAL,
      to: [data.email],
      subject: processedSubject,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        ${processedContent
          .split("\n")
          .map((line) => `<p>${escapeHtml(line)}</p>`)
          .join("")}
      </div>`,
    })

    const validation = resendEmailResponseSchema.safeParse(response.data)
    if (!validation.success) {
      logger.warn('Welcome email response validation failed', {
        errors: validation.error.issues,
      })
    }
    return true
  } catch (error) {
    logger.error("Failed to send welcome email", castError(error))
    return false
  }
}

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
      // TODO: MAGIC NUMBERS - Extract to src/lib/constants/lead-scoring.ts
      // Thresholds (80, 70) are inconsistent across codebase (also 70, 40 used elsewhere)
      leadQuality: leadScore >= 80 ? 'hot' : leadScore >= 70 ? 'warm' : 'cold',
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

// TODO: ANTI-PATTERN - Move to email template file or use @react-email
// This 50+ line HTML template is duplicated in api/contact/route.ts
// Should be in src/lib/templates/emails/ or use existing email-templates.json pattern
// Generate admin notification email
function generateAdminNotificationHTML(
  data: ContactFormData,
  leadScore?: number,
  sequenceId?: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #0891b2;">New Contact Form Submission</h1>

      <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h2>Contact Information</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
        ${data.phone ? `<p><strong>Phone:</strong> <a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></p>` : ""}
        ${data.company ? `<p><strong>Company:</strong> ${escapeHtml(data.company)}</p>` : ""}
        ${data.service ? `<p><strong>Service Interest:</strong> ${escapeHtml(data.service)}</p>` : ""}
        ${data.budget ? `<p><strong>Budget:</strong> ${escapeHtml(data.budget)}</p>` : ""}
        ${data.timeline ? `<p><strong>Timeline:</strong> ${escapeHtml(data.timeline)}</p>` : ""}
      </div>

      ${leadScore ? `
      <div style="background: ${leadScore >= 70 ? "#dcfce7" : leadScore >= 40 ? "#fef3c7" : "#fef2f2"}; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: ${leadScore >= 70 ? "#15803d" : leadScore >= 40 ? "#d97706" : "#dc2626"};">Lead Intelligence</h2>
        <p><strong>Lead Score:</strong> ${leadScore}/100 ${
          leadScore >= 70 ? "(HIGH PRIORITY)" : leadScore >= 40 ? "(QUALIFIED)" : "(NURTURE)"
        }</p>
        <p><strong>Email Sequence:</strong> ${sequenceId || "standard-welcome"}</p>
        <p><strong>Recommended Action:</strong> ${
          leadScore >= 70
            ? "Schedule call within 24 hours"
            : leadScore >= 40
            ? "Follow up within 2-3 days"
            : "Add to nurture sequence"
        }</p>
      </div>
      ` : ""}

      <!-- TODO: MAGIC NUMBERS in template above - Thresholds 70, 40 inconsistent with scoring function (uses 70, 45, 20) -->
      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
        <h2>Message</h2>
        <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
      </div>

      <p style="margin-top: 30px; color: #64748b; font-size: 12px;">
        Submitted: ${new Date().toLocaleString()}<br>
        Source: Hudson Digital Solutions Contact Form<br>
        ${leadScore ? `Lead Score: ${leadScore}/100 | Sequence: ${sequenceId}` : ""}
      </p>
    </div>
  `
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