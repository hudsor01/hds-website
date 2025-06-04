'use server'

import { Resend } from 'resend'
import { z } from 'zod'
import { logger } from '../logger'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Base email validation schema
export const emailBaseSchema = z.object({
  to: z.union([
    z.string().email(),
    z.array(z.string().email()),
  ]),
  from: z.string().email().optional(),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string(),
  replyTo: z.string().email().optional(),
  cc: z.union([
    z.string().email(),
    z.array(z.string().email()),
  ]).optional(),
  bcc: z.union([
    z.string().email(),
    z.array(z.string().email()),
  ]).optional(),
  attachments: z.array(
    z.object({
      content: z.string(),
      filename: z.string(),
      type: z.string().optional(),
      disposition: z.string().optional(),
    }),
  ).optional(),
})

// Contact form submission schema
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  subject: z.string().optional(),
  service: z.string().optional(),
  budget: z.string().optional(),
  // Spam protection fields
  honeypot: z.string().optional(),
  website: z.string().optional(),
})

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().optional(),
  interests: z.array(z.string()).optional(),
})

// Lead magnet request schema
export const leadMagnetSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  resourceId: z.string(),
})

export type EmailPayload = z.infer<typeof emailBaseSchema>
export type ContactFormData = z.infer<typeof contactFormSchema>
export type NewsletterData = z.infer<typeof newsletterSchema>
export type LeadMagnetData = z.infer<typeof leadMagnetSchema>

// Result interfaces
interface EmailSuccess {
  success: true
  id: string
  message?: string
}

interface EmailError {
  success: false
  error: string
  details?: unknown
}

export type EmailResult = EmailSuccess | EmailError

// Type guard for EmailError
export function isEmailError(result: EmailResult): result is EmailError {
  return !result.success
}

/**
 * Core email sending function
 */
