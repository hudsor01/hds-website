/**
 * Blog Posts API Route
 * POST: Create a new blog post (authenticated via ADMIN_SECRET)
 *
 * Used by n8n automation workflow to publish blog content.
 * Posts default to published: false (draft) so they can be reviewed.
 */

import { eq, inArray } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { validateAdminAuth } from '@/lib/auth/admin'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { createBlogPostSchema } from '@/lib/schemas/blog-api'
import {
	blogAuthors,
	blogPosts,
	blogPostTags,
	blogTags
} from '@/lib/schemas/schema'

export async function POST(request: NextRequest) {
	const authError = validateAdminAuth(request)
	if (authError) {
		return authError
	}

	try {
		const body: unknown = await request.json()
		const parsed = createBlogPostSchema.safeParse(body)

		if (!parsed.success) {
			return NextResponse.json(
				{ error: 'Validation failed', details: parsed.error.flatten() },
				{ status: 400 }
			)
		}

		const { authorSlug, tagSlugs, ...postData } = parsed.data

		// Resolve author by slug
		const authorRows = await db
			.select({ id: blogAuthors.id })
			.from(blogAuthors)
			.where(eq(blogAuthors.slug, authorSlug))
			.limit(1)

		const author = authorRows[0]
		if (!author) {
			return NextResponse.json(
				{ error: `Author not found: ${authorSlug}` },
				{ status: 404 }
			)
		}

		// Check for duplicate slug
		const existingSlug = await db
			.select({ id: blogPosts.id })
			.from(blogPosts)
			.where(eq(blogPosts.slug, postData.slug))
			.limit(1)

		if (existingSlug.length > 0) {
			return NextResponse.json(
				{ error: `Post with slug already exists: ${postData.slug}` },
				{ status: 409 }
			)
		}

		// Insert the post
		const insertedRows = await db
			.insert(blogPosts)
			.values({
				slug: postData.slug,
				title: postData.title,
				excerpt: postData.excerpt,
				content: postData.content,
				featureImage: postData.featureImage ?? null,
				readingTime: postData.readingTime,
				featured: postData.featured,
				published: postData.published,
				publishedAt: postData.published ? new Date() : null,
				authorId: author.id
			})
			.returning({ id: blogPosts.id, slug: blogPosts.slug })

		const newPost = insertedRows[0]
		if (!newPost) {
			throw new Error('Failed to insert blog post')
		}

		// Attach tags if provided
		if (tagSlugs.length > 0) {
			const resolvedTags = await db
				.select({ id: blogTags.id, slug: blogTags.slug })
				.from(blogTags)
				.where(inArray(blogTags.slug, tagSlugs))

			const missingSlugs = tagSlugs.filter(
				slug => !resolvedTags.some(tag => tag.slug === slug)
			)
			for (const slug of missingSlugs) {
				logger.info('Tag not found, skipping', { tagSlug: slug })
			}

			if (resolvedTags.length > 0) {
				await db.insert(blogPostTags).values(
					resolvedTags.map(tag => ({
						postId: newPost.id,
						tagId: tag.id
					}))
				)
			}
		}

		logger.info('Blog post created via API', {
			postId: newPost.id,
			slug: newPost.slug,
			published: postData.published
		})

		return NextResponse.json(
			{
				success: true,
				post: {
					id: newPost.id,
					slug: newPost.slug,
					published: postData.published
				}
			},
			{ status: 201 }
		)
	} catch (error) {
		logger.error('Blog post creation failed', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
