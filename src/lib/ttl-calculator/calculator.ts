import { z } from 'zod'
import type {
	CalculationResults,
	PaymentResults,
	TTLResults,
	VehicleInputs
} from '@/types/ttl-types'
import { calculateLeaseComparison } from './lease'
import { calculateTCO } from './tco'

// Per-county fees. Sources (re-check each January):
// - titleFee: TxDMV Motor Vehicle Title Manual, Table 3-1. $33 in
//   nonattainment counties, $28 everywhere else.
// - localFees: TxDMV Fee Chart 1C, effective Jan 1 - Dec 31, 2026. Collected
//   with registration, not with the title.
// - emissionsFee: the state's $2.75 Emissions Inspection Fee, collected at
//   registration in emissions counties. Bexar joined the list Nov 1, 2026.
type CountyFees = Record<
	string,
	{ titleFee: number; localFees: number; emissionsFee: number }
>

const EMISSIONS_FEE = 2.75

export const COUNTY_FEES: CountyFees = {
	Travis: { titleFee: 33, localFees: 11.5, emissionsFee: EMISSIONS_FEE },
	Harris: { titleFee: 33, localFees: 11.5, emissionsFee: EMISSIONS_FEE },
	Dallas: { titleFee: 33, localFees: 11.5, emissionsFee: EMISSIONS_FEE },
	Bexar: { titleFee: 33, localFees: 21.5, emissionsFee: EMISSIONS_FEE },
	Tarrant: { titleFee: 33, localFees: 10, emissionsFee: EMISSIONS_FEE },
	Collin: { titleFee: 33, localFees: 11.5, emissionsFee: EMISSIONS_FEE },
	Denton: { titleFee: 33, localFees: 11.5, emissionsFee: EMISSIONS_FEE },
	'El Paso': { titleFee: 33, localFees: 20, emissionsFee: EMISSIONS_FEE },
	'Fort Bend': { titleFee: 33, localFees: 11.5, emissionsFee: EMISSIONS_FEE },
	Montgomery: { titleFee: 33, localFees: 10, emissionsFee: EMISSIONS_FEE },
	Williamson: { titleFee: 33, localFees: 11.5, emissionsFee: EMISSIONS_FEE },
	Hidalgo: { titleFee: 28, localFees: 20, emissionsFee: 0 },
	Cameron: { titleFee: 28, localFees: 21.5, emissionsFee: 0 },
	Guadalupe: { titleFee: 33, localFees: 11.5, emissionsFee: 0 },
	McLennan: { titleFee: 28, localFees: 11.5, emissionsFee: 0 },
	Brazoria: { titleFee: 33, localFees: 10, emissionsFee: EMISSIONS_FEE },
	Nueces: { titleFee: 33, localFees: 10, emissionsFee: 0 },
	Midland: { titleFee: 28, localFees: 10, emissionsFee: 0 },
	Bastrop: { titleFee: 33, localFees: 11.5, emissionsFee: 0 },
	// Any other county: attainment title fee and the most common local fee.
	Default: { titleFee: 28, localFees: 10, emissionsFee: 0 }
}

// Texas state fees (TxDMV "Register Your Vehicle" and Fee Chart 1C, 2026)
//
// New vehicles: a passenger car or light truck sold in Texas, never
// registered, of the current or preceding model year must get a 24-month
// registration (Transportation Code 502.044(a-1), SB 1729, Sept 1, 2025)
// "on payment of all fees for each year of registration" (43 TAC
// 217.27(c)(2)(B)). So the base fee, TexasSure fee and county fees are
// charged twice; processing and handling is per transaction (43 TAC
// 217.183) and the $16.75 inspection replacement fee is one-time (Transp.
// Code 548.510(b)). TxDMV's webDEALER fee page for a new vehicle (Dealer
// User Guide, July 2026, Figure 53) shows exactly this.
export const TEXAS_SALES_TAX_RATE = 0.0625
const BASE_REGISTRATION_FEE = 50.75 // 6,000 lbs or less, per registration year
const PROCESSING_FEE = 4.75 // per transaction
const INSURANCE_VERIFICATION_FEE = 1.0 // TexasSure, per registration year
const INSPECTION_FEE = 7.5 // Inspection Program Replacement Fee, yearly
const NEW_VEHICLE_INSPECTION_FEE = 16.75 // One-time, covers the 24 months
const NEW_VEHICLE_REGISTRATION_YEARS = 2
// Every dealer sale pays the $10 buyer plate fee (HB 718, July 1, 2025;
// TxDMV Motor Vehicle Dealer Manual 2026)
export const BUYER_PLATE_FEE = 10
const EV_FEE_ANNUAL = 200
const EV_FEE_NEW_TWO_YEAR = 400

