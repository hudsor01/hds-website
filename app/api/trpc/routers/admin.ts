/**
 * Admin tRPC Router
 * 
 * Handles all admin dashboard API endpoints with proper authentication
 * and data access for contacts, leads, analytics, and performance monitoring
 */

import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../lib/trpc'
import { PrismaClient } from '@prisma/client'
import { TRPCError } from '@trpc/server'

const prisma = new PrismaClient()

// Input validation schemas
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

const contactFiltersSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST', 'UNRESPONSIVE']).optional(),
  service: z.string().optional(),
  search: z.string().optional(),
}).merge(paginationSchema).merge(dateRangeSchema)

const updateContactStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST', 'UNRESPONSIVE']),
})

export const adminRouter = createTRPCRouter({
  // ===== Contacts Management =====
  
  /**
   * Get all contacts with filtering and pagination
   */
  getContacts: publicProcedure
    .input(contactFiltersSchema)
    .query(async ({ input }) => {
      try {
        const { page, limit, startDate, endDate, status, service, search } = input
        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}
        
        if (startDate) {
          where.createdAt = { ...where.createdAt, gte: new Date(startDate) }
        }
        if (endDate) {
          where.createdAt = { ...where.createdAt, lte: new Date(endDate) }
        }
        if (status) {
          where.status = status
        }
        if (service) {
          where.service = service
        }
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
            { message: { contains: search, mode: 'insensitive' } },
          ]
        }

        // Get contacts and total count
        const [contacts, total] = await Promise.all([
          prisma.contact.findMany({
            where,
            include: {
              responses: {
                orderBy: { sentAt: 'desc' },
                take: 1,
              },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          }),
          prisma.contact.count({ where }),
        ])

        return {
          contacts: contacts.map(contact => ({
            ...contact,
            lastResponse: contact.responses[0] || null,
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch contacts',
          cause: error,
        })
      }
    }),

  /**
   * Get contact by ID
   */
  getContact: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const contact = await prisma.contact.findUnique({
          where: { id: input.id },
          include: {
            responses: {
              orderBy: { sentAt: 'desc' },
            },
          },
        })

        if (!contact) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Contact not found',
          })
        }

        return contact
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch contact',
          cause: error,
        })
      }
    }),

  /**
   * Update contact status
   */
  updateContactStatus: publicProcedure
    .input(updateContactStatusSchema)
    .mutation(async ({ input }) => {
      try {
        const contact = await prisma.contact.update({
          where: { id: input.id },
          data: { status: input.status },
        })

        return contact
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update contact status',
          cause: error,
        })
      }
    }),

  /**
   * Get contact analytics summary
   */
  getContactAnalytics: publicProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const { startDate, endDate } = input
        const where: any = {}
        
        if (startDate) {
          where.createdAt = { ...where.createdAt, gte: new Date(startDate) }
        }
        if (endDate) {
          where.createdAt = { ...where.createdAt, lte: new Date(endDate) }
        }

        const [
          totalContacts,
          newContacts,
          qualifiedContacts,
          wonContacts,
          statusBreakdown,
          serviceBreakdown,
          recentContacts,
        ] = await Promise.all([
          prisma.contact.count({ where }),
          prisma.contact.count({ where: { ...where, status: 'NEW' } }),
          prisma.contact.count({ where: { ...where, status: 'QUALIFIED' } }),
          prisma.contact.count({ where: { ...where, status: 'WON' } }),
          prisma.contact.groupBy({
            by: ['status'],
            where,
            _count: { id: true },
          }),
          prisma.contact.groupBy({
            by: ['service'],
            where: { ...where, service: { not: null } },
            _count: { id: true },
          }),
          prisma.contact.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
        ])

        const conversionRate = totalContacts > 0 ? (wonContacts / totalContacts) * 100 : 0

        return {
          summary: {
            total: totalContacts,
            new: newContacts,
            qualified: qualifiedContacts,
            won: wonContacts,
            conversionRate: Math.round(conversionRate * 100) / 100,
          },
          breakdown: {
            byStatus: statusBreakdown.map(item => ({
              status: item.status,
              count: item._count.id,
            })),
            byService: serviceBreakdown.map(item => ({
              service: item.service,
              count: item._count.id,
            })),
          },
          recent: recentContacts,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch contact analytics',
          cause: error,
        })
      }
    }),

  // ===== Analytics Dashboard =====

  /**
   * Get dashboard analytics
   */
  getDashboardAnalytics: publicProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const { startDate, endDate } = input
        const where: any = {}
        
        if (startDate) {
          where.viewedAt = { ...where.viewedAt, gte: new Date(startDate) }
        }
        if (endDate) {
          where.viewedAt = { ...where.viewedAt, lte: new Date(endDate) }
        }

        const [
          pageViews,
          uniqueVisitors,
          topPages,
          trafficSources,
          deviceBreakdown,
          conversions,
        ] = await Promise.all([
          prisma.pageView.count({ where }),
          prisma.pageView.findMany({
            where,
            distinct: ['sessionId'],
            select: { sessionId: true },
          }),
          prisma.pageView.groupBy({
            by: ['page'],
            where,
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10,
          }),
          prisma.pageView.groupBy({
            by: ['utm_source'],
            where: { ...where, utm_source: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5,
          }),
          prisma.pageView.groupBy({
            by: ['device'],
            where: { ...where, device: { not: null } },
            _count: { id: true },
          }),
          prisma.contact.count({
            where: startDate || endDate ? {
              createdAt: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
              },
            } : {},
          }),
        ])

        const uniqueVisitorCount = uniqueVisitors.length
        const conversionRate = pageViews > 0 ? (conversions / uniqueVisitorCount) * 100 : 0

        return {
          overview: {
            pageViews,
            uniqueVisitors: uniqueVisitorCount,
            conversions,
            conversionRate: Math.round(conversionRate * 100) / 100,
          },
          breakdown: {
            topPages: topPages.map(item => ({
              page: item.page,
              views: item._count.id,
            })),
            trafficSources: trafficSources.map(item => ({
              source: item.utm_source || 'Direct',
              visitors: item._count.id,
            })),
            devices: deviceBreakdown.map(item => ({
              device: item.device || 'Unknown',
              count: item._count.id,
            })),
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard analytics',
          cause: error,
        })
      }
    }),

  /**
   * Get performance metrics from web vitals
   */
  getPerformanceMetrics: publicProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const { startDate, endDate } = input
        const where: any = {}
        
        if (startDate) {
          where.timestamp = { ...where.timestamp, gte: new Date(startDate) }
        }
        if (endDate) {
          where.timestamp = { ...where.timestamp, lte: new Date(endDate) }
        }

        // Get web vitals data from the web_vitals table
        const webVitalsData = await prisma.$queryRaw`
          SELECT 
            metric_name,
            AVG(metric_value) as avg_value,
            COUNT(*) as sample_count,
            COUNT(CASE WHEN metric_rating = 'good' THEN 1 END) as good_count,
            COUNT(CASE WHEN metric_rating = 'needs-improvement' THEN 1 END) as needs_improvement_count,
            COUNT(CASE WHEN metric_rating = 'poor' THEN 1 END) as poor_count
          FROM web_vitals 
          WHERE 
            ${startDate ? `timestamp >= ${startDate}` : '1=1'} AND
            ${endDate ? `timestamp <= ${endDate}` : '1=1'}
          GROUP BY metric_name
        ` as any[]

        const metrics: Record<string, any> = {}
        
        webVitalsData.forEach(metric => {
          const totalSamples = Number(metric.sample_count)
          const goodPercentage = totalSamples > 0 ? (Number(metric.good_count) / totalSamples) * 100 : 0
          
          metrics[metric.metric_name] = {
            value: Number(metric.avg_value),
            rating: goodPercentage >= 75 ? 'good' : goodPercentage >= 50 ? 'needs-improvement' : 'poor',
            samples: totalSamples,
            distribution: {
              good: Number(metric.good_count),
              needsImprovement: Number(metric.needs_improvement_count),
              poor: Number(metric.poor_count),
            },
          }
        })

        // Calculate overall performance score
        const metricWeights = { LCP: 0.3, FID: 0.3, CLS: 0.25, FCP: 0.15 }
        let performanceScore = 0
        let totalWeight = 0

        Object.entries(metricWeights).forEach(([metricName, weight]) => {
          if (metrics[metricName]) {
            const metric = metrics[metricName]
            const goodPercentage = metric.samples > 0 ? (metric.distribution.good / metric.samples) * 100 : 0
            performanceScore += goodPercentage * weight
            totalWeight += weight
          }
        })

        performanceScore = totalWeight > 0 ? Math.round(performanceScore / totalWeight) : 0

        return {
          performanceScore,
          metrics,
          summary: {
            totalSessions: webVitalsData.reduce((acc, metric) => acc + Number(metric.sample_count), 0),
            passingSessions: webVitalsData.reduce((acc, metric) => acc + Number(metric.good_count), 0),
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch performance metrics',
          cause: error,
        })
      }
    }),

  // ===== Newsletter & Lead Magnets =====

  /**
   * Get newsletter subscribers analytics
   */
  getNewsletterAnalytics: publicProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const { startDate, endDate } = input
        const where: any = {}
        
        if (startDate) {
          where.subscribedAt = { ...where.subscribedAt, gte: new Date(startDate) }
        }
        if (endDate) {
          where.subscribedAt = { ...where.subscribedAt, lte: new Date(endDate) }
        }

        const [
          totalSubscribers,
          activeSubscribers,
          recentSubscribers,
          sourceBreakdown,
        ] = await Promise.all([
          prisma.newsletterSubscriber.count({ where }),
          prisma.newsletterSubscriber.count({ 
            where: { ...where, status: 'ACTIVE' },
          }),
          prisma.newsletterSubscriber.findMany({
            where,
            orderBy: { subscribedAt: 'desc' },
            take: 10,
          }),
          prisma.newsletterSubscriber.groupBy({
            by: ['source'],
            where: { ...where, source: { not: null } },
            _count: { id: true },
          }),
        ])

        return {
          summary: {
            total: totalSubscribers,
            active: activeSubscribers,
            unsubscribed: totalSubscribers - activeSubscribers,
          },
          breakdown: {
            bySources: sourceBreakdown.map(item => ({
              source: item.source || 'Unknown',
              count: item._count.id,
            })),
          },
          recent: recentSubscribers,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch newsletter analytics',
          cause: error,
        })
      }
    }),

  /**
   * Get lead magnet downloads analytics
   */
  getLeadMagnetAnalytics: publicProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const { startDate, endDate } = input
        const where: any = {}
        
        if (startDate) {
          where.downloadedAt = { ...where.downloadedAt, gte: new Date(startDate) }
        }
        if (endDate) {
          where.downloadedAt = { ...where.downloadedAt, lte: new Date(endDate) }
        }

        const [
          totalDownloads,
          uniqueDownloaders,
          topLeadMagnets,
          recentDownloads,
        ] = await Promise.all([
          prisma.leadMagnetDownload.count({ where }),
          prisma.leadMagnetDownload.findMany({
            where,
            distinct: ['email'],
            select: { email: true },
          }),
          prisma.leadMagnetDownload.groupBy({
            by: ['leadMagnetId'],
            where,
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5,
          }),
          prisma.leadMagnetDownload.findMany({
            where,
            include: {
              leadMagnet: true,
            },
            orderBy: { downloadedAt: 'desc' },
            take: 10,
          }),
        ])

        // Get lead magnet details for top performers
        const topLeadMagnetIds = topLeadMagnets.map(item => item.leadMagnetId)
        const leadMagnets = await prisma.leadMagnet.findMany({
          where: { id: { in: topLeadMagnetIds } },
        })

        const topLeadMagnetsWithDetails = topLeadMagnets.map(item => {
          const leadMagnet = leadMagnets.find(lm => lm.id === item.leadMagnetId)
          return {
            id: item.leadMagnetId,
            title: leadMagnet?.title || 'Unknown',
            downloads: item._count.id,
          }
        })

        return {
          summary: {
            totalDownloads,
            uniqueDownloaders: uniqueDownloaders.length,
          },
          breakdown: {
            topLeadMagnets: topLeadMagnetsWithDetails,
          },
          recent: recentDownloads,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch lead magnet analytics',
          cause: error,
        })
      }
    }),

  /**
   * Get leads (contacts with sales focus)
   */
  getLeads: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST', 'UNRESPONSIVE']).optional(),
      service: z.string().optional(),
      search: z.string().optional(),
      sortBy: z.enum(['createdAt', 'name', 'value']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ input }) => {
      try {
        const { page, limit, status, service, search, sortBy, sortOrder } = input
        const skip = (page - 1) * limit

        const where: any = {}
        
        if (status) {
          where.status = status
        }
        
        if (service) {
          where.service = service
        }
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ]
        }

        const orderBy: any = {}
        if (sortBy === 'value') {
          // For value sorting, we'll use budget as a proxy
          orderBy.budget = sortOrder
        } else {
          orderBy[sortBy] = sortOrder
        }

        const [leads, total] = await Promise.all([
          prisma.contact.findMany({
            where,
            include: {
              responses: {
                orderBy: { sentAt: 'desc' },
                take: 1,
              },
            },
            orderBy,
            skip,
            take: limit,
          }),
          prisma.contact.count({ where }),
        ])

        return {
          leads: leads.map(lead => ({
            ...lead,
            value: lead.budget || '$0', // Convert budget to value
            source: lead.source || 'Direct',
            lastContact: lead.responses[0]?.sentAt || null,
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch leads',
          cause: error,
        })
      }
    }),

  /**
   * Get lead analytics/metrics
   */
  getLeadAnalytics: publicProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const { startDate, endDate } = input
        const where: any = {}
        
        if (startDate) {
          where.createdAt = { ...where.createdAt, gte: new Date(startDate) }
        }
        if (endDate) {
          where.createdAt = { ...where.createdAt, lte: new Date(endDate) }
        }

        const [
          totalLeads,
          newLeads,
          qualifiedLeads,
          wonLeads,
          statusBreakdown,
          serviceBreakdown,
          sourceBreakdown,
          conversionFunnel,
        ] = await Promise.all([
          prisma.contact.count({ where }),
          prisma.contact.count({ 
            where: { ...where, status: 'NEW' }, 
          }),
          prisma.contact.count({ 
            where: { ...where, status: 'QUALIFIED' }, 
          }),
          prisma.contact.count({ 
            where: { ...where, status: 'WON' }, 
          }),
          prisma.contact.groupBy({
            by: ['status'],
            where,
            _count: { id: true },
          }),
          prisma.contact.groupBy({
            by: ['service'],
            where: { ...where, service: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
          }),
          prisma.contact.groupBy({
            by: ['source'],
            where: { ...where, source: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
          }),
          // Conversion funnel calculation
          Promise.all([
            prisma.contact.count({ where: { ...where, status: { in: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST', 'UNRESPONSIVE'] } } }),
            prisma.contact.count({ where: { ...where, status: { in: ['CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON'] } } }),
            prisma.contact.count({ where: { ...where, status: { in: ['QUALIFIED', 'PROPOSAL_SENT', 'WON'] } } }),
            prisma.contact.count({ where: { ...where, status: 'WON' } }),
          ]),
        ])

        const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0

        // Calculate pipeline value (estimate based on typical values per service)
        const serviceValues = {
          'web': 15000,
          'revops': 25000,
          'analytics': 20000,
          'consulting': 10000,
        }
        
        const pipelineValue = await prisma.contact.findMany({
          where: { 
            ...where, 
            status: { in: ['QUALIFIED', 'PROPOSAL_SENT'] },
            service: { not: null },
          },
          select: { service: true },
        }).then(leads => 
          leads.reduce((total, lead) => {
            const value = serviceValues[lead.service as keyof typeof serviceValues] || 5000
            return total + value
          }, 0),
        )

        return {
          overview: {
            totalLeads,
            newLeads,
            qualifiedLeads,
            wonLeads,
            conversionRate: Math.round(conversionRate * 100) / 100,
            pipelineValue,
          },
          breakdown: {
            byStatus: statusBreakdown.map(item => ({
              status: item.status,
              count: item._count.id,
            })),
            byService: serviceBreakdown.map(item => ({
              service: item.service || 'Other',
              count: item._count.id,
            })),
            bySource: sourceBreakdown.map(item => ({
              source: item.source || 'Direct',
              count: item._count.id,
            })),
          },
          funnel: {
            total: conversionFunnel[0],
            contacted: conversionFunnel[1], 
            qualified: conversionFunnel[2],
            won: conversionFunnel[3],
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch lead analytics',
          cause: error,
        })
      }
    }),

  /**
   * Update lead status
   */
  updateLeadStatus: publicProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST', 'UNRESPONSIVE']),
    }))
    .mutation(async ({ input }) => {
      try {
        const { id, status } = input

        const lead = await prisma.contact.update({
          where: { id },
          data: { 
            status,
            updatedAt: new Date(),
          },
          include: {
            responses: {
              orderBy: { sentAt: 'desc' },
              take: 1,
            },
          },
        })

        return {
          ...lead,
          value: lead.budget || '$0',
          source: lead.source || 'Direct',
          lastContact: lead.responses[0]?.sentAt || null,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update lead status',
          cause: error,
        })
      }
    }),
})

export type AdminRouter = typeof adminRouter