/**
 * CalculatorInput adornments. The prefix used to render before the <input>,
 * so the input's own background painted over it and the "$" on the mortgage
 * tool never showed (the reserved left padding stayed empty). Adornments
 * must follow the input in the DOM so they paint above it.
 */

import { describe, expect, test } from 'bun:test'
import { render } from '@testing-library/react'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'

describe('CalculatorInput adornments', () => {
	test('the prefix renders after the input so it is not painted over', () => {
		const { container } = render(
			<CalculatorInput id="price" label="Home Price" prefix="$" />
		)
		const input = container.querySelector('input')
		const prefix = Array.from(container.querySelectorAll('span')).find(
			span => span.textContent === '$'
		)
		expect(input).not.toBeNull()
		expect(prefix).toBeDefined()
		if (!input || !prefix) {
			return
		}
		expect(
			input.compareDocumentPosition(prefix) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy()
		expect(input.className).toContain('pl-7')
	})

	test('the suffix still renders after the input', () => {
		const { container } = render(
			<CalculatorInput id="rate" label="Interest Rate" suffix="%" />
		)
		const input = container.querySelector('input')
		const suffix = Array.from(container.querySelectorAll('span')).find(
			span => span.textContent === '%'
		)
		if (!input || !suffix) {
			throw new Error('input or suffix missing')
		}
		expect(
			input.compareDocumentPosition(suffix) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy()
	})
})
