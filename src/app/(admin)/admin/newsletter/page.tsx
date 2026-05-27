/**
 * Admin Newsletter list page (server component).
 *
 * Phase 10 Wave 2: cursor-paginated + search-aware. The existing
 * `<StatusFilterBar>` chip row stays byte-equal and composes alongside the
 * new `<SearchInput>` (client, nuqs) and shadcn `<Pagination>` (server,
 * cursor-driven `<Link>`s built via `buildPaginationHref`).
 *
 * Param composition matrix (matches Plan 10-05 / /admin/leads):
 *  - `?status=` round-trips via `<StatusFilterBar>` chip submissions (single
 *    button per chip; the "All" chip drops the param entirely).
 *  - `?q=` round-trips via the nuqs `<SearchInput>`. nuqs auto-preserves
 *    every other query param (including `status`) so `<SearchInput>` does
 *    NOT need a preservedParams prop.
 *  - `?cursor=` round-trips via the shadcn `<PaginationPrevious>` /
 *    `<PaginationNext>` `<Link>` hrefs; `preservedForPagination` carries
 *    both `status` and `q` when each is active.
 *
 * Wrapped in <Suspense> + `await connection()` so the DB read stays out
 * of any partial prerender step in `next build` (same pattern as the
 * showcase list page).
 *
 * No "New" button: newsletter subscribers are inbound only (created by
 * `/api/newsletter` from the public signup form). The operator never
 * authors a row from this page.
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
import { buildPaginationHref } from '@/lib/admin/list-cursor'
import {
	listSubscribersForAdmin,
	SUBSCRIBER_STATUSES,
	type SubscriberStatus
} from '@/lib/admin/newsletter-queries'

export const metadata: Metadata = {
	title: 'Admin: Newsletter',
	robots: { index: false, follow: false }
}

const FILTER_OPTIONS: StatusFilterOption[] = [
	{ value: null, label: 'All' },
	...SUBSCRIBER_STATUSES.map(s => ({
		value: s,
		label: s.charAt(0).toUpperCase() + s.slice(1)
	}))
]

interface AdminNewsletterPageProps {
	searchParams: Promise<{ status?: string; q?: string; cursor?: string }>
}

async function NewsletterList({ searchParams }: AdminNewsletterPageProps) {
	await connection()
	const { status: rawStatus, q: rawQ, cursor } = await searchParams
	const status: SubscriberStatus | null = (
		SUBSCRIBER_STATUSES as readonly string[]
	).includes(rawStatus ?? '')
		? (rawStatus as SubscriberStatus)
		: null
	const q = (rawQ ?? '').trim()
	const { rows, prevCursor, nextCursor } = await listSubscribersForAdmin({
		status,
		q: q.length > 0 ? q : undefined,
		cursor
	})
	const preservedForPagination: Record<string, string> = {}
	if (status) {
		preservedForPagination.status = status
	}
	if (q) {
		preservedForPagination.q = q
	}
	const clearSearchHref = status
		? `/admin/newsletter?status=${status}`
		: '/admin/newsletter'

	return (
		<>
			<StatusFilterBar
				baseHref="/admin/newsletter"
				current={status}
				options={FILTER_OPTIONS}
			/>
			<SearchInput placeholder="Search subscribers" />
			{rows.length === 0 ? (
				q ? (
					<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
						<p className="text-sm text-muted-foreground">
							No subscribers matching <span className="font-mono">{q}</span>.
						</p>
						<Link
							href={clearSearchHref}
							className="inline-block mt-3 text-sm font-medium text-accent-text hover:underline"
						>
							Clear search
						</Link>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">No subscribers yet.</p>
				)
			) : (
				<>
					<Table>
						<TableCaption className="sr-only">
							Newsletter subscribers
						</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead>Email</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Source</TableHead>
								<TableHead>Subscribed</TableHead>
								<TableHead>Unsubscribed</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map(r => (
								<TableRow key={r.id}>
									<TableCell className="text-foreground">
										<Link
											href={`/admin/newsletter/${r.id}`}
											className="hover:underline"
										>
											{r.email}
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.name ?? '-'}
									</TableCell>
									<TableCell>
										<StatusBadge status={r.status} />
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.source ?? '-'}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.subscribedAt?.toLocaleDateString('en-US') ?? '-'}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.unsubscribedAt?.toLocaleDateString('en-US') ?? '-'}
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
											'/admin/newsletter',
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
											'/admin/newsletter',
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

export default function AdminNewsletterPage({
	searchParams
}: AdminNewsletterPageProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold text-foreground">Newsletter</h1>
			</div>
			<Suspense
				fallback={
					<div className="text-sm text-muted-foreground">
						Loading subscribers...
					</div>
				}
			>
				<NewsletterList searchParams={searchParams} />
			</Suspense>
		</div>
	)
}
