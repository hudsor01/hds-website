/**
 * Mortgage math: payment, mortgage insurance, cash to close and a full
 * amortization schedule with extra payments. Pure functions, no I/O.
 *
 * Program rules (re-check each January):
 * - FHA: HUD Mortgagee Letter 2023-05 (effective for case numbers endorsed
 *   on or after March 20, 2023). Upfront MIP is 1.75% of the base loan.
 *   Annual MIP depends on term, base loan amount and LTV, and lasts 11 years
 *   when LTV is 90% or less, otherwise the full term. Annual MIP is charged
 *   on the average scheduled balance of each 12-month period, so it steps
 *   down every year.
 * - VA: va.gov "VA funding fee and loan closing costs" (fee table effective
 *   April 7, 2023). Only the funding fee may be financed on a purchase.
 * - Conventional PMI: CFPB, Homeowners Protection Act. PMI ends
 *   automatically when the balance reaches 78% of the original value, and
 *   no later than the month after the loan's midpoint.
 */

export type LoanProgram = 'conventional' | 'fha' | 'va'

export interface MortgageInputs {
	homePrice: number
	downPayment: number
	program: LoanProgram
	/** Annual rate in percent, e.g. 6.5 */
	interestRate: number
	termYears: number
	propertyTaxAnnual: number
	insuranceAnnual: number
	hoaMonthly: number
	/** Conventional PMI, annual percent of the loan */
	pmiRate: number
	vaFirstUse: boolean
	vaExempt: boolean
	/** Roll the FHA upfront MIP or VA funding fee into the loan */
	financeUpfrontFee: boolean
	/** Lender and title costs, excluding points and the upfront fee */
	closingCosts: number
	/** 1 point = 1% of the loan amount */
	discountPoints: number
	/** Seller or lender credits toward closing costs */
	credits: number
	extraMonthly: number
	/** Paid once a year, with the 12th payment of each loan year */
	extraYearly: number
	startYear: number
	/** 1 to 12 */
	startMonth: number
}

export interface ScheduleYear {
	year: number
	principal: number
	interest: number
	mortgageInsurance: number
	extra: number
	endingBalance: number
}

export interface MortgageResults {
	baseLoan: number
	loanAmount: number
	ltv: number
	upfrontFee: number
	upfrontFeeLabel: string
	monthlyPrincipalInterest: number
	monthlyPropertyTax: number
	monthlyInsurance: number
	monthlyHoa: number
	/** Mortgage insurance in the first month */
	monthlyMortgageInsurance: number
	mortgageInsuranceLabel: string
	totalMonthlyPayment: number
	/** Payment number in which mortgage insurance is last charged; null if never or never ends before payoff */
	mortgageInsuranceEndsAfterPayment: number | null
	pointsCost: number
	cashToClose: number
	payoffMonths: number
	payoffYear: number
	payoffMonth: number
	totalInterest: number
	totalMortgageInsurance: number
	totalOfLoanPayments: number
	/** P&I, insurance, taxes, HOA and extras until payoff, at today's tax and insurance */
	totalCost: number
	interestSaved: number
	monthsSaved: number
	schedule: ScheduleYear[]
}

export class MortgageInputError extends Error {}

const FHA_UPFRONT_RATE = 0.0175
const FHA_HIGH_BALANCE = 726_200
const FHA_SHORT_DURATION_MONTHS = 132 // 11 years

/** FHA annual MIP rate (decimal) per ML 2023-05. */
export function fhaAnnualMipRate(
	baseLoan: number,
	ltv: number,
	termYears: number
): number {
	const high = baseLoan > FHA_HIGH_BALANCE
	if (termYears > 15) {
		if (ltv > 0.95) {
			return high ? 0.0075 : 0.0055
		}
		return high ? 0.007 : 0.005
	}
	if (!high) {
		return ltv > 0.9 ? 0.004 : 0.0015
	}
	if (ltv > 0.9) {
		return 0.0065
	}
	return ltv > 0.78 ? 0.004 : 0.0015
}

/**
 * Months FHA annual MIP is charged. Every row of the ML 2023-05 table with
 * LTV at or below 90% lasts 11 years; above 90% it lasts the full term.
 */
export function fhaMipDurationMonths(ltv: number, termYears: number): number {
	const termMonths = termYears * 12
	return ltv <= 0.9
		? Math.min(FHA_SHORT_DURATION_MONTHS, termMonths)
		: termMonths
}

/** VA funding fee rate (decimal) for a purchase loan. */
export function vaFundingFeeRate(
	downPaymentRatio: number,
	firstUse: boolean
): number {
	if (downPaymentRatio >= 0.1) {
		return 0.0125
	}
	if (downPaymentRatio >= 0.05) {
		return 0.015
	}
	return firstUse ? 0.0215 : 0.033
}

/** Level monthly principal and interest payment. */
export function monthlyPayment(
	principal: number,
	annualRatePercent: number,
	months: number
): number {
	if (principal <= 0) {
		return 0
	}
	const r = annualRatePercent / 100 / 12
	if (r === 0) {
		return principal / months
	}
	const growth = (1 + r) ** months
	return (principal * r * growth) / (growth - 1)
}

