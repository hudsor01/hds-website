/**
 * Testimonials tRPC Router
 * 
 * Handles all testimonial operations including CRUD and public access
 */

import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../lib/trpc-unified'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

export const testimonialsRouter = createTRPCRouter({
  // Public procedures - accessible to all users
  
  /**
   * Get all active testimonials
   */
  getTestimonials: publicProcedure
    .input(z.object({
      serviceUsed: z.string().optional(),
      featured: z.boolean().optional(),
      limit: z.number().min(1).max(50).optional(),
      verified: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { serviceUsed, featured, limit, verified } = input

      const where: Prisma.TestimonialWhereInput = {
        isActive: true,
      }

      if (serviceUsed) {
        where.serviceUsed = serviceUsed
      }

      if (featured !== undefined) {
        where.featured = featured
      }

      if (verified !== undefined) {
        where.verified = verified
      }

      const testimonials = await ctx.db.testimonial.findMany({
        where,
        take: limit,
        orderBy: [
          { featured: 'desc' },
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          name: true,
          role: true,
          company: true,
          content: true,
          rating: true,
          avatar: true,
          companyLogo: true,
          serviceUsed: true,
          projectType: true,
          featured: true,
          verified: true,
          createdAt: true,
        },
      })

      return testimonials
    }),

  /**
   * Get featured testimonials for homepage
   */
  getFeatured: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(10).default(3),
    }))
    .query(async ({ ctx, input }) => {
      const testimonials = await ctx.db.testimonial.findMany({
        where: { 
          isActive: true,
          featured: true,
          verified: true,
        },
        take: input.limit,
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          role: true,
          company: true,
          content: true,
          rating: true,
          avatar: true,
          serviceUsed: true,
        },
      })

      return testimonials
    }),

  /**
   * Get testimonials by service
   */
  getByService: publicProcedure
    .input(z.object({
      serviceUsed: z.string(),
      limit: z.number().min(1).max(20).default(5),
    }))
    .query(async ({ ctx, input }) => {
      const testimonials = await ctx.db.testimonial.findMany({
        where: { 
          isActive: true,
          verified: true,
          serviceUsed: input.serviceUsed,
        },
        take: input.limit,
        orderBy: [
          { featured: 'desc' },
          { rating: 'desc' },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          name: true,
          role: true,
          company: true,
          content: true,
          rating: true,
          avatar: true,
          companyLogo: true,
          projectType: true,
        },
      })

      return testimonials
    }),

  /**
   * Get testimonial statistics
   */
  getStats: publicProcedure
    .query(async ({ ctx }) => {
      const [totalCount, averageRating, serviceBreakdown] = await Promise.all([
        ctx.db.testimonial.count({
          where: { isActive: true, verified: true },
        }),
        ctx.db.testimonial.aggregate({
          where: { isActive: true, verified: true },
          _avg: { rating: true },
        }),
        ctx.db.testimonial.groupBy({
          by: ['serviceUsed'],
          where: { 
            isActive: true, 
            verified: true,
            serviceUsed: { not: null },
          },
          _count: true,
          orderBy: { _count: { serviceUsed: 'desc' } },
        }),
      ])

      return {
        totalCount,
        averageRating: Number((averageRating._avg.rating || 0).toFixed(1)),
        serviceBreakdown: serviceBreakdown.map(item => ({
          service: item.serviceUsed || 'Other',
          count: item._count,
        })),
      }
    }),

  // Admin procedures - require authentication

  /**
   * Get all testimonials for admin (including inactive)
   */
  getAllTestimonials: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
      isActive: z.boolean().optional(),
      verified: z.boolean().optional(),
      serviceUsed: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, offset, isActive, verified, serviceUsed, search } = input

      const where: Prisma.TestimonialWhereInput = {}

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      if (verified !== undefined) {
        where.verified = verified
      }

      if (serviceUsed) {
        where.serviceUsed = serviceUsed
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ]
      }

      const total = await ctx.db.testimonial.count({ where })

      const testimonials = await ctx.db.testimonial.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
      })

      return {
        testimonials,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      }
    }),

  /**
   * Create a new testimonial
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      role: z.string().min(1).max(100),
      company: z.string().min(1).max(100),
      content: z.string().min(1).max(1000),
      rating: z.number().min(1).max(5).default(5),
      avatar: z.string().url().optional(),
      companyLogo: z.string().url().optional(),
      serviceUsed: z.string().optional(),
      projectType: z.string().optional(),
      featured: z.boolean().default(false),
      displayOrder: z.number().default(0),
      isActive: z.boolean().default(true),
      verified: z.boolean().default(false),
      email: z.string().email().optional(),
      linkedIn: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const testimonial = await ctx.db.testimonial.create({
          data: {
            name: input.name,
            role: input.role,
            company: input.company,
            content: input.content,
            rating: input.rating,
            avatar: input.avatar,
            companyLogo: input.companyLogo,
            serviceUsed: input.serviceUsed,
            projectType: input.projectType,
            featured: input.featured,
            displayOrder: input.displayOrder,
            isActive: input.isActive,
            verified: input.verified,
            email: input.email,
            linkedIn: input.linkedIn,
          },
        })

        return testimonial
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create testimonial',
        })
      }
    }),

  /**
   * Update a testimonial
   */
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(100).optional(),
      role: z.string().min(1).max(100).optional(),
      company: z.string().min(1).max(100).optional(),
      content: z.string().min(1).max(1000).optional(),
      rating: z.number().min(1).max(5).optional(),
      avatar: z.string().url().optional(),
      companyLogo: z.string().url().optional(),
      serviceUsed: z.string().optional(),
      projectType: z.string().optional(),
      featured: z.boolean().optional(),
      displayOrder: z.number().optional(),
      isActive: z.boolean().optional(),
      verified: z.boolean().optional(),
      email: z.string().email().optional(),
      linkedIn: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, verified, ...updateData } = input

      try {
        const updatePayload: Prisma.TestimonialUpdateInput = { ...updateData }
        
        // Handle verification
        if (verified !== undefined) {
          updatePayload.verified = verified
          if (verified) {
            updatePayload.verifiedAt = new Date()
          } else {
            updatePayload.verifiedAt = null
          }
        }

        const testimonial = await ctx.db.testimonial.update({
          where: { id },
          data: updatePayload,
        })

        return testimonial
      } catch (error: unknown) {
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Testimonial not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update testimonial',
        })
      }
    }),

  /**
   * Delete a testimonial
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.testimonial.delete({
          where: { id: input.id },
        })

        return { success: true }
      } catch (error: unknown) {
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Testimonial not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete testimonial',
        })
      }
    }),

  /**
   * Verify a testimonial
   */
  verify: protectedProcedure
    .input(z.object({
      id: z.string(),
      verified: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const testimonial = await ctx.db.testimonial.update({
          where: { id: input.id },
          data: {
            verified: input.verified,
            verifiedAt: input.verified ? new Date() : null,
          },
        })

        return testimonial
      } catch (error: unknown) {
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Testimonial not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify testimonial',
        })
      }
    }),

  /**
   * Reorder testimonials
   */
  reorder: protectedProcedure
    .input(z.object({
      testimonialIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Update display order for each testimonial
        await Promise.all(
          input.testimonialIds.map((testimonialId, index) =>
            ctx.db.testimonial.update({
              where: { id: testimonialId },
              data: { displayOrder: index },
            }),
          ),
        )

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reorder testimonials',
        })
      }
    }),

  /**
   * Get testimonial analytics
   */
  getAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalTestimonials, 
        activeTestimonials, 
        verifiedTestimonials, 
        featuredTestimonials,
        avgRating,
        ratingDistribution,
      ] = await Promise.all([
        ctx.db.testimonial.count(),
        ctx.db.testimonial.count({ where: { isActive: true } }),
        ctx.db.testimonial.count({ where: { verified: true } }),
        ctx.db.testimonial.count({ where: { featured: true, isActive: true } }),
        ctx.db.testimonial.aggregate({
          where: { isActive: true, verified: true },
          _avg: { rating: true },
        }),
        ctx.db.testimonial.groupBy({
          by: ['rating'],
          where: { isActive: true, verified: true },
          _count: true,
          orderBy: { rating: 'desc' },
        }),
      ])

      return {
        totalTestimonials,
        activeTestimonials,
        verifiedTestimonials,
        featuredTestimonials,
        averageRating: Number((avgRating._avg.rating || 0).toFixed(1)),
        ratingDistribution: ratingDistribution.map(item => ({
          rating: item.rating,
          count: item._count,
        })),
      }
    }),
})