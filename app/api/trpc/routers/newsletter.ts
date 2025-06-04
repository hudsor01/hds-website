import { TRPCError } from '@trpc/server'
import { Resend } from 'resend'
import { createTRPCRouter, publicProcedure } from '../lib/trpc-unified'
import { newsletterSchema } from '@/lib/validation/form-schemas'
import { env } from '@/lib/env'
import { logger, emailLogger } from '@/lib/logger'
import { sanitizeNewsletterFormData } from '@/lib/security/sanitization'
import { db } from '@/lib/database'
import { z } from 'zod'

const resend = new Resend(env.RESEND_API_KEY)

export const newsletterRouter = createTRPCRouter({
  subscribe: publicProcedure
    .input(newsletterSchema)
    .mutation(async ({ input }) => {
      const startTime = Date.now()

      try {
        // Sanitize input data
        const sanitizedInput = sanitizeNewsletterFormData({
          email: input.email,
          name: input.name,
        })

        logger.info('Newsletter subscription', {
          email: sanitizedInput.email,
          name: sanitizedInput.name,
          interests: input.interests,
        })

        // Check if email already exists
        const existingSubscriber = await db.newsletterSubscriber.findUnique({
          where: { email: sanitizedInput.email },
        })

        if (existingSubscriber) {
          if (existingSubscriber.status === 'ACTIVE') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'This email is already subscribed to our newsletter.',
            })
          } else {
            // Reactivate if previously unsubscribed
            await db.newsletterSubscriber.update({
              where: { email: sanitizedInput.email },
              data: {
                status: 'ACTIVE',
                name: sanitizedInput.name || existingSubscriber.name,
                interests: input.interests || existingSubscriber.interests,
                subscribedAt: new Date(),
                unsubscribedAt: null,
              },
            })
          }
        } else {
          // Create new subscriber
          await db.newsletterSubscriber.create({
            data: {
              email: sanitizedInput.email,
              name: sanitizedInput.name || null,
              interests: input.interests || [],
              status: 'ACTIVE',
              verified: true, // Auto-verify for now
              source: 'newsletter_form',
            },
          })
        }

        logger.info('Newsletter subscriber stored in database', {
          email: sanitizedInput.email,
          isNew: !existingSubscriber,
        })

        // Send welcome email using sanitized data
        const welcomeHtml = `
          <h2>Welcome to Hudson Digital Solutions Newsletter!</h2>
          
          <p>${sanitizedInput.name ? `Hi ${sanitizedInput.name},` : 'Hello,'}</p>
          
          <p>Thank you for subscribing to our newsletter. You'll receive:</p>
          
          <ul>
            <li>Digital transformation insights</li>
            <li>AI and automation tips</li>
            <li>Business growth strategies</li>
            <li>Technology updates</li>
          </ul>
          
          ${
            input.interests && input.interests.length > 0
              ? `<p>You've expressed interest in: ${input.interests.join(', ')}</p>`
              : ''
          }
          
          <p>We promise to only send valuable content and you can unsubscribe at any time.</p>
          
          <p>Best regards,<br>
          The Hudson Digital Solutions Team</p>
        `

        const fromEmail =
          process.env.RESEND_FROM_EMAIL || 'noreply@hudsondigitalsolutions.com'

        try {
          await resend.emails.send({
            from: fromEmail,
            to: sanitizedInput.email,
            subject: 'Welcome to Hudson Digital Solutions Newsletter',
            html: welcomeHtml,
          })

          emailLogger.info('Welcome email sent', {
            to: sanitizedInput.email,
          })
        } catch (error) {
          emailLogger.error('Failed to send welcome email', {
            error: error instanceof Error ? error.message : 'Unknown error',
          })

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send welcome email',
          })
        }

        // Notify admin using sanitized data
        const adminNotification = `
          <h3>New Newsletter Subscription</h3>
          <p><strong>Email:</strong> ${sanitizedInput.email}</p>
          ${sanitizedInput.name ? `<p><strong>Name:</strong> ${sanitizedInput.name}</p>` : ''}
          ${
            input.interests && input.interests.length > 0
              ? `<p><strong>Interests:</strong> ${input.interests.join(', ')}</p>`
              : ''
          }
          <p><strong>Date:</strong> ${new Date().toISOString()}</p>
        `

        const toEmail = process.env.CONTACT_EMAIL || 'hello@hudsondigitalsolutions.com'

        try {
          await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: 'New Newsletter Subscriber',
            html: adminNotification,
          })

          emailLogger.info('Admin notification sent', {
            subscriber: sanitizedInput.email,
          })
        } catch (error) {
          // Don't fail the whole request if admin notification fails
          emailLogger.error('Failed to send admin notification', {
            error: error instanceof Error ? error.message : 'Unknown error',
            subscriber: sanitizedInput.email,
          })
        }

        const duration = Date.now() - startTime

        logger.info('Newsletter subscription completed', {
          duration,
          email: sanitizedInput.email,
        })

        return {
          success: true,
          message: 'Successfully subscribed to the newsletter!',
        }
      } catch (error) {
        const duration = Date.now() - startTime

        logger.error('Newsletter subscription failed', {
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
          email: input?.email || 'unknown',
        })

        if (error instanceof TRPCError) {
          throw error
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to subscribe to newsletter. Please try again.',
        })
      }
    }),

  unsubscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        token: z.string(), // Unsubscribe token for security
      }),
    )
    .mutation(async ({ input }) => {
      // TODO: Implement unsubscribe logic with proper token validation
      // For now, just return success
      logger.info('Newsletter unsubscribe request', {
        email: input.email,
      })

      return {
        success: true,
        message: 'Successfully unsubscribed from the newsletter',
      }
    }),
})
