/**
 * Admin Leads list page (server component).
 *
 * Most recent 200 leads, newest first, optionally filtered by `?status=`
 * round-trip from the `<StatusFilterBar>` chip row. Every row links to its
 * detail page where mutations live. There is no "New" button (leads are
 * inbound only -- CONTEXT.md §3), and there are no row-level mutation
 * affordances on the list (status changes happen on the detail page so
 * the operator can see attribution and notes before deciding).
 *
 * Wrapped in <Suspense> + `await connection()` so the DB read stays out
 * of any partial-prerender step in `next build` -- same pattern as the
 * dashboard and showcase list pages.
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
import { listLeadsForAdmin } from '@/lib/admin/leads-queries'
import { LEAD_STATUSES, type LeadStatus } from '@/lib/schemas/admin-leads'

export const metadata: Metadata = {
	title: 'Admin: Leads',
	robots: { index: false, follow: false }
}

const FILTER_OPTIONS: StatusFilterOption[] = [
	{ value: null, label: 'All' },
	...LEAD_STATUSES.map(s => ({
		value: s,
		label: s.charAt(0).toUpperCase() + s.slice(1)
	}))
]

interface AdminLeadsPageProps {
	searchParams: Promise<{ status?: string }>
}

async function LeadsList({ searchParams }: AdminLeadsPageProps) {
	await connection()
	const { status: rawStatus } = await searchParams
	const status: LeadStatus | null = (
		LEAD_STATUSES as readonly string[]
	).includes(rawStatus ?? '')
		? (rawStatus as LeadStatus)
		: null
	const rows = await listLeadsForAdmin(status, 200)

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold text-foreground">Leads</h1>
				<Link
					href="/admin/leads/calculator"
					className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-accent-text border border-border bg-surface-raised hover:bg-surface-base transition-smooth"
				>
					Calculator leads
				</Link>
			</div>
			<StatusFilterBar
				baseHref="/admin/leads"
				current={status}
				options={FILTER_OPTIONS}
			/>
			{rows.length === 0 ? (
				<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
					<p className="text-sm text-muted-foreground">No leads yet.</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border bg-surface-raised">
					<table className="w-full text-sm">
						<caption className="sr-only">Leads</caption>
						<thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-surface-base">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									Name
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Email
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Company
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Source
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Status
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
											href={`/admin/leads/${r.id}`}
											className="hover:underline"
										>
											{r.name ?? '(no name)'}
										</Link>
									</td>
									<td className="px-4 py-3 text-muted-foreground">{r.email}</td>
									<td className="px-4 py-3 text-muted-foreground">
										{r.company ?? '-'}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{r.source ?? '-'}
									</td>
									<td className="px-4 py-3">
										<StatusBadge status={r.status} />
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

export default function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
	return (
		<Suspense
			fallback={
				<div className="text-sm text-muted-foreground">Loading leads...</div>
			}
		>
			<LeadsList searchParams={searchParams} />
		</Suspense>
	)
}
