import { logger } from '@/lib/logger'
import { unifiedRateLimiter } from '@/lib/rate-limiter'
import { getClientIp } from '@/lib/utils/request'
import { processContactSubmission } from '@/lib/services/contact-service'
import type { NextRequest } from 'next/server'

/**
 * API route for contact form submission
 * Delegates business logic to processContactSubmission for consistency with Server Action
 */
export async function POST(request: NextRequest) {
  const logContext = { component: 'contact-form', timestamp: Date.now() };

  try {
    logger.info(`Contact form submission started - contact-form-${Date.now()}`, logContext)

    // Rate limiting
    const clientIP = getClientIp(request)
    const isAllowed = await unifiedRateLimiter.checkLimit(clientIP, 'contactForm')

    if (!isAllowed) {
      return Response.json({
        success: false,
        error: "Too many requests. Please try again in 15 minutes."
      }, { status: 429 })
    }

    // Parse JSON and delegate to shared processing
    const rawData = await request.json()
    const result = await processContactSubmission(rawData, clientIP, logger)

    // Map result to appropriate HTTP status
    if (!result.success) {
      const status = result.error?.includes('Invalid') ? 400 : 500
      return Response.json(result, { status })
    }

    return Response.json(result)

  } catch (error) {
    logger.error("Contact form error", error)
    return Response.json({
      success: false,
      error: "An unexpected error occurred. Please try again later."
    }, { status: 500 })
  }
}
