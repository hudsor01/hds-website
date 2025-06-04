import React from 'react'
import { Resend } from 'resend'
import { ContactNotificationTemplate } from '@/components/emails/contact-notification'
import { ContactConfirmationTemplate } from '@/components/emails/contact-confirmation'
import { NewsletterWelcomeTemplate } from '@/components/emails/newsletter-welcome'

// Initialize Resend with error handling
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || 'noreply@hudsondigitalsolutions.com',
  adminEmail: process.env.CONTACT_EMAIL || 'contact@hudsondigitalsolutions.com',
  replyTo: process.env.CONTACT_EMAIL || 'contact@hudsondigitalsolutions.com',
} as const

// Types
interface ContactEmailData {
  name: string
  email: string
  company?: string
  phone?: string
  service?: string
  message: string
  sourceUrl?: string
}

interface NewsletterEmailData {
  email: string
  firstName?: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Email service functions
export class ResendEmailService {
  /**
   * Send contact form notification to admin
   */
  static async sendContactNotification(data: ContactEmailData): Promise<EmailResult> {
    try {
      const timestamp = new Date().toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })

      const { data: result, error } = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: [EMAIL_CONFIG.adminEmail],
        replyTo: data.email, // Reply goes directly to customer
        subject: `🚀 New Business Inquiry from ${data.name}${data.company ? ` (${data.company})` : ''}`,
        react: ContactNotificationTemplate({
          ...data,
          timestamp,
        }) as React.ReactElement,
        tags: [
          { name: 'category', value: 'contact-notification' },
          { name: 'source', value: 'website' },
          { name: 'priority', value: 'high' },
        ],
      })

      if (error) {
        console.error('Failed to send contact notification:', error)
        return { success: false, error: error.message }
      }

      return { success: true, messageId: result?.id }
    } catch (error) {
      console.error('Contact notification email error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send contact form confirmation to customer
   */
  static async sendContactConfirmation(data: ContactEmailData): Promise<EmailResult> {
    try {
      const { data: result, error } = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: [data.email],
        replyTo: EMAIL_CONFIG.replyTo,
        subject: '✨ Thank you for reaching out - Hudson Digital Solutions',
        react: ContactConfirmationTemplate({
          name: data.name,
          message: data.message,
        }) as React.ReactElement,
        tags: [
          { name: 'category', value: 'contact-confirmation' },
          { name: 'source', value: 'website' },
          { name: 'priority', value: 'normal' },
        ],
      })

      if (error) {
        console.error('Failed to send contact confirmation:', error)
        return { success: false, error: error.message }
      }

      return { success: true, messageId: result?.id }
    } catch (error) {
      console.error('Contact confirmation email error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send newsletter welcome email
   */
  static async sendNewsletterWelcome(data: NewsletterEmailData): Promise<EmailResult> {
    try {
      const { data: result, error } = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: [data.email],
        replyTo: EMAIL_CONFIG.replyTo,
        subject: '🎯 Welcome to the Inside Track - Your Business Optimization Journey Starts Now!',
        react: NewsletterWelcomeTemplate({
          email: data.email,
          firstName: data.firstName,
        }) as React.ReactElement,
        tags: [
          { name: 'category', value: 'newsletter-welcome' },
          { name: 'source', value: 'website' },
          { name: 'priority', value: 'normal' },
        ],
      })

      if (error) {
        console.error('Failed to send newsletter welcome:', error)
        return { success: false, error: error.message }
      }

      return { success: true, messageId: result?.id }
    } catch (error) {
      console.error('Newsletter welcome email error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send both contact notification and confirmation emails
   */
  static async sendContactEmails(data: ContactEmailData): Promise<{
    notificationResult: EmailResult
    confirmationResult: EmailResult
  }> {
    const [notificationResult, confirmationResult] = await Promise.all([
      this.sendContactNotification(data),
      this.sendContactConfirmation(data),
    ])

    return {
      notificationResult,
      confirmationResult,
    }
  }

  /**
   * Validate email configuration
   */
  static validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!process.env.RESEND_API_KEY) {
      errors.push('RESEND_API_KEY environment variable is required')
    }
    
    if (!process.env.RESEND_FROM_EMAIL) {
      errors.push('RESEND_FROM_EMAIL environment variable is required')
    }
    
    if (!process.env.CONTACT_EMAIL) {
      errors.push('CONTACT_EMAIL environment variable is required')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Test email configuration by sending a test email
   */
  static async testConfiguration(): Promise<EmailResult> {
    const validation = this.validateConfig()
    
    if (!validation.isValid) {
      return {
        success: false,
        error: `Configuration errors: ${validation.errors.join(', ')}`,
      }
    }

    try {
      const { data: result, error } = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: [EMAIL_CONFIG.adminEmail],
        subject: '🧪 Resend Configuration Test - Hudson Digital Solutions',
        html: `
          <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;'>
            <h2 style='color: #3B82F6;'>✅ Resend Configuration Test</h2>
            <p>This is a test email to verify that your Resend configuration is working correctly.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
            <p>If you received this email, your Resend integration is working properly!</p>
          </div>
        `,
        tags: [
          { name: 'category', value: 'configuration-test' },
          { name: 'environment', value: process.env.NODE_ENV || 'unknown' },
        ],
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, messageId: result?.id }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

// Export individual functions for backwards compatibility
export const sendContactNotification = ResendEmailService.sendContactNotification.bind(ResendEmailService)
export const sendContactConfirmation = ResendEmailService.sendContactConfirmation.bind(ResendEmailService)
export const sendNewsletterWelcome = ResendEmailService.sendNewsletterWelcome.bind(ResendEmailService)
export const sendContactEmails = ResendEmailService.sendContactEmails.bind(ResendEmailService)

// Export types
export type { ContactEmailData, NewsletterEmailData, EmailResult }