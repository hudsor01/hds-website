'use server'

import { headers } from "next/headers"
import { Resend } from "resend"
import { RateLimiter } from "@/lib/rate-limiter"
import { recordContactFormSubmission } from "@/lib/metrics"
import { escapeHtml, detectInjectionAttempt } from "@/lib/security-utils"
import { getEmailSequences, processEmailTemplate } from "@/lib/email-utils"
import { scheduleEmailSequence } from "@/lib/scheduled-emails"
import { contactFormSchema, scoreLeadFromContactData, type ContactFormData } from "@/lib/schemas/contact"
import { createServerLogger, castError } from "@/lib/logger"

// Initialize rate limiter
const rateLimiter = new RateLimiter()
const CONTACT_FORM_LIMITS = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 3, // 3 submissions per 15 minutes
}

// Initialize Resend
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Get client IP from headers
async function getClientIP(): Promise<string> {
  const headersList = await headers()
  const forwardedFor = headersList.get("x-forwarded-for")
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim()
    if (first) {
      return first
    }
  }

  const realIp = headersList.get("x-real-ip")
  if (realIp?.trim()) {
    return realIp.trim()
  }

  return "unknown"
}

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

export async function submitContactForm(
  _prevState: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  const logger = createServerLogger(`contact-form-${Date.now()}`);

  try {
    logger.info('Contact form submission started');
    // Step 1: Rate limiting
    const clientIP = await getClientIP()
    const isLimited = await rateLimiter.checkLimit(
      `contact-form:${clientIP}`,
      CONTACT_FORM_LIMITS.maxRequests,
      CONTACT_FORM_LIMITS.windowMs
    )

    if (isLimited) {
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

    // Step 3: Detect injection attempts (for monitoring)
    const fieldsToCheck = [
      data.firstName,
      data.lastName,
      data.email,
      data.message,
      data.company,
    ].filter(Boolean)

    const suspiciousActivity = fieldsToCheck.some((field) =>
      detectInjectionAttempt(field as string)
    )

    if (suspiciousActivity) {
      logger.warn("Potential injection attempt detected", { clientIP, fields: fieldsToCheck })
    }

    // Step 4: Calculate lead score
    const leadScoring = scoreLeadFromContactData(data)
    const leadScore = leadScoring.score
    const sequenceId = leadScoring.sequenceType
    const sequence = getEmailSequences()[sequenceId]

    // Prepare email variables
    const emailVariables = {
      firstName: data.firstName,
      lastName: data.lastName || "",
      company: data.company || "your business",
      service: data.service || "web development",
      email: data.email,
    }

    // Step 5: Send emails
    if (resend) {
      try {
        // Send admin notification
        await resend.emails.send({
          from: "Hudson Digital <noreply@hudsondigitalsolutions.com>",
          to: ["hello@hudsondigitalsolutions.com"],
          subject: `New Project Inquiry - ${data.firstName} ${data.lastName} (Score: ${leadScore})`,
          html: generateAdminNotificationHTML(data, leadScore, sequenceId),
        })

        // Send immediate welcome email to prospect
        if (sequence) {
          const processedContent = processEmailTemplate(sequence.content, emailVariables)
          const processedSubject = processEmailTemplate(sequence.subject, emailVariables)

          await resend.emails.send({
            from: "Richard Hudson <hello@hudsondigitalsolutions.com>",
            to: [data.email],
            subject: processedSubject,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
              ${processedContent
                .split("\n")
                .map((line) => `<p>${escapeHtml(line)}</p>`)
                .join("")}
            </div>`,
          })
        }

        // Send Discord notification if configured
        if (process.env.DISCORD_WEBHOOK_URL) {
          try {
            await fetch(process.env.DISCORD_WEBHOOK_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                embeds: [{
                  title: "New Project Inquiry",
                  color: 0x0891b2,
                  fields: [
                    {
                      name: "Contact",
                      value: `**${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}**\n${escapeHtml(data.email)}${
                        data.phone ? `\n${escapeHtml(data.phone)}` : ""
                      }`,
                      inline: true,
                    },
                    {
                      name: "Details & Score",
                      value: `**Lead Score:** ${leadScore}/100\n**Service:** ${escapeHtml(
                        data.service || "Not specified"
                      )}\n**Company:** ${escapeHtml(data.company || "Not specified")}\n**Sequence:** ${sequenceId}`,
                      inline: true,
                    },
                    {
                      name: "Message",
                      value: escapeHtml(
                        data.message.length > 1000
                          ? data.message.substring(0, 1000) + "..."
                          : data.message
                      ),
                      inline: false,
                    },
                  ],
                  timestamp: new Date().toISOString(),
                  footer: { text: "Hudson Digital Solutions Contact Form" },
                }],
              }),
            })
          } catch (discordError) {
            logger.error("Failed to send Discord notification", castError(discordError))
          }
        }

        // Record successful submission
        recordContactFormSubmission(true)

        // Schedule follow-up emails
        scheduleEmailSequence(
          data.email,
          `${data.firstName} ${data.lastName}`,
          sequenceId,
          emailVariables
        )

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
      // Schedule emails even without email service
      scheduleEmailSequence(
        data.email,
        `${data.firstName} ${data.lastName}`,
        sequenceId,
        emailVariables
      )

      // In test environment, still consider it successful if validation passed
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