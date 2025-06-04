import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../lib/trpc-unified'
import { db } from '@/lib/database'
import { logger } from '@/lib/logger'

export const analyticsRouter = createTRPCRouter({
  trackPageView: publicProcedure
    .input(
      z.object({
        path: z.string(),
        title: z.string().optional(),
        referrer: z.string().optional(),
        sessionId: z.string(),
        userId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Extract metadata from context
        const metadata = {
          ipAddress: ctx.headers?.get('x-forwarded-for') || ctx.headers?.get('x-real-ip') || null,
          userAgent: ctx.headers?.get('user-agent') || null,
        }

        // Store page view in database
        await db.pageView.create({
          data: {
            page: input.path,
            title: input.title || null,
            referrer: input.referrer || null,
            sessionId: input.sessionId,
            userId: input.userId || null,
            ...metadata,
          },
        })

        logger.info('Page view tracked', {
          path: input.path,
          sessionId: input.sessionId,
        })

        return { success: true }
      } catch (error) {
        logger.error('Failed to track page view', {
          error: error instanceof Error ? error.message : 'Unknown error',
          path: input.path,
        })
        return { success: false }
      }
    }),

  trackEvent: publicProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string().optional(),
        action: z.string().optional(),
        label: z.string().optional(),
        value: z.number().optional(),
        sessionId: z.string(),
        userId: z.string().optional(),
        page: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Store event in database
        await db.event.create({
          data: {
            name: input.name,
            category: input.category || null,
            action: input.action || null,
            label: input.label || null,
            value: input.value || null,
            sessionId: input.sessionId,
            userId: input.userId || null,
            page: input.page || null,
            metadata: input.metadata || null,
          },
        })

        logger.info('Event tracked', {
          event: input.name,
          sessionId: input.sessionId,
        })

        return { success: true }
      } catch (error) {
        logger.error('Failed to track event', {
          error: error instanceof Error ? error.message : 'Unknown error',
          event: input.name,
        })
        return { success: false }
      }
    }),
})
