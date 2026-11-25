import { describe, expect, test } from 'bun:test'
import {
	calculatePayment,
	calculateResults,
	calculateTTL,
	validateVehicleInputs
} from '@/lib/ttl-calculator/calculator'
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
		expect(r.plateFee).toBe(10)
		expect(r.totalTTL).toBeCloseTo(1562.5 + 33 + 75.5 + 10 + 2.75)
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

	test('new vehicles: 24 months of registration, one-time fees once', () => {
		// Transp. Code 502.044(a-1); 43 TAC 217.27(c)(2)(B); TxDMV webDEALER
		// new-vehicle fee page: base 101.50, TexasSure 2.00, Dallas local
		// 11.50 x 2, inspection replacement 16.75 once, processing 4.75 once
		const r = calculateTTL(inputs({ isNewVehicle: true, tradeInValue: 0 }))
		expect(r.registrationFees).toBeCloseTo(101.5 + 2 + 23 + 16.75 + 4.75, 2)
		expect(r.registrationFees).toBeCloseTo(148, 2)
		expect(r.emissions).toBe(0)
		// $30,000 new car in Dallas: 1,875 tax + 33 title + 148 + 10 plate
		expect(r.totalTTL).toBeCloseTo(2066, 2)
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

describe('rebates and trade-ins (Comptroller Motor Vehicle Tax Guide)', () => {
	test('a dealer-applied rebate comes off the taxable value', () => {
		// (30,000 - 5,000 trade - 1,000 rebate) x 6.25%
		expect(calculateTTL(inputs({ rebateAmount: 1000 })).salesTax).toBe(1500)
	})

	test('taxable value never goes below zero', () => {
		expect(calculateTTL(inputs({ tradeInValue: 40000 })).salesTax).toBe(0)
	})
})

describe('calculatePayment', () => {
	test('finances price less trade-in plus TTL', () => {
		// Dallas used: 1,562.50 tax + 33 title + 75.50 registration + 10 plate
		// + 2.75 emissions
		const r = calculateResults(inputs())
		expect(r.ttlResults?.totalTTL).toBeCloseTo(1683.75, 2)
		expect(r.paymentResults?.loanAmount).toBeCloseTo(26683.75, 2)
		expect(r.paymentResults?.monthlyPayment).toBeCloseTo(515.87, 2)
	})

	test('a rebate lowers both the tax and the loan', () => {
		const r = calculateResults(inputs({ rebateAmount: 1000 }))
		expect(r.paymentResults?.loanAmount).toBeCloseTo(25621.25, 2)
		expect(r.paymentResults?.monthlyPayment).toBeCloseTo(495.33, 2)
	})

	test('the down payment comes off the total, never below zero', () => {
		const ttl = 1683.75
		expect(
			calculatePayment(inputs({ downPayment: 5000 }), ttl).loanAmount
		).toBeCloseTo(21683.75, 2)
		const cash = calculatePayment(inputs({ downPayment: 30000 }), ttl)
		expect(cash.loanAmount).toBe(0)
		expect(cash.monthlyPayment).toBe(0)
	})

	test('0% financing divides evenly over the term', () => {
		const r = calculatePayment(
			inputs({ interestRate: 0, loanTermMonths: 48, tradeInValue: 0 }),
			0
		)
		expect(r.monthlyPayment).toBe(625)
		expect(r.totalInterest).toBe(0)
	})

	test('the loan term changes the payment', () => {
		const short = calculatePayment(inputs({ loanTermMonths: 36 }), 0)
		const long = calculatePayment(inputs({ loanTermMonths: 72 }), 0)
		expect(short.monthlyPayment).toBeGreaterThan(long.monthlyPayment)
		expect(short.totalInterest).toBeLessThan(long.totalInterest)
	})
})

describe('validateVehicleInputs', () => {
	test('accepts the defaults', () => {
		expect(validateVehicleInputs(inputs())).toEqual({})
	})

	test('accepts zero for every money input and the rate', () => {
		expect(
			validateVehicleInputs(
				inputs({
					purchasePrice: 0,
					tradeInValue: 0,
					downPayment: 0,
					rebateAmount: 0,
					interestRate: 0
				})
			)
		).toEqual({})
	})

	test('accepts a missing rebate and the 30% rate ceiling', () => {
		expect(
			validateVehicleInputs(
				inputs({ rebateAmount: undefined, interestRate: 30 })
			)
		).toEqual({})
	})

	test('rejects a negative purchase price (the -5000 report case)', () => {
		expect(validateVehicleInputs(inputs({ purchasePrice: -5000 }))).toEqual({
			purchasePrice: 'Enter a price of $0 or more.'
		})
	})

	test('rejects a negative trade-in, down payment and rebate', () => {
		expect(
			validateVehicleInputs(
				inputs({ tradeInValue: -1, downPayment: -1, rebateAmount: -1 })
			)
		).toEqual({
			tradeInValue: 'Enter a trade-in of $0 or more.',
			downPayment: 'Enter a down payment of $0 or more.',
			rebateAmount: 'Enter a rebate of $0 or more.'
		})
	})

	test('rejects a rate below 0% or above 30%', () => {
		const message = 'Enter a rate from 0% to 30%.'
		expect(validateVehicleInputs(inputs({ interestRate: -0.1 }))).toEqual({
			interestRate: message
		})
		expect(validateVehicleInputs(inputs({ interestRate: 31 }))).toEqual({
			interestRate: message
		})
	})

	test('rejects NaN from a cleared or malformed field', () => {
		expect(
			validateVehicleInputs(inputs({ interestRate: Number.NaN }))
		).toHaveProperty('interestRate')
	})
})
