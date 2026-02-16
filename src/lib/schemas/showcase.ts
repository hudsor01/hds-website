/**
 * Unified Showcase Schema
 * Combines portfolio projects and case studies into one table
 * Use showcaseType to distinguish: 'quick' (portfolio) vs 'detailed' (case study)
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

export const showcase = pgTable('showcase', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  longDescription: text('long_description'),

  // Type discriminator: 'quick' for portfolio items, 'detailed' for case studies
  showcaseType: text('showcase_type').notNull().default('quick'),

  // Client & project info
  clientName: text('client_name'),
  industry: text('industry'),
  projectType: text('project_type'),
  category: text('category'),

  // Case study narrative content (for showcaseType='detailed')
  challenge: text('challenge'),
  solution: text('solution'),
  results: text('results'),

  // Technical details
  technologies: jsonb('technologies').$type<string[]>().default([]),
  metrics: jsonb('metrics').$type<Record<string, string>>().default({}),

  // Images
  imageUrl: text('image_url'),
  ogImageUrl: text('og_image_url'),
  galleryImages: jsonb('gallery_images').$type<string[]>(),
  gradientClass: text('gradient_class').default('surface-overlay'),

  // Links
  externalLink: text('external_link'),
  githubLink: text('github_link'),

  // Testimonial
  testimonialText: text('testimonial_text'),
  testimonialAuthor: text('testimonial_author'),
  testimonialRole: text('testimonial_role'),
  testimonialVideoUrl: text('testimonial_video_url'),

  // Project metadata
  projectDuration: text('project_duration'),
  teamSize: integer('team_size'),

  // Display & status
  featured: boolean('featured').default(false),
  published: boolean('published').default(false),
  displayOrder: integer('display_order').default(0),
  viewCount: integer('view_count').default(0),

  // Timestamps
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Type exports
export type Showcase = typeof showcase.$inferSelect;
export type NewShowcase = typeof showcase.$inferInsert;
