/**
 * ROI Calculator Client Component
 *
 * Results are derived live from the validated inputs, which live in the
 * URL (?traffic=&conv=&aov=&impr=&invest=) so a shared link shows its
 * results on load. Reading the URL with nuqs suspends prerendering, so
 * only that part sits behind Suspense: the fallback renders the same page
 * (heading, description and form) with default values, which keeps the H1
 * and form in the server HTML.
 */

'use client'

import { parseAsString, useQueryStates } from 'nuqs'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import { CalculatorResults } from '@/components/calculators/CalculatorResults'
import type { ToolAction } from '@/components/layout/ToolPageLayout'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'
import {
	calculateRoi,
	formatRoiMoney,
	formatRoiPercent,
	MAX_IMPROVEMENT,
	MAX_INVESTMENT,
	MAX_MONTHLY_TRAFFIC,
	MAX_ORDER_VALUE,
	parseRoiInput,
	type RoiField,
	type RoiInput,
	type RoiRawInput,
	type RoiResult
} from '@/lib/roi-calculator'

interface RoiCalculatorViewProps {
	raw: RoiRawInput
	interactive: boolean
	onFieldChange: (field: RoiField, value: string) => void
	onReset: () => void
}

interface ResultItem {
	label: string
	value: string
	description: string
	highlight?: boolean
}

const DEFAULT_IMPROVEMENT = '20'

const DEFAULT_RAW: RoiRawInput = {
	monthlyTraffic: '',
	conversionRate: '',
	averageOrderValue: '',
	improvementPercentage: DEFAULT_IMPROVEMENT,
	investment: ''
}

// Every field is kept as the exact text typed (no integer rounding, no
// "0" for a cleared field) and validated in parseRoiInput.
const URL_PARSERS = {
	monthlyTraffic: parseAsString.withDefault(''),
	conversionRate: parseAsString.withDefault(''),
	averageOrderValue: parseAsString.withDefault(''),
	improvementPercentage: parseAsString.withDefault(DEFAULT_IMPROVEMENT),
	investment: parseAsString.withDefault('')
}

const URL_KEYS = {
	monthlyTraffic: 'traffic',
	conversionRate: 'conv',
	averageOrderValue: 'aov',
	improvementPercentage: 'impr',
	investment: 'invest'
}

const TRACK_DELAY_MS = 1500

const NUMBER = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const ONE_DECIMAL = new Intl.NumberFormat('en-US', {
	maximumFractionDigits: 1
})

const noop = () => undefined

function formatPercent(value: number): string {
	return `${NUMBER.format(value)}%`
}

function formatMonths(value: number): string {
	const text = ONE_DECIMAL.format(value)
	return text === '1' ? '1 month' : `${text} months`
}

function buildResultItems(input: RoiInput, result: RoiResult): ResultItem[] {
	const projectedDescription = result.improvedRateCapped
		? `At a 100% conversion rate. A ${formatPercent(input.improvementPercentage)} lift on ${formatPercent(input.conversionRate)} would pass 100%, so it is capped.`
		: `At a ${formatPercent(result.improvedConversionRate)} conversion rate, a ${formatPercent(input.improvementPercentage)} relative lift`

	const items: ResultItem[] = [
		{
			label: 'Current Annual Revenue',
			value: formatRoiMoney(result.currentAnnualRevenue),
			description: `At your current ${formatPercent(input.conversionRate)} conversion rate`
		},
		{
			label: 'Projected Annual Revenue',
			value: formatRoiMoney(result.projectedAnnualRevenue),
			description: projectedDescription,
			highlight: true
		},
		{
			label: 'Additional Monthly Revenue',
			value: formatRoiMoney(result.monthlyIncrease),
			description: 'Extra revenue per month',
			highlight: true
		},
		{
			label: 'Additional Annual Revenue',
			value: formatRoiMoney(result.annualIncrease),
			description: 'Extra revenue over 12 months',
			highlight: true
		}
	]

	if (input.investment !== null && result.roiPercentage !== null) {
		const investment = formatRoiMoney(input.investment)
		items.push(
			{
				label: 'First-Year ROI',
				value: formatRoiPercent(result.roiPercentage),
				description: `Additional annual revenue minus your ${investment} investment, divided by that investment. Based on revenue, not profit.`
			},
			{
				label: 'Payback Period',
				value:
					result.paybackMonths === null
						? 'Not reached'
						: formatMonths(result.paybackMonths),
				description:
					result.paybackMonths === null
						? 'There is no added monthly revenue to pay back the investment.'
						: `Your ${investment} investment divided by the additional monthly revenue`
			}
		)
	}

	return items
}

