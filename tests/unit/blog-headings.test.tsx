/**
 * Blog listing pages keep a valid heading outline: one h1 and no level
 * skipped (QA-06), in server HTML order as well as rendered order. The
 * author page (unchanged, already valid) is covered by e2e/blog.spec.ts:
 * its priority next/image preload needs a real URL base.
 */
import { describe, expect, test } from 'bun:test'
import type { ReactNode } from 'react'
import { renderToReadableStream } from 'react-dom/server'
import BlogPage from '@/app/(public)/blog/page'
import TagPage from '@/app/(public)/blog/tag/[slug]/page'
import { getTagsWithCounts } from '@/lib/blog'

async function renderHtml(node: ReactNode): Promise<string> {
	const stream = await renderToReadableStream(node)
	await stream.allReady
	// Drop React's text-node separators so copy reads as one string.
	return (await new Response(stream).text()).replaceAll('<!-- -->', '')
}

function headingLevels(html: string): number[] {
	return [...html.matchAll(/<h([1-6])[\s>]/g)].map(m => Number(m[1]))
}

function expectNoSkips(levels: number[]) {
	expect(levels.filter(level => level === 1)).toHaveLength(1)
	expect(levels[0]).toBe(1)
	const skips = levels.flatMap((level, i) =>
		i > 0 && level > (levels[i - 1] ?? 1) + 1
			? [`h${levels[i - 1]} -> h${level} at heading ${i}`]
			: []
	)
	expect(skips).toEqual([])
}

function params(slug: string) {
	return { params: Promise.resolve({ slug }) }
}

describe('blog heading outline', () => {
	test('/blog', async () => {
		expectNoSkips(headingLevels(await renderHtml(<BlogPage />)))
	})

	test('every tag page with posts has an h2 above its post cards', async () => {
		const tags = (await getTagsWithCounts()).filter(tag => tag.count > 0)
		expect(tags.length).toBeGreaterThan(0)
		for (const tag of tags) {
			const html = await renderHtml(await TagPage(params(tag.slug)))
			expect(html).toContain(`Articles tagged ${tag.name}`)
			expectNoSkips(headingLevels(html))
		}
	})
})
