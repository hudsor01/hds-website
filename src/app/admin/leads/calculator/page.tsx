/**
 * Admin Calculator-Leads list page (server component).
 *
 * Renders the most recent 200 calculator submissions sorted by `createdAt
 * DESC`. The status filter chip row maps to the `lead_quality` column via
 * the shared `StatusFilterBar` primitive (URL param is `status` by
 * convention even though the DB column is `leadQuality`; documented at the
 * `searchParams` declaration below).
 *
 * Wrapped in <Suspense> + `await connection()` so the DB read stays out of
 * any partial-prerender step in `next build` (same pattern as Phase 04
 * admin pages).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import {
	StatusFilterBar,
	type StatusFilterOption
} from '@/components/admin/StatusFilterBar'
import {
	CALCULATOR_LEAD_QUALITIES,
	type CalculatorLeadQuality,
	listCalculatorLeadsForAdmin
} from '@/lib/admin/calculator-leads-queries'

export const metadata: Metadata = {
	title: 'Admin: Calculator leads',
	robots: { index: false, follow: false }
}

const FILTER_OPTIONS: StatusFilterOption[] = [
	{ value: null, label: 'All' },
	...CALCULATOR_LEAD_QUALITIES.map(q => ({
		value: q,
		label: q.charAt(0).toUpperCase() + q.slice(1)
	}))
]

interface AdminCalculatorLeadsPageProps {
	// URL param is `status` (StatusFilterBar convention) but the underlying DB
	// column is `leadQuality`. Normalized below into a typed quality value.
	searchParams: Promise<{ status?: string }>
}

async function CalculatorLeadsList({
	searchParams
}: AdminCalculatorLeadsPageProps) {
	await connection()
	const { status: rawStatus } = await searchParams
	const quality: CalculatorLeadQuality | null = (
		CALCULATOR_LEAD_QUALITIES as readonly string[]
	).includes(rawStatus ?? '')
		? (rawStatus as CalculatorLeadQuality)
		: null
	const rows = await listCalculatorLeadsForAdmin(quality, 200)
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<Link
						href="/admin/leads"
						className="text-sm text-accent-text hover:underline"
					>
						Back to leads
					</Link>
					<h1 className="text-2xl font-semibold text-foreground mt-2">
						Calculator leads
					</h1>
				</div>
			</div>
			<StatusFilterBar
				baseHref="/admin/leads/calculator"
				current={quality}
				options={FILTER_OPTIONS}
				legend="Filter by quality"
			/>
			{rows.length === 0 ? (
				<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
					<p className="text-sm text-muted-foreground">
						No calculator submissions yet.
					</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border bg-surface-raised">
					<table className="w-full text-sm">
						<caption className="sr-only">Calculator lead submissions</caption>
						<thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-surface-base">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									Email
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Calculator
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Quality
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Contacted
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Converted
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Created
								</th>
							</tr>
						</thead>
						<tbody>
							{rows.map(r => (
								<tr key={r.id} className="border-t border-border">
									<td className="px-4 py-3 text-foreground">
										<Link
											href={`/admin/leads/calculator/${r.id}`}
											className="hover:underline"
										>
											{r.email}
										</Link>
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{r.calculatorType}
									</td>
									<td className="px-4 py-3">
										<StatusBadge status={r.leadQuality} />
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{r.contacted ? 'Yes' : 'No'}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{r.converted ? `Yes ($${r.conversionValue ?? '0'})` : 'No'}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{r.createdAt
											? r.createdAt.toLocaleDateString('en-US')
											: '-'}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

export default function AdminCalculatorLeadsPage({
	searchParams
}: AdminCalculatorLeadsPageProps) {
	return (
		<Suspense
			fallback={
				<div className="text-sm text-muted-foreground">
					Loading calculator leads...
				</div>
			}
		>
			<CalculatorLeadsList searchParams={searchParams} />
		</Suspense>
	)
}
