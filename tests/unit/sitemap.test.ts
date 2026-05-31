import { describe, expect, it } from 'bun:test'
import { TOOLS } from '@/app/(public)/tools/tools-data'
import sitemap from '@/app/sitemap'

const SITE_URL = 'https://hudsondigitalsolutions.com'

// No module mocks: the sitemap wraps every DB-backed source
// (showcase/blog/help-articles/tags/authors) in try/catch and falls back
// to an empty list, so without a database it still emits the static +
// registry-derived URLs we assert here. Avoiding mock.module also keeps
// this file from globally replacing @/lib/blog for other test files.

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
		expect(urls.has(`${SITE_URL}/help`)).toBe(true)
	})

	it('emits help category URLs derived from the help-articles registry', async () => {
		const urls = new Set((await sitemap()).map(e => e.url))
		expect(urls.has(`${SITE_URL}/help/getting-started`)).toBe(true)
	})

	it('never emits a duplicate URL', async () => {
		const urls = (await sitemap()).map(e => e.url)
		expect(urls.length).toBe(new Set(urls).size)
	})
})
