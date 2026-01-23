/**
 * Content-related schemas
 * Tables: testimonials, testimonial_requests, help_articles
 */
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

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
  category: text('category').notNull(),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
});

// Type exports
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type TestimonialRequest = typeof testimonialRequests.$inferSelect;
export type NewTestimonialRequest = typeof testimonialRequests.$inferInsert;
export type HelpArticle = typeof helpArticles.$inferSelect;
export type NewHelpArticle = typeof helpArticles.$inferInsert;
