/**
 * Project-related schemas
 * Tables: projects
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

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  longDescription: text('long_description'),
  category: text('category').notNull(),
  techStack: jsonb('tech_stack').$type<string[]>().notNull(),
  technologies: jsonb('technologies').$type<string[]>(),
  imageUrl: text('image_url').notNull(),
  gradientClass: text('gradient_class').notNull().default('bg-gradient-to-br from-cyan-500/20 to-blue-500/20'),
  externalLink: text('external_link'),
  githubLink: text('github_link'),
  caseStudyUrl: text('case_study_url'),
  stats: jsonb('stats').$type<Record<string, string>>().notNull().default({}),
  resultsMetrics: jsonb('results_metrics'),
  challenges: jsonb('challenges').$type<string[]>(),
  solutions: jsonb('solutions').$type<string[]>(),
  testimonialText: text('testimonial_text'),
  testimonialAuthor: text('testimonial_author'),
  testimonialAuthorTitle: text('testimonial_author_title'),
  testimonialVideoUrl: text('testimonial_video_url'),
  industry: text('industry'),
  projectDuration: text('project_duration'),
  teamSize: integer('team_size'),
  galleryImages: jsonb('gallery_images').$type<string[]>(),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  ogImageUrl: text('og_image_url'),
  displayOrder: integer('display_order').notNull().default(0),
  viewCount: integer('view_count').notNull().default(0),
  featured: boolean('featured').notNull().default(false),
  published: boolean('published').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Type exports
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
