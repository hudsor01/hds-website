/**
 * Admin Scheduled-Emails list page (server component).
 *
 * Phase 05 §5.4 entry point for the `/admin/emails` surface. Renders:
 *  - 4 queue-health stat cards (pending / sent / failed / cancelled counts)
 *  - A `StatusFilterBar` row of chips that round-trips via `?status=...`
 *  - The most recent 100 scheduled emails by `scheduledFor DESC`
 *
 * Data is loaded with `Promise.all` over `getQueueCounts()` and
 * `listScheduledEmailsForAdmin()` inside a `<Suspense>` boundary, after
 * `await connection()`, so the DB read stays out of any partial-prerender
 * step in `next build` (same pattern as the dashboard page).
 *
 * The filter chips include per-status counts so the operator still sees
 * queue health at a glance even when the table is filtered. The "All" chip
 * does not get a count (the sum is implicit).
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
	EMAIL_STATUSES,
	type EmailStatus,
	getQueueCounts,
	listScheduledEmailsForAdmin
} from '@/lib/admin/emails-queries'

export const metadata: Metadata = {
	title: 'Admin: Emails',
	robots: { index: false, follow: false }
}

interface AdminEmailsPageProps {
	searchParams: Promise<{ status?: string }>
}

async function EmailsList({ searchParams }: AdminEmailsPageProps) {
	await connection()
	const { status: rawStatus } = await searchParams
	const status: EmailStatus | null = (
		EMAIL_STATUSES as readonly string[]
	).includes(rawStatus ?? '')
		? (rawStatus as EmailStatus)
		: null

	const [counts, rows] = await Promise.all([
		getQueueCounts(),
		listScheduledEmailsForAdmin(status, 100)
	])

	const filterOptions: StatusFilterOption[] = [
		{ value: null, label: 'All' },
		...EMAIL_STATUSES.map(s => ({
			value: s,
			label: s.charAt(0).toUpperCase() + s.slice(1),
			count: counts[s]
		}))
	]

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold text-foreground">Emails</h1>
			</div>

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

			{rows.length === 0 ? (
				<div className="rounded-xl border border-border bg-surface-raised p-8 text-center text-sm text-muted-foreground">
					No scheduled emails.
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border bg-surface-raised">
					<table className="w-full text-sm">
						<caption className="sr-only">Scheduled emails</caption>
						<thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-surface-base">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									Recipient
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Sequence/Step
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Status
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Scheduled for
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Sent at
								</th>
								<th scope="col" className="px-4 py-3 font-medium text-right">
									Retries
								</th>
							</tr>
						</thead>
						<tbody>
							{rows.map(r => (
								<tr key={r.id} className="border-t border-border">
									<td className="px-4 py-3 text-foreground">
										<Link
											href={`/admin/emails/${r.id}`}
											className="hover:underline"
										>
											{r.recipientEmail}
										</Link>
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										<span>{r.sequenceId}</span>
										<span className="text-muted-foreground"> / </span>
										<span>{r.stepId}</span>
									</td>
									<td className="px-4 py-3">
										<StatusBadge status={r.status} />
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{r.scheduledFor.toLocaleString('en-US')}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{r.sentAt?.toLocaleString('en-US') ?? '-'}
									</td>
									<td className="px-4 py-3 text-right text-muted-foreground">
										{`${r.retryCount}/${r.maxRetries}`}
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

export default function AdminEmailsPage({
	searchParams
}: AdminEmailsPageProps) {
	return (
		<Suspense
			fallback={
				<div className="text-sm text-muted-foreground">Loading emails...</div>
			}
		>
			<EmailsList searchParams={searchParams} />
		</Suspense>
	)
}
