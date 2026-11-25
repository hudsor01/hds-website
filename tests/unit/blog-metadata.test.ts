/**
 * Blog route metadata: titles fit in 60 characters with the short brand
 * suffix, frontmatter titles are never rewritten, and every tag and author
 * page has a 120 to 160 character meta description.
 */
import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Metadata } from 'next'
import { generateMetadata as postMetadata } from '@/app/(public)/blog/[slug]/page'
import { generateMetadata as authorMetadata } from '@/app/(public)/blog/author/[slug]/page'
import { generateMetadata as tagMetadata } from '@/app/(public)/blog/tag/[slug]/page'
import { getAllPosts, getAuthors, getTags } from '@/lib/blog'
import { BLOG_AUTHOR_META_DESCRIPTIONS, BLOG_TAGS } from '@/lib/constants/blog'
import {
	BRAND_SUFFIX as BLOG_TITLE_SUFFIX,
	brandedTitle
} from '@/lib/seo-config'

const OLD_SUFFIX = ' - Hudson Digital Solutions'
const DASHES = /[–—]/
const COMMA_BEFORE_CONJUNCTION = /, (and|or) /

// Phase 34 rewrote these frontmatter titles; only the suffix may change.
const PHASE_34_SLUGS = [
	'how-ai-automation-can-save-your-business-20-hours-per-week',
	'how-to-leave-thryv-without-losing-rankings',
	'your-website-needs-a-blueprint-how-to-plan-a-project-that-pays-off',
	'texas-tax-title-license-vehicle-costs'
]

function params(slug: string) {
	return { params: Promise.resolve({ slug }) }
}

function titleOf(metadata: Metadata): string {
	if (typeof metadata.title !== 'string') {
		throw new Error('expected a plain string title')
	}
	return metadata.title
}

function expectDescriptionInWindow(description: unknown) {
	expect(typeof description).toBe('string')
	const text = String(description)
	expect(text.length).toBeGreaterThanOrEqual(120)
	expect(text.length).toBeLessThanOrEqual(160)
	expect(text).not.toMatch(DASHES)
	expect(text).not.toMatch(COMMA_BEFORE_CONJUNCTION)
}

describe('blog post titles', () => {
	test('every post title fits, keeps its frontmatter title and drops the old suffix', async () => {
		const posts = await getAllPosts()
		expect(posts.length).toBeGreaterThan(0)
		for (const post of posts) {
			const title = titleOf(await postMetadata(params(post.slug)))
			expect(title.length).toBeLessThanOrEqual(60)
			expect(title).not.toContain(OLD_SUFFIX)
			expect(title.startsWith(post.title)).toBe(true)
			expect([post.title, `${post.title}${BLOG_TITLE_SUFFIX}`]).toContain(title)
		}
	})

	test('Phase 34 rewritten titles keep their page-specific part', async () => {
		const bySlug = new Map((await getAllPosts()).map(p => [p.slug, p]))
		for (const slug of PHASE_34_SLUGS) {
			const post = bySlug.get(slug)
			if (!post) {
				throw new Error(`Phase 34 post ${slug} is not published`)
			}
			expect(titleOf(await postMetadata(params(slug)))).toBe(
				brandedTitle(post.title)
			)
		}
	})
})

describe('tag and author pages', () => {
	test('tag titles carry the short suffix and the tag description', async () => {
		for (const tag of await getTags()) {
			const metadata = await tagMetadata(params(tag.slug))
			const title = titleOf(metadata)
			expect(title).toBe(`${tag.name} Articles${BLOG_TITLE_SUFFIX}`)
			expect(title.length).toBeLessThanOrEqual(60)
			expect(metadata.description).toBe(tag.description)
		}
	})

	test('every tag description is a 120 to 160 character meta description', () => {
		for (const tag of BLOG_TAGS) {
			expectDescriptionInWindow(tag.description)
		}
	})

	test('author titles fit and the description is in the window', async () => {
		for (const author of await getAuthors()) {
			const metadata = await authorMetadata(params(author.slug))
			const title = titleOf(metadata)
			expect(title).toBe(`Articles by ${author.name}${BLOG_TITLE_SUFFIX}`)
			expect(title.length).toBeLessThanOrEqual(60)
			expectDescriptionInWindow(metadata.description)
		}
		for (const description of Object.values(BLOG_AUTHOR_META_DESCRIPTIONS)) {
			expectDescriptionInWindow(description)
		}
	})
})

describe('blog route sources', () => {
	test('no blog route hard-codes the old title suffix', () => {
		const root = join(import.meta.dir, '../../src/app/(public)/blog')
		for (const file of [
			'[slug]/page.tsx',
			'tag/[slug]/page.tsx',
			'author/[slug]/page.tsx',
			'page.tsx'
		]) {
			expect(readFileSync(join(root, file), 'utf8')).not.toContain(OLD_SUFFIX)
		}
	})
})
