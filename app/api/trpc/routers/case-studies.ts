/**
 * Case Studies tRPC Router
 * 
 * Handles all case study operations including CRUD and public access
 */

import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../lib/trpc'
import { TRPCError } from '@trpc/server'
import { PostStatus } from '@prisma/client'

export const caseStudiesRouter = createTRPCRouter({
  // Public procedures - accessible to all users
  
  /**
   * Get all published case studies
   */
  getCaseStudies: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
      category: z.string().optional(),
      serviceUsed: z.string().optional(),
      featured: z.boolean().optional(),
      clientIndustry: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, offset, category, serviceUsed, featured, clientIndustry } = input

      const where: any = {
        status: PostStatus.PUBLISHED,
        publishedAt: { not: null },
      }

      if (category) {
        where.category = category
      }

      if (serviceUsed) {
        where.servicesUsed = { has: serviceUsed }
      }

      if (featured !== undefined) {
        where.featured = featured
      }

      if (clientIndustry) {
        where.clientIndustry = clientIndustry
      }

      const total = await ctx.db.caseStudy.count({ where })

      const caseStudies = await ctx.db.caseStudy.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { featured: 'desc' },
          { displayOrder: 'asc' },
          { publishedAt: 'desc' },
        ],
        select: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          description: true,
          clientName: true,
          clientIndustry: true,
          clientLogo: true,
          challenge: true,
          solution: true,
          timeline: true,
          servicesUsed: true,
          technologies: true,
          results: true,
          metrics: true,
          featuredImage: true,
          category: true,
          tags: true,
          featured: true,
          publishedAt: true,
          viewCount: true,
        },
      })

      return {
        caseStudies,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
          hasNext: offset + limit < total,
          hasPrev: offset > 0,
        },
      }
    }),

  /**
   * Get a single case study by slug
   */
  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
      incrementView: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const caseStudy = await ctx.db.caseStudy.findUnique({
        where: { 
          slug: input.slug,
          status: PostStatus.PUBLISHED,
        },
      })

      if (!caseStudy) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Case study not found',
        })
      }

      // Increment view count if requested
      if (input.incrementView) {
        await ctx.db.caseStudy.update({
          where: { id: caseStudy.id },
          data: { viewCount: { increment: 1 } },
        })
      }

      return caseStudy
    }),

  /**
   * Get featured case studies for homepage
   */
  getFeatured: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(10).default(3),
    }))
    .query(async ({ ctx, input }) => {
      const caseStudies = await ctx.db.caseStudy.findMany({
        where: { 
          status: PostStatus.PUBLISHED,
          featured: true,
        },
        take: input.limit,
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          clientName: true,
          clientIndustry: true,
          clientLogo: true,
          results: true,
          metrics: true,
          featuredImage: true,
          servicesUsed: true,
        },
      })

      return caseStudies
    }),

  /**
   * Get case studies by service
   */
  getByService: publicProcedure
    .input(z.object({
      serviceUsed: z.string(),
      limit: z.number().min(1).max(20).default(5),
    }))
    .query(async ({ ctx, input }) => {
      const caseStudies = await ctx.db.caseStudy.findMany({
        where: { 
          status: PostStatus.PUBLISHED,
          servicesUsed: { has: input.serviceUsed },
        },
        take: input.limit,
        orderBy: [
          { featured: 'desc' },
          { viewCount: 'desc' },
          { publishedAt: 'desc' },
        ],
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          clientName: true,
          clientIndustry: true,
          results: true,
          metrics: true,
          featuredImage: true,
          timeline: true,
        },
      })

      return caseStudies
    }),

  /**
   * Get all industries represented in case studies
   */
  getIndustries: publicProcedure
    .query(async ({ ctx }) => {
      const caseStudies = await ctx.db.caseStudy.findMany({
        where: { 
          status: PostStatus.PUBLISHED,
          clientIndustry: { not: null },
        },
        select: { clientIndustry: true },
        distinct: ['clientIndustry'],
      })

      return caseStudies
        .map(cs => cs.clientIndustry)
        .filter(Boolean)
        .sort()
    }),

  /**
   * Get all categories used in case studies
   */
  getCategories: publicProcedure
    .query(async ({ ctx }) => {
      const caseStudies = await ctx.db.caseStudy.findMany({
        where: { 
          status: PostStatus.PUBLISHED,
          category: { not: null },
        },
        select: { category: true },
        distinct: ['category'],
      })

      return caseStudies
        .map(cs => cs.category)
        .filter(Boolean)
        .sort()
    }),

  // Admin procedures - require authentication

  /**
   * Get all case studies for admin (including drafts)
   */
  getAllCaseStudies: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
      status: z.nativeEnum(PostStatus).optional(),
      search: z.string().optional(),
      clientIndustry: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, offset, status, search, clientIndustry } = input

      const where: any = {}

      if (status) {
        where.status = status
      }

      if (clientIndustry) {
        where.clientIndustry = clientIndustry
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { clientName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      const total = await ctx.db.caseStudy.count({ where })

      const caseStudies = await ctx.db.caseStudy.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { featured: 'desc' },
          { updatedAt: 'desc' },
        ],
      })

      return {
        caseStudies,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      }
    }),

  /**
   * Create a new case study
   */
  create: protectedProcedure
    .input(z.object({
      slug: z.string().min(1).max(100),
      title: z.string().min(1).max(200),
      subtitle: z.string().optional(),
      description: z.string().min(1),
      content: z.string().min(1),
      clientName: z.string().min(1).max(100),
      clientIndustry: z.string().optional(),
      clientSize: z.string().optional(),
      clientWebsite: z.string().url().optional(),
      clientLogo: z.string().url().optional(),
      challenge: z.string().min(1),
      solution: z.string().min(1),
      timeline: z.string().optional(),
      teamSize: z.number().positive().optional(),
      servicesUsed: z.array(z.string()).default([]),
      technologies: z.array(z.string()).default([]),
      results: z.record(z.any()).default({}),
      metrics: z.record(z.any()).default({}),
      featuredImage: z.string().url().optional(),
      beforeImage: z.string().url().optional(),
      afterImage: z.string().url().optional(),
      gallery: z.array(z.string().url()).default([]),
      videoUrl: z.string().url().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      displayOrder: z.number().default(0),
      status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const caseStudy = await ctx.db.caseStudy.create({
          data: {
            ...input,
            publishedAt: input.status === PostStatus.PUBLISHED ? new Date() : null,
          },
        })

        return caseStudy
      } catch (error: any) {
        if (error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A case study with this slug already exists',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create case study',
        })
      }
    }),

  /**
   * Update a case study
   */
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      slug: z.string().min(1).max(100).optional(),
      title: z.string().min(1).max(200).optional(),
      subtitle: z.string().optional(),
      description: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      clientName: z.string().min(1).max(100).optional(),
      clientIndustry: z.string().optional(),
      clientSize: z.string().optional(),
      clientWebsite: z.string().url().optional(),
      clientLogo: z.string().url().optional(),
      challenge: z.string().min(1).optional(),
      solution: z.string().min(1).optional(),
      timeline: z.string().optional(),
      teamSize: z.number().positive().optional(),
      servicesUsed: z.array(z.string()).optional(),
      technologies: z.array(z.string()).optional(),
      results: z.record(z.any()).optional(),
      metrics: z.record(z.any()).optional(),
      featuredImage: z.string().url().optional(),
      beforeImage: z.string().url().optional(),
      afterImage: z.string().url().optional(),
      gallery: z.array(z.string().url()).optional(),
      videoUrl: z.string().url().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      featured: z.boolean().optional(),
      displayOrder: z.number().optional(),
      status: z.nativeEnum(PostStatus).optional(),
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, status, ...updateData } = input

      try {
        // Handle publishing logic
        const updatePayload: any = { ...updateData }
        if (status) {
          updatePayload.status = status
          if (status === PostStatus.PUBLISHED) {
            // Set publishedAt if not already set
            const existing = await ctx.db.caseStudy.findUnique({
              where: { id },
              select: { publishedAt: true },
            })
            if (!existing?.publishedAt) {
              updatePayload.publishedAt = new Date()
            }
          }
        }

        const caseStudy = await ctx.db.caseStudy.update({
          where: { id },
          data: updatePayload,
        })

        return caseStudy
      } catch (error: any) {
        if (error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A case study with this slug already exists',
          })
        }
        if (error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Case study not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update case study',
        })
      }
    }),

  /**
   * Delete a case study
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.caseStudy.delete({
          where: { id: input.id },
        })

        return { success: true }
      } catch (error: any) {
        if (error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Case study not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete case study',
        })
      }
    }),

  /**
   * Reorder case studies
   */
  reorder: protectedProcedure
    .input(z.object({
      caseStudyIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Update display order for each case study
        await Promise.all(
          input.caseStudyIds.map((caseStudyId, index) =>
            ctx.db.caseStudy.update({
              where: { id: caseStudyId },
              data: { displayOrder: index },
            }),
          ),
        )

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reorder case studies',
        })
      }
    }),

  /**
   * Get case study analytics
   */
  getAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalCaseStudies, 
        publishedCaseStudies, 
        draftCaseStudies, 
        featuredCaseStudies,
        totalViews,
        industryBreakdown,
      ] = await Promise.all([
        ctx.db.caseStudy.count(),
        ctx.db.caseStudy.count({ where: { status: PostStatus.PUBLISHED } }),
        ctx.db.caseStudy.count({ where: { status: PostStatus.DRAFT } }),
        ctx.db.caseStudy.count({ where: { featured: true, status: PostStatus.PUBLISHED } }),
        ctx.db.caseStudy.aggregate({
          _sum: { viewCount: true },
          where: { status: PostStatus.PUBLISHED },
        }),
        ctx.db.caseStudy.groupBy({
          by: ['clientIndustry'],
          where: { 
            status: PostStatus.PUBLISHED,
            clientIndustry: { not: null },
          },
          _count: true,
          orderBy: { _count: { clientIndustry: 'desc' } },
        }),
      ])

      return {
        totalCaseStudies,
        publishedCaseStudies,
        draftCaseStudies,
        featuredCaseStudies,
        totalViews: totalViews._sum.viewCount || 0,
        industryBreakdown: industryBreakdown.map(item => ({
          industry: item.clientIndustry || 'Other',
          count: item._count,
        })),
      }
    }),
})