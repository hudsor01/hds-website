/**
 * The navbar search button shows only "Search" (no Cmd/Ctrl K badges).
 * Its accessible name comes from that visible text (WCAG 2.5.3 label in
 * name), and the shortcut stays discoverable through aria-keyshortcuts.
 */

import { describe, expect, mock, test } from 'bun:test'
import { fireEvent, render, within } from '@testing-library/react'
import CommandPaletteTrigger from '@/components/cmdk/CommandPaletteTrigger'

describe('CommandPaletteTrigger', () => {
	test('is a button named "Search" with no keyboard badges', () => {
		const { container } = render(<CommandPaletteTrigger />)
		const button = within(container).getByRole('button', { name: 'Search' })
		expect(button.textContent?.trim()).toBe('Search')
		expect(container.querySelector('kbd')).toBeNull()
		expect(button.getAttribute('aria-label')).toBeNull()
		expect(button.getAttribute('aria-keyshortcuts')).toBe('Meta+K Control+K')
	})

	test('opens the palette on click', () => {
		const listener = mock(() => {})
		window.addEventListener('palette:open', listener)
		try {
			const { container } = render(<CommandPaletteTrigger />)
			fireEvent.click(within(container).getByRole('button', { name: 'Search' }))
			expect(listener).toHaveBeenCalledTimes(1)
		} finally {
			window.removeEventListener('palette:open', listener)
		}
	})
})