// Weight-based registration above 6,000 lbs: [max weight, fee]
const WEIGHT_FEES: ReadonlyArray<readonly [number, number]> = [
	[10000, 54],
	[18000, 110],
	[25999, 205],
	[40000, 340],
	[54999, 535],
	[70000, 740],
	[80000, 840]
]

function baseRegistrationFee(weight: number): number {
	if (weight <= 6000) {
		return BASE_REGISTRATION_FEE
	}
	const bracket = WEIGHT_FEES.find(([maxWeight]) => weight <= maxWeight)
	if (!bracket) {
		throw new Error(`No Texas registration fee bracket for ${weight} lbs`)
	}
	return bracket[1]
}

/**
 * Registration line: base fee by weight, the county's local fees and the
 * TexasSure fee for each registration year, plus processing and the
 * inspection replacement fee once.
 */
function calculateRegistrationFee(
	isNewVehicle: boolean,
	vehicleWeight: number,
	localFees: number
): number {
	const weight = vehicleWeight || 4000 // Default to average car weight if not provided
	const years = isNewVehicle ? NEW_VEHICLE_REGISTRATION_YEARS : 1
	const inspectionFee = isNewVehicle
		? NEW_VEHICLE_INSPECTION_FEE
		: INSPECTION_FEE

	return (
		(baseRegistrationFee(weight) + localFees + INSURANCE_VERIFICATION_FEE) *
			years +
		PROCESSING_FEE +
		inspectionFee
	)
}

export const MAX_INTEREST_RATE = 30

const PRICE_ERROR = 'Enter a price of $0 or more.'
const TRADE_IN_ERROR = 'Enter a trade-in of $0 or more.'
const DOWN_PAYMENT_ERROR = 'Enter a down payment of $0 or more.'
const REBATE_ERROR = 'Enter a rebate of $0 or more.'
const RATE_ERROR = `Enter a rate from 0% to ${MAX_INTEREST_RATE}%.`

/**
 * The money and rate inputs the math trusts. A negative price, trade-in,
 * down payment or rebate (or a negative rate) produces a plausible-looking
 * but wrong result, so it is rejected here instead of clamped away.
 * Shared with the save action so stored calculations obey the same rules.
 */
export const ttlAmountsSchema = z.object({
	purchasePrice: z.number({ error: PRICE_ERROR }).nonnegative(PRICE_ERROR),
	tradeInValue: z.number({ error: TRADE_IN_ERROR }).nonnegative(TRADE_IN_ERROR),
	downPayment: z
		.number({ error: DOWN_PAYMENT_ERROR })
		.nonnegative(DOWN_PAYMENT_ERROR),
	rebateAmount: z
		.number({ error: REBATE_ERROR })
		.nonnegative(REBATE_ERROR)
		.optional(),
	interestRate: z
		.number({ error: RATE_ERROR })
		.min(0, RATE_ERROR)
		.max(MAX_INTEREST_RATE, RATE_ERROR)
})

export type TtlAmountField = keyof z.infer<typeof ttlAmountsSchema>
export type TtlFieldErrors = Partial<Record<TtlAmountField, string>>

function isAmountField(key: PropertyKey | undefined): key is TtlAmountField {
	return typeof key === 'string' && key in ttlAmountsSchema.shape
}

/** The first problem with each money or rate input; empty when all are valid. */
export function validateVehicleInputs(
	input: Pick<VehicleInputs, TtlAmountField>
): TtlFieldErrors {
	const parsed = ttlAmountsSchema.safeParse({
		purchasePrice: input.purchasePrice,
		tradeInValue: input.tradeInValue,
		downPayment: input.downPayment,
		rebateAmount: input.rebateAmount,
		interestRate: input.interestRate
	})
	if (parsed.success) {
		return {}
	}
	const errors: TtlFieldErrors = {}
	for (const issue of parsed.error.issues) {
		const field = issue.path[0]
		if (isAmountField(field) && errors[field] === undefined) {
			errors[field] = issue.message
		}
	}
	return errors
}

