import { TRPCError } from '@trpc/server'
import { Resend } from 'resend'
import { createTRPCRouter, publicProcedure } from '../lib/trpc-unified'
import { leadMagnetSchema } from '@/lib/validation/form-schemas'
import { triggerSequence } from '@/lib/email/sequences/engine'
import { env } from '@/lib/env'
import { logger, emailLogger } from '@/lib/logger'
import { sanitizeFormInput } from '@/lib/security/sanitization'
import { db } from '@/lib/database'
import { z } from 'zod'

const resend = new Resend(env.RESEND_API_KEY)

// Resources available for download
export const resources = [
  {
    id: 'digital-strategy-guide',
    title: 'Digital Strategy Guide',
    description:
      'A comprehensive guide to planning your digital transformation',
    fileName: 'digital-strategy-guide.pdf',
  },
  {
    id: 'roi-calculator-template',
    title: 'ROI Calculator Template',
    description: 'Calculate the return on investment for your digital projects',
    fileName: 'roi-calculator-template.pdf',
  },
  {
    id: 'seo-basics-cheatsheet',
    title: 'SEO Basics Cheatsheet',
    description: 'Essential SEO tips to improve your website ranking',
    fileName: 'seo-basics-cheatsheet.pdf',
  },
  {
    id: 'website-checklist',
    title: 'Website Health Checklist',
    description: 'Comprehensive checklist to evaluate your website performance',
    fileName: 'website-checklist.pdf',
  },
  {
    id: 'case-study-crm-optimization',
    title: 'Case Study: CRM Optimization',
    description: 'How we helped a client optimize their CRM for better results',
    fileName: 'case-study-crm-optimization.pdf',
  },
  {
    id: 'contact-form-templates',
    title: 'Contact Form Templates',
    description: 'Ready-to-use contact form templates for your website',
    fileName: 'contact-form-templates.pdf',
  },
]

const leadMagnetInputSchema = leadMagnetSchema.extend({
  resourceId: z.string(),
})

export const leadMagnetRouter = createTRPCRouter({
  getResources: publicProcedure.query(async () => ({
    success: true,
    resources,
  })),

  getResource: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const resource = resources.find(r => r.id === input.id)

      if (!resource) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Resource not found',
        })
      }

      return {
        success: true,
        resource,
      }
    }),

  download: publicProcedure
    .input(leadMagnetInputSchema)
    .mutation(async ({ input }) => {
      const startTime = Date.now()

      try {
        // Find the requested resource
        const resource = resources.find(r => r.id === input.resourceId)

        if (!resource) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Resource not found',
          })
        }

        // Sanitize input data
        const sanitizedInput = sanitizeFormInput(input)

        // Log the request
        logger.info('Lead magnet download', {
          email: sanitizedInput.email,
          resourceId: sanitizedInput.resourceId,
        })

        // Store download in database
        const download = await db.leadMagnetDownload.create({
          data: {
            leadMagnetId: resource.id,
            name: sanitizedInput.name,
            email: sanitizedInput.email,
            company: sanitizedInput.company || null,
          },
        })

        // Update download count
        await db.leadMagnet.upsert({
          where: { name: resource.id },
          update: {
            downloadCount: { increment: 1 },
          },
          create: {
            name: resource.id,
            title: resource.title,
            description: resource.description,
            fileName: resource.fileName,
            downloadCount: 1,
          },
        })

        logger.info('Lead magnet download stored in database', {
          downloadId: download.id,
          email: sanitizedInput.email,
        })

        // Prepare download email using sanitized input
        const downloadEmailHtml = `
          <h2>Your ${resource.title} Download</h2>
          
          <p>Hi ${sanitizedInput.name},</p>
          
          <p>Thank you for your interest in our ${resource.title}. You can download it using the link below:</p>
          
          <p style="margin: 20px 0;">
            <a href="${env.NEXT_PUBLIC_APP_URL}/resources/${resource.fileName}" 
              style="padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Download ${resource.title}
            </a>
          </p>
          
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p>${env.NEXT_PUBLIC_APP_URL}/resources/${resource.fileName}</p>
          
          <p>We hope you find this resource valuable. If you have any questions, feel free to reply to this email.</p>
          
          <p>Best regards,<br>
          The Hudson Digital Solutions Team</p>
        `

        const fromEmail =
          process.env.RESEND_FROM_EMAIL || 'noreply@hudsondigitalsolutions.com'

        // Send download email
        try {
          await resend.emails.send({
            from: fromEmail,
            to: sanitizedInput.email,
            subject: `Your ${resource.title} Download`,
            html: downloadEmailHtml,
          })

          emailLogger.info('Resource download email sent', {
            to: sanitizedInput.email,
            resourceId: sanitizedInput.resourceId,
          })
        } catch (error) {
          emailLogger.error('Failed to send resource download email', {
            error: error instanceof Error ? error.message : 'Unknown error',
          })

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send download email',
          })
        }

        // Notify admin
        const adminNotificationHtml = `
          <h3>New Lead Magnet Download</h3>
          <p><strong>Resource:</strong> ${resource.title}</p>
          <p><strong>Name:</strong> ${input.name}</p>
          <p><strong>Email:</strong> ${input.email}</p>
          <p><strong>Company:</strong> ${input.company || 'Not provided'}</p>
          <p><strong>Date:</strong> ${new Date().toISOString()}</p>
        `

        const toEmail = process.env.CONTACT_EMAIL || 'hello@hudsondigitalsolutions.com'

        try {
          await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: `New Lead Magnet Download: ${resource.title}`,
            html: adminNotificationHtml,
          })

          emailLogger.info('Admin notification sent for lead magnet', {
            resourceId: input.resourceId,
            email: input.email,
          })
        } catch (error) {
          // Don't fail the whole request if admin notification fails
          emailLogger.error('Failed to send admin notification for lead magnet', {
            error: error instanceof Error ? error.message : 'Unknown error',
            resourceId: input.resourceId,
          })
        }

        // Trigger email sequence
        try {
          await triggerSequence('lead_magnet_download', {
            email: input.email,
            name: input.name,
            firstName: input.name.split(' ')[0],
            company: input.company,
            resourceId: input.resourceId,
            resourceTitle: resource.title,
          })

          emailLogger.info('Email sequence triggered for lead magnet', {
            sequence: 'lead_magnet_download',
            email: input.email,
          })
        } catch (error) {
          // Don't fail the whole request if sequence fails
          emailLogger.error('Failed to trigger email sequence for lead magnet', {
            error: error instanceof Error ? error.message : 'Unknown error',
            email: input.email,
          })
        }

        const duration = Date.now() - startTime

        logger.info('Lead magnet download processed successfully', {
          duration,
          email: input.email,
          resourceId: input.resourceId,
        })

        return {
          success: true,
          message:
            'Thank you for your download! Check your email for the download link.',
          resourceUrl: `/resources/${resource.fileName}`,
          resource,
        }
      } catch (error) {
        const duration = Date.now() - startTime

        logger.error('Lead magnet download processing failed', {
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
          email: input.email,
          resourceId: input.resourceId,
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
