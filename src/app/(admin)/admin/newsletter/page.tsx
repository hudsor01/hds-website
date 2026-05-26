/**
 * Admin Newsletter list page (server component).
 *
 * Renders the most recent <=200 newsletter subscribers sorted by
 * `subscribedAt DESC`, with a status filter chip row above the table. Each
 * row links to its detail page where the operator can unsubscribe /
 * re-subscribe / hard-delete (GDPR).
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
import { StatusBadge } from '@/components/admin/StatusBadge'
import {
	StatusFilterBar,
	type StatusFilterOption
} from '@/components/admin/StatusFilterBar'
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
	searchParams: Promise<{ status?: string }>
}

async function NewsletterList({ searchParams }: AdminNewsletterPageProps) {
	await connection()
	const { status: rawStatus } = await searchParams
	const status: SubscriberStatus | null = (
		SUBSCRIBER_STATUSES as readonly string[]
	).includes(rawStatus ?? '')
		? (rawStatus as SubscriberStatus)
		: null
	const rows = await listSubscribersForAdmin(status, 200)
	return (
		<>
			<StatusFilterBar
				baseHref="/admin/newsletter"
				current={status}
				options={FILTER_OPTIONS}
			/>
			{rows.length === 0 ? (
				<p className="text-sm text-muted-foreground">No subscribers yet.</p>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border bg-surface-raised">
					<table className="w-full text-sm">
						<caption className="sr-only">Newsletter subscribers</caption>
						<thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-surface-base">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									Email
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Name
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Status
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Source
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Subscribed
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									Unsubscribed
								</th>
							</tr>
						</thead>
						<tbody>
							{rows.map(r => (
								<tr key={r.id} className="border-t border-border">
									<td className="px-4 py-3 text-foreground">
										<Link
											href={`/admin/newsletter/${r.id}`}
											className="hover:underline"
										>
											{r.email}
										</Link>
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{r.name ?? '-'}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										<StatusBadge status={r.status} />
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{r.source ?? '-'}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{r.subscribedAt?.toLocaleDateString('en-US') ?? '-'}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{r.unsubscribedAt?.toLocaleDateString('en-US') ?? '-'}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
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
