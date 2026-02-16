/**
 * Blog-related schemas
 * Tables: blog_authors, blog_tags, blog_posts, blog_post_tags
 */
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const blogAuthors = pgTable('blog_authors', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  bio: text('bio'),
  profileImage: text('profile_image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const blogTags = pgTable('blog_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
});

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull().default(''),
  featureImage: text('feature_image'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  readingTime: integer('reading_time').notNull().default(5),
  featured: boolean('featured').default(false),
  published: boolean('published').default(true),
  authorId: uuid('author_id').references(() => blogAuthors.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const blogPostTags = pgTable(
  'blog_post_tags',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => blogPosts.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => blogTags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })],
);

// Type exports
export type DbBlogAuthor = typeof blogAuthors.$inferSelect;
export type NewBlogAuthor = typeof blogAuthors.$inferInsert;
export type DbBlogTag = typeof blogTags.$inferSelect;
export type NewBlogTag = typeof blogTags.$inferInsert;
export type DbBlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type DbBlogPostTag = typeof blogPostTags.$inferSelect;
export type NewBlogPostTag = typeof blogPostTags.$inferInsert;