/**
 * Calculate Texas Title & License fees.
 * Pure: deterministic given the same inputs.
 */
export function calculateTTL(input: VehicleInputs): TTLResults {
	const countyData = COUNTY_FEES[input.county] || COUNTY_FEES.Default
	if (!countyData) {
		throw new Error(
			`County data not found and default fallback failed for county: ${input.county}`
		)
	}

	// Taxable value: sales price less trade-in and dealer discounts
	// (Comptroller Motor Vehicle Tax Guide). A manufacturer rebate the dealer
	// passes to the buyer counts as a cash discount (Comptroller letter ruling
	// 202503002P), so it comes off too. Inputs are validated first
	// (validateVehicleInputs); the clamp only guards the math.
	const taxableAmount = Math.max(
		0,
		input.purchasePrice - input.tradeInValue - (input.rebateAmount ?? 0)
	)

	// Sales tax
	const salesTax = taxableAmount * TEXAS_SALES_TAX_RATE

	// Title application fee
	const titleFee = countyData.titleFee

	// Registration fees
	const registrationFees = calculateRegistrationFee(
		input.isNewVehicle,
		input.vehicleWeight,
		countyData.localFees
	)

	// EV fee: new EVs get two years of registration and pay both years up front
	const evFee = input.isElectric
		? input.isNewVehicle
			? EV_FEE_NEW_TWO_YEAR
			: EV_FEE_ANNUAL
		: 0

	// Emissions inspection fee: vehicles under two years old and electric
	// vehicles are exempt from the emissions test (TCEQ), so no fee is due
	const emissions =
		input.isNewVehicle || input.isElectric ? 0 : countyData.emissionsFee

	const plateFee = BUYER_PLATE_FEE

	const totalTTL =
		salesTax + titleFee + registrationFees + plateFee + evFee + emissions

	return {
		salesTax,
		titleFee,
		registrationFees,
		plateFee,
		evFee,
		emissions,
		totalTTL
	}
}

/**
 * Loan payment. The buyer owes the price less rebate and trade-in, plus TTL
 * (rolled into the loan, as dealers usually do); the down payment comes off
 * that total. Standard amortization; a zero rate divides evenly.
 */
export function calculatePayment(
	input: Pick<
		VehicleInputs,
		| 'purchasePrice'
		| 'tradeInValue'
		| 'rebateAmount'
		| 'downPayment'
		| 'interestRate'
		| 'loanTermMonths'
	>,
	ttlAmount: number
): PaymentResults {
	const amountDue =
		input.purchasePrice -
		(input.rebateAmount ?? 0) -
		input.tradeInValue +
		ttlAmount
	const loanAmount = Math.max(0, amountDue - input.downPayment)
	const termMonths = input.loanTermMonths

	if (loanAmount <= 0 || termMonths <= 0) {
		return {
			loanAmount: 0,
			monthlyPayment: 0,
			biweeklyPayment: 0,
			totalInterest: 0,
			totalFinanced: 0
		}
	}

	if (input.interestRate === 0) {
		return {
			loanAmount,
			monthlyPayment: loanAmount / termMonths,
			biweeklyPayment: loanAmount / termMonths / 2,
			totalInterest: 0,
			totalFinanced: loanAmount
		}
	}

	const monthlyRate = input.interestRate / 100 / 12
	const growth = (1 + monthlyRate) ** termMonths
	const monthlyPayment = (loanAmount * monthlyRate * growth) / (growth - 1)
	const totalFinanced = monthlyPayment * termMonths

	return {
		loanAmount,
		monthlyPayment,
		biweeklyPayment: monthlyPayment / 2,
		totalInterest: totalFinanced - loanAmount,
		totalFinanced
	}
}

/** Every result the calculator shows, from one set of inputs */
export function calculateResults(input: VehicleInputs): CalculationResults {
	const ttlResults = calculateTTL(input)
	return {
		ttlResults,
		paymentResults: calculatePayment(input, ttlResults.totalTTL),
		tcoResults: calculateTCO(input),
		leaseComparisonResults: calculateLeaseComparison(input)
	}
}
