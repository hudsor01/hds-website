/**
 * Sync content/blog/*.md -> Neon blog_posts (idempotent upsert by slug).
 *   bun run scripts/blog/publish.ts             # publish all files
 *   bun run scripts/blog/publish.ts --dry-run   # show what would change, write nothing
 *   bun run scripts/blog/publish.ts --export    # one-time migration: Neon -> files
 * Requires POSTGRES_URL (auto-loaded from .env.local locally).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { eq, inArray } from 'drizzle-orm'
import matter from 'gray-matter'
import { db } from '@/lib/db'
import {
	blogAuthors,
	blogPosts,
	blogPostTags,
	blogTags
} from '@/lib/schemas/blog'
import {
	bodyToHtml,
	CONTENT_DIR,
	computeReadingTime,
	listPostFiles,
	parsePost
} from './lib'

const dryRun = process.argv.includes('--dry-run')
const doExport = process.argv.includes('--export')

async function authorIdBySlug(slug: string): Promise<string> {
	const [a] = await db
		.select({ id: blogAuthors.id })
		.from(blogAuthors)
		.where(eq(blogAuthors.slug, slug))
	if (!a) {
		throw new Error(`author not found: ${slug}`)
	}
	return a.id
}

async function tagIdsBySlugs(slugs: string[]): Promise<string[]> {
	if (slugs.length === 0) {
		return []
	}
	const rows = await db
		.select({ id: blogTags.id, slug: blogTags.slug })
		.from(blogTags)
		.where(inArray(blogTags.slug, slugs))
	const map = new Map(rows.map(r => [r.slug, r.id]))
	return slugs.map(s => {
		const id = map.get(s)
		if (!id) {
			throw new Error(`tag not found: ${s}`)
		}
		return id
	})
}

async function publish(): Promise<void> {
	// Skip gracefully without a DB (e.g. a CI build with no POSTGRES_URL).
	// Real publishing happens on Vercel deploys, where POSTGRES_URL is set.
	if (!dryRun && !process.env.POSTGRES_URL) {
		console.warn('blog:publish skipped (no POSTGRES_URL)')
		return
	}
	const files = listPostFiles()
	for (const file of files) {
		const { slug, data, body } = parsePost(file)
		const content = bodyToHtml(body, data.bodyFormat ?? 'markdown')
		const readingTime =
			data.readingTime && data.readingTime > 0
				? data.readingTime
				: computeReadingTime(body)
		if (dryRun) {
			console.warn(
				`[dry-run] ${slug} -> ${content.length} bytes html, published=${data.published}, tags=[${(data.tags ?? []).join(', ')}]`
			)
			continue
		}
		const authorId = await authorIdBySlug(data.author)
		const set = {
			title: data.title,
			excerpt: data.excerpt,
			content,
			featureImage: data.featureImage || null,
			publishedAt: new Date(data.publishedAt),
			readingTime,
			featured: data.featured ?? false,
			published: data.published ?? true,
			authorId,
			updatedAt: new Date()
		}
		const [row] = await db
			.insert(blogPosts)
			.values({ slug, ...set })
			.onConflictDoUpdate({ target: blogPosts.slug, set })
			.returning({ id: blogPosts.id })
		const postId =
			row?.id ??
			(
				await db
					.select({ id: blogPosts.id })
					.from(blogPosts)
					.where(eq(blogPosts.slug, slug))
			)[0]?.id
		if (!postId) {
			throw new Error(`no id resolved for ${slug}`)
		}
		const tagIds = await tagIdsBySlugs(data.tags ?? [])
		await db.delete(blogPostTags).where(eq(blogPostTags.postId, postId))
		if (tagIds.length > 0) {
			await db
				.insert(blogPostTags)
				.values(tagIds.map(tagId => ({ postId, tagId })))
		}
		console.warn(`published ${slug}`)
	}
	console.warn(`blog:publish - ${files.length} posts synced`)
}

async function exportPosts(): Promise<void> {
	mkdirSync(CONTENT_DIR, { recursive: true })
	const posts = await db.select().from(blogPosts)
	const authors = await db.select().from(blogAuthors)
	const authorSlug = new Map(authors.map(a => [a.id, a.slug]))
	const tagRows = await db
		.select({ postId: blogPostTags.postId, slug: blogTags.slug })
		.from(blogPostTags)
		.innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
	const tagsByPost = new Map<string, string[]>()
	for (const r of tagRows) {
		const list = tagsByPost.get(r.postId) ?? []
		list.push(r.slug)
		tagsByPost.set(r.postId, list)
	}
	for (const post of posts) {
		const fm = {
			title: post.title,
			slug: post.slug,
			excerpt: post.excerpt,
			pillar: 0,
			tags: tagsByPost.get(post.id) ?? [],
			author:
				(post.authorId ? authorSlug.get(post.authorId) : undefined) ??
				'richard-hudson',
			publishedAt: (post.publishedAt ?? new Date()).toISOString().slice(0, 10),
			published: post.published ?? true,
			featured: post.featured ?? false,
			featureImage: post.featureImage ?? '',
			readingTime: post.readingTime,
			bodyFormat: 'html',
			legacy: true
		}
		writeFileSync(
			join(CONTENT_DIR, `${post.slug}.md`),
			matter.stringify(`\n${post.content}\n`, fm)
		)
		console.warn(`exported ${post.slug}.md`)
	}
	console.warn(`blog:export - ${posts.length} posts -> content/blog/`)
}

const run = doExport ? exportPosts : publish
run()
	.then(() => process.exit(0))
	.catch((error: unknown) => {
		console.error('blog:publish failed', error)
		process.exit(1)
	})
