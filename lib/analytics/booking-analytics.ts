/**
 * Booking Analytics Integration
 * 
 * Comprehensive analytics system for Cal.com booking funnel tracking
 * following Next.js 15 and React 19 patterns.
 */

import { z } from 'zod'
import { db as prisma } from '../database'
import type { 
  BookingEvent, 
  BookingAnalyticsData, 
  BookingFunnelMetrics,
  BookingConversionData,
} from '../../types/analytics-types'

// Booking event schemas for validation
export const bookingEventSchema = z.object({
  eventType: z.enum([
    'booking_page_view',
    'booking_started',
    'booking_form_filled',
    'booking_submitted',
    'booking_confirmed',
    'booking_cancelled',
    'booking_rescheduled',
    'booking_completed',
    'booking_no_show',
    'payment_started',
    'payment_completed',
    'payment_failed',
  ]),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  bookingId: z.string().optional(),
  serviceId: z.string().optional(),
  properties: z.record(z.unknown()).optional(),
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  referrer: z.string().optional(),
  timestamp: z.date().optional(),
})

export const bookingAnalyticsConfigSchema = z.object({
  enableTracking: z.boolean().default(true),
  enableConversionTracking: z.boolean().default(true),
  enableFunnelAnalysis: z.boolean().default(true),
  retentionDays: z.number().default(90),
  batchSize: z.number().default(100),
})

/**
 * Booking Analytics Service
 */
export class BookingAnalyticsService {
  private config: z.infer<typeof bookingAnalyticsConfigSchema>

  constructor(config?: Partial<z.infer<typeof bookingAnalyticsConfigSchema>>) {
    this.config = bookingAnalyticsConfigSchema.parse(config || {})
  }

  /**
   * Track a booking event
   */
  async trackEvent(event: BookingEvent): Promise<void> {
    if (!this.config.enableTracking) return

    try {
      const validatedEvent = bookingEventSchema.parse(event)
      
      await prisma.bookingAnalyticsEvent.create({
        data: {
          eventType: validatedEvent.eventType,
          sessionId: validatedEvent.sessionId,
          userId: validatedEvent.userId,
          bookingId: validatedEvent.bookingId,
          properties: validatedEvent.properties,
          source: validatedEvent.source,
          medium: validatedEvent.medium,
          campaign: validatedEvent.campaign,
          referrer: validatedEvent.referrer,
          timestamp: validatedEvent.timestamp || new Date(),
        },
      })
    } catch (error) {
      console.error('Error tracking booking event:', error)
      // Don't throw - analytics shouldn't break the booking flow
    }
  }

  /**
   * Track booking funnel progression
   */
  async trackFunnelStep(
    sessionId: string,
    step: 'page_view' | 'form_start' | 'form_complete' | 'booking_submit' | 'booking_confirm',
    properties?: Record<string, unknown>,
  ): Promise<void> {
    await this.trackEvent({
      eventType: `booking_${step}` as BookingEvent['eventType'],
      sessionId,
      properties: {
        funnelStep: step,
        ...properties,
      },
    })
  }

  /**
   * Get booking analytics data for a date range
   */
  async getAnalytics(
    startDate: Date,
    endDate: Date,
    serviceId?: string,
  ): Promise<BookingAnalyticsData> {
    const baseWhereClause = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
      ...(serviceId && {
        properties: {
          path: ['serviceId'],
          equals: serviceId,
        },
      }),
    }

    // Get event counts by type
    const eventCounts = await prisma.bookingAnalyticsEvent.groupBy({
      by: ['eventType'],
      where: baseWhereClause,
      _count: {
        id: true,
      },
    })

    // Get booking metrics
    const bookingMetrics = await this.getBookingMetrics(startDate, endDate, serviceId)

    // Get conversion funnel
    const conversionFunnel = await this.getConversionFunnel(startDate, endDate, serviceId)

    // Get top sources
    const topSources = await prisma.bookingAnalyticsEvent.groupBy({
      by: ['source'],
      where: {
        ...baseWhereClause,
        source: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    })

    return {
      dateRange: { startDate, endDate },
      totalEvents: eventCounts.reduce((sum, event) => sum + event._count.id, 0),
      eventCounts: eventCounts.reduce((acc, event) => {
        acc[event.eventType] = event._count.id
        return acc
      }, {} as Record<string, number>),
      bookingMetrics,
      conversionFunnel,
      topSources: topSources.map((source) => ({
        source: source.source || 'direct',
        count: source._count.id,
      })),
    }
  }

  /**
   * Get booking conversion metrics
   */
  async getBookingMetrics(
    startDate: Date,
    endDate: Date,
    serviceId?: string,
  ): Promise<BookingFunnelMetrics> {
    const bookingWhereClause = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      ...(serviceId && { serviceId }),
    }

