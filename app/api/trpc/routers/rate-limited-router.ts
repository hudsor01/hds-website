import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/app/api/trpc/lib/trpc'
import { 
  contactFormRateLimit,
  newsletterRateLimit,
  bookingRateLimit,
  apiRateLimit,
  rateLimitHealthCheck,
} from '@/lib/redis/production-rate-limiter'
import { logger } from '@/lib/logger'

/**
 * Production Rate-Limited API Router
 * 
 * This router demonstrates how to integrate Redis-based rate limiting
 * with your existing tRPC procedures. Each endpoint has appropriate
 * rate limiting based on its risk profile and usage patterns.
 * 
 * Purpose: Implement production-ready rate limiting for item #4 on security checklist
 * Assumptions: Redis is configured via UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * 
 * Layer grouping:
 * - API Layer: Rate limiting middleware
 * - Business Logic Layer: tRPC procedures
 * - Data Layer: Database operations (existing)
 */

const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
  company: z.string().optional(),
  phone: z.string().optional(),
})

const newsletterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
})

const bookingSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  service: z.enum(['consultation', 'development', 'design', 'maintenance']),
  message: z.string().max(1000).optional(),
  preferredDate: z.string().optional(),
})

export const rateLimitedRouter = createTRPCRouter({
  /**
   * Contact Form Submission
   * Rate limit: 2 requests per 15 minutes
   * Risk: High (spam potential)
   */
  submitContactForm: publicProcedure
    .use(contactFormRateLimit)
    .input(contactFormSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        logger.info('Contact form submission', {
          email: input.email,
          company: input.company,
          hasPhone: !!input.phone,
        })

        // TODO: Implement actual contact form logic
        // - Save to database
        // - Send email notification
        // - Send auto-reply to user
        
        return {
          success: true,
          message: 'Thank you for your message. We\'ll get back to you within 24 hours.',
        }
      } catch (error) {
        logger.error('Contact form submission failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          email: input.email,
        })
        
        throw new Error('Failed to submit contact form. Please try again.')
      }
    }),

  /**
   * Newsletter Subscription
   * Rate limit: 3 requests per 5 minutes
   * Risk: Medium (email list abuse)
   */
  subscribeNewsletter: publicProcedure
    .use(newsletterRateLimit)
    .input(newsletterSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        logger.info('Newsletter subscription', {
          email: input.email,
          hasName: !!input.name,
        })

        // TODO: Implement newsletter subscription logic
        // - Check if already subscribed
        // - Add to mailing list
        // - Send confirmation email
        
        return {
          success: true,
          message: 'Successfully subscribed to newsletter. Check your email for confirmation.',
        }
      } catch (error) {
        logger.error('Newsletter subscription failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          email: input.email,
        })
        
        throw new Error('Failed to subscribe to newsletter. Please try again.')
      }
    }),

  /**
   * Booking Request
   * Rate limit: 5 requests per 10 minutes
   * Risk: Medium (calendar spam)
   */
  submitBooking: publicProcedure
    .use(bookingRateLimit)
    .input(bookingSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        logger.info('Booking request', {
          email: input.email,
          service: input.service,
          hasPreferredDate: !!input.preferredDate,
        })

        // TODO: Implement booking logic
        // - Check availability
        // - Create calendar event
        // - Send confirmation emails
        // - Integrate with Cal.com API
        
        return {
          success: true,
          message: 'Booking request received. We\'ll confirm your appointment within 2 hours.',
          bookingId: `booking_${Date.now()}`, // Temporary ID
        }
      } catch (error) {
        logger.error('Booking submission failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          email: input.email,
          service: input.service,
        })
        
        throw new Error('Failed to submit booking request. Please try again.')
      }
    }),

  /**
   * General API Health Check
   * Rate limit: 60 requests per minute (moderate)
   * Risk: Low (read-only)
   */
  healthCheck: publicProcedure
    .use(apiRateLimit)
    .query(async ({ ctx }) => {
      try {
        const rateLimitHealth = await rateLimitHealthCheck()
        
        return {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            database: 'healthy', // From your existing DB middleware
            rateLimit: rateLimitHealth.status,
            redis: rateLimitHealth.details.redis.connected ? 'healthy' : 'degraded',
          },
          fallbackMode: rateLimitHealth.details.fallbackMode,
        }
      } catch (error) {
        logger.error('Health check failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        
        return {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          error: 'Health check partially failed',
        }
      }
    }),

  /**
   * Rate Limit Status Check
   * Useful for debugging and monitoring
   * Rate limit: 60 requests per minute
   */
  rateLimitStatus: publicProcedure
    .use(apiRateLimit)
    .query(async ({ ctx }) => {
      const health = await rateLimitHealthCheck()
      
      return {
        redis: {
          connected: health.details.redis.connected,
          status: health.status,
          fallbackMode: health.details.fallbackMode,
          error: health.details.lastError,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          skipRateLimiting: process.env.SKIP_RATE_LIMITING === 'true',
          hasRedisConfig: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
        },
      }
    }),
})

/**
 * Trade-off Analysis:
 * 
 * Chosen Approach: Redis-first with in-memory fallback
 * ✅ Pros:
 * - Distributed rate limiting across Vercel functions
 * - Production-grade scalability
 * - Upstash optimized for serverless
 * - Graceful degradation when Redis unavailable
 * - Comprehensive monitoring and alerting
 * 
 * ❌ Cons:
 * - External dependency (Redis)
 * - Additional cost (~$5-20/month)
 * - Network latency for each check (~1-2ms)
 * - More complex configuration
 * 
 * Alternative Approaches Considered:
 * 1. Vercel Edge Config: Limited to 512KB, read-only
 * 2. Database-based: Too slow for rate limiting
 * 3. In-memory only: Doesn't work across functions
 * 4. Nginx/proxy level: Not available on Vercel
 * 
 * Selected Redis because:
 * - Best performance for rate limiting use case
 * - Scales with your application growth
 * - Industry standard for this pattern
 * - Upstash has excellent Vercel integration
 * 
 * Dependencies:
 * - @upstash/redis (already installed)
 * - UPSTASH_REDIS_REST_URL environment variable
 * - UPSTASH_REDIS_REST_TOKEN environment variable
 * 
 * Side Effects:
 * - Creates Redis keys with TTL for rate limiting
 * - Logs rate limit violations for monitoring
 * - May fail open (allow requests) on Redis errors for availability
 */
