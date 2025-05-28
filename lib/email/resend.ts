import { Resend } from 'resend'
import { z } from 'zod'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Email validation schema
export const emailSchema = z.object({
  to: z.string().email(),
  from: z.string().email(),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string(),
  replyTo: z.string().email().optional(),
  attachments: z
    .array(
      z.object({
        content: z.string(),
        filename: z.string(),
        type: z.string().optional(),
        disposition: z.string().optional(),
      }),
    )
    .optional(),
})

export type EmailPayload = z.infer<typeof emailSchema>

/**
 * Sends an email using Resend
 * @param emailData Email data conforming to EmailPayload type
 * @returns Promise resolving to the Resend response
 */
export async function sendEmail(emailData: EmailPayload) {
  try {
    // Validate email data
    emailSchema.parse(emailData)

    // Set default sender if not provided
    const fromEmail =
      emailData.from ||
      process.env.RESEND_FROM_EMAIL ||
      'noreply@hudsondigitalsolutions.com'

    // Prepare email payload for Resend
    const msg = {
      to: emailData.to,
      from: fromEmail,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      replyTo: emailData.replyTo,
      attachments: emailData.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        type: att.type,
        disposition: att.disposition as 'inline' | 'attachment' | undefined,
      })),
    }

    // Send email
    const response = await resend.emails.send(msg)
    return { success: true, response }
  } catch (error) {
    console.error('Error sending email via Resend:', error)

    // Return a structured error
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error in email data',
        details: error.errors,
      }
    }

    return {
      success: false,
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : String(error),
    }
  }
}
