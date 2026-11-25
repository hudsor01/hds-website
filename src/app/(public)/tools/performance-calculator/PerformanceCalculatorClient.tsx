/**
 * Site Speed Revenue Calculator
 * Shows the real PageSpeed score and lab metrics for a URL, then a revenue
 * scenario built on a conversion lift the visitor chooses
 */

'use client'

import { ArrowLeft, Check, Info, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import { CalculatorResults } from '@/components/calculators/CalculatorResults'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { Card } from '@/components/ui/card'
import { trackEvent } from '@/lib/analytics'
import { logger } from '@/lib/logger'
import {
	DEFAULT_LIFT_PERCENT,
	formatLabValue,
	indefiniteArticle,
	isGoodLabValue,
	LAB_METRICS,
	revenueScenario,
	SCORE_BAND_RANGE,
	scoreBand
} from '@/lib/performance-calculator'
import {
	formatRoiMoney,
	MAX_MONTHLY_TRAFFIC,
	MAX_ORDER_VALUE,
	ORDER_VALUE_MAX_ERROR,
	TRAFFIC_MAX_ERROR
} from '@/lib/roi-calculator'
import {
	apiErrorSchema,
	type PagespeedMetrics,
	pagespeedSuccessSchema
} from '@/lib/schemas/pagespeed'

interface AnalyzedSite {
	url: string
	metrics: PagespeedMetrics
}

interface RawInputs {
	websiteUrl: string
	monthlyVisitors: string
	averageOrderValue: string
	currentConversionRate: string
	liftPercent: string
}

const DELOITTE_URL = 'https://web.dev/case-studies/milliseconds-make-millions'
const PORTENT_URL =
	'https://www.portent.com/blog/analytics/research-site-speed-hurting-everyones-revenue.htm'
const GENERIC_ERROR =
	'Something went wrong while analyzing that URL. Try again in a few minutes.'

const OPTIMIZATION_TIPS = [
	{
		title: 'Image Optimization',
		desc: 'WebP format, lazy loading, responsive images'
	},
	{
		title: 'Code Splitting',
		desc: "Load only what's needed, when it's needed"
	},
	{
		title: 'CDN Deployment',
		desc: 'Global edge network for faster delivery'
	},
	{
		title: 'Caching Strategy',
		desc: 'Smart caching to minimize server requests'
	},
	{
		title: 'Critical CSS',
		desc: 'Inline critical styles for faster rendering'
	},
	{
		title: 'Minification',
		desc: 'Compressed code for smaller file sizes'
	}
] as const

/** Empty or invalid input reads as null so the field can be cleared. */
function parseNumber(raw: string, max?: number): number | null {
	if (raw.trim() === '') {
		return null
	}
	const value = Number(raw)
	if (!Number.isFinite(value) || value < 0) {
		return null
	}
	if (max !== undefined && value > max) {
		return null
	}
	return value
}

/** The error for a filled-in number above its maximum, if any. */
function maxError(
	raw: string,
	max: number,
	message: string
): string | undefined {
	const value = Number(raw)
	return raw.trim() !== '' && Number.isFinite(value) && value > max
		? message
		: undefined
}

function formatPercent(value: number): string {
	return `${Number(value.toFixed(2))}%`
}

async function readErrorMessage(response: Response): Promise<string> {
	try {
		const parsed = apiErrorSchema.safeParse(await response.json())
		return parsed.success ? parsed.data.error : GENERIC_ERROR
	} catch {
		return GENERIC_ERROR
	}
}

export default function PerformanceCalculatorClient() {
	const [inputs, setInputs] = useState<RawInputs>({
		websiteUrl: '',
		monthlyVisitors: '',
		averageOrderValue: '',
		currentConversionRate: '',
		liftPercent: String(DEFAULT_LIFT_PERCENT)
	})
	const [analyzed, setAnalyzed] = useState<AnalyzedSite | null>(null)
	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const [error, setError] = useState('')

	const setField = (field: keyof RawInputs, value: string) =>
		setInputs(prev => ({ ...prev, [field]: value }))

	const monthlyVisitors = parseNumber(
		inputs.monthlyVisitors,
		MAX_MONTHLY_TRAFFIC
	)
	const averageOrderValue = parseNumber(
		inputs.averageOrderValue,
		MAX_ORDER_VALUE
	)
	const visitorsError = maxError(
		inputs.monthlyVisitors,
		MAX_MONTHLY_TRAFFIC,
		TRAFFIC_MAX_ERROR
	)
	const orderValueError = maxError(
		inputs.averageOrderValue,
		MAX_ORDER_VALUE,
		ORDER_VALUE_MAX_ERROR
	)
	const conversionRate = parseNumber(inputs.currentConversionRate, 100)
	const liftPercent = parseNumber(inputs.liftPercent, 100)

	// Derived during render so the numbers always match the current inputs.
	const scenario =
		monthlyVisitors !== null &&
		averageOrderValue !== null &&
		conversionRate !== null &&
		liftPercent !== null
			? revenueScenario({
					monthlyVisitors,
					conversionRatePercent: conversionRate,
					averageOrderValue,
					liftPercent
				})
			: null

	const analyzeWebsite = async () => {
		const url = inputs.websiteUrl.trim()
		setIsAnalyzing(true)
		setError('')
		setAnalyzed(null)

		try {
			const response = await fetch(
				`/api/pagespeed?url=${encodeURIComponent(url)}`
			)

			if (!response.ok) {
				setError(await readErrorMessage(response))
				return
			}

			const parsed = pagespeedSuccessSchema.safeParse(await response.json())
			if (!parsed.success) {
				logger.error('Unexpected /api/pagespeed response', parsed.error)
				setError(GENERIC_ERROR)
				return
			}

			const { metrics } = parsed.data.data
			setAnalyzed({ url, metrics })
			trackEvent('calculator_used', {
				calculator_type: 'performance-calculator',
				website_url: url,
				performance_score: metrics.performanceScore
			})
		} catch (err) {
			setError(GENERIC_ERROR)
			logger.error('Performance analysis error', err)
		} finally {
			setIsAnalyzing(false)
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		analyzeWebsite()
	}

	const score = analyzed?.metrics.performanceScore ?? null
	const band = score === null ? null : scoreBand(score)
	const scenarioLift = liftPercent ?? 0
	const scenarioLabel = `Scenario: revenue at ${indefiniteArticle(scenarioLift)} ${formatPercent(scenarioLift)} higher conversion rate`

	const resultItems =
		analyzed && band && score !== null
			? [
					{
						label: 'PageSpeed performance score',
						value: `${score}/100`,
						description: `${band} (${SCORE_BAND_RANGE[band]} on Lighthouse's scale). Mobile lab score from one run; it can move a few points between runs.`,
						highlight: band !== 'Good'
					},
					...(scenario
						? [
								{
									label: 'Current monthly revenue from these inputs',
									value: formatRoiMoney(scenario.monthlyRevenue),
									description:
										'Monthly visitors x conversion rate x average order value.'
								},
								{
									label: scenarioLabel,
									value: `+${formatRoiMoney(scenario.monthlyGain)}/mo`,
									description: `${formatRoiMoney(scenario.annualGain)} a year. Your conversion rate goes from ${formatPercent(conversionRate ?? 0)} to ${formatPercent(scenario.scenarioConversionRatePercent)}${scenario.capped ? ' (capped at 100%)' : ''}. A what-if built on the lift you entered, not a prediction.`,
									highlight: true
								}
							]
						: [])
				]
			: []

	const handleCopy = async () => {
		if (!analyzed || score === null || !band) {
			return
		}
		const lines = [
			`Site: ${analyzed.url}`,
			`PageSpeed performance score (mobile, one run): ${score}/100 (${band})`,
			...LAB_METRICS.map(
				guide =>
					`${guide.abbr}: ${formatLabValue(guide, analyzed.metrics[guide.key])} (good: ${guide.goodLabel})`
			),
			...(scenario
				? [
						`Current monthly revenue from these inputs: ${formatRoiMoney(scenario.monthlyRevenue)}`,
						`${scenarioLabel}: +${formatRoiMoney(scenario.monthlyGain)}/mo, ${formatRoiMoney(scenario.annualGain)}/yr (a scenario, not a prediction)`
					]
				: [])
		]
		try {
			await navigator.clipboard.writeText(lines.join('\n'))
			toast.success('Report copied')
		} catch (err) {
			logger.error('Copy report failed', err)
			toast.error(
				'Could not copy the report. Select the text and copy it instead.'
			)
		}
	}

	const formSlot = (
		<div className="space-y-comfortable">
			<form onSubmit={handleSubmit} className="space-y-comfortable">
				<CalculatorInput
					label="Website URL"
					id="websiteUrl"
					type="url"
					placeholder="https://example.com"
					value={inputs.websiteUrl}
					onChange={e => setField('websiteUrl', e.target.value)}
					helpText="Enter your website URL to run a mobile PageSpeed test"
					required
				/>

				<div className="grid gap-comfortable md:grid-cols-2">
					<CalculatorInput
						label="Monthly Visitors"
						id="monthlyVisitors"
						type="number"
						inputMode="numeric"
						min="0"
						max={MAX_MONTHLY_TRAFFIC}
						step="1"
						value={inputs.monthlyVisitors}
						onChange={e => setField('monthlyVisitors', e.target.value)}
						helpText="Average monthly website visitors"
						error={visitorsError}
						required
					/>

					<CalculatorInput
						label="Average Order Value"
						id="averageOrderValue"
						type="number"
						inputMode="decimal"
						min="0"
						max={MAX_ORDER_VALUE}
						step="0.01"
						prefix="$"
						value={inputs.averageOrderValue}
						onChange={e => setField('averageOrderValue', e.target.value)}
						helpText="Average value per conversion"
						error={orderValueError}
						required
					/>

					<CalculatorInput
						label="Current Conversion Rate"
						id="currentConversionRate"
						type="number"
						inputMode="decimal"
						min="0"
						max="100"
						step="0.1"
						suffix="%"
						value={inputs.currentConversionRate}
						onChange={e => setField('currentConversionRate', e.target.value)}
						helpText="Percentage of visitors who convert"
						required
					/>

					<CalculatorInput
						label="Expected conversion lift if the site gets fast"
						id="liftPercent"
						type="number"
						inputMode="decimal"
						min="0"
						max="100"
						step="0.1"
						suffix="%"
						value={inputs.liftPercent}
						onChange={e => setField('liftPercent', e.target.value)}
						helpText="Relative lift, your assumption. The default is explained below."
						required
					/>
				</div>

				{error && (
					<Card size="sm" className="bg-destructive-light" role="alert">
						<p className="text-sm text-destructive-text">{error}</p>
					</Card>
				)}

				<button
					type="submit"
					disabled={isAnalyzing}
					className="w-full rounded-md bg-accent px-6 py-3 text-base font-semibold text-accent-foreground shadow-xs hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isAnalyzing ? (
						<span className="flex items-center justify-center">
							<Loader2
								className="-ml-1 mr-3 h-5 w-5 animate-spin"
								aria-hidden="true"
							/>
							Analyzing Website...
						</span>
					) : (
						'Analyze Performance'
					)}
				</button>

				<p aria-live="polite" className="text-sm text-muted-foreground">
					{isAnalyzing
						? 'Google is running a full mobile Lighthouse test. This takes 15 to 60 seconds.'
						: ''}
				</p>

				<Card size="sm" className="bg-info-light">
					<div className="flex">
						<div className="shrink-0">
							<Info className="h-5 w-5 text-info-text" aria-hidden="true" />
						</div>
						<div className="ml-3 space-y-2 text-sm text-info-text">
							<p>
								<strong>Where the default lift comes from:</strong> in
								Deloitte&apos;s{' '}
								<a
									href={DELOITTE_URL}
									target="_blank"
									rel="noopener noreferrer"
									className="underline"
								>
									Milliseconds Make Millions
								</a>{' '}
								study of 37 brand sites, commissioned by Google, a 0.1 second
								improvement in mobile site speed was associated with an 8.4%
								increase in retail conversions and 10.1% in travel. That is a
								correlation from one study, so treat {DEFAULT_LIFT_PERCENT}% as
								a starting point and change it.
							</p>
							<p>
								Portent&apos;s{' '}
								<a
									href={PORTENT_URL}
									target="_blank"
									rel="noopener noreferrer"
									className="underline"
								>
									2022 site speed study
								</a>{' '}
								found the highest e-commerce conversion rates between 1 and 2
								seconds of load time.
							</p>
						</div>
					</div>
				</Card>
			</form>

			{/* Performance Tips */}
			<div className="space-y-content border-t border-border pt-8">
				<h2 className="text-lg font-semibold text-foreground">
					How I Optimize Performance
				</h2>

				<div className="space-y-3">
					{OPTIMIZATION_TIPS.map(tip => (
						<div
							key={tip.title}
							className="flex items-start gap-3 rounded-lg border border-border p-3"
						>
							<Check
								className="h-5 w-5 shrink-0 text-accent"
								aria-hidden="true"
							/>
							<div>
								<div className="font-medium text-foreground">{tip.title}</div>
								<div className="text-sm text-muted-foreground">{tip.desc}</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)

	const resultSlot = analyzed ? (
		<div>
			<Card className="mb-content-block bg-muted">
				<h3 className="mb-heading text-lg font-semibold text-foreground">
					Lab metrics (mobile, one run)
				</h3>
				<p className="mb-subheading text-xs text-muted-foreground">
					Core Web Vitals are LCP, INP and CLS. INP needs real visitors, so a
					lab run shows TBT in its place.
				</p>
				<dl className="grid gap-content sm:grid-cols-2">
					{LAB_METRICS.map(guide => {
						const metric = analyzed.metrics[guide.key]
						const good = isGoodLabValue(guide, metric.numericValue)
						return (
							<div key={guide.key} className="text-center">
								<dt className="text-sm text-muted-foreground">
									{guide.abbr} <span className="text-xs">({guide.name})</span>
								</dt>
								<dd className="text-xl font-bold text-foreground">
									{formatLabValue(guide, metric)}
								</dd>
								<dd className="text-xs text-muted-foreground">
									Good: {guide.goodLabel}
									{good === null ? '' : good ? ' (met)' : ' (not met)'}
								</dd>
								{guide.note && (
									<dd className="text-xs text-muted-foreground">
										{guide.note}
									</dd>
								)}
							</div>
						)
					})}
				</dl>
			</Card>

			<CalculatorResults
				results={resultItems}
				calculatorType="performance-calculator"
				inputs={{
					websiteUrl: analyzed.url,
					monthlyVisitors,
					averageOrderValue,
					currentConversionRate: conversionRate,
					expectedLiftPercent: liftPercent,
					performanceScore: analyzed.metrics.performanceScore
				}}
			/>

			<button
				type="button"
				onClick={() => {
					setAnalyzed(null)
					setError('')
				}}
				className="mt-content-block flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface-raised px-6 py-3 text-base font-semibold text-muted-foreground shadow-xs hover:bg-muted"
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Analyze Another Site
			</button>
		</div>
	) : undefined

	return (
		<ToolPageLayout
			title="Site Speed Revenue Calculator"
			description="Run a real mobile PageSpeed test on your site, then see what a conversion lift you choose would be worth in revenue. A scenario, not a prediction."
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={analyzed !== null}
			resultPlaceholder="Enter your website URL and click Analyze to see results"
			actions={
				analyzed
					? [{ type: 'copy', label: 'Copy Report', onClick: handleCopy }]
					: undefined
			}
		/>
	)
}
