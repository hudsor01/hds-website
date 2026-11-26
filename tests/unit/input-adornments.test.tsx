/**
 * Input adornments ("$", search icons) are absolutely positioned inside a
 * relative wrapper. Drawn before the <input>, they were painted over by the
 * input's opaque background and never showed. They must follow the input
 * in the DOM. CurrencyInput used to add its own "$" on top of the Input
 * currency variant's, which would have shown two signs once visible.
 */

import { describe, expect, test } from 'bun:test'
import { render } from '@testing-library/react'
import { CurrencyInput } from '@/components/forms/CurrencyInput'
import { Input } from '@/components/ui/input'

function dollarSpans(container: HTMLElement): HTMLSpanElement[] {
	return Array.from(container.querySelectorAll('span')).filter(
		span => span.textContent?.trim() === '$'
	)
}

describe('Input currency variant', () => {
	test('draws one "$" after the input, hidden from assistive tech', () => {
		const { container } = render(
			<Input variant="currency" aria-label="Amount" />
		)
		const input = container.querySelector('input')
		const signs = dollarSpans(container)
		if (!input) {
			throw new Error('input missing')
		}
		expect(signs).toHaveLength(1)
		const [sign] = signs
		expect(
			sign &&
				input.compareDocumentPosition(sign) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy()
		expect(sign?.getAttribute('aria-hidden')).toBe('true')
		expect(sign?.className).toContain('pointer-events-none')
	})

	test('the default variant draws no "$"', () => {
		const { container } = render(<Input aria-label="Name" />)
		expect(dollarSpans(container)).toHaveLength(0)
	})
})

describe('CurrencyInput', () => {
	test('renders exactly one "$"', () => {
		const { container } = render(
			<CurrencyInput id="price" label="Price" value={0} onChange={() => {}} />
		)
		expect(dollarSpans(container)).toHaveLength(1)
	})
})
