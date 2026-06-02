import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import {
	calculatePaystubTotals,
	type PaystubCalculationParams
} from '@/lib/paystub-calculator/calculate-paystub-totals'
import { validatePaystubInputs } from '@/lib/paystub-calculator/validation'

/**
 * Paystub Validation Tests
 *
 * Tests the validation logic that protects against invalid inputs.
 * Uses real calculator implementation to mirror production behavior.
 */
describe('calculatePaystubTotals validation', () => {
	let validBase: PaystubCalculationParams | null = null

	beforeEach(() => {
		validBase = {
			hourlyRate: 25,
			hoursPerPeriod: 80,
			filingStatus: 'single' as const,
			taxYear: 2025,
			state: 'TX',
			payFrequency: 'biweekly' as const
		}
	})

	afterEach(() => {
		validBase = null
	})

	it('throws on invalid hourly rate', () => {
		// Test mirrors production: negative hourly rate should fail validation
		if (!validBase) {
			return
		}
		const invalidParams = { ...validBase, hourlyRate: -5 }
		const validation = validatePaystubInputs(invalidParams)

		expect(validation.isValid).toBe(false)
		expect(validation.errors.hourlyRate).toBeDefined()
		expect(validation.errors.hourlyRate).toContain('must be greater than $0')

		// The calculator should throw when validation fails
		expect(() => calculatePaystubTotals(invalidParams)).toThrow(
			/Invalid paystub inputs/
		)
	})

	it('throws on invalid pay frequency', () => {
		// Test mirrors production: invalid pay frequency should fail validation
		if (!validBase) {
			return
		}
		const invalidParams = {
			...validBase,
			payFrequency:
				'quarterly' as unknown as PaystubCalculationParams['payFrequency']
		}
		const validation = validatePaystubInputs(invalidParams)

		expect(validation.isValid).toBe(false)
		expect(validation.errors.payFrequency).toBeDefined()
		expect(validation.errors.payFrequency).toContain('Invalid pay frequency')

		// The calculator should throw when validation fails
		expect(() => calculatePaystubTotals(invalidParams)).toThrow(
			/Invalid paystub inputs/
		)
	})

	it('rejects a tax year with no backing data', () => {
		// PAYSTUB-03: a year not in getSupportedTaxYears() (e.g. a stale shared URL
		// carrying 2024) must fail validation instead of silently falling back.
		if (!validBase) {
			return
		}
		const invalidParams = { ...validBase, taxYear: 2024 }
		const validation = validatePaystubInputs(invalidParams)

		expect(validation.isValid).toBe(false)
		expect(validation.errors.taxYear).toBeDefined()
	})

	it('accepts the supported tax year 2025', () => {
		// PAYSTUB-03: the only backed year passes the membership check.
		if (!validBase) {
			return
		}
		expect(validatePaystubInputs(validBase).isValid).toBe(true)
	})
})
