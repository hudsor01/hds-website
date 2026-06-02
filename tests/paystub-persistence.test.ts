import { describe, expect, it } from 'bun:test'
import {
	isSupportedStateCode,
	isSupportedTaxYear,
	SUPPORTED_STATE_CODES
} from '@/lib/paystub-calculator/supported-inputs'

/**
 * Stale-restore regression tests (PR #332 review, HIGH).
 *
 * Both restore paths (URL via nuqs, localStorage via loadFormData) clamp a
 * restored taxYear/state to the supported set before applying it to form state.
 * Mocking the React hooks + localStorage is heavy, so per the plan we unit-test
 * the shared predicates and the exact clamp expressions the hooks use. This proves
 * a returning user whose localStorage carries `taxYear: 2024` and an unsupported
 * state has the year clamped to 2025 and the unsupported state dropped.
 */
describe('supported-inputs predicates', () => {
	describe('isSupportedTaxYear', () => {
		it('accepts 2025 (the only backed year)', () => {
			expect(isSupportedTaxYear(2025)).toBe(true)
		})

		it('rejects a stale 2024 (no backing data)', () => {
			expect(isSupportedTaxYear(2024)).toBe(false)
		})

		it('rejects 2023', () => {
			expect(isSupportedTaxYear(2023)).toBe(false)
		})
	})

	describe('isSupportedStateCode', () => {
		it('accepts a supported income-tax state (CA)', () => {
			expect(isSupportedStateCode('CA')).toBe(true)
		})

		it('accepts a supported no-income-tax state (TX)', () => {
			expect(isSupportedStateCode('TX')).toBe(true)
		})

		it('is case-insensitive (lowercase ca)', () => {
			expect(isSupportedStateCode('ca')).toBe(true)
		})

		it('rejects an unsupported state code (AL)', () => {
			expect(isSupportedStateCode('AL')).toBe(false)
		})

		it('SUPPORTED_STATE_CODES contains the income-tax + no-income-tax union', () => {
			// CA/NY/IL/PA/MA (income tax) + the no-income-tax codes are all present.
			for (const code of ['CA', 'NY', 'IL', 'PA', 'MA', 'TX', 'FL', 'WA']) {
				expect(SUPPORTED_STATE_CODES.has(code)).toBe(true)
			}
			expect(SUPPORTED_STATE_CODES.has('AL')).toBe(false)
		})
	})
})

describe('stale-restore clamp (returning user with taxYear:2024 + unsupported state)', () => {
	// Mirror of the seed a returning user would have in localStorage.
	const savedData = { taxYear: 2024, state: 'AL' }
	const prevTaxYear = 2025 // form default

	it('clamps a stale taxYear:2024 to the supported default (2025)', () => {
		// Exact clamp expression from use-paystub-persistence / use-paystub-generator.
		const restoredYear =
			savedData.taxYear != null && isSupportedTaxYear(savedData.taxYear)
				? savedData.taxYear
				: prevTaxYear
		expect(restoredYear).toBe(2025)
	})

	it('drops the unsupported state (AL) so it never reaches the calc', () => {
		const shouldRestoreState = !!(
			savedData.state && isSupportedStateCode(savedData.state)
		)
		expect(shouldRestoreState).toBe(false)
	})

	it('restores a valid persisted year/state unchanged', () => {
		const valid = { taxYear: 2025, state: 'ca' }
		const restoredYear =
			valid.taxYear != null && isSupportedTaxYear(valid.taxYear)
				? valid.taxYear
				: prevTaxYear
		const restoredState =
			valid.state && isSupportedStateCode(valid.state)
				? valid.state.toUpperCase()
				: null
		expect(restoredYear).toBe(2025)
		expect(restoredState).toBe('CA')
	})
})
