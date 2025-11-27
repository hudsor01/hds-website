/**
 * Ghost CMS Response Validation Schemas
 *
 * These schemas validate Ghost CMS API responses at runtime to ensure
 * data integrity and catch API changes early.
 */

import { z } from 'zod'
import { logger } from '@/lib/logger';

// Author schema
export const ghostAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  profile_image: z.string().url().nullable().optional(),
  cover_image: z.string().url().nullable().optional(),
  bio: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  location: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  url: z.string().url(),
})

export type GhostAuthor = z.infer<typeof ghostAuthorSchema>

// Tag schema
export const ghostTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  feature_image: z.string().url().nullable().optional(),
  visibility: z.string(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  url: z.string().url(),
})

export type GhostTag = z.infer<typeof ghostTagSchema>

// Post schema
export const ghostPostSchema = z.object({
  id: z.string(),
  uuid: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  html: z.string(),
  comment_id: z.string(),
  feature_image: z.string().url().nullable().optional(),
  feature_image_alt: z.string().nullable().optional(),
  feature_image_caption: z.string().nullable().optional(),
  featured: z.boolean(),
  visibility: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  published_at: z.string().datetime(),
  custom_excerpt: z.string().nullable().optional(),
  codeinjection_head: z.string().nullable().optional(),
  codeinjection_foot: z.string().nullable().optional(),
  custom_template: z.string().nullable().optional(),
  canonical_url: z.string().url().nullable().optional(),
  authors: z.array(ghostAuthorSchema).optional(),
  tags: z.array(ghostTagSchema).optional(),
  primary_author: ghostAuthorSchema.optional(),
  primary_tag: ghostTagSchema.optional(),
  url: z.string().url(),
  excerpt: z.string(),
  reading_time: z.number().int().nonnegative(),
  access: z.boolean(),
  send_email_when_published: z.boolean().optional(),
  og_image: z.string().url().nullable().optional(),
  og_title: z.string().nullable().optional(),
  og_description: z.string().nullable().optional(),
  twitter_image: z.string().url().nullable().optional(),
  twitter_title: z.string().nullable().optional(),
  twitter_description: z.string().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  email_subject: z.string().nullable().optional(),
})

export type GhostPost = z.infer<typeof ghostPostSchema>

// Settings schema
export const ghostSettingsSchema = z.object({
  title: z.string(),
  description: z.string(),
  logo: z.string().url().nullable().optional(),
  icon: z.string().url().nullable().optional(),
  accent_color: z.string().nullable().optional(),
  cover_image: z.string().url().nullable().optional(),
  facebook: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(),
  lang: z.string(),
  timezone: z.string(),
  codeinjection_head: z.string().nullable().optional(),
  codeinjection_foot: z.string().nullable().optional(),
  navigation: z.array(z.object({
    label: z.string(),
    url: z.string().url(),
  })).optional(),
  secondary_navigation: z.array(z.object({
    label: z.string(),
    url: z.string().url(),
  })).optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  og_image: z.string().url().nullable().optional(),
  og_title: z.string().nullable().optional(),
  og_description: z.string().nullable().optional(),
  twitter_image: z.string().url().nullable().optional(),
  twitter_title: z.string().nullable().optional(),
  twitter_description: z.string().nullable().optional(),
  url: z.string().url(),
})

export type GhostSettings = z.infer<typeof ghostSettingsSchema>

// Pagination schema
export const ghostPaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  pages: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  next: z.number().int().positive().nullable().optional(),
  prev: z.number().int().positive().nullable().optional(),
})

// Browse response schema (when API returns paginated data)
export const ghostBrowseResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema).optional(),
    meta: z.object({
      pagination: ghostPaginationSchema,
    }).optional(),
  }).or(z.array(itemSchema)) // Ghost sometimes returns array directly

// Helper function to safely parse Ghost responses
export function parseGhostResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T | null {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error(`Ghost CMS validation error in ${context}:`, {
        issues: error.issues,
        data: JSON.stringify(data, null, 2),
      })
    }
    return null
  }
}

// Helper to safely parse arrays of posts
export function parseGhostPosts(data: unknown): GhostPost[] {
  try {
    return z.array(ghostPostSchema).parse(data)
  } catch (error) {
    logger.error('Failed to validate Ghost posts:', error as Error)
    return []
  }
}

// Helper to safely parse arrays of tags
export function parseGhostTags(data: unknown): GhostTag[] {
  try {
    return z.array(ghostTagSchema).parse(data)
  } catch (error) {
    logger.error('Failed to validate Ghost tags:', error as Error)
    return []
  }
}

// Helper to safely parse arrays of authors
export function parseGhostAuthors(data: unknown): GhostAuthor[] {
  try {
    return z.array(ghostAuthorSchema).parse(data)
  } catch (error) {
    logger.error('Failed to validate Ghost authors:', error as Error)
    return []
  }
}
