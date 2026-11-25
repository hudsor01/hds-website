/**
 * Blog listing pagination (QA-03): /blog is page 1, /blog/page/N the rest,
 * every post reachable through plain links, out-of-range pages not listed.
 */
import { describe, expect, test } from 'bun:test'
import type { ReactNode } from 'react'
import { renderToReadableStream } from 'react-dom/server'
import {
	generateMetadata,
	generateStaticParams,
	unstable_paramMatching
} from '@/app/(public)/blog/page/[page]/page'
import { BlogPagination, blogPageHref } from '@/components/blog/BlogPagination'
import {
	BLOG_PAGE_SIZE,
	getAllPosts,
	getBlogPageCount,
	getPosts
} from '@/lib/blog'

async function renderHtml(node: ReactNode): Promise<string> {
	const stream = await renderToReadableStream(node)
	await stream.allReady
	return new Response(stream).text()
}

function hrefs(html: string): string[] {
	return [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1] ?? '')
}

describe('getPosts paging', () => {
	test('pages are disjoint and together list every post in order', async () => {
		const all = await getAllPosts()
		const totalPages = await getBlogPageCount()
		expect(totalPages).toBe(Math.max(1, Math.ceil(all.length / BLOG_PAGE_SIZE)))

		const seen: string[] = []
		for (let page = 1; page <= totalPages; page++) {
			const result = await getPosts({ page })
			expect(result.total).toBe(all.length)
			expect(result.totalPages).toBe(totalPages)
			expect(result.posts.length).toBeGreaterThan(0)
			expect(result.posts.length).toBeLessThanOrEqual(BLOG_PAGE_SIZE)
			seen.push(...result.posts.map(p => p.slug))
		}
		expect(seen).toEqual(all.map(p => p.slug))
		expect((await getPosts({ page: totalPages + 1 })).posts).toEqual([])
	})
})

describe('/blog/page/[page] route', () => {
	test('prerenders 1..N and 404s anything else', async () => {
		const totalPages = await getBlogPageCount()
		const params = await generateStaticParams()
		expect(params.length).toBeGreaterThan(0)
		expect(params).toEqual(
			Array.from({ length: totalPages }, (_, i) => ({ page: String(i + 1) }))
		)
		expect(unstable_paramMatching).toEqual({ page: 'not-found' })
	})

	test('page 2 metadata is self-canonical with a fitting title and description', async () => {
		const totalPages = await getBlogPageCount()
		if (totalPages < 2) {
			return
		}
		const metadata = await generateMetadata({
			params: Promise.resolve({ page: '2' })
		})
		expect(metadata.alternates?.canonical).toBe(
			'https://hudsondigitalsolutions.com/blog/page/2'
		)
		const title = String(metadata.title)
		expect(title).toBe(
			'Small Business Web Design Blog, Page 2 | Hudson Digital'
		)
		expect(title.length).toBeLessThanOrEqual(60)
		const description = String(metadata.description)
		expect(description.length).toBeGreaterThanOrEqual(120)
		expect(description.length).toBeLessThanOrEqual(160)
		expect(description).not.toMatch(/[–—]/)
		expect(description).not.toMatch(/, (and|or) /)
	})

	test('a value that is not a listed page gets not-found metadata', async () => {
		for (const page of ['0', '02', 'abc', '9999']) {
			const metadata = await generateMetadata({
				params: Promise.resolve({ page })
			})
			expect(metadata.alternates).toBeUndefined()
		}
	})
})

describe('BlogPagination', () => {
	test('renders nothing when every post fits on one page', async () => {
		expect(
			await renderHtml(<BlogPagination currentPage={1} totalPages={1} />)
		).toBe('')
	})

	test('links page 1 to /blog and later pages to /blog/page/N', async () => {
		expect(blogPageHref(1)).toBe('/blog')
		expect(blogPageHref(3)).toBe('/blog/page/3')

		const first = await renderHtml(
			<BlogPagination currentPage={1} totalPages={3} />
		)
		expect(hrefs(first)).toEqual([
			'/blog',
			'/blog/page/2',
			'/blog/page/3',
			'/blog/page/2'
		])
		expect(first).not.toContain('Go to previous page')
		expect(first).toMatch(/aria-current="page"[^>]*>1</)

		const last = await renderHtml(
			<BlogPagination currentPage={3} totalPages={3} />
		)
		expect(hrefs(last)).toEqual([
			'/blog/page/2',
			'/blog',
			'/blog/page/2',
			'/blog/page/3'
		])
		expect(last).not.toContain('Go to next page')
		expect(last).toMatch(/aria-current="page"[^>]*>3</)
	})
})
