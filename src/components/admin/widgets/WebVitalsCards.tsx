/**
 * WebVitalsCards
 * Server component. Six KPI cards for Core Web Vitals (CLS, FCP, FID, INP,
 * LCP, TTFB) showing p75 over the last 7 days plus the sample count.
 * Each value is color-coded by the canonical CWV threshold rules (same
 * thresholds the /api/web-vitals route uses to assign a rating on ingest).
 */
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import type { AdminQueryResult } from '@/lib/admin/query-result'

type WebVitalsCardsProps = {
	result: AdminQueryResult<
		Array<{ name: string; p75: number; sampleCount: number }>
	>
}

type Rating = 'good' | 'needs-improvement' | 'poor'

const WEB_VITALS_ORDER = ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'] as const

const WEB_VITALS_UNITS: Record<string, string> = {
	CLS: '',
	FCP: 'ms',
	FID: 'ms',
	INP: 'ms',
	LCP: 'ms',
	TTFB: 'ms'
}

const WEB_VITALS_THRESHOLDS: Record<
	string,
	{ good: number; needsImprovement: number }
> = {
	CLS: { good: 0.1, needsImprovement: 0.25 },
	FCP: { good: 1800, needsImprovement: 3000 },
	FID: { good: 100, needsImprovement: 300 },
	INP: { good: 200, needsImprovement: 500 },
	LCP: { good: 2500, needsImprovement: 4000 },
	TTFB: { good: 800, needsImprovement: 1800 }
}

function classifyVital(name: string, value: number): Rating {
	const thresholds = WEB_VITALS_THRESHOLDS[name]
	if (!thresholds) {
		return 'poor'
	}
	if (value <= thresholds.good) {
		return 'good'
	}
	if (value <= thresholds.needsImprovement) {
		return 'needs-improvement'
	}
	return 'poor'
}

function ratingClass(rating: Rating): string {
	if (rating === 'good') {
		return 'text-success-text'
	}
	if (rating === 'needs-improvement') {
		return 'text-warning-text'
	}
	return 'text-destructive-text'
}

export function WebVitalsCards({ result }: WebVitalsCardsProps) {
	if (!result.ok) {
		return (
			<div className="rounded-xl border border-border bg-surface-raised p-6">
				<h2 className="text-sm font-semibold text-foreground mb-4">
					Web Vitals (last 7 days)
				</h2>
				<AdminErrorState inline resource="web vitals" />
			</div>
		)
	}

	const rows = result.data

	return (
		<div className="rounded-xl border border-border bg-surface-raised p-6">
			<h2 className="text-sm font-semibold text-foreground mb-4">
				Web Vitals (last 7 days)
			</h2>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
				{WEB_VITALS_ORDER.map(name => {
					const row = rows.find(r => r.name === name)
					const unit = WEB_VITALS_UNITS[name]
					return (
						<div
							key={name}
							className="rounded-lg border border-border-subtle bg-surface-base p-4"
						>
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
								{name}
							</p>
							{row ? (
								<p
									className={`text-2xl font-semibold mt-1 ${ratingClass(classifyVital(name, row.p75))}`}
								>
									{name === 'CLS' ? row.p75.toFixed(2) : Math.round(row.p75)}
									<span className="text-sm font-normal text-muted-foreground ml-1">
										{unit}
									</span>
								</p>
							) : (
								<p className="text-2xl font-semibold text-muted-foreground mt-1">
									--
								</p>
							)}
							<p className="text-xs text-muted-foreground mt-2">
								n = {row?.sampleCount?.toLocaleString() ?? 0}
							</p>
						</div>
					)
				})}
			</div>
		</div>
	)
}
