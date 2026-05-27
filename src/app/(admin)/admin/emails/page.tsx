/**
 * Admin Scheduled-Emails list page (server component).
 *
 * Phase 10 Wave 2: cursor-paginated + search-aware. The existing 4
 * queue-health stat cards stay UNFILTERED -- `getQueueCounts()` is called
 * WITHOUT arguments inside `Promise.all` so the cards always reflect the
 * full queue state regardless of the active `?status=` / `?q=` / `?cursor=`
 * params. The existing `<StatusFilterBar>` chip row stays byte-equal and
 * composes alongside the new `<SearchInput>` (client, nuqs) and shadcn
 * `<Pagination>` (server, cursor-driven `<Link>`s built via
 * `buildPaginationHref`).
 *
 * Param composition matrix (matches Plan 10-05 / 10-06 / 10-07):
 *  - `?status=` round-trips via `<StatusFilterBar>` chip submissions (single
 *    button per chip; the "All" chip drops the param entirely).
 *  - `?q=` round-trips via the nuqs `<SearchInput>`. nuqs auto-preserves
 *    every other query param (including `status`) so `<SearchInput>` does
 *    NOT need a preservedParams prop.
 *  - `?cursor=` round-trips via the shadcn `<PaginationPrevious>` /
 *    `<PaginationNext>` `<Link>` hrefs; `preservedForPagination` carries
 *    both `status` and `q` when each is active.
 *  - Switching status via the chip row deliberately drops `q` and `cursor`
 *    (StatusFilterBar's submit is a plain GET with no hidden inputs); the
 *    stat cards above the bar are unaffected because they are derived from
 *    the unfiltered `getQueueCounts()` call.
 *
 * Wrapped in <Suspense> + `await connection()` so the DB read stays out
 * of any partial-prerender step in `next build` -- same pattern as the
 * other admin list pages.
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
	EMAIL_STATUSES,
	type EmailStatus,
	getQueueCounts,
	listScheduledEmailsForAdmin
} from '@/lib/admin/emails-queries'
import { buildPaginationHref } from '@/lib/admin/list-cursor'

export const metadata: Metadata = {
	title: 'Admin: Emails',
	robots: { index: false, follow: false }
}

interface AdminEmailsPageProps {
	searchParams: Promise<{ status?: string; q?: string; cursor?: string }>
}

async function EmailsList({ searchParams }: AdminEmailsPageProps) {
	await connection()
	const { status: rawStatus, q: rawQ, cursor } = await searchParams
	const status: EmailStatus | null = (
		EMAIL_STATUSES as readonly string[]
	).includes(rawStatus ?? '')
		? (rawStatus as EmailStatus)
		: null
	const q = (rawQ ?? '').trim()

	// CRITICAL: getQueueCounts() is called with NO arguments. The 4 stat
	// cards reflect the FULL queue regardless of the active status / q /
	// cursor filters. Only the paginated list helper sees the filters.
	const [counts, { rows, prevCursor, nextCursor }] = await Promise.all([
		getQueueCounts(),
		listScheduledEmailsForAdmin({
			status,
			q: q.length > 0 ? q : undefined,
			cursor
		})
	])

	const filterOptions: StatusFilterOption[] = [
		{ value: null, label: 'All' },
		...EMAIL_STATUSES.map(s => ({
			value: s,
			label: s.charAt(0).toUpperCase() + s.slice(1),
			count: counts[s]
		}))
	]

	const preservedForPagination: Record<string, string> = {}
	if (status) {
		preservedForPagination.status = status
	}
	if (q) {
		preservedForPagination.q = q
	}

	return (
		<>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{EMAIL_STATUSES.map(s => (
					<div
						key={s}
						className="rounded-xl border border-border bg-surface-raised p-4"
					>
						<div className="text-xs uppercase tracking-wider text-muted-foreground">
							{s}
						</div>
						<div className="text-2xl font-semibold text-foreground mt-1">
							{counts[s].toLocaleString('en-US')}
						</div>
					</div>
				))}
			</div>

			<StatusFilterBar
				baseHref="/admin/emails"
				current={status}
				options={filterOptions}
			/>

			<SearchInput placeholder="Search emails" />

			{rows.length === 0 ? (
				q ? (
					<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
						<p className="text-sm text-muted-foreground">
							No emails matching <span className="font-mono">{q}</span>.
						</p>
						<Link
							href={status ? `/admin/emails?status=${status}` : '/admin/emails'}
							className="inline-block mt-3 text-sm font-medium text-accent-text hover:underline"
						>
							Clear search
						</Link>
					</div>
				) : (
					<div className="rounded-xl border border-border bg-surface-raised p-8 text-center text-sm text-muted-foreground">
						No scheduled emails.
					</div>
				)
			) : (
				<>
					<Table>
						<TableCaption className="sr-only">Scheduled emails</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead>Recipient</TableHead>
								<TableHead>Sequence/Step</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Scheduled for</TableHead>
								<TableHead>Sent at</TableHead>
								<TableHead className="text-right">Retries</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map(r => (
								<TableRow key={r.id}>
									<TableCell className="text-foreground">
										<Link
											href={`/admin/emails/${r.id}`}
											className="hover:underline"
										>
											{r.recipientEmail}
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground">
										<span>{r.sequenceId}</span>
										<span className="text-muted-foreground"> / </span>
										<span>{r.stepId}</span>
									</TableCell>
									<TableCell>
										<StatusBadge status={r.status} />
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.scheduledFor.toLocaleString('en-US')}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.sentAt?.toLocaleString('en-US') ?? '-'}
									</TableCell>
									<TableCell className="text-right text-muted-foreground">
										{`${r.retryCount}/${r.maxRetries}`}
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
											'/admin/emails',
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
											'/admin/emails',
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

export default function AdminEmailsPage({
	searchParams
}: AdminEmailsPageProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold text-foreground">Emails</h1>
			</div>
			<Suspense
				fallback={
					<div className="text-sm text-muted-foreground">Loading emails...</div>
				}
			>
				<EmailsList searchParams={searchParams} />
			</Suspense>
		</div>
	)
}
