import { TRPCError } from '@trpc/server'
import { Resend } from 'resend'
import { createTRPCRouter, publicProcedure } from '../lib/trpc-unified'
import { contactFormFullSchema } from '@/lib/validation/form-schemas'
import { triggerSequence } from '@/lib/email/sequences/engine'
import { env } from '@/lib/env'
import { logger, emailLogger } from '@/lib/logger'
import { sanitizeHtml, sanitizeEmail, sanitizeText, sanitizePhone, commonSanitizers } from '@/lib/security/input-sanitization'
import { db } from '@/lib/database'
import { z } from 'zod'

const resend = new Resend(env.RESEND_API_KEY)

// Extend the schema to include spam protection fields
const contactFormWithSpamProtectionSchema = contactFormFullSchema.extend({
  // Honeypot fields for bot detection
  website: z.string().optional(),
  honeypot: z.string().optional(),
  // Timing protection
  formStartTime: z.number().optional(),
  formSubmissionTime: z.number().optional(),
})

export const contactRouter = createTRPCRouter({
  submit: publicProcedure
    .input(contactFormWithSpamProtectionSchema)
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now()

      const sanitizedInput: Record<string, unknown> = null

      try {
        // Sanitize input data
        const sanitizedInput = {
          name: commonSanitizers.name(input.name),
          email: commonSanitizers.email(input.email),
          phone: input.phone ? commonSanitizers.phone(input.phone) : undefined,
          company: input.company ? sanitizeText(input.company) : undefined,
          subject: input.subject ? sanitizeText(input.subject) : undefined,
          service: input.service ? sanitizeText(input.service) : undefined,
          budget: input.budget ? sanitizeText(input.budget) : undefined,
          message: commonSanitizers.message(input.message),
        }

        // Log the request
        logger.info('Contact form submission', {
          email: sanitizedInput.email,
          service: sanitizedInput.service,
        })

        // Basic spam protection checks
        if (input.website || input.honeypot) {
          logger.warn('Honeypot triggered', {
            email: sanitizedInput.email,
            honeypot: !!input.honeypot,
            website: !!input.website,
          })

          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Security validation failed. Please try again.',
          })
        }

        // Timing protection (submissions faster than 3 seconds are suspicious)
        if (input.formStartTime && input.formSubmissionTime) {
          const formDuration = input.formSubmissionTime - input.formStartTime
          if (formDuration < 3000) {
            logger.warn('Form submitted too quickly', {
              email: sanitizedInput.email,
              duration: formDuration,
            })

            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Please take more time to fill out the form.',
            })
          }
        }

        // Extract metadata from context
        const metadata = {
          ipAddress: ctx.headers?.get('x-forwarded-for') || ctx.headers?.get('x-real-ip') || null,
          userAgent: ctx.headers?.get('user-agent') || null,
          referrer: ctx.headers?.get('referer') || null,
        }

        // Store contact in database
        const contact = await db.contact.create({
          data: {
            name: sanitizedInput.name,
            email: sanitizedInput.email,
            phone: sanitizedInput.phone || null,
            company: sanitizedInput.company || null,
            subject: sanitizedInput.subject || null,
            service: sanitizedInput.service || null,
            budget: sanitizedInput.budget || null,
            message: sanitizedInput.message,
            source: 'contact_form',
            status: 'NEW',
            ...metadata,
          },
        })

        logger.info('Contact stored in database', {
          contactId: contact.id,
          email: sanitizedInput.email,
        })

        // Prepare email HTML using sanitized input
        const emailHtml = `
          <h2>New Contact Form Submission</h2>
          
          <h3>Contact Information:</h3>
          <ul>
            <li><strong>Name:</strong> ${sanitizedInput.name}</li>
            <li><strong>Email:</strong> ${sanitizedInput.email}</li>
            ${sanitizedInput.company ? `<li><strong>Company:</strong> ${sanitizedInput.company}</li>` : ''}
            ${sanitizedInput.phone ? `<li><strong>Phone:</strong> ${sanitizedInput.phone}</li>` : ''}
          </ul>
          
          <h3>Project Details:</h3>
          <ul>
            ${sanitizedInput.service ? `<li><strong>Service:</strong> ${sanitizedInput.service}</li>` : ''}
            ${sanitizedInput.budget ? `<li><strong>Budget:</strong> ${sanitizedInput.budget}</li>` : ''}
          </ul>
          
          <h3>Message:</h3>
          <p>${sanitizedInput.message.replace(/\n/g, '<br>')}</p>
        `

        const fromEmail =
          process.env.RESEND_FROM_EMAIL || 'noreply@hudsondigitalsolutions.com'
        const toEmail = process.env.CONTACT_EMAIL || 'hello@hudsondigitalsolutions.com'

        // Send admin notification
        try {
          await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            replyTo: sanitizedInput.email,
            subject: `New Contact Form: ${sanitizedInput.service || 'General'} - ${sanitizedInput.name}`,
            html: emailHtml,
          })

          emailLogger.info('Admin notification sent', {
            to: toEmail,
            subject: `Contact form from ${sanitizedInput.name}`,
          })
        } catch (error) {
          emailLogger.error('Failed to send admin notification', {
            error: error instanceof Error ? error.message : 'Unknown error',
          })

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send notification',
          })
        }

        // Send confirmation email to user
        const confirmationHtml = `
          <h2>Thank you for contacting Hudson Digital Solutions</h2>
          
          <p>Hi ${sanitizedInput.name},</p>
          
          <p>We've received your message and will respond within 24 hours.</p>
          
          <h3>Your Request:</h3>
          <ul>
            ${sanitizedInput.service ? `<li><strong>Service:</strong> ${sanitizedInput.service}</li>` : ''}
            ${sanitizedInput.budget ? `<li><strong>Budget:</strong> ${sanitizedInput.budget}</li>` : ''}
          </ul>
          
          <h3>Your Message:</h3>
          <p>${sanitizedInput.message.replace(/\n/g, '<br>')}</p>
          
          <p>Best regards,<br>
          The Hudson Digital Solutions Team</p>
        `

        try {
          await resend.emails.send({
            from: fromEmail,
            to: sanitizedInput.email,
            subject: 'We received your message - Hudson Digital Solutions',
            html: confirmationHtml,
          })

          emailLogger.info('Confirmation email sent', {
            to: sanitizedInput.email,
          })
        } catch (error) {
          // Don't fail the whole request if confirmation fails
          emailLogger.error('Failed to send confirmation email', {
            error: error instanceof Error ? error.message : 'Unknown error',
            to: sanitizedInput.email,
          })
        }

        // Trigger email sequence
        try {
          await triggerSequence('contact_form', {
            email: sanitizedInput.email,
            name: sanitizedInput.name,
            firstName: sanitizedInput.name.split(' ')[0],
            service: sanitizedInput.service,
            company: sanitizedInput.company,
            budget: sanitizedInput.budget,
          })

          emailLogger.info('Email sequence triggered', {
            sequence: 'contact_form',
            email: sanitizedInput.email,
          })
        } catch (error) {
          // Don't fail the whole request if sequence fails
          emailLogger.error('Failed to trigger email sequence', {
            error: error instanceof Error ? error.message : 'Unknown error',
            email: sanitizedInput.email,
          })
        }

        const duration = Date.now() - startTime

        logger.info('Contact form processed successfully', {
          duration,
          email: sanitizedInput.email,
        })

        return {
          success: true,
          message: "Thank you for your message! We'll be in touch soon.",
        }
      } catch (error) {
        const duration = Date.now() - startTime

        logger.error('Contact form processing failed', {
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
          email: sanitizedInput?.email || 'unknown',
        })

        if (error instanceof TRPCError) {
          throw error
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong. Please try again later.',
        })
      }
    }),
})
