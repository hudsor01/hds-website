'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { ServiceUpdate } from '@/types/service-types'

/**
 * Server Actions for data mutations
 * Following Next.js 15 best practices for Server Functions
 */

// Validation schemas
const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  service: z.string().optional(),
})

const NewsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional(),
})

const LeadMagnetSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  resource: z.string().min(1, 'Resource type is required'),
})

// Contact form submission
export async function submitContactForm(formData: FormData) {
  // Extract and validate form data
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    company: formData.get('company') as string,
    phone: formData.get('phone') as string,
    message: formData.get('message') as string,
    service: formData.get('service') as string,
  }

  try {
    // Validate with Zod schema
    const validatedData = ContactFormSchema.parse(rawData)

    // TODO: In a real implementation, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Add to CRM system
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Log for development
    console.log('Contact form submitted:', validatedData)
    
    // Revalidate any cached data that might be affected
    revalidateTag('contact-submissions')
    
    return {
      success: true,
      message: 'Thank you for your message. We\'ll be in touch soon!',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }
    }

    console.error('Contact form submission error:', error)
    return {
      success: false,
      message: 'Failed to submit form. Please try again.',
    }
  }
}

// Newsletter subscription
export async function subscribeToNewsletter(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    source: formData.get('source') as string,
  }

  try {
    const validatedData = NewsletterSchema.parse(rawData)

    // TODO: Add to email service (Resend, Mailchimp, etc.)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('Newsletter subscription:', validatedData)
    
    // Revalidate newsletter subscriber count
    revalidateTag('newsletter-stats')
    
    return {
      success: true,
      message: 'Successfully subscribed to newsletter!',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Invalid email address',
        errors: error.errors,
      }
    }

    console.error('Newsletter subscription error:', error)
    return {
      success: false,
      message: 'Failed to subscribe. Please try again.',
    }
  }
}

// Lead magnet download
export async function downloadLeadMagnet(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    name: formData.get('name') as string,
    resource: formData.get('resource') as string,
  }

  try {
    const validatedData = LeadMagnetSchema.parse(rawData)

    // TODO: 
    // 1. Add to CRM/email list
    // 2. Track conversion
    // 3. Send download link via email
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    console.log('Lead magnet download:', validatedData)
    
    // Revalidate lead statistics
    revalidateTag('lead-stats')
    
    // Redirect to download page or thank you page
    redirect(`/downloads/${validatedData.resource}?email=${encodeURIComponent(validatedData.email)}`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Please check your information',
        errors: error.errors,
      }
    }

    console.error('Lead magnet download error:', error)
    return {
      success: false,
      message: 'Failed to process download. Please try again.',
    }
  }
}

// Book consultation action
export async function bookConsultation(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    company: formData.get('company') as string,
    phone: formData.get('phone') as string,
    service: formData.get('service') as string,
    message: formData.get('message') as string,
  }

  try {
    const validatedData = ContactFormSchema.parse(rawData)

    // TODO: Integrate with calendar system (Cal.com, Calendly, etc.)
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    console.log('Consultation booking:', validatedData)
    
    // Revalidate consultation stats
    revalidateTag('consultation-bookings')
    
    // Redirect to calendar or thank you page
    redirect('/book-consultation/success')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Please check your information',
        errors: error.errors,
      }
    }

    console.error('Consultation booking error:', error)
    return {
      success: false,
      message: 'Failed to book consultation. Please try again.',
    }
  }
}

// Admin actions (require authentication in real implementation)
export async function updateServicePricing(formData: FormData) {
  // TODO: Add authentication check
  
  const serviceId = formData.get('serviceId') as string
  const price = formData.get('price') as string

  try {
    // TODO: Update in database
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log('Service pricing updated:', { serviceId, price })
    
    // Revalidate service pages
    revalidatePath('/services')
    revalidatePath(`/services/${serviceId}`)
    
    return {
      success: true,
      message: 'Service pricing updated successfully',
    }
  } catch (error) {
    console.error('Service pricing update error:', error)
    return {
      success: false,
      message: 'Failed to update pricing',
    }
  }
}

// Like/interaction action (for blog posts, testimonials, etc.)
export async function incrementLike(itemId: string, type: 'post' | 'testimonial' = 'post') {
  try {
    // TODO: Update like count in database
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Simulate new like count
    const newLikeCount = Math.floor(Math.random() * 100) + 1
    
    console.log(`${type} ${itemId} liked, new count: ${newLikeCount}`)
    
    // Revalidate the specific item
    revalidateTag(`${type}-${itemId}`)
    
    return newLikeCount
  } catch (error) {
    console.error('Like increment error:', error)
    throw error
  }
}

// Batch action for multiple operations
export async function batchUpdateServices(formData: FormData) {
  const updates = JSON.parse(formData.get('updates') as string)

  try {
    // Process multiple updates in parallel
    const results = await Promise.allSettled(
      updates.map(async (update: ServiceUpdate) => {
        // TODO: Update each service in database
        await new Promise(resolve => setTimeout(resolve, 100))
        return { id: update.id, success: true }
      }),
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    // Revalidate all services
    revalidatePath('/services')
    
    return {
      success: true,
      message: `Updated ${successful} services successfully${failed > 0 ? `, ${failed} failed` : ''}`,
      results,
    }
  } catch (error) {
    console.error('Batch update error:', error)
    return {
      success: false,
      message: 'Failed to update services',
    }
  }
}