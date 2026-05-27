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
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import {
	NuqsTestingAdapter,
	type OnUrlUpdateFunction
} from 'nuqs/adapters/testing'
import { SearchInput } from '@/components/admin/SearchInput'

function renderWithNuqs(
	ui: React.ReactElement,
	{
		searchParams,
		onUrlUpdate
	}: { searchParams?: string; onUrlUpdate?: OnUrlUpdateFunction } = {}
) {
	return render(ui, {
		wrapper: ({ children }) => (
			<NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate}>
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

	it('resets ?cursor= when q changes (otherwise search on page 2+ returns 0 results)', async () => {
		// Regression test for PR #228 round-1 BLOCKING #1: if cursor is
		// preserved across q changes, a search on page 2+ filters the
		// AFTER-cursor slice for matches, missing any hits earlier in the
		// dataset. SearchInput must reset cursor to null in parallel with
		// setting q so the new search lands on page 1 of the filtered set.
		// nuqs throttles the q setter by 300ms, so the URL update arrives
		// after a debounce window -- waitFor handles that.
		const urlUpdates: Array<{ searchParams: URLSearchParams }> = []
		const onUrlUpdate: OnUrlUpdateFunction = update => {
			urlUpdates.push({ searchParams: update.searchParams })
		}
		const { container } = renderWithNuqs(<SearchInput />, {
			searchParams: '?cursor=after%3Aabc&q=oldterm',
			onUrlUpdate
		})
		const input = container.querySelector('input[name="q"]') as HTMLInputElement
		act(() => {
			fireEvent.change(input, { target: { value: 'newterm' } })
		})
		await waitFor(
			() => {
				expect(urlUpdates.length).toBeGreaterThan(0)
			},
			{ timeout: 1000 }
		)
		// At least one of the URL updates emitted while typing must clear
		// the cursor param. The final converged URL should have q=newterm
		// and no cursor.
		const cleared = urlUpdates.some(u => u.searchParams.get('cursor') === null)
		expect(cleared).toBe(true)
		const last = urlUpdates.at(-1)
		expect(last?.searchParams.get('q')).toBe('newterm')
		expect(last?.searchParams.get('cursor')).toBeNull()
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
