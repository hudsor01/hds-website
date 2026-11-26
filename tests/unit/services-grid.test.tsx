import { describe, expect, test } from 'bun:test'
import { render, screen, within } from '@testing-library/react'
import { ServicesGrid } from '@/components/ui/ServicesGrid'
import { SERVICES } from '@/lib/constants/services'

// The /services cards use a stretched link: the title <Link> is the card's
// only interactive, and its ::after overlay covers the whole card, so a
// click anywhere on the card opens the service page.
function cardFor(anchorId: string): HTMLElement {
	const wrapper = document.getElementById(anchorId)
	const card = wrapper?.firstElementChild
	if (!(card instanceof HTMLElement)) {
		throw new Error(`No card inside the #${anchorId} anchor`)
	}
	return card
}

describe('ServicesGrid cards', () => {
	test('renders one card per service', () => {
		render(<ServicesGrid />)
		expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(
			SERVICES.length
		)
	})

	for (const service of SERVICES) {
		test(`${service.title} card is one stretched link to /services/${service.slug}`, () => {
			render(<ServicesGrid />)
			const wrapper = document.getElementById(service.anchorId)
			// The in-page anchor still clears the sticky navbar
			expect(wrapper).toHaveClass('scroll-mt-24')

			const card = cardFor(service.anchorId)
			expect(card.querySelectorAll('a, button')).toHaveLength(1)
			const link = within(card).getByRole('link')
			expect(link).toHaveAttribute('href', `/services/${service.slug}`)

			expect(card).toHaveClass('relative')
			// Fills the grid row so sibling cards share one height
			expect(card).toHaveClass('h-full')
			expect(link).toHaveClass('after:absolute', 'after:inset-0')
			// The link itself must not be the containing block, or the
			// overlay would only cover the title text.
			expect(link).not.toHaveClass('relative')
		})

		test(`${service.title} link name is the card title`, () => {
			render(<ServicesGrid />)
			const card = cardFor(service.anchorId)
			const heading = within(card).getByRole('heading', { level: 3 })
			const link = within(card).getByRole('link')

			expect(heading).toContainElement(link)
			expect(link).toHaveAccessibleName(service.title)
		})
	}
})
