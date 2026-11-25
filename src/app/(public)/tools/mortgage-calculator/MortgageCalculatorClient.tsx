/**
 * Mortgage Calculator Client Component
 * Full monthly payment by loan type (conventional, FHA, VA), cash to close,
 * extra payments and a yearly amortization schedule. Inputs live in the URL
 * so a calculation can be shared. Math lives in src/lib/mortgage-calculator.
 *
 * Reading the URL with nuqs suspends prerendering, so only that part sits
 * behind Suspense: the fallback renders the same page (heading,
 * description and form) with default values, which keeps the H1 and form
 * in the server HTML.
 */

'use client'

import {
	type Nullable,
	parseAsBoolean,
	parseAsFloat,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryStates,
	type Values
} from 'nuqs'
import { type ReactNode, Suspense, useState } from 'react'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import { CalculatorResults } from '@/components/calculators/CalculatorResults'
import type { ToolAction } from '@/components/layout/ToolPageLayout'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { trackEvent } from '@/lib/analytics'
import {
	calculateMortgage,
	type LoanProgram,
	MortgageInputError,
	type MortgageInputs,
	type MortgageResults
} from '@/lib/mortgage-calculator/calculate'
import { formatCurrency } from '@/lib/utils'

const PROGRAMS = ['conventional', 'fha', 'va', 'usda'] as const
const TERMS = [30, 25, 20, 15, 10] as const

const PROGRAM_LABELS: Record<LoanProgram, string> = {
	conventional: 'Conventional',
	fha: 'FHA',
	va: 'VA',
	usda: 'USDA'
}

const MONTH_NAMES = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
]

const DEFAULTS = {
	price: 350000,
	downPercent: 20,
	rate: 6.5,
	term: 30,
	taxRate: 1.8,
	insurance: 2400,
	pmiRate: 0.5,
	closingCosts: 8500
}

// URL keys are part of shared links, so they must not change. Down payment
// is stored as a percent (dpp) or, once typed in dollars, as dollars (dp);
// dp wins when present, matching older shared links. Property tax is a
// yearly dollar amount (tax) or a rate (taxr).
const MORTGAGE_PARSERS = {
	price: parseAsFloat.withDefault(DEFAULTS.price),
	dp: parseAsFloat,
	dpp: parseAsFloat.withDefault(DEFAULTS.downPercent),
	type: parseAsStringLiteral(PROGRAMS).withDefault('conventional'),
	rate: parseAsFloat.withDefault(DEFAULTS.rate),
	term: parseAsInteger.withDefault(DEFAULTS.term),
	start: parseAsString,
	tax: parseAsFloat,
	taxr: parseAsFloat.withDefault(DEFAULTS.taxRate),
	ins: parseAsFloat.withDefault(DEFAULTS.insurance),
	hoa: parseAsFloat.withDefault(0),
	pmir: parseAsFloat.withDefault(DEFAULTS.pmiRate),
	vafirst: parseAsBoolean.withDefault(true),
	vaexempt: parseAsBoolean.withDefault(false),
	finfee: parseAsBoolean.withDefault(true),
	cc: parseAsFloat.withDefault(DEFAULTS.closingCosts),
	pts: parseAsFloat.withDefault(0),
	credits: parseAsFloat.withDefault(0),
	xm: parseAsFloat.withDefault(0),
	xy: parseAsFloat.withDefault(0)
}

type MortgageParams = Values<typeof MORTGAGE_PARSERS>

interface MortgageCalculatorViewProps {
	params: MortgageParams
	setParams: (values: Partial<Nullable<MortgageParams>> | null) => void
	interactive: boolean
}

