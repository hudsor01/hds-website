/**
 * Content-related schemas
 * Tables: case_studies, testimonials, testimonial_requests, help_articles
 */
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';

export const caseStudies = pgTable('case_studies', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  clientName: text('client_name').notNull(),
  industry: text('industry').notNull(),
  projectType: text('project_type').notNull(),
  description: text('description').notNull(),
  challenge: text('challenge').notNull(),
  solution: text('solution').notNull(),
  results: text('results').notNull(),
  technologies: jsonb('technologies'),
  metrics: jsonb('metrics'),
  testimonialText: text('testimonial_text'),
  testimonialAuthor: text('testimonial_author'),
  testimonialRole: text('testimonial_role'),
  testimonialVideoUrl: text('testimonial_video_url'),
  thumbnailUrl: text('thumbnail_url'),
  featuredImageUrl: text('featured_image_url'),
  projectUrl: text('project_url'),
  projectDuration: text('project_duration'),
  teamSize: integer('team_size'),
  featured: boolean('featured').default(false),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  role: text('role'),
  company: text('company'),
  content: text('content').notNull(),
  rating: integer('rating'),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  featured: boolean('featured').default(false),
  published: boolean('published').default(true),
  projectId: uuid('project_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const testimonialRequests = pgTable('testimonial_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: text('token').notNull().unique(),
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email').notNull(),
  projectName: text('project_name'),
  message: text('message'),
  status: text('status').default('pending'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  testimonialId: uuid('testimonial_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const helpArticles = pgTable('help_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  category: text('category'),
  tags: jsonb('tags'),
  published: boolean('published').default(false),
  viewCount: integer('view_count').default(0),
  helpfulCount: integer('helpful_count').default(0),
  notHelpfulCount: integer('not_helpful_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Type exports
export type CaseStudy = typeof caseStudies.$inferSelect;
export type NewCaseStudy = typeof caseStudies.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type TestimonialRequest = typeof testimonialRequests.$inferSelect;
export type NewTestimonialRequest = typeof testimonialRequests.$inferInsert;
export type HelpArticle = typeof helpArticles.$inferSelect;
export type NewHelpArticle = typeof helpArticles.$inferInsert;