/** Scheduled balance after k payments with no extra principal. */
function scheduledBalance(
	principal: number,
	r: number,
	payment: number,
	k: number
): number {
	if (r === 0) {
		return Math.max(0, principal - payment * k)
	}
	const growth = (1 + r) ** k
	return Math.max(0, principal * growth - payment * ((growth - 1) / r))
}

function round2(n: number): number {
	return Math.round(n * 100) / 100
}

function validate(i: MortgageInputs): void {
	const nonNegative: Array<[string, number]> = [
		['Home price', i.homePrice],
		['Down payment', i.downPayment],
		['Interest rate', i.interestRate],
		['Property tax', i.propertyTaxAnnual],
		['Home insurance', i.insuranceAnnual],
		['HOA dues', i.hoaMonthly],
		['PMI rate', i.pmiRate],
		['Closing costs', i.closingCosts],
		['Discount points', i.discountPoints],
		['Credits', i.credits],
		['Extra monthly payment', i.extraMonthly],
		['Extra yearly payment', i.extraYearly]
	]
	for (const [label, value] of nonNegative) {
		if (!Number.isFinite(value) || value < 0) {
			throw new MortgageInputError(`${label} must be zero or more.`)
		}
	}
	if (i.homePrice <= 0) {
		throw new MortgageInputError('Enter a home price above zero.')
	}
	if (i.downPayment >= i.homePrice) {
		throw new MortgageInputError(
			'The down payment covers the whole price, so there is no loan to calculate.'
		)
	}
	if (i.interestRate > 30) {
		throw new MortgageInputError('Enter an interest rate of 30% or less.')
	}
	if (![10, 15, 20, 25, 30].includes(i.termYears)) {
		throw new MortgageInputError('Choose a 10, 15, 20, 25 or 30 year term.')
	}
	if (i.startMonth < 1 || i.startMonth > 12 || !Number.isInteger(i.startYear)) {
		throw new MortgageInputError('Enter a valid first payment month.')
	}
}

interface UpfrontFee {
	amount: number
	label: string
}

function upfrontFee(i: MortgageInputs, baseLoan: number): UpfrontFee {
	if (i.program === 'fha') {
		return { amount: baseLoan * FHA_UPFRONT_RATE, label: 'FHA upfront MIP' }
	}
	if (i.program === 'va' && !i.vaExempt) {
		const rate = vaFundingFeeRate(i.downPayment / i.homePrice, i.vaFirstUse)
		return { amount: baseLoan * rate, label: 'VA funding fee' }
	}
	return { amount: 0, label: '' }
}

interface InsurancePlan {
	label: string
	/** Monthly charge for payment number m (1-based) given the balance before it */
	charge: (m: number, balanceBefore: number) => number
}

function insurancePlan(
	i: MortgageInputs,
	baseLoan: number,
	loanAmount: number,
	ltv: number,
	r: number,
	payment: number
): InsurancePlan {
	const termMonths = i.termYears * 12
	if (i.program === 'conventional') {
		if (ltv <= 0.8 || i.pmiRate === 0) {
			return { label: '', charge: () => 0 }
		}
		const monthly = (loanAmount * i.pmiRate) / 100 / 12
		const stopBalance = i.homePrice * 0.78
		const midpoint = termMonths / 2
		return {
			label: 'PMI',
			charge: (m, balanceBefore) =>
				balanceBefore > stopBalance && m <= midpoint ? monthly : 0
		}
	}
	if (i.program === 'fha') {
		const rate = fhaAnnualMipRate(baseLoan, ltv, i.termYears)
		const duration = fhaMipDurationMonths(ltv, i.termYears)
		const byYear = new Map<number, number>()
		const yearCharge = (loanYear: number): number => {
			const cached = byYear.get(loanYear)
			if (cached !== undefined) {
				return cached
			}
			let sum = 0
			for (let k = 0; k < 12; k++) {
				sum += scheduledBalance(loanAmount, r, payment, loanYear * 12 + k)
			}
			const monthly = (rate * (sum / 12)) / 12
			byYear.set(loanYear, monthly)
			return monthly
		}
		return {
			label: 'FHA annual MIP',
			charge: (m, balanceBefore) =>
				m <= duration && balanceBefore > 0
					? yearCharge(Math.floor((m - 1) / 12))
					: 0
		}
	}
	return { label: '', charge: () => 0 }
}

interface Amortization {
	months: number
	totalInterest: number
	totalInsurance: number
	totalExtra: number
	lastInsuredPayment: number | null
	schedule: ScheduleYear[]
}