/** Matches the MORTGAGE_PARSERS defaults, for the server-rendered shell. */
const DEFAULT_PARAMS: MortgageParams = {
	price: DEFAULTS.price,
	dp: null,
	dpp: DEFAULTS.downPercent,
	type: 'conventional',
	rate: DEFAULTS.rate,
	term: DEFAULTS.term,
	start: null,
	tax: null,
	taxr: DEFAULTS.taxRate,
	ins: DEFAULTS.insurance,
	hoa: 0,
	pmir: DEFAULTS.pmiRate,
	vafirst: true,
	vaexempt: false,
	finfee: true,
	cc: DEFAULTS.closingCosts,
	pts: 0,
	credits: 0,
	xm: 0,
	xy: 0
}

const noop = () => undefined

/** "YYYY-MM" for the month after today, the usual first payment month. */
function nextMonth(): string {
	const d = new Date()
	const y = d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear()
	const m = ((d.getMonth() + 1) % 12) + 1
	return `${y}-${String(m).padStart(2, '0')}`
}

function parseMonth(value: string): { year: number; month: number } {
	const [y, m] = value.split('-').map(Number)
	return { year: y ?? new Date().getFullYear(), month: m ?? 1 }
}

function percent(n: number): string {
	return `${(n * 100).toFixed(1)}%`
}

function toNumber(value: string): number {
	const n = Number.parseFloat(value)
	return Number.isFinite(n) ? n : 0
}

interface SectionProps {
	title: string
	children: ReactNode
}

function Section({ title, children }: SectionProps) {
	return (
		<fieldset className="space-y-content border-t border-border pt-6 first:border-t-0 first:pt-0">
			<legend className="text-eyebrow text-muted-foreground">{title}</legend>
			{children}
		</fieldset>
	)
}

interface ModeToggleProps {
	label: string
	options: readonly [string, string]
	active: 0 | 1
	onChange: (index: 0 | 1) => void
}

function ModeToggle({ label, options, active, onChange }: ModeToggleProps) {
	return (
		<div className="flex items-center gap-tight">
			{options.map((option, index) => (
				<button
					key={option}
					type="button"
					aria-pressed={active === index}
					aria-label={`${label} in ${option === '%' ? 'percent' : 'dollars'}`}
					onClick={() => onChange(index as 0 | 1)}
					className={`px-2 py-1 text-xs rounded ${
						active === index
							? 'bg-accent text-accent-foreground'
							: 'bg-muted text-muted-foreground'
					}`}
				>
					{option}
				</button>
			))}
		</div>
	)
}

