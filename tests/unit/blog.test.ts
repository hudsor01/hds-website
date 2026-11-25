/**
 * Blog data layer tests (src/lib/blog.ts).
 *
 * Runs against the real compiled module (src/lib/_generated/blog-posts.ts,
 * produced by `bun run blog:build`, which `test:unit` runs first) and checks
 * it against a fresh compile of content/blog, so the tests track the content
 * without hard-coding post counts.
 */
import { describe, expect, test } from 'bun:test'
import {
	getAllPosts,
	getAuthorBySlug,
	getAuthors,
	getFeaturedPosts,
	getPostBySlug,
	getPostIndex,
	getPosts,
	getPostsByAuthor,
	getPostsByTag,
	getTagBySlug,
	getTags,
	getTagsWithCounts
} from '@/lib/blog'
import { BLOG_TAGS } from '@/lib/constants/blog'
import { compilePosts } from '../../scripts/blog/build'

const COMPILED = compilePosts()

describe('blog data layer', () => {
	test('serves exactly the published posts in content/blog, newest first', async () => {
		const posts = await getAllPosts()
		expect(posts.map(p => p.slug)).toEqual(COMPILED.map(p => p.slug))
		const times = posts.map(p => Date.parse(p.published_at))
		expect(times).toEqual([...times].sort((a, b) => b - a))
	})

	test('list functions never carry article content', async () => {
		const lists = [
			await getAllPosts(),
			(await getPosts()).posts,
			await getFeaturedPosts(),
			await getPostsByTag('seo'),
			await getPostsByAuthor('richard-hudson')
		]
		for (const list of lists) {
			expect(list.length).toBeGreaterThan(0)
			for (const post of list) {
				expect('content' in post).toBe(false)
			}
		}
	})

	test('getPosts paginates with a default page size of 10', async () => {
		const all = await getAllPosts()
		const first = await getPosts()
		const page2 = (await getPosts({ limit: 10, page: 2 })).posts
		expect(first.posts.map(p => p.slug)).toEqual(
			all.slice(0, 10).map(p => p.slug)
		)
		expect(page2.map(p => p.slug)).toEqual(all.slice(10, 20).map(p => p.slug))
		expect(first.total).toBe(all.length)
		expect(first.totalPages).toBe(Math.max(1, Math.ceil(all.length / 10)))
	})

	test('getPostBySlug returns the full post, null for unknown slugs', async () => {
		const first = COMPILED[0]
		if (!first) {
			throw new Error('no compiled posts')
		}
		const post = await getPostBySlug(first.slug)
		expect(post?.content).toBe(first.content)
		expect(post?.title).toBe(first.title)
		expect(post?.author.slug).toBe(first.authorSlug)
		expect(post?.tags.map(t => t.slug)).toEqual(first.tagSlugs)
		expect(await getPostBySlug('wp-login.php')).toBeNull()
	})

	test('drafts are not served', async () => {
		expect(
			await getPostBySlug(
				'why-your-business-needs-a-custom-crm-integration-to-unlock-true-efficiency'
			)
		).toBeNull()
	})

	test('getFeaturedPosts returns only featured posts, capped by limit', async () => {
		const featured = await getFeaturedPosts(3)
		expect(featured.length).toBeGreaterThan(0)
		expect(featured.length).toBeLessThanOrEqual(3)
		expect(featured.every(p => p.featured)).toBe(true)
		expect(await getFeaturedPosts(1)).toHaveLength(1)
	})

	test('tags resolve to display names and render in name order', async () => {
		const tags = await getTags()
		expect(tags.map(t => t.slug)).toEqual(BLOG_TAGS.map(t => t.slug))
		const names = tags.map(t => t.name)
		expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
		expect(await getTagBySlug('seo')).toMatchObject({
			slug: 'seo',
			name: 'SEO'
		})
		expect(await getTagBySlug('nope')).toBeNull()
	})

	test('tag counts match the posts carrying each tag', async () => {
		for (const tag of await getTagsWithCounts()) {
			const expected = COMPILED.filter(p =>
				p.tagSlugs.includes(tag.slug)
			).length
			expect(tag.count).toBe(expected)
			expect((await getPostsByTag(tag.slug)).length).toBe(expected)
		}
	})

	test('getPostsByTag returns only posts with that tag', async () => {
		const posts = await getPostsByTag('website-migration')
		expect(posts.length).toBeGreaterThan(0)
		for (const post of posts) {
			expect(post.tags.some(t => t.slug === 'website-migration')).toBe(true)
		}
		expect(await getPostsByTag('nope')).toEqual([])
	})

	test('author lookup and author posts', async () => {
		const author = await getAuthorBySlug('richard-hudson')
		expect(author).toMatchObject({
			name: 'Richard Hudson',
			bio: 'Founder of Hudson Digital Solutions',
			profile_image: '/images/founder.jpg'
		})
		expect(await getAuthors()).toHaveLength(1)
		expect(await getAuthorBySlug('nope')).toBeNull()
		expect((await getPostsByAuthor('richard-hudson')).length).toBe(
			COMPILED.length
		)
		expect(await getPostsByAuthor('nope')).toEqual([])
	})

	test('getPostIndex is the palette projection only', async () => {
		const index = await getPostIndex(50)
		expect(index).toHaveLength(Math.min(50, COMPILED.length))
		for (const entry of index) {
			expect(Object.keys(entry).sort()).toEqual([
				'excerpt',
				'slug',
				'tagNames',
				'title'
			])
		}
		const first = index[0]
		const firstPost = (await getAllPosts())[0]
		expect(first?.slug).toBe(firstPost?.slug)
		expect(first?.tagNames).toEqual(firstPost?.tags.map(t => t.name))
	})
})
