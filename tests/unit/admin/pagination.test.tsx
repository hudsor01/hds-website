/**
 * Phase 10 Pagination primitive -- server-rendered Prev/Next nav row.
 * Verifies: nav landmark + aria-label, link hrefs contain the cursor and
 * preserved params, disabled state collapses to non-link text, labels are
 * the literal "Previous" / "Next" strings (no em-dash, no arrow glyphs).
 *
 * Plan listed the file as `.test.ts` but the assertions use JSX, which
 * Bun's loader only parses inside `.tsx`. Deviation: filename only;
 * contents match the plan exactly.
 */
import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import { Pagination } from '@/components/admin/Pagination'

describe('Pagination', () => {
	it('renders a nav landmark with aria-label="Pagination"', () => {
		const { container } = render(
			<Pagination baseHref="/admin/leads" prevCursor={null} nextCursor={null} />
		)
		const nav = container.querySelector('nav')
		expect(nav?.getAttribute('aria-label')).toBe('Pagination')
	})

	it('renders both Previous and Next as plain disabled spans when both cursors are null', () => {
		const { container } = render(
			<Pagination baseHref="/admin/leads" prevCursor={null} nextCursor={null} />
		)
		const links = container.querySelectorAll('a')
		expect(links.length).toBe(0)
		const disabledSpans = container.querySelectorAll(
			'span[aria-disabled="true"]'
		)
		expect(disabledSpans.length).toBe(2)
		const text = container.textContent ?? ''
		expect(text.includes('Previous')).toBe(true)
		expect(text.includes('Next')).toBe(true)
	})

	it('renders Previous as a Link with rel=prev and the cursor in the href when prevCursor is non-null', () => {
		const { container } = render(
			<Pagination
				baseHref="/admin/leads"
				prevCursor="before:abc"
				nextCursor={null}
			/>
		)
		const link = container.querySelector(
			'a[rel="prev"]'
		) as HTMLAnchorElement | null
		expect(link).not.toBeNull()
		expect(link?.getAttribute('href')).toBe('/admin/leads?cursor=before%3Aabc')
		expect(link?.textContent).toBe('Previous')
	})

	it('renders Next as a Link with rel=next and the cursor in the href when nextCursor is non-null', () => {
		const { container } = render(
			<Pagination
				baseHref="/admin/leads"
				prevCursor={null}
				nextCursor="after:xyz"
			/>
		)
		const link = container.querySelector(
			'a[rel="next"]'
		) as HTMLAnchorElement | null
		expect(link).not.toBeNull()
		expect(link?.getAttribute('href')).toBe('/admin/leads?cursor=after%3Axyz')
		expect(link?.textContent).toBe('Next')
	})

	it('includes every preservedParams entry as a query string param', () => {
		const { container } = render(
			<Pagination
				baseHref="/admin/leads"
				prevCursor={null}
				nextCursor="after:xyz"
				preservedParams={{ status: 'new', q: 'hello world' }}
			/>
		)
		const link = container.querySelector(
			'a[rel="next"]'
		) as HTMLAnchorElement | null
		const href = link?.getAttribute('href') ?? ''
		expect(href.startsWith('/admin/leads?')).toBe(true)
		expect(href.includes('cursor=after%3Axyz')).toBe(true)
		expect(href.includes('status=new')).toBe(true)
		expect(
			href.includes('q=hello+world') || href.includes('q=hello%20world')
		).toBe(true)
	})

	it('omits preservedParams entries whose value is the empty string', () => {
		const { container } = render(
			<Pagination
				baseHref="/admin/leads"
				prevCursor={null}
				nextCursor="after:xyz"
				preservedParams={{ status: '', q: 'hello' }}
			/>
		)
		const link = container.querySelector(
			'a[rel="next"]'
		) as HTMLAnchorElement | null
		const href = link?.getAttribute('href') ?? ''
		expect(href.includes('status=')).toBe(false)
		expect(href.includes('q=hello')).toBe(true)
	})

	it('contains no em-dash, en-dash, or arrow glyphs', () => {
		const { container } = render(
			<Pagination
				baseHref="/admin/leads"
				prevCursor="before:a"
				nextCursor="after:b"
				preservedParams={{ status: 'new' }}
			/>
		)
		const html = container.innerHTML
		// Use Unicode escapes so the source file itself contains no forbidden
		// glyphs (CLAUDE.md "no em/en-dash or arrow glyphs anywhere" rule)
		// while still asserting on the literal characters at runtime.
		expect(html.includes('\u2014')).toBe(false) // em-dash (U+2014)
		expect(html.includes('\u2013')).toBe(false) // en-dash (U+2013)
		expect(html.includes('\u2192')).toBe(false) // right arrow (U+2192)
		expect(html.includes('\u2190')).toBe(false) // left arrow (U+2190)
	})
})