function MortgageCalculatorView({
	params,
	setParams,
	interactive
}: MortgageCalculatorViewProps) {
	const {
		price: homePrice,
		dp: downDollars,
		dpp: downPercent,
		type: program,
		rate: interestRate,
		term: termYears,
		start: startMonth,
		tax: taxAmount,
		taxr: taxRate,
		ins: insurance,
		hoa,
		pmir: pmiRate,
		vafirst: vaFirstUse,
		vaexempt: vaExempt,
		finfee: financeFee,
		cc: closingCosts,
		pts: points,
		credits,
		xm: extraMonthly,
		xy: extraYearly
	} = params

	const [results, setResults] = useState<MortgageResults | null>(null)
	const [error, setError] = useState('')
	const [downInDollars, setDownInDollars] = useState(downDollars !== null)
	const [showSchedule, setShowSchedule] = useState(false)

	const downPayment = downDollars ?? Math.round((homePrice * downPercent) / 100)
	const downRatio = homePrice > 0 ? downPayment / homePrice : 0
	const taxAnnual = taxAmount ?? (homePrice * taxRate) / 100
	const taxInDollars = taxAmount !== null
	const showPmi = program === 'conventional' && downRatio < 0.2
	const hasUpfrontFee =
		program === 'fha' || program === 'usda' || (program === 'va' && !vaExempt)
	const upfrontFeeName =
		program === 'fha'
			? 'FHA upfront MIP'
			: program === 'usda'
				? 'USDA guarantee fee'
				: 'VA funding fee'

	const buildInputs = (): MortgageInputs => {
		const start = parseMonth(startMonth ?? nextMonth())
		return {
			homePrice,
			downPayment,
			program,
			interestRate,
			termYears,
			propertyTaxAnnual: taxAnnual,
			insuranceAnnual: insurance,
			hoaMonthly: hoa,
			pmiRate: showPmi ? pmiRate : 0,
			vaFirstUse,
			vaExempt,
			financeUpfrontFee: financeFee,
			closingCosts,
			discountPoints: points,
			credits,
			extraMonthly,
			extraYearly,
			startYear: start.year,
			startMonth: start.month
		}
	}

	const handleDownPercent = (value: string) => {
		setParams({ dp: null, dpp: toNumber(value) })
	}

	const handleDownDollars = (value: string) => {
		const dollars = toNumber(value)
		setParams(
			homePrice > 0
				? {
						dp: dollars,
						dpp: Math.round((dollars / homePrice) * 1000) / 10
					}
				: { dp: dollars }
		)
	}

	const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault()
		try {
			const calculated = calculateMortgage(buildInputs())
			setResults(calculated)
			setError('')
			if (!interactive) {
				return
			}
			trackEvent('calculator_used', {
				calculator_type: 'mortgage-calculator',
				home_price: homePrice,
				down_payment_percent: Math.round(downRatio * 1000) / 10,
				interest_rate: interestRate,
				loan_term: termYears,
				loan_program: program
			})
		} catch (err) {
			if (err instanceof MortgageInputError) {
				setResults(null)
				setError(err.message)
				return
			}
			throw err
		}
	}

	const handleReset = () => {
		setResults(null)
		setError('')
		setShowSchedule(false)
		setDownInDollars(false)
		setParams(null)
	}

	const payoffLabel = results
		? `${MONTH_NAMES[results.payoffMonth - 1]} ${results.payoffYear}`
		: ''

	// The layout's copy action writes this and shows a success or failure toast
	const summaryText = results
		? [
				'Mortgage Calculator Summary',
				`Loan type: ${PROGRAM_LABELS[program]}`,
				`Total monthly payment: ${formatCurrency(results.totalMonthlyPayment)}`,
				`Principal and interest: ${formatCurrency(results.monthlyPrincipalInterest)}`,
				`Property tax: ${formatCurrency(results.monthlyPropertyTax)}`,
				`Home insurance: ${formatCurrency(results.monthlyInsurance)}`,
				...(results.monthlyMortgageInsurance > 0
					? [
							`${results.mortgageInsuranceLabel}: ${formatCurrency(results.monthlyMortgageInsurance)}`
						]
					: []),
				...(results.monthlyHoa > 0
					? [`HOA dues: ${formatCurrency(results.monthlyHoa)}`]
					: []),
				`Loan amount: ${formatCurrency(results.loanAmount)}`,
				`Cash to close: ${formatCurrency(results.cashToClose)}`,
				`Total interest: ${formatCurrency(results.totalInterest)}`,
				`Paid off: ${payoffLabel}`
			].join('\n')
		: ''

	const insuranceEndLabel = (r: MortgageResults): string => {
		if (r.mortgageInsuranceEndsAfterPayment === null) {
			return 'Charged for the life of the loan'
		}
		const years = Math.floor(r.mortgageInsuranceEndsAfterPayment / 12)
		const months = r.mortgageInsuranceEndsAfterPayment % 12
		const parts = [
			years > 0 ? `${years} year${years === 1 ? '' : 's'}` : '',
			months > 0 ? `${months} month${months === 1 ? '' : 's'}` : ''
		].filter(Boolean)
		return `Drops off after ${parts.join(' ')}`
	}

	const resultItems = results
		? [
				{
					label: 'Total Monthly Payment',
					value: formatCurrency(results.totalMonthlyPayment),
					description: 'Principal, interest, taxes, insurance and fees',
					highlight: true
				},
				{
					label: 'Principal and Interest',
					value: formatCurrency(results.monthlyPrincipalInterest),
					description: `${formatCurrency(results.loanAmount)} at ${interestRate}% for ${termYears} years`
				},
				{
					label: 'Property Tax',
					value: formatCurrency(results.monthlyPropertyTax),
					description: `${formatCurrency(taxAnnual)} a year`
				},
				{
					label: 'Home Insurance',
					value: formatCurrency(results.monthlyInsurance),
					description: `${formatCurrency(insurance)} a year`
				},
				...(results.monthlyMortgageInsurance > 0
					? [
							{
								label: results.mortgageInsuranceLabel,
								value: formatCurrency(results.monthlyMortgageInsurance),
								description: insuranceEndLabel(results)
							}
						]
					: []),
				...(results.monthlyHoa > 0
					? [
							{
								label: 'HOA Dues',
								value: formatCurrency(results.monthlyHoa),
								description: 'Homeowners association'
							}
						]
					: []),
				{
					label: 'Loan Amount',
					value: formatCurrency(results.loanAmount),
					description:
						results.loanAmount > results.baseLoan
							? `Includes ${formatCurrency(results.loanAmount - results.baseLoan)} ${results.upfrontFeeLabel}`
							: `${percent(results.ltv)} of the home price`
				},
				{
					label: 'Cash Needed at Closing',
					value: formatCurrency(results.cashToClose),
					description: 'Down payment, closing costs and points, less credits',
					highlight: true
				},
				{
					label: 'Total Interest',
					value: formatCurrency(results.totalInterest),
					description:
						results.interestSaved > 0
							? `Extra payments save ${formatCurrency(results.interestSaved)}`
							: `Over ${termYears} years`
				},
				...(results.totalMortgageInsurance > 0
					? [
							{
								label: `Total ${results.mortgageInsuranceLabel}`,
								value: formatCurrency(results.totalMortgageInsurance),
								description: 'Until it drops off or the loan is paid'
							}
						]
					: []),
				{
					label: 'Paid Off',
					value: payoffLabel,
					description:
						results.monthsSaved > 0
							? `${results.monthsSaved} months early with extra payments`
							: `${results.payoffMonths} payments`
				},
				{
					label: 'Total Cost Over the Loan',
					value: formatCurrency(results.totalCost),
					description:
						'Principal, interest, mortgage insurance, taxes, insurance and HOA at today’s rates'
				}
			]
		: []

	const actions: ToolAction[] = [
		{
			type: 'copy',
			label: 'Copy Summary',
			copyText: summaryText,
			copiedMessage: 'Summary copied'
		}
	]

	const formSlot = (
		<form onSubmit={handleSubmit} className="space-y-comfortable" noValidate>
			<Section title="Home and Loan">
				<CalculatorInput
					label="Home Price"
					id="homePrice"
					type="number"
					min="0"
					step="1000"
					value={homePrice || ''}
					onChange={e => {
						const price = toNumber(e.target.value)
						// In dollar mode the dollars stay put; keep the percent in step
						setParams(
							downInDollars && price > 0
								? {
										price,
										dpp: Math.round((downPayment / price) * 1000) / 10
									}
								: { price }
						)
					}}
					prefix="$"
					helpText="Purchase price of the home"
					required
				/>

				<div className="space-y-tight">
					<div className="flex items-center justify-between">
						<Label htmlFor={downInDollars ? 'downPayment' : 'downPercent'}>
							Down Payment
						</Label>
						<ModeToggle
							label="Down payment"
							options={['%', '$']}
							active={downInDollars ? 1 : 0}
							onChange={index => setDownInDollars(index === 1)}
						/>
					</div>
					{downInDollars ? (
						<CalculatorInput
							label=""
							id="downPayment"
							type="number"
							min="0"
							step="1000"
							value={downPayment || ''}
							onChange={e => handleDownDollars(e.target.value)}
							prefix="$"
							helpText={`${percent(downRatio)} of the home price`}
						/>
					) : (
						<CalculatorInput
							label=""
							id="downPercent"
							type="number"
							min="0"
							max="100"
							step="0.5"
							value={downPercent || ''}
							onChange={e => handleDownPercent(e.target.value)}
							suffix="%"
							helpText={formatCurrency(downPayment)}
						/>
					)}
				</div>

				<div className="grid gap-content md:grid-cols-2">
					<div className="flex flex-col gap-tight">
						<Label id="program-label" htmlFor="program">
							Loan Type
						</Label>
						<Select
							value={program}
							onValueChange={value => {
								const selected = PROGRAMS.find(p => p === value)
								if (!selected) {
									return
								}
								// USDA guaranteed loans are 30-year fixed only
								setParams(
									selected === 'usda'
										? { type: selected, term: 30 }
										: { type: selected }
								)
							}}
						>
							<SelectTrigger id="program" aria-labelledby="program-label">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PROGRAMS.map(p => (
									<SelectItem key={p} value={p}>
										{PROGRAM_LABELS[p]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex flex-col gap-tight">
						<Label id="loanTerm-label" htmlFor="loanTerm">
							Loan Term
						</Label>
						<Select
							value={String(termYears)}
							onValueChange={value => setParams({ term: Number(value) })}
							disabled={program === 'usda'}
						>
							<SelectTrigger id="loanTerm" aria-labelledby="loanTerm-label">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{TERMS.map(t => (
									<SelectItem key={t} value={String(t)}>
										{t} years
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{program === 'usda' && (
							<p className="text-xs text-muted-foreground">
								USDA guaranteed loans are 30-year fixed
							</p>
						)}
					</div>
				</div>

				{program === 'usda' && (
					<p className="text-xs text-muted-foreground">
						USDA loans need no down payment, but the home must be in an eligible
						rural area and household income must be within the area limit. Check
						an address at eligibility.sc.egov.usda.gov.
					</p>
				)}

				{program === 'va' && (
					<div className="space-y-tight rounded-lg border border-border p-4">
						<div className="flex flex-col gap-tight">
							<Label id="vaUse-label" htmlFor="vaUse">
								VA Loan Use
							</Label>
							<Select
								value={vaFirstUse ? 'first' : 'subsequent'}
								onValueChange={value =>
									setParams({ vafirst: value === 'first' })
								}
							>
								<SelectTrigger id="vaUse" aria-labelledby="vaUse-label">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="first">First VA loan</SelectItem>
									<SelectItem value="subsequent">
										I have used a VA loan before
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-start gap-tight pt-2">
							<Checkbox
								id="vaExempt"
								aria-labelledby="vaExempt-label"
								checked={vaExempt}
								onCheckedChange={value => {
									if (typeof value === 'boolean') {
										setParams({ vaexempt: value })
									}
								}}
							/>
							<Label
								id="vaExempt-label"
								htmlFor="vaExempt"
								className="font-normal leading-snug"
							>
								Exempt from the funding fee (for example, you receive VA
								disability compensation)
							</Label>
						</div>
					</div>
				)}

				{hasUpfrontFee && (
					<div className="flex items-start gap-tight">
						<Checkbox
							id="financeFee"
							aria-labelledby="financeFee-label"
							checked={financeFee}
							onCheckedChange={value => {
								if (typeof value === 'boolean') {
									setParams({ finfee: value })
								}
							}}
						/>
						<Label
							id="financeFee-label"
							htmlFor="financeFee"
							className="font-normal leading-snug"
						>
							Add the {upfrontFeeName} to the loan instead of paying it at
							closing
						</Label>
					</div>
				)}

				<div className="grid gap-content md:grid-cols-2">
					<CalculatorInput
						label="Interest Rate"
						id="interestRate"
						type="number"
						min="0"
						max="30"
						step="0.125"
						value={interestRate || ''}
						onChange={e => setParams({ rate: toNumber(e.target.value) })}
						suffix="%"
						helpText="The rate your lender quoted"
						required
					/>
					<CalculatorInput
						label="First Payment"
						id="startMonth"
						type="month"
						value={startMonth ?? ''}
						onChange={e => setParams({ start: e.target.value || null })}
						helpText="Leave blank for next month"
					/>
				</div>
			</Section>

			<Section title="Monthly Costs">
				<div className="space-y-tight">
					<div className="flex items-center justify-between">
						<Label htmlFor={taxInDollars ? 'taxAmount' : 'taxRate'}>
							Property Tax
						</Label>
						<ModeToggle
							label="Property tax"
							options={['%', '$']}
							active={taxInDollars ? 1 : 0}
							onChange={index =>
								index === 1
									? setParams({ tax: Math.round(taxAnnual) })
									: setParams({ tax: null })
							}
						/>
					</div>
					{taxInDollars ? (
						<CalculatorInput
							label=""
							id="taxAmount"
							type="number"
							min="0"
							step="100"
							value={taxAmount ?? ''}
							onChange={e => setParams({ tax: toNumber(e.target.value) })}
							prefix="$"
							helpText="Yearly tax bill, after any homestead exemption"
						/>
					) : (
						<CalculatorInput
							label=""
							id="taxRate"
							type="number"
							min="0"
							max="10"
							step="0.01"
							value={taxRate || ''}
							onChange={e => setParams({ taxr: toNumber(e.target.value) })}
							suffix="%"
							helpText={`${formatCurrency(taxAnnual)} a year. Use the combined rate from your county appraisal district.`}
						/>
					)}
				</div>

				<div className="grid gap-content md:grid-cols-2">
					<CalculatorInput
						label="Home Insurance"
						id="insurance"
						type="number"
						min="0"
						step="100"
						value={insurance || ''}
						onChange={e => setParams({ ins: toNumber(e.target.value) })}
						prefix="$"
						suffix="/yr"
						helpText="Yearly premium from your insurance quote"
					/>
					<CalculatorInput
						label="HOA Dues"
						id="hoa"
						type="number"
						min="0"
						step="10"
						value={hoa || ''}
						onChange={e => setParams({ hoa: toNumber(e.target.value) })}
						prefix="$"
						suffix="/mo"
						helpText="Leave blank if there is no HOA"
					/>
				</div>

				{showPmi && (
					<CalculatorInput
						label="PMI Rate"
						id="pmiRate"
						type="number"
						min="0"
						max="5"
						step="0.05"
						value={pmiRate || ''}
						onChange={e => setParams({ pmir: toNumber(e.target.value) })}
						suffix="%/yr"
						helpText="Ask your lender. It depends on your credit score and down payment. PMI drops off once you owe 78% of the original value."
					/>
				)}
				{program === 'fha' && (
					<p className="text-xs text-muted-foreground">
						FHA annual MIP is set by HUD from your loan amount, term and down
						payment, so there is nothing to enter.
					</p>
				)}
				{program === 'usda' && (
					<p className="text-xs text-muted-foreground">
						The USDA annual fee (0.35%) and the 1% guarantee fee are set by
						USDA, so there is nothing to enter.
					</p>
				)}
			</Section>

			<Section title="Closing Costs">
				<CalculatorInput
					label="Closing Costs"
					id="closingCosts"
					type="number"
					min="0"
					step="100"
					value={closingCosts || ''}
					onChange={e => setParams({ cc: toNumber(e.target.value) })}
					prefix="$"
					helpText="Lender, title and prepaid costs from page 2 of your Loan Estimate"
				/>
				<div className="grid gap-content md:grid-cols-2">
					<CalculatorInput
						label="Discount Points"
						id="points"
						type="number"
						min="0"
						max="10"
						step="0.125"
						value={points || ''}
						onChange={e => setParams({ pts: toNumber(e.target.value) })}
						helpText="1 point costs 1% of the loan"
					/>
					<CalculatorInput
						label="Seller or Lender Credits"
						id="credits"
						type="number"
						min="0"
						step="100"
						value={credits || ''}
						onChange={e => setParams({ credits: toNumber(e.target.value) })}
						prefix="$"
						helpText="Money toward your closing costs"
					/>
				</div>
			</Section>

			<Section title="Extra Payments">
				<div className="grid gap-content md:grid-cols-2">
					<CalculatorInput
						label="Extra Each Month"
						id="extraMonthly"
						type="number"
						min="0"
						step="25"
						value={extraMonthly || ''}
						onChange={e => setParams({ xm: toNumber(e.target.value) })}
						prefix="$"
						helpText="Added to principal every month"
					/>
					<CalculatorInput
						label="Extra Each Year"
						id="extraYearly"
						type="number"
						min="0"
						step="100"
						value={extraYearly || ''}
						onChange={e => setParams({ xy: toNumber(e.target.value) })}
						prefix="$"
						helpText="One extra principal payment a year"
					/>
				</div>
			</Section>

			{error && (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			)}

			<Button type="submit" variant="accent" className="w-full">
				Calculate Payment
			</Button>

			{results !== null && (
				<Button
					type="button"
					variant="outline"
					onClick={handleReset}
					className="w-full"
				>
					Start Over
				</Button>
			)}
		</form>
	)

	const resultSlot = results ? (
		<CalculatorResults
			results={resultItems}
			calculatorType="mortgage-calculator"
			inputs={buildInputs()}
		>
			<div className="space-y-tight">
				<Button
					type="button"
					variant="outline"
					className="w-full"
					aria-expanded={showSchedule}
					aria-controls="amortization-schedule"
					onClick={() => setShowSchedule(open => !open)}
				>
					{showSchedule ? 'Hide' : 'Show'} Yearly Amortization Schedule
				</Button>
				{showSchedule && (
					<div id="amortization-schedule" className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Year</TableHead>
									<TableHead className="text-right">Principal</TableHead>
									<TableHead className="text-right">Interest</TableHead>
									{results.totalMortgageInsurance > 0 && (
										<TableHead className="text-right">
											{results.mortgageInsuranceLabel}
										</TableHead>
									)}
									<TableHead className="text-right">Balance</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{results.schedule.map(row => (
									<TableRow key={row.year}>
										<TableCell>{row.year}</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatCurrency(row.principal)}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatCurrency(row.interest)}
										</TableCell>
										{results.totalMortgageInsurance > 0 && (
											<TableCell className="text-right tabular-nums">
												{formatCurrency(row.mortgageInsurance)}
											</TableCell>
										)}
										<TableCell className="text-right tabular-nums">
											{formatCurrency(row.endingBalance)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</div>
		</CalculatorResults>
	) : undefined

	return (
		<ToolPageLayout
			title="Mortgage Calculator"
			description="See the full monthly payment for a conventional, FHA, VA or USDA loan, with taxes, insurance, mortgage insurance or fees, HOA dues, cash to close and how extra payments change your payoff date"
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={results !== null}
			resultPlaceholder="Enter your loan details to calculate your payment"
			actions={actions}
		/>
	)
}

function MortgageCalculatorWithUrlState() {
	const [params, setParams] = useQueryStates(MORTGAGE_PARSERS)
	return (
		<MortgageCalculatorView
			params={params}
			setParams={values => {
				void setParams(values)
			}}
			interactive
		/>
	)
}

export function MortgageCalculatorClient() {
	return (
		<Suspense
			fallback={
				<MortgageCalculatorView
					params={DEFAULT_PARAMS}
					setParams={noop}
					interactive={false}
				/>
			}
		>
			<MortgageCalculatorWithUrlState />
		</Suspense>
	)
}
