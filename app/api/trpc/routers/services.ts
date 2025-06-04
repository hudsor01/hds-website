/**
 * Services tRPC Router
 * 
 * Handles all service operations including CRUD and public access
 */

import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../lib/trpc-unified'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

export const servicesRouter = createTRPCRouter({
  // Public procedures - accessible to all users
  
  /**
   * Get all active services
   */
  getServices: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      featured: z.boolean().optional(),
      limit: z.number().min(1).max(50).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { category, featured, limit } = input

      const where: Prisma.ServiceWhereInput = {
        isActive: true,
      }

      if (category) {
        where.category = category
      }

      if (featured !== undefined) {
        where.featured = featured
      }

      const services = await ctx.db.service.findMany({
        where,
        take: limit,
        orderBy: [
          { featured: 'desc' },
          { displayOrder: 'asc' },
          { name: 'asc' },
        ],
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          shortDescription: true,
          startingPrice: true,
          currency: true,
          priceUnit: true,
          features: true,
          benefits: true,
          icon: true,
          featuredImage: true,
          category: true,
          tags: true,
          featured: true,
          estimatedTimeline: true,
          targetAudience: true,
        },
      })

      return services
    }),

  /**
   * Get a single service by slug
   */
  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const service = await ctx.db.service.findUnique({
        where: { 
          slug: input.slug,
          isActive: true,
        },
      })

      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        })
      }

      return service
    }),

  /**
   * Get featured services for homepage
   */
  getFeatured: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(10).default(3),
    }))
    .query(async ({ ctx, input }) => {
      const services = await ctx.db.service.findMany({
        where: { 
          isActive: true,
          featured: true,
        },
        take: input.limit,
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          shortDescription: true,
          startingPrice: true,
          currency: true,
          priceUnit: true,
          features: true,
          icon: true,
          category: true,
          estimatedTimeline: true,
        },
      })

      return services
    }),

  /**
   * Get all service categories
   */
  getCategories: publicProcedure
    .query(async ({ ctx }) => {
      const services = await ctx.db.service.findMany({
        where: { 
          isActive: true,
          category: { not: null },
        },
        select: { category: true },
        distinct: ['category'],
      })

      return services
        .map(s => s.category)
        .filter(Boolean)
        .sort()
    }),

  // Admin procedures - require authentication

  /**
   * Get all services for admin (including inactive)
   */
  getAllServices: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
      isActive: z.boolean().optional(),
      category: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, offset, isActive, category, search } = input

      const where: Prisma.ServiceWhereInput = {}

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      if (category) {
        where.category = category
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      const total = await ctx.db.service.count({ where })

      const services = await ctx.db.service.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { featured: 'desc' },
          { displayOrder: 'asc' },
          { name: 'asc' },
        ],
      })

      return {
        services,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      }
    }),

  /**
   * Create a new service
   */
  create: protectedProcedure
    .input(z.object({
      slug: z.string().min(1).max(100),
      name: z.string().min(1).max(200),
      description: z.string().min(1),
      shortDescription: z.string().optional(),
      startingPrice: z.number().positive().optional(),
      currency: z.string().default('USD'),
      priceUnit: z.string().default('project'),
      features: z.array(z.string()).default([]),
      benefits: z.array(z.string()).default([]),
      deliverables: z.array(z.string()).default([]),
      icon: z.string().optional(),
      featuredImage: z.string().url().optional(),
      gallery: z.array(z.string().url()).default([]),
      category: z.string().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      displayOrder: z.number().default(0),
      isActive: z.boolean().default(true),
      estimatedTimeline: z.string().optional(),
      targetAudience: z.string().optional(),
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const service = await ctx.db.service.create({
          data: input as Prisma.ServiceCreateInput,
        })

        return service
      } catch (error: unknown) {
        if (error instanceof Error && 'code' in error && error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A service with this slug already exists',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create service',
        })
      }
    }),

  /**
   * Update a service
   */
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      slug: z.string().min(1).max(100).optional(),
      name: z.string().min(1).max(200).optional(),
      description: z.string().min(1).optional(),
      shortDescription: z.string().optional(),
      startingPrice: z.number().positive().optional(),
      currency: z.string().optional(),
      priceUnit: z.string().optional(),
      features: z.array(z.string()).optional(),
      benefits: z.array(z.string()).optional(),
      deliverables: z.array(z.string()).optional(),
      icon: z.string().optional(),
      featuredImage: z.string().url().optional(),
      gallery: z.array(z.string().url()).optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      featured: z.boolean().optional(),
      displayOrder: z.number().optional(),
      isActive: z.boolean().optional(),
      estimatedTimeline: z.string().optional(),
      targetAudience: z.string().optional(),
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      try {
        const service = await ctx.db.service.update({
          where: { id },
          data: updateData,
        })

        return service
      } catch (error: unknown) {
        if (error instanceof Error && 'code' in error) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'A service with this slug already exists',
            })
          }
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Service not found',
            })
          }
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update service',
        })
      }
    }),

  /**
   * Delete a service
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.service.delete({
          where: { id: input.id },
        })

        return { success: true }
      } catch (error: unknown) {
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Service not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete service',
        })
      }
    }),

  /**
   * Reorder services
   */
  reorder: protectedProcedure
    .input(z.object({
      serviceIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Update display order for each service
        await Promise.all(
          input.serviceIds.map((serviceId, index) =>
            ctx.db.service.update({
              where: { id: serviceId },
              data: { displayOrder: index },
            }),
          ),
        )

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reorder services',
        })
      }
    }),

  /**
   * Get service analytics
   */
  getAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      const [totalServices, activeServices, featuredServices, categories] = await Promise.all([
        ctx.db.service.count(),
        ctx.db.service.count({ where: { isActive: true } }),
        ctx.db.service.count({ where: { featured: true, isActive: true } }),
        ctx.db.service.findMany({
          where: { isActive: true, category: { not: null } },
          select: { category: true },
          distinct: ['category'],
        }),
      ])

      return {
        totalServices,
        activeServices,
        featuredServices,
        totalCategories: categories.length,
      }
    }),
})