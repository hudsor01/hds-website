import { describe, expect, test } from 'bun:test'
import { calculateTTL } from '@/lib/ttl-calculator/calculator'
import type { VehicleInputs } from '@/types/ttl-types'

// Expected values come from TxDMV Fee Chart 1C (2026), the Motor Vehicle
// Title Manual (Table 3-1) and the TxDMV registration fee table.
function inputs(overrides: Partial<VehicleInputs> = {}): VehicleInputs {
	return {
		purchasePrice: 30000,
		tradeInValue: 5000,
		vehicleWeight: 4000,
		isElectric: false,
		isNewVehicle: false,
		county: 'Dallas',
		loanTermMonths: 60,
		interestRate: 6,
		downPayment: 0,
		paymentFrequency: 'monthly',
		zipCode: '',
		loanStartDate: '',
		leaseMileage: 0,
		leaseBuyout: 0,
		residualValue: 0,
		moneyFactor: 0,
		...overrides
	}
}

// Base 50.75 + processing 4.75 + TexasSure 1 + inspection replacement 7.50
const STATE_REGISTRATION_USED = 64

describe('calculateTTL', () => {
	test('used car in Dallas County', () => {
		const r = calculateTTL(inputs())
		expect(r.salesTax).toBeCloseTo(1562.5) // 6.25% of price minus trade-in
		expect(r.titleFee).toBe(33)
		expect(r.registrationFees).toBeCloseTo(STATE_REGISTRATION_USED + 11.5)
		expect(r.emissions).toBe(2.75)
		expect(r.evFee).toBe(0)
		expect(r.totalTTL).toBeCloseTo(1562.5 + 33 + 75.5 + 2.75)
	})

	test('local fees follow the 2026 county chart', () => {
		expect(calculateTTL(inputs({ county: 'Tarrant' })).registrationFees).toBe(
			STATE_REGISTRATION_USED + 10
		)
		expect(calculateTTL(inputs({ county: 'Bexar' })).registrationFees).toBe(
			STATE_REGISTRATION_USED + 21.5
		)
	})

	test('attainment counties pay the $28 title fee and no emissions fee', () => {
		const r = calculateTTL(inputs({ county: 'Hidalgo' }))
		expect(r.titleFee).toBe(28)
		expect(r.emissions).toBe(0)
	})

	test('unknown counties fall back to the attainment defaults', () => {
		const r = calculateTTL(inputs({ county: 'Loving' }))
		expect(r.titleFee).toBe(28)
		expect(r.registrationFees).toBe(STATE_REGISTRATION_USED + 10)
	})

	test('new vehicles pay the two-year inspection fee and skip emissions', () => {
		const r = calculateTTL(inputs({ isNewVehicle: true }))
		expect(r.registrationFees).toBeCloseTo(
			STATE_REGISTRATION_USED - 7.5 + 16.75 + 11.5
		)
		expect(r.emissions).toBe(0)
	})

	test('EV fee is $200 a year, $400 for a new two-year registration', () => {
		expect(calculateTTL(inputs({ isElectric: true })).evFee).toBe(200)
		expect(
			calculateTTL(inputs({ isElectric: true, isNewVehicle: true })).evFee
		).toBe(400)
		expect(calculateTTL(inputs({ isElectric: true })).emissions).toBe(0)
	})

	test('weight brackets match the TxDMV chart', () => {
		const base = (vehicleWeight: number): number =>
			calculateTTL(inputs({ vehicleWeight, county: 'Loving' }))
				.registrationFees -
			(STATE_REGISTRATION_USED - 50.75 + 10)
		expect(base(6000)).toBeCloseTo(50.75)
		expect(base(6001)).toBeCloseTo(54)
		expect(base(10001)).toBeCloseTo(110)
		expect(base(18001)).toBeCloseTo(205)
		expect(base(80000)).toBeCloseTo(840)
		expect(() => base(80001)).toThrow(/80001 lbs/)
	})
})