function amortize(
	loanAmount: number,
	r: number,
	payment: number,
	termMonths: number,
	plan: InsurancePlan,
	extraMonthly: number,
	extraYearly: number
): Amortization {
	let balance = loanAmount
	let totalInterest = 0
	let totalInsurance = 0
	let totalExtra = 0
	let lastInsuredPayment: number | null = null
	const schedule: ScheduleYear[] = []
	let m = 0
	while (balance > 0.005 && m < termMonths) {
		m++
		const yearIndex = Math.floor((m - 1) / 12)
		if (!schedule[yearIndex]) {
			schedule[yearIndex] = {
				year: yearIndex + 1,
				principal: 0,
				interest: 0,
				mortgageInsurance: 0,
				extra: 0,
				endingBalance: 0
			}
		}
		const row = schedule[yearIndex] as ScheduleYear
		const insurance = plan.charge(m, balance)
		if (insurance > 0) {
			lastInsuredPayment = m
		}
		const interest = balance * r
		const scheduledPrincipal = Math.min(payment - interest, balance)
		balance -= scheduledPrincipal
		const wantedExtra = extraMonthly + (m % 12 === 0 ? extraYearly : 0)
		const extra = Math.min(wantedExtra, balance)
		balance -= extra
		totalInterest += interest
		totalInsurance += insurance
		totalExtra += extra
		row.principal += scheduledPrincipal + extra
		row.interest += interest
		row.mortgageInsurance += insurance
		row.extra += extra
		row.endingBalance = Math.max(0, balance)
	}
	return {
		months: m,
		totalInterest,
		totalInsurance,
		totalExtra,
		lastInsuredPayment,
		schedule: schedule.map(y => ({
			year: y.year,
			principal: round2(y.principal),
			interest: round2(y.interest),
			mortgageInsurance: round2(y.mortgageInsurance),
			extra: round2(y.extra),
			endingBalance: round2(y.endingBalance)
		}))
	}
}

export function calculateMortgage(i: MortgageInputs): MortgageResults {
	validate(i)
	const baseLoan = i.homePrice - i.downPayment
	const ltv = baseLoan / i.homePrice
	const fee = upfrontFee(i, baseLoan)
	const financedFee = i.financeUpfrontFee ? fee.amount : 0
	const loanAmount = baseLoan + financedFee
	const termMonths = i.termYears * 12
	const r = i.interestRate / 100 / 12
	const payment = monthlyPayment(loanAmount, i.interestRate, termMonths)
	const plan = insurancePlan(i, baseLoan, loanAmount, ltv, r, payment)

	const actual = amortize(
		loanAmount,
		r,
		payment,
		termMonths,
		plan,
		i.extraMonthly,
		i.extraYearly
	)
	const baseline =
		i.extraMonthly > 0 || i.extraYearly > 0
			? amortize(loanAmount, r, payment, termMonths, plan, 0, 0)
			: actual

	const monthlyPropertyTax = i.propertyTaxAnnual / 12
	const monthlyInsurance = i.insuranceAnnual / 12
	const monthlyMortgageInsurance = plan.charge(1, loanAmount)
	const totalMonthlyPayment =
		payment +
		monthlyPropertyTax +
		monthlyInsurance +
		monthlyMortgageInsurance +
		i.hoaMonthly

	const pointsCost = (loanAmount * i.discountPoints) / 100
	const unfinancedFee = fee.amount - financedFee
	const cashToClose =
		i.downPayment +
		Math.max(0, i.closingCosts + pointsCost + unfinancedFee - i.credits)

	const payoffIndex = i.startMonth - 1 + actual.months - 1
	const payoffYear = i.startYear + Math.floor(payoffIndex / 12)
	const payoffMonth = (payoffIndex % 12) + 1

	const principalAndInterestPaid = loanAmount + actual.totalInterest
	const housingCosts =
		(monthlyPropertyTax + monthlyInsurance + i.hoaMonthly) * actual.months

	const insuranceEnds =
		actual.lastInsuredPayment !== null &&
		actual.lastInsuredPayment < actual.months
			? actual.lastInsuredPayment
			: null

	return {
		baseLoan: round2(baseLoan),
		loanAmount: round2(loanAmount),
		ltv,
		upfrontFee: round2(fee.amount),
		upfrontFeeLabel: fee.label,
		monthlyPrincipalInterest: round2(payment),
		monthlyPropertyTax: round2(monthlyPropertyTax),
		monthlyInsurance: round2(monthlyInsurance),
		monthlyHoa: round2(i.hoaMonthly),
		monthlyMortgageInsurance: round2(monthlyMortgageInsurance),
		mortgageInsuranceLabel: plan.label,
		totalMonthlyPayment: round2(totalMonthlyPayment),
		mortgageInsuranceEndsAfterPayment: insuranceEnds,
		pointsCost: round2(pointsCost),
		cashToClose: round2(cashToClose),
		payoffMonths: actual.months,
		payoffYear,
		payoffMonth,
		totalInterest: round2(actual.totalInterest),
		totalMortgageInsurance: round2(actual.totalInsurance),
		totalOfLoanPayments: round2(principalAndInterestPaid),
		totalCost: round2(
			principalAndInterestPaid + actual.totalInsurance + housingCosts
		),
		interestSaved: round2(baseline.totalInterest - actual.totalInterest),
		monthsSaved: baseline.months - actual.months,
		schedule: actual.schedule
	}
}
