/**
 * Website Cost Estimator Client Component
 * An illustrative planning model with URL state, shown beside published
 * market ranges for context. Not market data and not a quote.
 *
 * Reading the URL with nuqs suspends prerendering, so only that part sits
 * behind Suspense: the fallback renders the same page (heading,
 * description and form) with default values, which keeps the H1 and form
 * in the server HTML.
 */

'use client'

import { type Nullable, useQueryStates, type Values } from 'nuqs'
import { Suspense } from 'react'
import { toast } from 'sonner'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import { CalculatorResults } from '@/components/calculators/CalculatorResults'
import type { ToolAction } from '@/components/layout/ToolPageLayout'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { trackEvent } from '@/lib/analytics'
import {
	calculateEstimate,
	DESIGN_LEVELS,
	estimatorParsers,
	FEATURES,
	type Feature,
	formatWholeDollars,
	INCLUDED_PAGES,
	MAX_PAGES,
	MIN_PAGES,
	parsePageCount,
	TIMELINES,
	WEBSITE_TYPES
} from '@/lib/cost-estimator'
import { logger } from '@/lib/logger'

const CLUTCH_URL =
	'https://clutch.co/resources/how-to-create-a-budget-for-a-new-website'

const CLUTCH_FIGURES = [
	'Building a website from scratch usually costs less than $10,000.',
	'Hiring a freelancer: $500 to $5,000 for a basic 5 to 10 page site.',
	'DIY website builders: typically $10 to $50 a month for hosting and builder fees.',
	'Larger or more complex projects (enterprise sites, e-commerce, membership portals) can exceed $100,000.'
] as const

const PAGES_ERROR = `Enter a whole number from ${MIN_PAGES} to ${MAX_PAGES}.`

type EstimatorParams = Values<typeof estimatorParsers>

interface CostEstimatorViewProps {
	params: EstimatorParams
	setParams: (values: Partial<Nullable<EstimatorParams>> | null) => void
	interactive: boolean
}

/** Matches the estimatorParsers defaults, for the server-rendered shell. */
const DEFAULT_PARAMS: EstimatorParams = {
	type: null,
	pages: String(INCLUDED_PAGES),
	features: [],
	design: 'standard',
	timeline: 'normal',
	maint: false
}

const noop = () => undefined

