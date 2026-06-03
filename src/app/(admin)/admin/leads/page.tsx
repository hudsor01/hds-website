/**
 * Admin Leads list page (server component).
 *
 * Phase 10 Wave 2: cursor-paginated + search-aware. The existing
 * `<StatusFilterBar>` chip row stays byte-equal and composes alongside the
 * new `<SearchInput>` (client, nuqs) and shadcn `<Pagination>` (server,
 * cursor-driven `<Link>`s built via `buildPaginationHref`).
 *
 * Param composition matrix:
 *  - `?status=` round-trips via `<StatusFilterBar>` chip submissions (single
 *    button per chip; the "All" chip drops the param entirely).
 *  - `?q=` round-trips via the nuqs `<SearchInput>`. nuqs auto-preserves
 *    every other query param (including `status`) so `<SearchInput>` does
 *    NOT need a preservedParams prop.
 *  - `?cursor=` round-trips via the shadcn `<PaginationPrevious>` /
 *    `<PaginationNext>` `<Link>` hrefs; `preservedForPagination` carries
 *    both `status` and `q` when each is active.
 *  - Switching status via the chip row deliberately drops `q` and `cursor`
 *    (StatusFilterBar's submit is a plain GET with no hidden inputs); that
 *    matches CONTEXT.md §4 "Search + filter + cursor compose": status is the
 *    coarsest filter and resets the page.
 *
 * Every row links to its detail page where mutations live. There is no
 * "New" button (leads are inbound only -- CONTEXT.md §3), and no row-level
 * mutation affordances on the list.
 *
 * Wrapped in <Suspense> + `await connection()` so the DB read stays out
 * of any partial-prerender step in `next build` -- same pattern as the
 * dashboard and showcase list pages.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import { SearchInput } from '@/components/admin/SearchInput'
import { StatusBadge } from '@/components/admin/StatusBadge'
import {
	StatusFilterBar,
	type StatusFilterOption
} from '@/components/admin/StatusFilterBar'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import {
	getLeadsRevenueSummary,
	listLeadsForAdmin
} from '@/lib/admin/leads-queries'
import { buildPaginationHref } from '@/lib/admin/list-cursor'
import { LEAD_STATUSES, type LeadStatus } from '@/lib/schemas/admin-leads'
import { formatCurrency } from '@/lib/utils'

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
	searchParams: Promise<{ status?: string; q?: string; cursor?: string }>
}

/**
 * Revenue rollup of won leads: total closed value + the ad-attributed subset
 * (won leads carrying a Google click id) -- the "did the ad generate revenue"
 * number. Renders nothing until at least one lead is marked won.
 */
async function RevenueSummary() {
	await connection()
	const s = await getLeadsRevenueSummary()
	if (s.wonCount === 0) {
		return null
	}
	const cards: { label: string; value: string }[] = [
		{ label: 'Won leads', value: String(s.wonCount) },
		{ label: 'Total revenue', value: formatCurrency(s.totalValue) },
		{ label: 'Ad-attributed leads', value: String(s.adAttributedCount) },
		{
			label: 'Ad-attributed revenue',
			value: formatCurrency(s.adAttributedValue)
		}
	]
	return (
		<dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{cards.map(c => (
				<div
					key={c.label}
					className="rounded-xl border border-border bg-surface-raised p-4"
				>
					<dt className="text-xs uppercase tracking-wider text-muted-foreground">
						{c.label}
					</dt>
					<dd className="mt-1 text-xl font-semibold text-foreground">
						{c.value}
					</dd>
				</div>
			))}
		</dl>
	)
}

async function LeadsList({ searchParams }: AdminLeadsPageProps) {
	await connection()
	const { status: rawStatus, q: rawQ, cursor } = await searchParams
	const status: LeadStatus | null = (
		LEAD_STATUSES as readonly string[]
	).includes(rawStatus ?? '')
		? (rawStatus as LeadStatus)
		: null
	const q = (rawQ ?? '').trim()
	const result = await listLeadsForAdmin({
		status,
		q: q.length > 0 ? q : undefined,
		cursor
	})
	if (!result.ok) {
		return <AdminErrorState resource="leads" />
	}
	const { rows, prevCursor, nextCursor } = result.data
	const preservedForPagination: Record<string, string> = {}
	if (status) {
		preservedForPagination.status = status
	}
	if (q) {
		preservedForPagination.q = q
	}

	return (
		<>
			<StatusFilterBar
				baseHref="/admin/leads"
				current={status}
				options={FILTER_OPTIONS}
			/>
			<SearchInput placeholder="Search leads" />
			{rows.length === 0 ? (
				q ? (
					<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
						<p className="text-sm text-muted-foreground">
							No leads matching <span className="font-mono">{q}</span>.
						</p>
						<Link
							href={status ? `/admin/leads?status=${status}` : '/admin/leads'}
							className="inline-block mt-3 text-sm font-medium text-accent-text hover:underline"
						>
							Clear search
						</Link>
					</div>
				) : (
					<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
						<p className="text-sm text-muted-foreground">No leads yet.</p>
					</div>
				)
			) : (
				<>
					<Table>
						<TableCaption className="sr-only">Leads</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Company</TableHead>
								<TableHead>Source</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map(r => (
								<TableRow key={r.id}>
									<TableCell className="text-foreground">
										<Link
											href={`/admin/leads/${r.id}`}
											className="hover:underline"
										>
											{r.name ?? '(no name)'}
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.email}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.company ?? '-'}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.source ?? '-'}
									</TableCell>
									<TableCell>
										<StatusBadge status={r.status} />
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.createdAt
											? r.createdAt.toLocaleDateString('en-US')
											: '-'}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<Pagination className="mt-4 justify-between">
						<PaginationContent>
							<PaginationItem>
								{prevCursor === null ? (
									<PaginationPrevious
										aria-disabled="true"
										className="pointer-events-none opacity-50"
									/>
								) : (
									<PaginationPrevious
										href={buildPaginationHref(
											'/admin/leads',
											prevCursor,
											preservedForPagination
										)}
									/>
								)}
							</PaginationItem>
							<PaginationItem>
								{nextCursor === null ? (
									<PaginationNext
										aria-disabled="true"
										className="pointer-events-none opacity-50"
									/>
								) : (
									<PaginationNext
										href={buildPaginationHref(
											'/admin/leads',
											nextCursor,
											preservedForPagination
										)}
									/>
								)}
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</>
			)}
		</>
	)
}

export default function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
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
			<Suspense fallback={null}>
				<RevenueSummary />
			</Suspense>
			<Suspense
				fallback={
					<div className="text-sm text-muted-foreground">Loading leads...</div>
				}
			>
				<LeadsList searchParams={searchParams} />
			</Suspense>
		</div>
	)
}
