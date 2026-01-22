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
  numeric,
} from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  shortDescription: text('short_description'),
  clientName: text('client_name'),
  category: text('category'),
  technologies: jsonb('technologies'),
  featuredImage: text('featured_image'),
  gallery: jsonb('gallery'),
  projectUrl: text('project_url'),
  repositoryUrl: text('repository_url'),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  status: text('status').default('completed'),
  budget: numeric('budget'),
  featured: boolean('featured').default(false),
  published: boolean('published').default(false),
  sortOrder: numeric('sort_order'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Type exports
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
