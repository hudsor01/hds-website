/**
 * Phase 10 SearchInput primitive -- server-rendered GET form with
 * preserved-param hidden inputs. Verifies the structural contract every
 * Wave 2 list page depends on (form method, action, input name, hidden
 * inputs for status preservation, submit label, no em/en-dash).
 *
 * Plan listed the file as `.test.ts` but the assertions use JSX, which
 * Bun's loader only parses inside `.tsx`. Deviation: filename only;
 * contents match the plan exactly.
 */
import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import { SearchInput } from '@/components/admin/SearchInput'

describe('SearchInput', () => {
	it('renders a GET form pointing at baseHref', () => {
		const { container } = render(<SearchInput baseHref="/admin/leads" />)
		const form = container.querySelector('form')
		expect(form).not.toBeNull()
		expect(form?.getAttribute('method')).toBe('get')
		expect(form?.getAttribute('action')).toBe('/admin/leads')
		expect(form?.getAttribute('role')).toBe('search')
	})

	it('renders an input[name=q] with type=search and the given defaultValue', () => {
		const { container } = render(
			<SearchInput baseHref="/admin/leads" q="hello world" />
		)
		const input = container.querySelector('input[name="q"]')
		expect(input).not.toBeNull()
		expect(input?.getAttribute('type')).toBe('search')
		expect((input as HTMLInputElement).defaultValue).toBe('hello world')
		expect(input?.getAttribute('aria-label')).toBe('Search')
	})

	it('uses the given placeholder', () => {
		const { container } = render(
			<SearchInput baseHref="/admin/leads" placeholder="Search leads" />
		)
		const input = container.querySelector('input[name="q"]')
		expect(input?.getAttribute('placeholder')).toBe('Search leads')
	})

	it('falls back to the literal placeholder "Search" when none provided', () => {
		const { container } = render(<SearchInput baseHref="/admin/leads" />)
		const input = container.querySelector('input[name="q"]')
		expect(input?.getAttribute('placeholder')).toBe('Search')
	})

	it('emits one hidden input per preservedParams entry', () => {
		const { container } = render(
			<SearchInput
				baseHref="/admin/leads"
				preservedParams={{ status: 'new', source: 'web' }}
			/>
		)
		const statusHidden = container.querySelector(
			'input[type="hidden"][name="status"]'
		) as HTMLInputElement | null
		const sourceHidden = container.querySelector(
			'input[type="hidden"][name="source"]'
		) as HTMLInputElement | null
		expect(statusHidden?.value).toBe('new')
		expect(sourceHidden?.value).toBe('web')
	})

	it('omits hidden inputs whose preservedParams value is the empty string', () => {
		const { container } = render(
			<SearchInput
				baseHref="/admin/leads"
				preservedParams={{ status: '', source: 'web' }}
			/>
		)
		const statusHidden = container.querySelector(
			'input[type="hidden"][name="status"]'
		)
		const sourceHidden = container.querySelector(
			'input[type="hidden"][name="source"]'
		)
		expect(statusHidden).toBeNull()
		expect(sourceHidden).not.toBeNull()
	})

	it('renders a submit button with the literal label "Search"', () => {
		const { container } = render(<SearchInput baseHref="/admin/leads" />)
		const button = container.querySelector('button[type="submit"]')
		expect(button?.textContent).toBe('Search')
	})

	it('contains no em-dash or en-dash characters anywhere', () => {
		const { container } = render(
			<SearchInput
				baseHref="/admin/leads"
				q="x"
				placeholder="Search leads"
				preservedParams={{ status: 'new' }}
			/>
		)
		const html = container.innerHTML
		// Use Unicode escapes so the source file itself contains no em/en-dash glyphs
		// (enforces the CLAUDE.md "no em/en-dash anywhere" rule at the source level
		// while still asserting on the literal characters at runtime).
		expect(html.includes('\u2014')).toBe(false) // em-dash (U+2014)
		expect(html.includes('\u2013')).toBe(false) // en-dash (U+2013)
	})
})
