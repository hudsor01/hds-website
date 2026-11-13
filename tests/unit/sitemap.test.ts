import { describe, expect, it } from 'bun:test'
import { TOOLS } from '@/app/(public)/tools/tools-data'
import sitemap from '@/app/sitemap'
import { getAllPosts } from '@/lib/blog'

const SITE_URL = 'https://hudsondigitalsolutions.com'

// No module mocks: the sitemap wraps every DB-backed source
// (showcase/help-articles) in try/catch and falls back to an empty list, so
// without a database it still emits the static + registry-derived URLs we
// assert here. Blog URLs come from the compiled content/blog module.

describe('sitemap', () => {
	it('includes every public tool from the TOOLS registry', async () => {
		const urls = new Set((await sitemap()).map(e => e.url))
		for (const tool of TOOLS) {
			expect(urls.has(`${SITE_URL}${tool.href}`)).toBe(true)
		}
	})

	it('excludes the admin-only testimonial-collector tool', async () => {
		const urls = (await sitemap()).map(e => e.url)
		expect(urls.some(u => u.includes('/tools/testimonial-collector'))).toBe(
			false
		)
	})

	it('includes legal and landing routes that were previously missing', async () => {
		const urls = new Set((await sitemap()).map(e => e.url))
		expect(urls.has(`${SITE_URL}/terms`)).toBe(true)
		expect(urls.has(`${SITE_URL}/website-migration`)).toBe(true)
	})

	it('leaves out help pages that have no published articles', async () => {
		// No database here, so there are no help articles: the hub and every
		// category are empty pages and must not be listed.
		const urls = (await sitemap()).map(e => e.url)
		expect(urls.some(u => u.startsWith(`${SITE_URL}/help`))).toBe(false)
	})

	it('emits exactly one URL per published blog post', async () => {
		const blogUrls = (await sitemap())
			.map(e => e.url)
			.filter(u => /\/blog\/(?!tag\/|author\/)[^/]+$/.test(u))
		const posts = await getAllPosts()
		expect(blogUrls.sort()).toEqual(
			posts.map(p => `${SITE_URL}/blog/${p.slug}`).sort()
		)
	})

	it('never emits a duplicate URL', async () => {
		const urls = (await sitemap()).map(e => e.url)
		expect(urls.length).toBe(new Set(urls).size)
	})
})
