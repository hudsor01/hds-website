/**
 * LEGACY blog tables, pending a manual DROP.
 * Tables: blog_authors, blog_tags, blog_posts, blog_post_tags
 *
 * Nothing reads or writes these anymore: blog posts are compiled from
 * content/blog (scripts/blog/build.ts) and authors/tags live in
 * src/lib/constants/blog.ts. The definitions stay only so `drizzle-kit push`
 * does not propose DROP TABLE while the tables still exist in Neon. Remove
 * this file (and its barrel export) in the same change that drops them.
 */
import {
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid
} from 'drizzle-orm/pg-core'

export const blogAuthors = pgTable('blog_authors', {
	id: uuid('id').primaryKey().defaultRandom(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	bio: text('bio'),
	profileImage: text('profile_image'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
})

export const blogTags = pgTable('blog_tags', {
	id: uuid('id').primaryKey().defaultRandom(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	description: text('description')
})

export const blogPosts = pgTable(
	'blog_posts',
	{
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
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
	},
	table => [
		index('idx_blog_posts_published').on(table.published, table.publishedAt),
		index('idx_blog_posts_author_id').on(table.authorId)
	]
)

export const blogPostTags = pgTable(
	'blog_post_tags',
	{
		postId: uuid('post_id')
			.notNull()
			.references(() => blogPosts.id, { onDelete: 'cascade' }),
		tagId: uuid('tag_id')
			.notNull()
			.references(() => blogTags.id, { onDelete: 'cascade' })
	},
	table => [primaryKey({ columns: [table.postId, table.tagId] })]
)