export async function sendEmail(emailData: EmailPayload): Promise<EmailResult> {
  try {
    // Validate email data
    emailBaseSchema.parse(emailData)
    
    // Set default sender if not provided
    const fromEmail = emailData.from || process.env.RESEND_FROM_EMAIL || 'noreply@hudsondigitalsolutions.com'
    
    // Log email attempt (only in development to avoid leaking sensitive data)
    if (process.env.NODE_ENV === 'development') {
      logger.info('Sending email', {
        to: emailData.to,
        subject: emailData.subject,
      })
    }
    
    // Prepare email payload for Resend
    const msg = {
      to: emailData.to,
      from: fromEmail,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      replyTo: emailData.replyTo,
      cc: emailData.cc,
      bcc: emailData.bcc,
      attachments: emailData.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        type: att.type,
        disposition: att.disposition as 'inline' | 'attachment' | undefined,
      })),
    }
    
    // Send email
    const response = await resend.emails.send(msg)
    
    if (response.error) {
      throw new Error(response.error.message)
    }
    
    return { 
      success: true, 
      id: response.data?.id || '',
      message: 'Email sent successfully',
    }
  } catch (error) {
    // Log the error
    logger.error('Error sending email via Resend', {
      error: error instanceof Error ? error.message : String(error),
    })
    
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

/**
 * Handle contact form submissions
 */
export async function sendContactFormEmail(data: ContactFormData): Promise<EmailResult> {
  try {
    // Validate form data
    contactFormSchema.parse(data)
    
    // Basic spam protection checks
    if (data.honeypot || data.website) {
      throw new Error('Spam protection failed')
    }
    
    // Prepare email to site owner
    const adminEmail = process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL || 'contact@hudsondigitalsolutions.com'
    
    // Create subject line based on available data
    const subject = data.subject 
      ? `New Contact Form: ${data.subject}` 
      : data.service 
        ? `New Contact Form: ${data.service} Inquiry` 
        : 'New Contact Form Submission'
    
    // Build email HTML with all available fields
    let fieldRows = ''
    
    // Add all optional fields if they exist
    if (data.phone) fieldRows += `<tr><td style='padding:8px 8px;'><strong>Phone:</strong></td><td style='padding:8px 8px;'>${data.phone}</td></tr>`
    if (data.company) fieldRows += `<tr><td style='padding:8px 8px;'><strong>Company:</strong></td><td style='padding:8px 8px;'>${data.company}</td></tr>`
    if (data.service) fieldRows += `<tr><td style='padding:8px 8px;'><strong>Service:</strong></td><td style='padding:8px 8px;'>${data.service}</td></tr>`
    if (data.budget) fieldRows += `<tr><td style='padding:8px 8px;'><strong>Budget:</strong></td><td style='padding:8px 8px;'>${data.budget}</td></tr>`
    
    const adminHtml = `
      <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'>
        <h1 style='color: #333; font-size: 24px; margin-bottom: 24px;'>New Contact Form Submission</h1>
        <table style='width: 100%; border-collapse: collapse; margin-bottom: 24px;'>
          <tr><td style='padding:8px 8px;'><strong>Name:</strong></td><td style='padding:8px 8px;'>${data.name}</td></tr>
          <tr><td style='padding:8px 8px;'><strong>Email:</strong></td><td style='padding:8px 8px;'>${data.email}</td></tr>
          ${fieldRows}
        </table>
        <div style='background-color: #f5f5f5; padding: 16px; border-radius: 4px; margin-bottom: 24px;'>
          <h2 style='color: #333; font-size: 18px; margin-top: 0;'>Message:</h2>
          <p style='white-space: pre-wrap;'>${data.message}</p>
        </div>
        <p style='color: #666; font-size: 14px;'>This message was sent from the contact form on your website.</p>
      </div>
    `
    
    // Send email to admin
    const adminResult = await sendEmail({
      to: adminEmail,
      subject,
      html: adminHtml,
      replyTo: data.email,
    })
    
    if (isEmailError(adminResult)) {
      throw new Error(`Failed to send admin email: ${adminResult.error}`)
    }
    
    // Send confirmation email to user
    const userHtml = `
      <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'>
        <h1 style='color: #333; font-size: 24px; margin-bottom: 24px;'>We've Received Your Message</h1>
        <p>Hi ${data.name},</p>
        <p>Thank you for contacting Hudson Digital Solutions. We've received your message and will get back to you shortly.</p>
        <p>Here's a copy of what you submitted:</p>
        <div style='background-color: #f5f5f5; padding: 16px; border-radius: 4px; margin: 24px 0;'>
          <p style='white-space: pre-wrap;'>${data.message}</p>
        </div>
        <p>We typically respond within 1 business day.</p>
        <p>Best regards,<br>The Hudson Digital Solutions Team</p>
      </div>
    `
    
    const userResult = await sendEmail({
      to: data.email,
      subject: 'Thank you for your message',
      html: userHtml,
    })
    
    if (isEmailError(userResult)) {
      logger.warn('Failed to send user confirmation email', {
        error: userResult.error,
        email: data.email,
      })
      // Continue even if user email fails, since admin already got the notification
    }
    
    return { 
      success: true, 
      id: adminResult.id, 
      message: 'Contact form submission processed successfully', 
    }
  } catch (error) {
    logger.error('Error processing contact form', {
      error: error instanceof Error ? error.message : String(error),
    })
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation error in contact form data', 
        details: error.errors, 
      }
    }
    
    return { 
      success: false, 
      error: 'Failed to process contact form submission', 
      details: error instanceof Error ? error.message : String(error), 
    }
  }
}

/**
 * Handle newsletter subscriptions
 */
export async function processNewsletterSignup(data: NewsletterData): Promise<EmailResult> {
  try {
    // Validate newsletter data
    newsletterSchema.parse(data)
    
    // Prepare email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hudsondigitalsolutions.com'
    
    const adminHtml = `
      <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'>
        <h1 style='color: #333; font-size: 24px; margin-bottom: 24px;'>New Newsletter Subscription</h1>
        <p><strong>Email:</strong> ${data.email}</p>
        ${data.name ? `<p><strong>Name:</strong> ${data.name}</p>` : ''}
        ${data.interests && data.interests.length > 0 
          ? `<p><strong>Interests:</strong> ${data.interests.join(', ')}</p>` 
          : ''
        }
        <p style='color: #666; font-size: 14px;'>This user subscribed to your newsletter on your website.</p>
      </div>
    `
    
    // Send notification to admin
    const adminResult = await sendEmail({
      to: adminEmail,
      subject: 'New Newsletter Subscription',
      html: adminHtml,
    })
    
    if (isEmailError(adminResult)) {
      throw new Error(`Failed to send admin notification: ${adminResult.error}`)
    }
    
    // Send welcome email to subscriber
    const userHtml = `
      <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'>
        <h1 style='color: #333; font-size: 24px; margin-bottom: 24px;'>Welcome to Our Newsletter!</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>Thank you for subscribing to our newsletter. You'll now receive updates on:</p>
        <ul>
          <li>Industry insights and trends</li>
          <li>Tips for growing your business</li>
          <li>Special offers and promotions</li>
        </ul>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>The Hudson Digital Solutions Team</p>
      </div>
    `
    
    const userResult = await sendEmail({
      to: data.email,
      subject: 'Welcome to Our Newsletter',
      html: userHtml,
    })
    
    if (isEmailError(userResult)) {
      logger.warn('Failed to send newsletter welcome email', {
        error: userResult.error,
        email: data.email,
      })
      // Continue if welcome email fails since admin was notified
    }
    
    return { 
      success: true, 
      id: adminResult.id, 
      message: 'Newsletter subscription processed successfully', 
    }
  } catch (error) {
    logger.error('Error processing newsletter signup', {
      error: error instanceof Error ? error.message : String(error),
    })
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation error in newsletter data', 
        details: error.errors, 
      }
    }
    
    return { 
      success: false, 
      error: 'Failed to process newsletter subscription', 
      details: error instanceof Error ? error.message : String(error), 
    }
  }
}

