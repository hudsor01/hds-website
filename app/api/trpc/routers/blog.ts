/**
 * Blog Posts tRPC Router
 * 
 * Handles all blog post operations including CRUD, filtering, and public access
 */

import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../lib/trpc-unified'
import { TRPCError } from '@trpc/server'
import { PostStatus } from '@prisma/client'

export const blogRouter = createTRPCRouter({
  // Public procedures - accessible to all users
  
  /**
   * Get all published blog posts with optional filtering
   */
  getPosts: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
      category: z.string().optional(),
      tag: z.string().optional(),
      search: z.string().optional(),
      orderBy: z.enum(['publishedAt', 'viewCount', 'title']).default('publishedAt'),
      orderDir: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, offset, category, tag, search, orderBy, orderDir } = input

      // Build where clause for filtering
      const where: Record<string, unknown> = {
        status: PostStatus.PUBLISHED,
        publishedAt: { not: null },
      }

      if (category) {
        where.categories = { has: category }
      }

      if (tag) {
        where.tags = { has: tag }
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ]
      }

      // Get total count for pagination
      const total = await ctx.db.blogPost.count({ where })

      // Get posts with ordering
      const posts = await ctx.db.blogPost.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { [orderBy]: orderDir },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          authorName: true,
          featuredImage: true,
          categories: true,
          tags: true,
          publishedAt: true,
          readTimeMinutes: true,
          viewCount: true,
          shareCount: true,
          likeCount: true,
        },
      })

      return {
        posts,
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
   * Get a single blog post by slug
   */
  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
      incrementView: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({
        where: { 
          slug: input.slug,
          status: PostStatus.PUBLISHED,
        },
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        })
      }

      // Increment view count if requested
      if (input.incrementView) {
        await ctx.db.blogPost.update({
          where: { id: post.id },
          data: { viewCount: { increment: 1 } },
        })
      }

      return post
    }),

  /**
   * Get all categories used in published posts
   */
  getCategories: publicProcedure
    .query(async ({ ctx }) => {
      const posts = await ctx.db.blogPost.findMany({
        where: { 
          status: PostStatus.PUBLISHED,
          categories: { isEmpty: false },
        },
        select: { categories: true },
      })

      // Flatten and count categories
      const categoryCount: Record<string, number> = {}
      posts.forEach(post => {
        post.categories.forEach(category => {
          categoryCount[category] = (categoryCount[category] || 0) + 1
        })
      })

      return Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    }),

  /**
   * Get all tags used in published posts
   */
  getTags: publicProcedure
    .query(async ({ ctx }) => {
      const posts = await ctx.db.blogPost.findMany({
        where: { 
          status: PostStatus.PUBLISHED,
          tags: { isEmpty: false },
        },
        select: { tags: true },
      })

      // Flatten and count tags
      const tagCount: Record<string, number> = {}
      posts.forEach(post => {
        post.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      })

      return Object.entries(tagCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    }),

  /**
   * Get featured blog posts
   */
  getFeatured: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(10).default(3),
    }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.blogPost.findMany({
        where: { 
          status: PostStatus.PUBLISHED,
          publishedAt: { not: null },
        },
        take: input.limit,
        orderBy: [
          { viewCount: 'desc' },
          { publishedAt: 'desc' },
        ],
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          authorName: true,
          featuredImage: true,
          publishedAt: true,
          readTimeMinutes: true,
          viewCount: true,
        },
      })

      return posts
    }),

  // Admin procedures - require authentication

  /**
   * Get all posts for admin (including drafts)
   */
  getAllPosts: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
      status: z.nativeEnum(PostStatus).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, offset, status, search } = input

      const where: Record<string, unknown> = {}

      if (status) {
        where.status = status
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { authorName: { contains: search, mode: 'insensitive' } },
        ]
      }

      const total = await ctx.db.blogPost.count({ where })

      const posts = await ctx.db.blogPost.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { updatedAt: 'desc' },
      })

      return {
        posts,
        pagination: {
          total,
          pages: Math.ceil(Number(total) / Number(limit)),
          currentPage: Math.floor(Number(offset) / Number(limit)) + 1,
        },
      }
    }),

  /**
   * Create a new blog post
   */
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      slug: z.string().min(1).max(100),
      excerpt: z.string().optional(),
      content: z.string().min(1),
      authorName: z.string().min(1),
      authorEmail: z.string().email().optional(),
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
      keywords: z.array(z.string()).default([]),
      featuredImage: z.string().url().optional(),
      gallery: z.array(z.string().url()).default([]),
      categories: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
      readTimeMinutes: z.number().min(1).max(60).default(5),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const post = await ctx.db.blogPost.create({
          data: {
            title: input.title,
            slug: input.slug,
            excerpt: input.excerpt,
            content: input.content,
            authorName: input.authorName,
            authorEmail: input.authorEmail,
            metaTitle: input.metaTitle,
            metaDescription: input.metaDescription,
            keywords: input.keywords,
            featuredImage: input.featuredImage,
            gallery: input.gallery,
            categories: input.categories,
            tags: input.tags,
            status: input.status,
            readTimeMinutes: input.readTimeMinutes,
            publishedAt: input.status === PostStatus.PUBLISHED ? new Date() : null,
          },
        })

        return post
      } catch (error: Record<string, unknown>) {
        if (error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A post with this slug already exists',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create blog post',
        })
      }
    }),

  /**
   * Update a blog post
   */
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).max(200).optional(),
      slug: z.string().min(1).max(100).optional(),
      excerpt: z.string().optional(),
      content: z.string().min(1).optional(),
      authorName: z.string().min(1).optional(),
      authorEmail: z.string().email().optional(),
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
      keywords: z.array(z.string()).optional(),
      featuredImage: z.string().url().optional(),
      gallery: z.array(z.string().url()).optional(),
      categories: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      status: z.nativeEnum(PostStatus).optional(),
      readTimeMinutes: z.number().min(1).max(60).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, status, ...updateData } = input

      try {
        // Handle publishing logic
        const updatePayload: Record<string, unknown> = { ...updateData }
        if (status) {
          updatePayload.status = status
          if (status === PostStatus.PUBLISHED) {
            // Set publishedAt if not already set
            const existing = await ctx.db.blogPost.findUnique({
              where: { id },
              select: { publishedAt: true },
            })
            if (!existing?.publishedAt) {
              updatePayload.publishedAt = new Date()
            }
          }
        }

        const post = await ctx.db.blogPost.update({
          where: { id },
          data: updatePayload,
        })

        return post
      } catch (error: Record<string, unknown>) {
        if (error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A post with this slug already exists',
          })
        }
        if (error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Blog post not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update blog post',
        })
      }
    }),

  /**
   * Delete a blog post
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.blogPost.delete({
          where: { id: input.id },
        })

        return { success: true }
      } catch (error: Record<string, unknown>) {
        if (error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Blog post not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete blog post',
        })
      }
    }),

  /**
   * Get blog analytics
   */
  getAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      const [totalPosts, publishedPosts, draftPosts, totalViews, avgReadTime] = await Promise.all([
        ctx.db.blogPost.count(),
        ctx.db.blogPost.count({ where: { status: PostStatus.PUBLISHED } }),
        ctx.db.blogPost.count({ where: { status: PostStatus.DRAFT } }),
        ctx.db.blogPost.aggregate({
          _sum: { viewCount: true },
          where: { status: PostStatus.PUBLISHED },
        }),
        ctx.db.blogPost.aggregate({
          _avg: { readTimeMinutes: true },
          where: { status: PostStatus.PUBLISHED },
        }),
      ])

      return {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews: totalViews._sum.viewCount || 0,
        avgReadTime: Math.round(avgReadTime._avg.readTimeMinutes || 5),
      }
    }),
})