'use server'

import { headers } from "next/headers"
import { unifiedRateLimiter } from "@/lib/rate-limiter"
import { getClientIpFromHeaders } from "@/lib/utils/request"
import { createServerLogger } from "@/lib/logger"
import { castError } from '@/lib/utils/errors'
import { processContactSubmission, type ContactSubmissionResult } from "@/lib/services/contact-service"

export type ContactFormState = ContactSubmissionResult | null

/**
 * Server Action for contact form submission
 * Delegates business logic to processContactSubmission for consistency with API route
 */
export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactSubmissionResult> {
  const logger = createServerLogger(`contact-form-${Date.now()}`);

  try {
    logger.info('Contact form submission started');

    // Rate limiting
    const headersList = await headers()
    const clientIP = getClientIpFromHeaders(headersList)
    const isAllowed = await unifiedRateLimiter.checkLimit(clientIP, 'contactForm')

    if (!isAllowed) {
      return {
        success: false,
        error: "Too many requests. Please try again in 15 minutes."
      }
    }

    // Convert FormData to object and delegate to shared processing
    const rawData = Object.fromEntries(formData.entries())
    return await processContactSubmission(rawData, clientIP, logger)

  } catch (error) {
    logger.error("Contact form error", castError(error))
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later."
    }
  }
}