function CostEstimatorView({
	params,
	setParams,
	interactive
}: CostEstimatorViewProps) {
	const { type: websiteType, features, design, timeline, maint } = params
	const pages = parsePageCount(params.pages)

	// Derived during render, so the range always matches the current inputs.
	const estimate =
		websiteType && pages !== null
			? calculateEstimate({
					websiteType,
					pages,
					features,
					design,
					timeline,
					maintenance: maint
				})
			: null

	const handleTypeChange = (value: string) => {
		const selected = WEBSITE_TYPES.find(t => t.value === value)
		if (!selected) {
			return
		}
		setParams({ type: selected.value })
		if (!interactive) {
			return
		}
		trackEvent('calculator_used', {
			calculator_type: 'cost-estimator',
			website_type: selected.value,
			features_count: features.length
		})
	}

	const handleFeatureToggle = (feature: Feature) => {
		setParams({
			features: features.includes(feature)
				? features.filter(f => f !== feature)
				: [...features, feature]
		})
	}

	const handleStartOver = () => {
		setParams(null)
	}

	const rangeText = estimate
		? `${formatWholeDollars(estimate.low)} to ${formatWholeDollars(estimate.high)}`
		: ''
	const maintenanceText =
		estimate && estimate.monthlyMaintenance !== null
			? `${formatWholeDollars(estimate.monthlyMaintenance)}/mo`
			: 'Not included'

	const handleCopy = async () => {
		if (!estimate) {
			return
		}
		const text = [
			'Website Cost Estimator: illustrative planning model (not market data, not a quote)',
			`Planning model range: ${rangeText}`,
			`Planning model midpoint: ${formatWholeDollars(estimate.midpoint)}`,
			`Planning timeline: ${estimate.weeks} weeks`,
			`Maintenance: ${maintenanceText}`
		].join('\n')
		try {
			await navigator.clipboard.writeText(text)
			toast.success('Range copied')
		} catch (err) {
			logger.error('Copy range failed', err)
			toast.error(
				'Could not copy the range. Select the text and copy it instead.'
			)
		}
	}

	const resultItems = estimate
		? [
				{
					label: 'Planning model range',
					value: rangeText,
					description:
						"Illustrative output of this tool's own formula. Not market data and not a quote.",
					highlight: true
				},
				{
					label: 'Planning model midpoint',
					value: formatWholeDollars(estimate.midpoint),
					description: 'Middle of the planning range'
				},
				{
					label: 'Planning timeline',
					value: `${estimate.weeks} weeks`,
					description: "This tool's assumption for this scope, not a schedule"
				},
				{
					label: 'Maintenance',
					value: maintenanceText,
					description:
						estimate.annualMaintenance === null
							? 'Turn on ongoing maintenance to include it'
							: `${formatWholeDollars(estimate.annualMaintenance)} a year. This tool assumes 15% of the build figure per year, before any rush adjustment.`
				}
			]
		: []

	const actions: ToolAction[] | undefined = estimate
		? [{ type: 'copy', label: 'Copy Range', onClick: handleCopy }]
		: undefined

	const formSlot = (
		<form
			onSubmit={e => e.preventDefault()}
			className="space-y-comfortable"
			noValidate
		>
			{/* Website Type */}
			<div className="space-y-tight">
				<Label htmlFor="websiteType">Website Type *</Label>
				<Select
					name="websiteType"
					value={websiteType ?? ''}
					onValueChange={handleTypeChange}
					required
				>
					<SelectTrigger id="websiteType">
						<SelectValue placeholder="Select a type..." />
					</SelectTrigger>
					<SelectContent>
						{WEBSITE_TYPES.map(type => (
							<SelectItem key={type.value} value={type.value}>
								{type.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Number of Pages */}
			<CalculatorInput
				label="Number of Pages"
				id="numberOfPages"
				type="number"
				inputMode="numeric"
				min={MIN_PAGES}
				max={MAX_PAGES}
				step="1"
				value={params.pages}
				onChange={e => setParams({ pages: e.target.value })}
				helpText="Estimated number of unique pages"
				error={pages === null ? PAGES_ERROR : undefined}
				aria-invalid={pages === null}
				required
			/>

			{/* Features */}
			<fieldset className="space-y-tight">
				<legend className="text-sm leading-none font-medium">
					Additional Features
				</legend>
				<div className="grid gap-3 sm:grid-cols-2">
					{FEATURES.map(feature => (
						<label
							key={feature.value}
							className="relative flex cursor-pointer items-start rounded-lg border border-border p-4 hover:bg-muted"
						>
							<div className="flex h-5 items-center">
								<Checkbox
									checked={features.includes(feature.value)}
									onCheckedChange={() => handleFeatureToggle(feature.value)}
								/>
							</div>
							<div className="ml-3 text-sm font-medium text-foreground">
								{feature.label}
							</div>
						</label>
					))}
				</div>
			</fieldset>

			{/* Design Complexity */}
			<div className="space-y-tight">
				<Label htmlFor="designComplexity">Design Complexity</Label>
				<Select
					name="designComplexity"
					value={design}
					onValueChange={value => {
						const level = DESIGN_LEVELS.find(d => d.value === value)
						if (level) {
							setParams({ design: level.value })
						}
					}}
				>
					<SelectTrigger id="designComplexity">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{DESIGN_LEVELS.map(level => (
							<SelectItem key={level.value} value={level.value}>
								{level.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Timeline */}
			<div className="space-y-tight">
				<Label htmlFor="timeline">Project Timeline</Label>
				<Select
					name="timeline"
					value={timeline}
					onValueChange={value => {
						const option = TIMELINES.find(t => t.value === value)
						if (option) {
							setParams({ timeline: option.value })
						}
					}}
				>
					<SelectTrigger id="timeline">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{TIMELINES.map(option => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Maintenance */}
			<div className="flex items-start gap-3">
				<Checkbox
					id="maintenance"
					checked={maint}
					onCheckedChange={value => {
						if (typeof value === 'boolean') {
							setParams({ maint: value })
						}
					}}
				/>
				<div className="text-sm">
					<Label htmlFor="maintenance" className="font-medium">
						Include ongoing maintenance
					</Label>
					<p className="text-muted-foreground">
						Ongoing updates, security patches and technical support
					</p>
				</div>
			</div>

			{websiteType && (
				<Button
					type="button"
					variant="outline"
					onClick={handleStartOver}
					className="w-full"
				>
					Start over
				</Button>
			)}
		</form>
	)

	// The numbers are an illustrative model: Richard prices every project
	// after scoping it, so the result must never read as his quote.
	const resultSlot = estimate ? (
		<CalculatorResults
			results={resultItems}
			calculatorType="cost-estimator"
			inputs={{
				websiteType,
				numberOfPages: pages,
				features,
				designComplexity: design,
				timeline,
				maintenanceNeeded: maint
			}}
		>
			<p className="text-sm text-muted-foreground">
				This is an illustrative planning model built on this tool&apos;s own
				assumptions. It is not market data and not a quote. I price every
				project after a free 30-minute website plan call, once I know what it
				will take. You get the timeline and a real price on that call.
			</p>
			<Card size="sm" className="bg-muted">
				<h4 className="mb-subheading text-base font-semibold text-foreground">
					What published guides say
				</h4>
				<ul className="list-disc space-y-tight pl-5 text-sm text-muted-foreground">
					{CLUTCH_FIGURES.map(figure => (
						<li key={figure}>{figure}</li>
					))}
				</ul>
				<p className="mt-heading text-xs text-muted-foreground">
					Source:{' '}
					<a
						href={CLUTCH_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="underline"
					>
						Clutch, How to Create a Budget for a New Website
					</a>{' '}
					(updated May 28, 2026). Shown for context, separate from this
					tool&apos;s model.
				</p>
			</Card>
		</CalculatorResults>
	) : undefined

	return (
		<ToolPageLayout
			title="Website Cost Estimator"
			description="An illustrative planning model that turns a website's type, pages and features into a cost range, shown beside published market ranges. It is not market data and not a quote."
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={estimate !== null}
			resultPlaceholder={
				websiteType
					? `Enter a page count from ${MIN_PAGES} to ${MAX_PAGES} to see the planning range`
					: 'Pick a website type to see the planning range'
			}
			actions={actions}
		/>
	)
}

function CostEstimatorWithUrlState() {
	const [params, setParams] = useQueryStates(estimatorParsers)
	return (
		<CostEstimatorView
			params={params}
			setParams={values => {
				void setParams(values)
			}}
			interactive
		/>
	)
}

export function CostEstimatorClient() {
	return (
		<Suspense
			fallback={
				<CostEstimatorView
					params={DEFAULT_PARAMS}
					setParams={noop}
					interactive={false}
				/>
			}
		>
			<CostEstimatorWithUrlState />
		</Suspense>
	)
}
