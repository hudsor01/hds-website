import { getEmailSequences, processEmailTemplate } from '@/lib/email-utils'
import { logger } from '@/lib/logger'
import { recordContactFormSubmission } from '@/lib/metrics'
import { notifyHighValueLead } from '@/lib/notifications'
import { unifiedRateLimiter } from '@/lib/rate-limiter'
import { getResendClient, isResendConfigured } from '@/lib/resend-client'
import { scheduleEmailSequence } from '@/lib/scheduled-emails'
import { resendEmailResponseSchema } from '@/lib/schemas/external'
import { contactFormSchema, scoreLeadFromContactData, type ContactFormData } from '@/lib/schemas/contact'
import { detectInjectionAttempt, escapeHtml } from '@/lib/utils'
import { getClientIp } from '@/lib/utils/request'
import type { NextRequest } from 'next/server'

// ================================
// CONFIGURATION
// ================================

// TODO: CRITICAL - DUPLICATION - Move to src/lib/config/email.ts
// DUPLICATED from actions/contact.ts - Use shared EMAIL_CONFIG instead
const EMAIL_FROM_ADMIN = "Hudson Digital <noreply@hudsondigitalsolutions.com>"
const EMAIL_FROM_PERSONAL = "Richard Hudson <hello@hudsondigitalsolutions.com>"
const EMAIL_TO_ADMIN = "hello@hudsondigitalsolutions.com"

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Check for suspicious content in form fields
 */
function checkForSecurityThreats(
  data: ContactFormData,
  clientIP: string,
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

/**
 * Send admin notification email
 */
async function sendAdminNotification(
  data: ContactFormData,
  leadScore: number,
  sequenceId: string,
): Promise<boolean> {
  if (!isResendConfigured()) { return false }

  try {
    const response = await getResendClient().emails.send({
      from: EMAIL_FROM_ADMIN,
      to: [EMAIL_TO_ADMIN],
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
    logger.error("Failed to send admin notification", error)
    return false
  }
}

/**
 * Send welcome email to prospect
 */
async function sendWelcomeEmail(
  data: ContactFormData,
  sequenceId: string,
  emailVariables: ReturnType<typeof prepareEmailVariables>,
): Promise<boolean> {
  if (!isResendConfigured()) { return false }

  const sequences = getEmailSequences()
  const sequence = sequences[sequenceId as keyof typeof sequences]
  if (!sequence) { return false }

  try {
    const processedContent = processEmailTemplate(sequence.content, emailVariables)
    const processedSubject = processEmailTemplate(sequence.subject, emailVariables)

    const response = await getResendClient().emails.send({
      from: EMAIL_FROM_PERSONAL,
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
    logger.error("Failed to send welcome email", error)
    return false
  }
}

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
      leadQuality: leadScore >= 80 ? 'hot' : leadScore >= 70 ? 'warm' : 'cold',
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

// Generate admin notification email
function generateAdminNotificationHTML(
  data: ContactFormData,
  leadScore?: number,
  sequenceId?: string,
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
        <h2 style="color: ${leadScore >= 70 ? "#15803d" : leadScore >= 40 ? "#d9706" : "#dc2626"};">Lead Intelligence</h2>
        <p><strong>Lead Score:</strong> ${leadScore}/100 ${leadScore >= 70 ? "(HIGH PRIORITY)" : leadScore >= 40 ? "(QUALIFIED)" : "(NURTURE)"
      }</p>
        <p><strong>Email Sequence:</strong> ${sequenceId || "standard-welcome"}</p>
        <p><strong>Recommended Action:</strong> ${leadScore >= 70
        ? "Schedule call within 24 hours"
        : leadScore >= 40
          ? "Follow up within 2-3 days"
          : "Add to nurture sequence"
      }</p>
      </div>
      ` : ""}

      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
        <h2>Message</h2>
        <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
      </div>

      <p style="margin-top: 30px; color: #64748b; font-size: 12px;">
        Submitted: ${new Date().toLocaleString()}<br>
        Source: Hudson Digital Solutions Contact Form<br>
        ${leadScore ? `Lead Score: ${leadScore}/10 | Sequence: ${sequenceId}` : ""}
      </p>
    </div>
  `
}

// TODO: CRITICAL - DUPLICATION - This entire file is 95% identical to actions/contact.ts
// Consolidate shared logic into src/lib/services/contact-service.ts
// Keep this route thin - just handle HTTP concerns, delegate business logic to service
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
    checkForSecurityThreats(data, clientIP)

    // Step 4: Calculate lead score and prepare email data
    const leadScoring = scoreLeadFromContactData(data)
    const leadScore = leadScoring.score
    const sequenceId = leadScoring.sequenceType
    const emailVariables = prepareEmailVariables(data)

    // Step 5: Send emails and notifications
    if (isResendConfigured()) {
      try {
        await sendAdminNotification(data, leadScore, sequenceId)
        await sendWelcomeEmail(data, sequenceId, emailVariables)
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