/**
 * Process lead magnet requests
 */
export async function processLeadMagnet(data: LeadMagnetData): Promise<EmailResult> {
  try {
    // Validate lead magnet data
    leadMagnetSchema.parse(data)
    
    // Get resource info based on resourceId
    const resources: Record<string, { name: string, path: string, description: string }> = {
      'website-checklist': {
        name: 'Website Health Checklist',
        path: '/resources/website-checklist.pdf',
        description: 'A comprehensive checklist to ensure your website is optimized for success.',
      },
      'seo-basics': {
        name: 'SEO Basics Cheatsheet',
        path: '/resources/seo-basics-cheatsheet.pdf',
        description: 'Essential SEO tips to improve your website visibility.',
      },
      'contact-templates': {
        name: 'Contact Form Templates',
        path: '/resources/contact-form-templates.pdf',
        description: 'Ready-to-use contact form templates for better lead generation.',
      },
      // Add more resources as needed
    }
    
    const resource = resources[data.resourceId]
    
    if (!resource) {
      throw new Error(`Resource not found: ${data.resourceId}`)
    }
    
    // Prepare notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hudsondigitalsolutions.com'
    
    const adminHtml = `
      <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'>
        <h1 style='color: #333; font-size: 24px; margin-bottom: 24px;'>New Lead Magnet Download</h1>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Resource:</strong> ${resource.name} (${data.resourceId})</p>
        <p style='color: #666; font-size: 14px;'>This lead was generated from your website.</p>
      </div>
    `
    
    // Send admin notification
    const adminResult = await sendEmail({
      to: adminEmail,
      subject: `New Lead Magnet Download: ${resource.name}`,
      html: adminHtml,
    })
    
    if (isEmailError(adminResult)) {
      throw new Error(`Failed to send admin notification: ${adminResult.error}`)
    }
    
    // Send resource email to user
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hudsondigitalsolutions.com'
    const resourceUrl = `${siteUrl}${resource.path}`
    
    const userHtml = `
      <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'>
        <h1 style='color: #333; font-size: 24px; margin-bottom: 24px;'>Your ${resource.name} Download</h1>
        <p>Hi ${data.name},</p>
        <p>Thank you for your interest in our ${resource.name}. You can download it using the link below:</p>
        <div style='text-align: center; margin: 32px 0;'>
          <a href='${resourceUrl}' style='background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;'>
            Download Your ${resource.name}
          </a>
        </div>
        <p>${resource.description}</p>
        <p>If you have any questions or need assistance, feel free to reply to this email.</p>
        <p>Best regards,<br>The Hudson Digital Solutions Team</p>
      </div>
    `
    
    const userResult = await sendEmail({
      to: data.email,
      subject: `Your ${resource.name} Download`,
      html: userHtml,
    })
    
    if (isEmailError(userResult)) {
      logger.warn('Failed to send lead magnet email', {
        error: userResult.error,
        email: data.email,
      })
      // Continue if lead magnet email fails since admin was notified
    }
    
    return { 
      success: true, 
      id: adminResult.id, 
      message: 'Lead magnet processed successfully',
    }
  } catch (error) {
    logger.error('Error processing lead magnet', {
      error: error instanceof Error ? error.message : String(error),
    })
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation error in lead magnet data', 
        details: error.errors, 
      }
    }
    
    return { 
      success: false, 
      error: 'Failed to process lead magnet request', 
      details: error instanceof Error ? error.message : String(error), 
    }
  }
}