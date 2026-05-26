/**
 * Admin Newsletter detail page (server component).
 *
 * Loads a single subscriber by id, 404s when missing, and renders three
 * operator sections:
 *  - Subscription: source / subscribed / unsubscribed / created / metadata
 *  - Actions: branches on current status to render exactly one of
 *    Unsubscribe / Re-subscribe (or a "no mutations available" message when
 *    the status is `bounced` or anything unrecognized)
 *  - Danger: GDPR hard-delete via the shared `<DeleteButton>` primitive
 *
 * Wrapped in <Suspense> + `await connection()` so the DB read stays out of
 * any partial-prerender step at build time (same pattern as the showcase
 * edit page).
 *
 * Next.js 16 `params` is async AND is uncached request data. Awaiting it
 * outside a Suspense boundary blocks the entire route's prerender shell,
 * which `cacheComponents` flags as an error. We pass the `params` Promise
 * straight through to the SubscriberLoader subtree and await inside Suspense.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { getSubscriberById } from '@/lib/admin/newsletter-queries'
import {
	deleteSubscriberAction,
	resubscribeSubscriberAction,
	unsubscribeSubscriberAction
} from '../actions'

// Thin void-returning wrappers so `<form action={...}>` (which requires
// `void | Promise<void>` per React's DOM types) can bind to the
// `ActionResult`-returning Server Actions. Mutations always revalidate the
// path inside the action body, so the new render reflects the result; we
// drop the `{ ok, errors }` envelope here because these single-button forms
// have no field-level UI to surface errors to. A future plan that adds
// inline error display can switch to `useActionState` against the raw
// actions without touching the actions themselves.
async function unsubscribeForm(formData: FormData): Promise<void> {
	'use server'
	await unsubscribeSubscriberAction(formData)
}

async function resubscribeForm(formData: FormData): Promise<void> {
	'use server'
	await resubscribeSubscriberAction(formData)
}

export const metadata: Metadata = {
	title: 'Admin: Subscriber detail',
	robots: { index: false, follow: false }
}

// `cacheComponents` requires at least one sample id so the build can
// validate dynamic accesses against a real prerender. The placeholder
// never resolves to a real row (getSubscriberById returns null which
// triggers notFound()), so the only thing that ships from this prerender
// is the 404 path; real ids render on first request via ISR.
export function generateStaticParams() {
	return [{ id: '__build_placeholder__' }]
}

interface SubscriberDetailPageProps {
	params: Promise<{ id: string }>
}

const ACTION_BTN_CLASS =
	'inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-accent-text border border-border bg-surface-raised hover:bg-surface-base transition-smooth'

async function SubscriberLoader({ params }: SubscriberDetailPageProps) {
	await connection()
	const { id } = await params
	const row = await getSubscriberById(id)
	if (!row) {
		notFound()
	}
	return (
		<div className="space-y-8">
			<div>
				<Link
					href="/admin/newsletter"
					className="text-sm text-accent-text hover:underline"
				>
					Back to newsletter
				</Link>
				<h1 className="text-2xl font-semibold text-foreground mt-2">
					{row.email}
				</h1>
				<div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
					{row.name && (
						<>
							<span>{row.name}</span>
							<span aria-hidden="true">{'·'}</span>
						</>
					)}
					<StatusBadge status={row.status} />
				</div>
			</div>

			<section>
				<h2 className="text-lg font-semibold text-foreground">Subscription</h2>
				<dl className="rounded-xl border border-border bg-surface-raised p-4 mt-2 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
					<dt className="text-muted-foreground">Source</dt>
					<dd className="text-foreground">{row.source ?? '-'}</dd>

					<dt className="text-muted-foreground">Subscribed at</dt>
					<dd className="text-foreground">
						{row.subscribedAt?.toLocaleString('en-US') ?? '-'}
					</dd>

					<dt className="text-muted-foreground">Unsubscribed at</dt>
					<dd className="text-foreground">
						{row.unsubscribedAt?.toLocaleString('en-US') ?? '-'}
					</dd>

					<dt className="text-muted-foreground">Created at</dt>
					<dd className="text-foreground">
						{row.createdAt?.toLocaleString('en-US') ?? '-'}
					</dd>

					<dt className="text-muted-foreground">Metadata</dt>
					<dd className="text-foreground">
						{row.metadata ? (
							<pre className="text-xs overflow-x-auto">
								{JSON.stringify(row.metadata, null, 2)}
							</pre>
						) : (
							'-'
						)}
					</dd>
				</dl>
			</section>

			<section>
				<h2 className="text-lg font-semibold text-foreground">Actions</h2>
				<div className="rounded-xl border border-border bg-surface-raised p-4 mt-2">
					{row.status === 'active' ? (
						<form action={unsubscribeForm}>
							<input type="hidden" name="id" value={row.id} />
							<button type="submit" className={ACTION_BTN_CLASS}>
								Unsubscribe
							</button>
						</form>
					) : row.status === 'unsubscribed' ? (
						<form action={resubscribeForm}>
							<input type="hidden" name="id" value={row.id} />
							<button type="submit" className={ACTION_BTN_CLASS}>
								Re-subscribe
							</button>
						</form>
					) : (
						<p className="text-sm text-muted-foreground">
							No mutations available for this status.
						</p>
					)}
				</div>
			</section>

			<section>
				<h2 className="text-lg font-semibold text-foreground">Danger</h2>
				<div className="rounded-xl border border-destructive/40 bg-surface-raised p-4 mt-2">
					<DeleteButton
						action={deleteSubscriberAction}
						id={row.id}
						label="Delete subscriber"
						confirmMessage={`Delete subscriber "${row.email}"? This is a GDPR hard delete. Cannot be undone.`}
					/>
				</div>
			</section>
		</div>
	)
}

export default function SubscriberDetailPage({
	params
}: SubscriberDetailPageProps) {
	return (
		<Suspense
			fallback={
				<div className="text-sm text-muted-foreground">
					Loading subscriber...
				</div>
			}
		>
			<SubscriberLoader params={params} />
		</Suspense>
	)
}