function RoiCalculatorView({
	raw,
	interactive,
	onFieldChange,
	onReset
}: RoiCalculatorViewProps) {
	const parsed = useMemo(() => parseRoiInput(raw), [raw])
	const outcome = useMemo(() => {
		if (parsed.status !== 'ok') {
			return null
		}
		const result = calculateRoi(parsed.data)
		return {
			input: parsed.data,
			result,
			items: buildResultItems(parsed.data, result)
		}
	}, [parsed])
	const errors = parsed.status === 'ok' ? {} : parsed.errors

	// Results update on every keystroke, so record usage once per visit
	// after the inputs settle rather than on each change.
	const tracked = useRef(false)
	useEffect(() => {
		if (!interactive || tracked.current || outcome === null) {
			return
		}
		const timer = setTimeout(() => {
			tracked.current = true
			trackEvent('calculator_used', {
				calculator_type: 'roi-calculator',
				monthly_traffic: outcome.input.monthlyTraffic,
				conversion_rate: outcome.input.conversionRate,
				potential_increase: outcome.result.annualIncrease
			})
		}, TRACK_DELAY_MS)
		return () => clearTimeout(timer)
	}, [interactive, outcome])

	const canReset = (Object.keys(DEFAULT_RAW) as RoiField[]).some(
		field => raw[field] !== DEFAULT_RAW[field]
	)

	const handleCopy = async () => {
		if (outcome === null) {
			return
		}
		const text = [
			'ROI Calculator Results',
			...outcome.items.map(item => `${item.label}: ${item.value}`)
		].join('\n')
		try {
			await navigator.clipboard.writeText(text)
			toast.success('Results copied')
		} catch {
			toast.error('Could not copy the results. Select them and copy by hand.')
		}
	}

	const actions: ToolAction[] | undefined =
		outcome === null
			? undefined
			: [
					{
						type: 'copy',
						label: 'Copy Results',
						onClick: () => {
							void handleCopy()
						}
					}
				]

	const fieldProps = (field: RoiField) => ({
		id: field,
		value: raw[field],
		onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
			onFieldChange(field, e.target.value),
		error: errors[field],
		'aria-invalid': errors[field] ? true : undefined
	})

	const formSlot = (
		<form
			onSubmit={e => e.preventDefault()}
			className="space-y-comfortable"
			noValidate
		>
			<div className="grid gap-comfortable md:grid-cols-2">
				<CalculatorInput
					label="Monthly Website Traffic"
					type="number"
					inputMode="numeric"
					min="0"
					max={MAX_MONTHLY_TRAFFIC}
					step="1"
					helpText="Average number of visitors per month"
					required
					{...fieldProps('monthlyTraffic')}
				/>

				<CalculatorInput
					label="Current Conversion Rate"
					type="number"
					inputMode="decimal"
					min="0"
					max="100"
					step="0.1"
					suffix="%"
					helpText="Percentage of visitors who buy or become a lead"
					required
					{...fieldProps('conversionRate')}
				/>

				<CalculatorInput
					label="Average Order Value"
					type="number"
					inputMode="decimal"
					min="0"
					max={MAX_ORDER_VALUE}
					step="0.01"
					prefix="$"
					helpText="Average revenue per conversion or sale"
					required
					{...fieldProps('averageOrderValue')}
				/>

				<CalculatorInput
					label="Target Improvement"
					type="number"
					inputMode="decimal"
					min="0"
					max={MAX_IMPROVEMENT}
					step="1"
					suffix="%"
					helpText="A relative lift: 2% with a 20% lift is 2.4%. The 20% default is an example assumption, not a forecast."
					required
					{...fieldProps('improvementPercentage')}
				/>

				<CalculatorInput
					label="Your Investment (optional)"
					type="number"
					inputMode="decimal"
					min="0"
					max={MAX_INVESTMENT}
					step="1"
					prefix="$"
					helpText="Your own estimate of what the improvement would cost. Leave it blank to see revenue only."
					{...fieldProps('investment')}
				/>
			</div>

			{canReset && (
				<Button
					type="button"
					variant="outline"
					onClick={onReset}
					className="w-full"
				>
					Start over
				</Button>
			)}
		</form>
	)

	const resultSlot = outcome ? (
		<CalculatorResults
			results={outcome.items}
			calculatorType="roi-calculator"
			inputs={outcome.input}
		/>
	) : undefined

	return (
		<ToolPageLayout
			title="ROI Calculator"
			description="See how much added revenue a higher website conversion rate could bring in. Add what you would spend to see first-year ROI and how many months it takes to pay back."
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={outcome !== null}
			resultPlaceholder="Enter your traffic, conversion rate and order value to see your results"
			actions={actions}
		/>
	)
}

function RoiCalculatorWithUrlState() {
	const [raw, setRaw] = useQueryStates(URL_PARSERS, { urlKeys: URL_KEYS })

	const handleFieldChange = (field: RoiField, value: string) => {
		// A cleared improvement stays blank (impr=) instead of snapping back
		// to the 20% default; other cleared fields drop out of the URL.
		if (value === '' && field !== 'improvementPercentage') {
			void setRaw({ [field]: null })
			return
		}
		void setRaw({ [field]: value })
	}

	const handleReset = () => {
		void setRaw(null)
	}

	return (
		<RoiCalculatorView
			raw={raw}
			interactive
			onFieldChange={handleFieldChange}
			onReset={handleReset}
		/>
	)
}

export function ROICalculatorClient() {
	return (
		<Suspense
			fallback={
				<RoiCalculatorView
					raw={DEFAULT_RAW}
					interactive={false}
					onFieldChange={noop}
					onReset={noop}
				/>
			}
		>
			<RoiCalculatorWithUrlState />
		</Suspense>
	)
}
