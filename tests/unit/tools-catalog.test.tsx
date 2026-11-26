import { describe, expect, test } from 'bun:test'
import { render, screen, within } from '@testing-library/react'
import ToolsCatalog from '@/app/(public)/tools/ToolsCatalog'
import { TOOLS } from '@/app/(public)/tools/tools-data'

// The tools index uses a stretched link: one CTA <Link> per card whose
// ::after overlay covers the whole card, so a click anywhere on the card
// follows it without nesting interactives or wrapping block content in <a>.
function cardFor(title: string): HTMLElement {
	const heading = screen.getByRole('heading', { level: 3, name: title })
	const card = heading.parentElement
	if (!card) {
		throw new Error(`No card wraps the "${title}" heading`)
	}
	return card
}

describe('ToolsCatalog cards', () => {
	test('renders one card per tool', () => {
		render(<ToolsCatalog />)
		expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(
			TOOLS.length
		)
	})

	for (const tool of TOOLS) {
		test(`${tool.title} card is one stretched link to ${tool.href}`, () => {
			render(<ToolsCatalog />)
			const card = cardFor(tool.title)

			expect(card.querySelectorAll('a, button')).toHaveLength(1)
			const link = within(card).getByRole('link')
			expect(link).toHaveAttribute('href', tool.href)

			expect(card).toHaveClass('relative')
			expect(link).toHaveClass('after:absolute', 'after:inset-0')
			// The link itself must not be the containing block, or the
			// overlay would only cover the CTA text.
			expect(link).not.toHaveClass('relative')
		})

		test(`${tool.title} link name keeps the visible CTA and adds the title`, () => {
			render(<ToolsCatalog />)
			const link = within(cardFor(tool.title)).getByRole('link')
			const name = link.textContent ?? ''

			expect(name.startsWith(tool.cta)).toBe(true)
			expect(name).toContain(tool.title)
			expect(link).toHaveAccessibleName(
				new RegExp(`^${escapeRegExp(tool.cta)}.*${escapeRegExp(tool.title)}`)
			)
		})
	}
})

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
