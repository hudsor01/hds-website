import { z } from 'zod';
import { urlSchema, timestampSchema } from './common';

// Blog post status
export const postStatusSchema = z.enum(['draft', 'published', 'archived']);

// Author schema
export const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  avatar: urlSchema.optional(),
  social: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }).optional(),
});

// Blog category schema
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

// Blog tag schema
export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

// Blog post schema
export const blogPostSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  slug: z.string(),
  excerpt: z.string().max(500).optional(),
  content: z.string(),
  featuredImage: urlSchema.optional(),
  status: postStatusSchema,
  author: authorSchema,
  categories: z.array(categorySchema).default([]),
  tags: z.array(tagSchema).default([]),
  publishedAt: z.date().or(z.string().datetime()).optional(),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    focusKeyword: z.string().optional(),
    canonicalUrl: urlSchema.optional(),
  }).optional(),
  readingTime: z.number().positive().optional(),
  viewCount: z.number().nonnegative().default(0),
}).merge(timestampSchema);

// Blog search schema
export const blogSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
  status: postStatusSchema.optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(10),
  sortBy: z.enum(['publishedAt', 'viewCount', 'title']).default('publishedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Comment schema
export const commentSchema = z.object({
  id: z.string(),
  postId: z.string(),
  author: z.object({
    name: z.string(),
    email: z.string().email(),
    website: urlSchema.optional(),
  }),
  content: z.string().min(1).max(5000),
  status: z.enum(['pending', 'approved', 'spam', 'trash']),
  parentId: z.string().optional(),
}).merge(timestampSchema);

// Type inference
export type BlogPost = z.infer<typeof blogPostSchema>;
export type BlogSearch = z.infer<typeof blogSearchSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type Author = z.infer<typeof authorSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Tag = z.infer<typeof tagSchema>;