/**
 * Admin Calculator-Leads list page (server component).
 *
 * Phase 10 Wave 2: cursor-paginated + search-aware. The existing
 * `<StatusFilterBar>` chip row (keyed to `?status=` even though the DB
 * column is `leadQuality`) stays byte-equal and composes alongside the new
 * `<SearchInput>` (client, nuqs) and shadcn `<Pagination>` (server,
 * cursor-driven `<Link>`s built via `buildPaginationHref`).
 *
 * Param composition matrix (identical to /admin/leads -- see Plan 10-05):
 *  - `?status=` round-trips via `<StatusFilterBar>` chip submissions. The
 *    URL param remains `status` for backward compatibility with the Phase
 *    05 convention even though the helper key is `quality` (matches the
 *    `lead_quality` DB column).
 *  - `?q=` round-trips via the nuqs `<SearchInput>`. nuqs auto-preserves
 *    every other query param (including `status`) so `<SearchInput>` does
 *    NOT need a preservedParams prop.
 *  - `?cursor=` round-trips via the shadcn `<PaginationPrevious>` /
 *    `<PaginationNext>` `<Link>` hrefs; `preservedForPagination` carries
 *    both `status` (from `quality`) and `q` when each is active.
 *
 * Wrapped in <Suspense> + `await connection()` so the DB read stays out of
 * any partial-prerender step in `next build` (same pattern as Phase 04
 * admin pages).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
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
	CALCULATOR_LEAD_QUALITIES,
	type CalculatorLeadQuality,
	listCalculatorLeadsForAdmin
} from '@/lib/admin/calculator-leads-queries'
import { buildPaginationHref } from '@/lib/admin/list-cursor'

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
	searchParams: Promise<{ status?: string; q?: string; cursor?: string }>
}

async function CalculatorLeadsList({
	searchParams
}: AdminCalculatorLeadsPageProps) {
	await connection()
	const { status: rawStatus, q: rawQ, cursor } = await searchParams
	const quality: CalculatorLeadQuality | null = (
		CALCULATOR_LEAD_QUALITIES as readonly string[]
	).includes(rawStatus ?? '')
		? (rawStatus as CalculatorLeadQuality)
		: null
	const q = (rawQ ?? '').trim()
	const { rows, prevCursor, nextCursor } = await listCalculatorLeadsForAdmin({
		quality,
		q: q.length > 0 ? q : undefined,
		cursor
	})
	const preservedForPagination: Record<string, string> = {}
	if (quality) {
		preservedForPagination.status = quality
	}
	if (q) {
		preservedForPagination.q = q
	}
	const clearSearchHref = quality
		? `/admin/leads/calculator?status=${quality}`
		: '/admin/leads/calculator'

	return (
		<>
			<StatusFilterBar
				baseHref="/admin/leads/calculator"
				current={quality}
				options={FILTER_OPTIONS}
				legend="Filter by quality"
			/>
			<SearchInput placeholder="Search calculator leads" />
			{rows.length === 0 ? (
				q ? (
					<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
						<p className="text-sm text-muted-foreground">
							No calculator leads matching{' '}
							<span className="font-mono">{q}</span>.
						</p>
						<Link
							href={clearSearchHref}
							className="inline-block mt-3 text-sm font-medium text-accent-text hover:underline"
						>
							Clear search
						</Link>
					</div>
				) : (
					<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
						<p className="text-sm text-muted-foreground">
							No calculator submissions yet.
						</p>
					</div>
				)
			) : (
				<>
					<Table>
						<TableCaption className="sr-only">
							Calculator lead submissions
						</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead>Email</TableHead>
								<TableHead>Calculator</TableHead>
								<TableHead>Quality</TableHead>
								<TableHead>Contacted</TableHead>
								<TableHead>Converted</TableHead>
								<TableHead>Created</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map(r => (
								<TableRow key={r.id}>
									<TableCell className="text-foreground">
										<Link
											href={`/admin/leads/calculator/${r.id}`}
											className="hover:underline"
										>
											{r.email}
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.calculatorType}
									</TableCell>
									<TableCell>
										<StatusBadge status={r.leadQuality} />
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.contacted ? 'Yes' : 'No'}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.converted ? `Yes ($${r.conversionValue ?? '0'})` : 'No'}
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
											'/admin/leads/calculator',
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
											'/admin/leads/calculator',
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

export default function AdminCalculatorLeadsPage({
	searchParams
}: AdminCalculatorLeadsPageProps) {
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
			<Suspense
				fallback={
					<div className="text-sm text-muted-foreground">
						Loading calculator leads...
					</div>
				}
			>
				<CalculatorLeadsList searchParams={searchParams} />
			</Suspense>
		</div>
	)
}
