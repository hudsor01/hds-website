import { z } from 'zod'
import {
  createTRPCRouter,
  publicProcedure,
  rateLimitMiddleware,
} from '../lib/trpc-unified'
import {
  contactFormFullSchema,
  newsletterSchema,
  leadMagnetSchema,
  buildContactFormSchema,
} from '@/lib/validation/form-schemas'
import { pageViewSchema, eventSchema } from '@/types/analytics-types'
import { logger } from '@/lib/logger'
import { contactRouter } from './contact'
import { newsletterRouter } from './newsletter'
import { leadMagnetRouter, resources } from './lead-magnet'
import { authRouter } from './auth'
import { adminRouter } from './admin'
import { blogRouter } from './blog'
import { servicesRouter } from './services'
import { testimonialsRouter } from './testimonials'
import { caseStudiesRouter } from './case-studies'

/**
 * Unified API Router
 *
 * This is the main API router that consolidates all endpoints into a single,
 * well-structured interface. It replaces the individual routers with a more
 * organized approach.
 *
 * Router structure:
 *
 * - contact: Contact form related endpoints
 *   - submit: Submit contact form
 *
 * - newsletter: Newsletter subscription endpoints
 *   - subscribe: Subscribe to newsletter
 *   - unsubscribe: Unsubscribe from newsletter
 *
 * - leadMagnet: Lead magnet related endpoints
 *   - download: Request a lead magnet resource
 *   - getResources: Get list of available resources
 *   - getResource: Get a specific resource details
 *
 * - auth: Authentication endpoints
 *   - login: Admin login
 *   - logout: Admin logout
 *   - verifySession: Verify current session
 *   - me: Get current user info
 *
 * - blog: Blog post management
 *   - getPosts: Get published blog posts
 *   - getPost: Get single blog post
 *   - createPost: Create new blog post (admin)
 *   - updatePost: Update blog post (admin)
 *   - deletePost: Delete blog post (admin)
 *
 * - services: Service management
 *   - getServices: Get all services
 *   - getService: Get single service
 *   - createService: Create new service (admin)
 *   - updateService: Update service (admin)
 *   - deleteService: Delete service (admin)
 *
 * - testimonials: Testimonial management
 *   - getTestimonials: Get all testimonials
 *   - getTestimonial: Get single testimonial
 *   - createTestimonial: Create new testimonial (admin)
 *   - updateTestimonial: Update testimonial (admin)
 *   - deleteTestimonial: Delete testimonial (admin)
 *
 * - caseStudies: Case study management
 *   - getCaseStudies: Get all case studies
 *   - getCaseStudy: Get single case study
 *   - createCaseStudy: Create new case study (admin)
 *   - updateCaseStudy: Update case study (admin)
 *   - deleteCaseStudy: Delete case study (admin)
 *
 * - analytics: Analytics tracking endpoints
 *   - trackPageView: Track page view
 *   - trackEvent: Track custom event
 */
export const apiRouter = createTRPCRouter({
  // ===== Contact Form =====
  contact: contactRouter,

  // ===== Newsletter =====
  newsletter: newsletterRouter,

  // ===== Lead Magnet =====
  leadMagnet: leadMagnetRouter,

  // ===== Authentication =====
  auth: authRouter,

  // ===== Admin Dashboard =====
  admin: adminRouter,

  // ===== Content Management =====
  blog: blogRouter,
  services: servicesRouter,
  testimonials: testimonialsRouter,
  caseStudies: caseStudiesRouter,

  // ===== Analytics =====
  analytics: createTRPCRouter({
    /**
     * Track page view
     *
     * Records a page view event in the analytics system.
     * This endpoint is designed to fail silently to avoid impacting user experience.
     */
    trackPageView: publicProcedure
      .input(pageViewSchema)
      .mutation(async ({ input, ctx }) => {
        try {
          // Here you would implement page view tracking logic
          // For example, save to your analytics database

          // Log the pageview
          logger.info('Page view tracked', {
            url: input.url,
            title: input.title,
            path: input.path,
            referrer: input.referrer || 'direct',
            timestamp: new Date().toISOString(),
          })

          // In a real implementation, you would save this data
          // to your analytics database or send to a service like
          // Google Analytics, Plausible, etc.

          return {
            success: true,
            timestamp: new Date().toISOString(),
          }
        } catch (error) {
          logger.error('Error tracking page view', {
            error: error instanceof Error ? error.message : String(error),
            url: input.url,
          })

          // Don't throw an error for analytics to avoid disrupting user experience
          return {
            success: false,
          }
        }
      }),

    /**
     * Track event
     *
     * Records a custom event in the analytics system.
     * This endpoint is designed to fail silently to avoid impacting user experience.
     */
    trackEvent: publicProcedure
      .input(eventSchema)
      .mutation(async ({ input, ctx }) => {
        try {
          // Log the event
          logger.info('Event tracked', {
            event: input.name,
            category: input.category || 'general',
            action: input.action,
            label: input.label,
            value: input.value,
            page: input.page,
            data: input.data,
            timestamp: new Date().toISOString(),
          })

          // In a real implementation, you would save this data
          // to your analytics database or send to a service

          return {
            success: true,
            timestamp: new Date().toISOString(),
          }
        } catch (error) {
          logger.error('Error tracking event', {
            error: error instanceof Error ? error.message : String(error),
            event: input.name,
          })

          // Don't throw an error for analytics to avoid disrupting user experience
          return {
            success: false,
          }
        }
      }),
  }),
})

/**
 * Export type definition of API router
 */
export type ApiRouter = typeof apiRouter