    // Get booking counts by status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      where: bookingWhereClause,
      _count: {
        id: true,
      },
    })

    // Get booking trends (daily counts)
    const bookingTrends = await prisma.$queryRaw<Array<{
      date: Date,
      count: number,
    }>>`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        COUNT(*)::int as count
      FROM "bookings"
      WHERE "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
        ${serviceId ? prisma.$queryRaw`AND "serviceId" = ${serviceId}` : prisma.$queryRaw``}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date
    `

    // Calculate revenue metrics
    const revenueMetrics = await prisma.payment.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'SUCCEEDED',
        ...(serviceId && {
          booking: {
            serviceId,
          },
        }),
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        amount: true,
      },
    })

    return {
      totalBookings: bookingsByStatus.reduce((sum, status) => sum + status._count.id, 0),
      bookingsByStatus: bookingsByStatus.reduce((acc, status) => {
        acc[status.status] = status._count.id
        return acc
      }, {} as Record<string, number>),
      bookingTrends: bookingTrends.map((trend) => ({
        date: trend.date.toISOString().split('T')[0],
        count: trend.count,
      })),
      revenue: {
        total: Number(revenueMetrics._sum.amount || 0),
        count: revenueMetrics._count.id,
        average: Number(revenueMetrics._avg.amount || 0),
      },
    }
  }

  /**
   * Calculate conversion funnel metrics
   */
  async getConversionFunnel(
    startDate: Date,
    endDate: Date,
    serviceId?: string,
  ): Promise<BookingConversionData> {
    const baseWhereClause = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
      ...(serviceId && {
        properties: {
          path: ['serviceId'],
          equals: serviceId,
        },
      }),
    }

    // Get unique sessions for each funnel step
    const funnelSteps = [
      'booking_page_view',
      'booking_started',
      'booking_form_filled',
      'booking_submitted',
      'booking_confirmed',
    ]

    const funnelData: Record<string, number> = {}
    
    for (const step of funnelSteps) {
      const uniqueSessions = await prisma.bookingAnalyticsEvent.findMany({
        where: {
          ...baseWhereClause,
          eventType: step,
        },
        select: {
          sessionId: true,
        },
        distinct: ['sessionId'],
      })
      
      funnelData[step] = uniqueSessions.filter((s) => s.sessionId).length
    }

    // Calculate conversion rates
    const pageViews = funnelData.booking_page_view || 0
    const conversions: Record<string, number> = {}
    
    funnelSteps.forEach((step) => {
      if (pageViews > 0) {
        conversions[step] = ((funnelData[step] || 0) / pageViews) * 100
      }
    })

    return {
      funnelSteps: funnelData,
      conversionRates: conversions,
      totalSessions: pageViews,
      completedBookings: funnelData.booking_confirmed || 0,
      overallConversionRate: pageViews > 0 ? ((funnelData.booking_confirmed || 0) / pageViews) * 100 : 0,
    }
  }

  /**
   * Get booking performance by service
   */
  async getServicePerformance(startDate: Date, endDate: Date): Promise<Array<{
    serviceId: string,
    serviceName: string,
    totalBookings: number,
    completedBookings: number,
    revenue: number,
    conversionRate: number,
  }>> {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        totalBookings: {
          gt: 0,
        },
      },
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            payments: {
              where: {
                status: 'SUCCEEDED',
              },
            },
          },
        },
      },
    })

    return services.map((service) => {
      const totalBookings = service.bookings.length
      const completedBookings = service.bookings.filter((b) => b.status === 'COMPLETED').length
      const revenue = service.bookings.reduce((sum, booking) => 
        sum + booking.payments.reduce((paymentSum, payment) => 
          paymentSum + Number(payment.amount), 0), 0)

      return {
        serviceId: service.id,
        serviceName: service.name,
        totalBookings,
        completedBookings,
        revenue,
        conversionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      }
    })
  }

  /**
   * Clean up old analytics data
   */
  async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays)

    await prisma.bookingAnalyticsEvent.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    })
  }
}

// Export singleton instance
export const bookingAnalytics = new BookingAnalyticsService()

// Helper functions for easy tracking
export async function trackBookingPageView(sessionId: string, serviceId?: string, source?: string) {
  await bookingAnalytics.trackEvent({
    eventType: 'booking_page_view',
    sessionId,
    properties: { serviceId },
    source,
  })
}

export async function trackBookingStarted(sessionId: string, serviceId: string) {
  await bookingAnalytics.trackEvent({
    eventType: 'booking_started',
    sessionId,
    properties: { serviceId },
  })
}

export async function trackBookingSubmitted(sessionId: string, bookingId: string, serviceId: string) {
  await bookingAnalytics.trackEvent({
    eventType: 'booking_submitted',
    sessionId,
    bookingId,
    properties: { serviceId },
  })
}

export async function trackBookingConfirmed(sessionId: string, bookingId: string, serviceId: string) {
  await bookingAnalytics.trackEvent({
    eventType: 'booking_confirmed',
    sessionId,
    bookingId,
    properties: { serviceId },
  })
}

export async function trackPaymentStarted(sessionId: string, bookingId: string, amount: number) {
  await bookingAnalytics.trackEvent({
    eventType: 'payment_started',
    sessionId,
    bookingId,
    properties: { amount },
  })
}

export async function trackPaymentCompleted(sessionId: string, bookingId: string, amount: number, paymentId: string) {
  await bookingAnalytics.trackEvent({
    eventType: 'payment_completed',
    sessionId,
    bookingId,
    properties: { amount, paymentId },
  })
}