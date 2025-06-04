'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ResendEmailService, type ContactEmailData, type NewsletterEmailData } from '@/lib/email/resend-service'
import { headers } from 'next/headers'
import { monitorEmailDelivery } from '@/lib/monitoring/email-monitoring'

// Server Action result types
type ActionResult<T = unknown> = {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}

/**
 * Server Action: Handle contact form submission with Resend integration
 */
export async function submitContactForm(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  try {
    // Validate form data
    const validatedFields = ContactFormSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company') || undefined,
      phone: formData.get('phone') || undefined,
      service: formData.get('service') || undefined,
      message: formData.get('message'),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        message: 'Please correct the form errors below.',
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Get source URL from headers for tracking
    const headersList = await headers()
    const referer = headersList.get('referer')
    const sourceUrl = referer || 'Direct'

    // Prepare email data
    const emailData: ContactEmailData = {
      ...validatedFields.data,
      sourceUrl,
    }

    // Send emails using Resend with monitoring
    const emailResults = await monitorEmailDelivery(
      'contact-form',
      () => ResendEmailService.sendContactEmails(emailData),
      2, // max retries
    )

    // Check if emails were sent successfully
    if (!emailResults.notificationResult.success) {
      console.error('Failed to send admin notification:', emailResults.notificationResult.error)
      return {
        success: false,
        message: 'Failed to send notification email. Please try again or contact us directly.',
      }
    }

    if (!emailResults.confirmationResult.success) {
      console.error('Failed to send customer confirmation:', emailResults.confirmationResult.error)
      // Don't fail the entire operation if confirmation email fails
      // The admin notification was successful, which is most important
    }

    // Revalidate contact page cache
    revalidatePath('/contact')

    return {
      success: true,
      message: `Thank you, ${validatedFields.data.name}! Your message has been sent successfully. We'll get back to you within 24 hours.`,
      data: {
        notificationSent: emailResults.notificationResult.success,
        confirmationSent: emailResults.confirmationResult.success,
        messageIds: {
          notification: emailResults.notificationResult.messageId,
          confirmation: emailResults.confirmationResult.messageId,
        },
      },
    }
  } catch (error) {
    console.error('Contact form submission error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again or contact us directly.',
    }
  }
}

// Add ContactFormSchema definition
const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

// Add NewsletterFormSchema definition
const NewsletterFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required').optional(),
})

/**
 * Server Action: Handle newsletter subscription with Resend integration
 */
export async function subscribeToNewsletter(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  try {
    // Validate form data
    const validatedFields = NewsletterFormSchema.safeParse({
      email: formData.get('email'),
      firstName: formData.get('firstName') || undefined,
    })

    if (!validatedFields.success) {
      return {
        success: false,
        message: 'Please enter a valid email address.',
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Check if email is already subscribed (you might want to implement this check)
    // For now, we'll proceed with the subscription

    // Prepare email data
    const emailData: NewsletterEmailData = {
      email: validatedFields.data.email,
      firstName: validatedFields.data.firstName,
    }

    // Send welcome email with monitoring
    const emailResult = await monitorEmailDelivery(
      'newsletter-welcome',
      () => ResendEmailService.sendNewsletterWelcome(emailData),
      2, // max retries
    )

    if (!emailResult.success) {
      console.error('Failed to send newsletter welcome email:', emailResult.error)
      return {
        success: false,
        message: 'Failed to complete subscription. Please try again.',
      }
    }

    // Here you would typically also add the email to your newsletter database
    // For example: await addToNewsletterList(emailData)

    return {
      success: true,
      message: `Welcome aboard! Check your email (${validatedFields.data.email}) for your welcome message and free business assessment.`,
      data: {
        email: validatedFields.data.email,
        messageId: emailResult.messageId,
      },
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred during subscription. Please try again.',
    }
  }
}

/**
 * Server Action: Send lead magnet email (for downloads, assessments, etc.)
 */
export async function sendLeadMagnetEmail(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const validatedFields = z.object({
      email: z.string().email('Please enter a valid email address'),
      firstName: z.string().min(1, 'First name is required'),
      leadMagnet: z.string().min(1, 'Lead magnet type is required'),
    }).safeParse({
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      leadMagnet: formData.get('leadMagnet'),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        message: 'Please fill in all required fields.',
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // You can create different email templates for different lead magnets
    // For now, we'll use the newsletter welcome as a placeholder
    const emailData: NewsletterEmailData = {
      email: validatedFields.data.email,
      firstName: validatedFields.data.firstName,
    }

    const emailResult = await ResendEmailService.sendNewsletterWelcome(emailData)

    if (!emailResult.success) {
      console.error('Failed to send lead magnet email:', emailResult.error)
      return {
        success: false,
        message: 'Failed to send your download link. Please try again.',
      }
    }

    return {
      success: true,
      message: `Success! Check your email (${validatedFields.data.email}) for your ${validatedFields.data.leadMagnet} download link.`,
      data: {
        email: validatedFields.data.email,
        leadMagnet: validatedFields.data.leadMagnet,
        messageId: emailResult.messageId,
      },
    }
  } catch (error) {
    console.error('Lead magnet email error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Server Action: Test email configuration (admin only)
 */
export async function testEmailConfiguration(): Promise<ActionResult> {
  try {
    // In a real app, you'd want to add admin authentication here
    // if (!isAdmin(await getUser())) {
    //   return { success: false, message: 'Unauthorized' }
    // }

    const result = await ResendEmailService.testConfiguration()

    if (!result.success) {
      return {
        success: false,
        message: `Email configuration test failed: ${result.error}`,
      }
    }

    return {
      success: true,
      message: 'Email configuration test passed! Check your admin email for the test message.',
      data: {
        messageId: result.messageId,
      },
    }
  } catch (error) {
    console.error('Email configuration test error:', error)
    return {
      success: false,
      message: 'Failed to test email configuration.',
    }
  }
}