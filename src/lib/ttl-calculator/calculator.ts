import type {
	PaymentResults,
	TTLResults,
	VehicleInputs
} from '@/types/ttl-types'

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
export const TEXAS_SALES_TAX_RATE = 0.0625
const BASE_REGISTRATION_FEE = 50.75 // 6,000 lbs or less
const PROCESSING_FEE = 4.75
const INSURANCE_VERIFICATION_FEE = 1.0 // TexasSure
const INSPECTION_FEE = 7.5 // Inspection Program Replacement Fee
const NEW_VEHICLE_INSPECTION_FEE = 16.75 // Two-year initial inspection
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
 * fees TxDMV collects with every registration.
 */
function calculateRegistrationFee(
	isNewVehicle: boolean,
	vehicleWeight: number,
	localFees: number
): number {
	const weight = vehicleWeight || 4000 // Default to average car weight if not provided
	const inspectionFee = isNewVehicle
		? NEW_VEHICLE_INSPECTION_FEE
		: INSPECTION_FEE

	return (
		baseRegistrationFee(weight) +
		localFees +
		PROCESSING_FEE +
		INSURANCE_VERIFICATION_FEE +
		inspectionFee
	)
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

	// Calculate taxable amount (purchase price minus trade-in)
	const taxableAmount = Math.max(0, input.purchasePrice - input.tradeInValue)

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

	// Total TTL
	const totalTTL = salesTax + titleFee + registrationFees + evFee + emissions

	return {
		salesTax,
		titleFee,
		registrationFees,
		evFee,
		emissions,
		totalTTL
	}
}

/**
 * Calculate monthly payment using standard amortization formula.
 * Pure. Has two early-return guards: zero loan/term -> all zeros;
 * zero interest -> simple division (avoids divide-by-zero in the
 * amortization expression).
 */
export function calculatePayment(
	purchasePrice: number,
	downPayment: number,
	ttlAmount: number,
	interestRate: number,
	termMonths: number
): PaymentResults {
	// Total amount to finance
	const loanAmount = purchasePrice - downPayment + ttlAmount

	if (loanAmount <= 0 || termMonths <= 0) {
		return {
			loanAmount: 0,
			monthlyPayment: 0,
			biweeklyPayment: 0,
			totalInterest: 0,
			totalFinanced: 0
		}
	}

	// If interest rate is 0, simple division
	if (interestRate === 0) {
		return {
			loanAmount: loanAmount,
			monthlyPayment: loanAmount / termMonths,
			biweeklyPayment: loanAmount / termMonths / 2,
			totalInterest: 0,
			totalFinanced: loanAmount
		}
	}

	// Monthly interest rate
	const monthlyRate = interestRate / 100 / 12

	// Monthly payment formula: P * [r(1+r)^n] / [(1+r)^n - 1]
	const monthlyPayment =
		(loanAmount * (monthlyRate * (1 + monthlyRate) ** termMonths)) /
		((1 + monthlyRate) ** termMonths - 1)

	const totalFinanced = monthlyPayment * termMonths
	const totalInterest = totalFinanced - loanAmount

	return {
		loanAmount,
		monthlyPayment,
		biweeklyPayment: monthlyPayment / 2,
		totalInterest,
		totalFinanced
	}
}
