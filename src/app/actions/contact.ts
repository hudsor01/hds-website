'use server'

import { headers } from "next/headers"
import { unifiedRateLimiter } from "@/lib/rate-limiter"
import { recordContactFormSubmission } from "@/lib/metrics"
import { getEmailSequences, processEmailTemplate } from "@/lib/email-utils"
import { scheduleEmailSequence } from "@/lib/scheduled-emails"
import { contactFormSchema, scoreLeadFromContactData } from "@/lib/schemas/contact"
import { createServerLogger, castError } from "@/lib/logger"
import { escapeHtml, detectInjectionAttempt } from "@/lib/utils"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { getResendClient, isResendConfigured } from "@/lib/resend-client"
import { fetchWithTimeout } from "@/lib/fetch-utils"
import { generateContactFormNotification } from "@/lib/email-templates"
import { env } from "@/env"

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
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    let clientIP = '127.0.0.1';
    
    if (forwardedFor) {
      const first = forwardedFor.split(',')[0]?.trim();
      if (first) {
        clientIP = first;
      }
    }

    const realIp = headersList.get('x-real-ip');
    if (realIp?.trim()) {
      clientIP = realIp.trim();
    }
    
    const identifier = `contact-form:${clientIP}`;
    const isLimited = await unifiedRateLimiter.checkLimit(identifier, 'contactForm');

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
    if (isResendConfigured()) {
      try {
        const resend = getResendClient();

        // Send admin notification
        await resend.emails.send({
          from: "Hudson Digital <noreply@hudsondigitalsolutions.com>",
          to: ["hello@hudsondigitalsolutions.com"],
          subject: `New Project Inquiry - ${data.firstName} ${data.lastName} (Score: ${leadScore})`,
          html: generateContactFormNotification({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            company: data.company,
            service: data.service,
            budget: data.budget,
            timeline: data.timeline,
            message: data.message,
            leadScore,
            sequenceId,
          }),
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

        // Send Discord notification if configured with timeout
        // Per MDN: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
        if (env.DISCORD_WEBHOOK_URL) {
          try {
            await fetchWithTimeout(env.DISCORD_WEBHOOK_URL, {
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
            }, 5000); // 5s timeout for Discord webhook
          } catch (discordError) {
            logger.error("Failed to send Discord notification", castError(discordError))
          }
        }

        // Record successful submission
        recordContactFormSubmission(true)

        // Save lead to database asynchronously (non-blocking)
        void (async () => {
          // Only save to database if Supabase is configured
          if (!isSupabaseConfigured() || !supabase) {
            logger.info('Skipping database save - Supabase not configured', {
              email: data.email
            });
            return;
          }

          try {
            const { error } = await supabase
              .from('leads')
              .insert([{
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                phone: data.phone || null,
                company: data.company || null,
                message: data.message,
                source: 'contact_form',
                status: 'new',
                lead_score: leadScore,
                consent_marketing: false, // Default value since not in form
                consent_analytics: true,  // Default value since not in form
                ip_address: clientIP,
                user_agent: headersList.get('user-agent') || null,
                referrer_url: headersList.get('referer') || null,
                created_at: new Date().toISOString()
              }]);

            if (error) {
              logger.error('Failed to save lead to database', {
                error: error.message,
                email: data.email
              });
            } else {
              logger.info('Lead saved to database successfully', {
                email: data.email
              });
            }
          } catch (dbError) {
            logger.error('Database error when saving lead', {
              error: dbError instanceof Error ? dbError.message : String(dbError),
              email: data.email
            });
          }
        })();

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