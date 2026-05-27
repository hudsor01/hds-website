/**
 * Phase 10 SearchInput primitive -- nuqs-driven client component.
 * Verifies the structural contract every Wave 2 list page depends on:
 * role=search wrapper, input[name=q] with type=search, accessible
 * aria-label, configurable placeholder, no em/en-dash glyphs in output.
 *
 * nuqs requires a Suspense + adapter wrapper at render time; tests use
 * the test adapter from `nuqs/adapters/testing`.
 */
import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { SearchInput } from '@/components/admin/SearchInput'

function renderWithNuqs(
	ui: React.ReactElement,
	{ searchParams }: { searchParams?: string } = {}
) {
	return render(ui, {
		wrapper: ({ children }) => (
			<NuqsTestingAdapter searchParams={searchParams}>
				{children}
			</NuqsTestingAdapter>
		)
	})
}

describe('SearchInput', () => {
	it('renders a role=search wrapper around the input', () => {
		const { container } = renderWithNuqs(<SearchInput />)
		const wrapper = container.querySelector('[role="search"]')
		expect(wrapper).not.toBeNull()
	})

	it('renders an input[name=q] with type=search and the standard aria-label', () => {
		const { container } = renderWithNuqs(<SearchInput />)
		const input = container.querySelector('input[name="q"]')
		expect(input).not.toBeNull()
		expect(input?.getAttribute('type')).toBe('search')
		expect(input?.getAttribute('aria-label')).toBe('Search')
	})

	it('seeds the input value from the q query param when present', () => {
		const { container } = renderWithNuqs(<SearchInput />, {
			searchParams: '?q=hello+world'
		})
		const input = container.querySelector(
			'input[name="q"]'
		) as HTMLInputElement | null
		expect(input?.value).toBe('hello world')
	})

	it('seeds the input value to empty string when no q query param is present', () => {
		const { container } = renderWithNuqs(<SearchInput />)
		const input = container.querySelector(
			'input[name="q"]'
		) as HTMLInputElement | null
		expect(input?.value).toBe('')
	})

	it('uses the given placeholder', () => {
		const { container } = renderWithNuqs(
			<SearchInput placeholder="Search leads" />
		)
		const input = container.querySelector('input[name="q"]')
		expect(input?.getAttribute('placeholder')).toBe('Search leads')
	})

	it('falls back to the literal placeholder "Search" when none is provided', () => {
		const { container } = renderWithNuqs(<SearchInput />)
		const input = container.querySelector('input[name="q"]')
		expect(input?.getAttribute('placeholder')).toBe('Search')
	})

	it('does NOT render a submit button (nuqs writes the URL on change)', () => {
		const { container } = renderWithNuqs(<SearchInput />)
		const button = container.querySelector('button[type="submit"]')
		expect(button).toBeNull()
	})

	it('does NOT render any form element (nuqs replaces the GET round-trip)', () => {
		const { container } = renderWithNuqs(<SearchInput />)
		const form = container.querySelector('form')
		expect(form).toBeNull()
	})

	it('contains no em-dash or en-dash characters anywhere', () => {
		const { container } = renderWithNuqs(
			<SearchInput placeholder="Search leads" />,
			{ searchParams: '?q=x' }
		)
		const html = container.innerHTML
		// Use Unicode escapes so the source file itself contains no em/en-dash
		// glyphs (enforces the CLAUDE.md "no em/en-dash anywhere" rule at the
		// source level while still asserting on the literal characters at runtime).
		expect(html.includes('\u2014')).toBe(false) // em-dash (U+2014)
		expect(html.includes('\u2013')).toBe(false) // en-dash (U+2013)
	})
})
