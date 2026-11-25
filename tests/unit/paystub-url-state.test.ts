import { describe, expect, it } from 'bun:test'
import {
	applyPaystubUrlState,
	hasPaystubUrlState,
	readPaystubUrlState,
	restoredPaystubStateCode
} from '@/hooks/use-paystub-url-state'
import type { PaystubData } from '@/types/paystub'

const BLANK: PaystubData = {
	employeeName: '',
	employeeId: '',
	employerName: '',
	hourlyRate: 0,
	hoursPerPeriod: 0,
	filingStatus: 'single',
	taxYear: 2026,
	payPeriods: [],
	totals: {
		hours: 0,
		grossPay: 0,
		preTaxDeductions: 0,
		federalTax: 0,
		socialSecurity: 0,
		medicare: 0,
		stateTax: 0,
		stateInsurance: 0,
		otherDeductions: 0,
		netPay: 0
	}
}

describe('readPaystubUrlState', () => {
	it('reads every shared-link param', () => {
		const state = readPaystubUrlState(
			'?name=Jane&id=E1&employer=Acme&rate=25.5&hours=40&status=single&year=2026&state=CA'
		)
		expect(state).toEqual({
			name: 'Jane',
			id: 'E1',
			employer: 'Acme',
			rate: 25.5,
			hours: 40,
			status: 'single',
			year: 2026,
			state: 'CA'
		})
	})

	it('returns all nulls for an empty query string', () => {
		const state = readPaystubUrlState('')
		expect(hasPaystubUrlState(state)).toBe(false)
	})

	it('ignores unrelated params', () => {
		expect(hasPaystubUrlState(readPaystubUrlState('?utm_source=x'))).toBe(false)
	})
})

describe('applyPaystubUrlState', () => {
	it('applies the URL values over the form', () => {
		const next = applyPaystubUrlState(
			BLANK,
			readPaystubUrlState('?name=Jane&rate=30&hours=80')
		)
		expect(next.employeeName).toBe('Jane')
		expect(next.hourlyRate).toBe(30)
		expect(next.hoursPerPeriod).toBe(80)
	})

	it('keeps the form value for params the URL does not carry', () => {
		const prev = { ...BLANK, employerName: 'Saved Co' }
		const next = applyPaystubUrlState(prev, readPaystubUrlState('?name=Jane'))
		expect(next.employerName).toBe('Saved Co')
	})

	it('clamps an unsupported year (?year=2025) to the form default', () => {
		const next = applyPaystubUrlState(BLANK, readPaystubUrlState('?year=2025'))
		expect(next.taxYear).toBe(2026)
	})

	it('maps a legacy return status onto a Form W-4 status', () => {
		const next = applyPaystubUrlState(
			BLANK,
			readPaystubUrlState('?status=qualifyingSurvivingSpouse')
		)
		expect(next.filingStatus).toBe('marriedJoint')
	})

	it('keeps the form status for an unknown status', () => {
		const next = applyPaystubUrlState(
			{ ...BLANK, filingStatus: 'headOfHousehold' },
			readPaystubUrlState('?status=bogus')
		)
		expect(next.filingStatus).toBe('headOfHousehold')
	})
})

describe('restoredPaystubStateCode', () => {
	it('restores a supported code in upper case (?state=ca)', () => {
		expect(restoredPaystubStateCode(readPaystubUrlState('?state=ca'))).toBe(
			'CA'
		)
	})

	it('restores a no-income-tax state (?state=TX)', () => {
		expect(restoredPaystubStateCode(readPaystubUrlState('?state=TX'))).toBe(
			'TX'
		)
	})

	it('drops an unsupported code (?state=AL)', () => {
		expect(
			restoredPaystubStateCode(readPaystubUrlState('?state=AL'))
		).toBeNull()
	})

	it('returns null when the URL has no state', () => {
		expect(restoredPaystubStateCode(readPaystubUrlState(''))).toBeNull()
	})
})
