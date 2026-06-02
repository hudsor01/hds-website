/**
 * Admin Scheduled-Email detail page (server component).
 *
 * Phase 05 §5.4 per-row surface. Loads the row by id via the admin query
 * layer and renders four sections. Phase 13 (ADMINERR-04): the loader 3-way
 * switches on the `AdminDetailResult` -- `notFound()` ONLY on a genuinely
 * missing row, an `<AdminErrorState>` on a caught DB error (never a misleading
 * 404), and the row render on `'found'`. The four sections are:
 *   1. Email      - sequenceId, stepId, recipient name, variables jsonb
 *   2. Delivery   - status, sent-at, retries, error (when non-null)
 *   3. Actions    - retry (when allowed) + cancel (when pending)
 *   4. Danger     - DeleteButton (queue cleanup)
 *
 * The retry button is hidden when `retryCount >= maxRetries` so the UI
 * mirrors the server-side guard in `retryScheduledEmail()`. The backend
 * gate is still authoritative -- this is a visual hint, not the check.
 *
 * Wrapped in <Suspense> + `await connection()` so the DB read happens
 * inside a streaming boundary. `generateStaticParams` returns a
 * placeholder id (required by `cacheComponents`) which the loader
 * short-circuits to 404 before `connection()`; see
 * `@/lib/admin/build-placeholder` for the full root-cause analysis.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { BUILD_PLACEHOLDER_ID } from '@/lib/admin/build-placeholder'
import { routeDetailResult } from '@/lib/admin/detail-result-routing'
import { getScheduledEmailById } from '@/lib/admin/emails-queries'
import {
	cancelScheduledEmailAction,
	deleteScheduledEmailAction,
	retryScheduledEmailAction
} from '../actions'

export const metadata: Metadata = {
	title: 'Admin: Email detail',
	robots: { index: false, follow: false }
}

// `cacheComponents` rejects an empty static-params list; the loader
// short-circuits the placeholder to `notFound()` before `connection()`
// to avoid a PPR postponed-boundary marker the client can't reveal. See
// `@/lib/admin/build-placeholder` for the full root-cause analysis.
export function generateStaticParams() {
	return [{ id: BUILD_PLACEHOLDER_ID }]
}

interface EmailDetailPageProps {
	params: Promise<{ id: string }>
}

// `<form action>` only accepts `void | Promise<void>` server actions. The
// underlying actions return an `ActionResult` envelope (parity with the
// Phase 04 mutations so a future client form can read `_form` errors), so
// we wrap each in a thin `Promise<void>` shim declared inline with
// `'use server'`. Wrappers swallow the envelope; mutation success is
// reflected via `revalidatePath` inside the underlying action.
async function retryAction(formData: FormData): Promise<void> {
	'use server'
	await retryScheduledEmailAction(formData)
}

async function cancelAction(formData: FormData): Promise<void> {
	'use server'
	await cancelScheduledEmailAction(formData)
}

async function EmailDetailLoader({ params }: EmailDetailPageProps) {
	const { id } = await params
	if (id === BUILD_PLACEHOLDER_ID) {
		notFound()
	}
	await connection()
	const routing = routeDetailResult(await getScheduledEmailById(id))
	if (routing.kind === 'not-found') {
		notFound()
	}
	if (routing.kind === 'error') {
		return <AdminErrorState resource="scheduled email" />
	}
	const row = routing.data

	const max = row.maxRetries ?? 3
	const canRetry = row.retryCount < max
	const showRetry = row.status === 'pending' || row.status === 'failed'
	const showCancel = row.status === 'pending'

	return (
		<div className="space-y-6">
			<div>
				<Link
					href="/admin/emails"
					className="text-sm text-accent-text hover:underline"
				>
					Back to emails
				</Link>
				<h1 className="text-2xl font-semibold text-foreground mt-2">
					{row.recipientEmail}
				</h1>
				<div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
					<StatusBadge status={row.status} />
					<span>Scheduled for {row.scheduledFor.toLocaleString('en-US')}</span>
				</div>
			</div>

			<section className="rounded-xl border border-border bg-surface-raised p-6 space-y-4">
				<h2 className="text-sm font-semibold text-foreground">Email</h2>
				<dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
					<div>
						<dt className="text-xs uppercase tracking-wider text-muted-foreground">
							Sequence
						</dt>
						<dd className="text-foreground mt-1">{row.sequenceId}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wider text-muted-foreground">
							Step
						</dt>
						<dd className="text-foreground mt-1">{row.stepId}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wider text-muted-foreground">
							Recipient name
						</dt>
						<dd className="text-foreground mt-1">{row.recipientName ?? '-'}</dd>
					</div>
				</dl>
				{row.variables ? (
					<div>
						<dt className="text-xs uppercase tracking-wider text-muted-foreground">
							Variables
						</dt>
						<pre className="text-xs overflow-x-auto rounded-md border border-border bg-surface-base p-3 mt-1 text-foreground">
							{JSON.stringify(row.variables, null, 2)}
						</pre>
					</div>
				) : null}
			</section>

			<section className="rounded-xl border border-border bg-surface-raised p-6 space-y-4">
				<h2 className="text-sm font-semibold text-foreground">Delivery</h2>
				<dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
					<div>
						<dt className="text-xs uppercase tracking-wider text-muted-foreground">
							Status
						</dt>
						<dd className="mt-1">
							<StatusBadge status={row.status} />
						</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wider text-muted-foreground">
							Sent at
						</dt>
						<dd className="text-foreground mt-1">
							{row.sentAt?.toLocaleString('en-US') ?? '-'}
						</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wider text-muted-foreground">
							Retries
						</dt>
						<dd className="text-foreground mt-1">
							{`${row.retryCount} / ${row.maxRetries}`}
						</dd>
					</div>
				</dl>
				{row.error ? (
					<div>
						<dt className="text-xs uppercase tracking-wider text-muted-foreground">
							Error
						</dt>
						<pre className="text-xs overflow-x-auto rounded-md border border-destructive/40 bg-destructive-light p-3 mt-1 text-destructive-text">
							{row.error}
						</pre>
					</div>
				) : null}
			</section>

			<section className="rounded-xl border border-border bg-surface-raised p-6 space-y-4">
				<h2 className="text-sm font-semibold text-foreground">Actions</h2>
				{showRetry ? (
					<div className="flex flex-wrap items-center gap-3">
						{canRetry ? (
							<form action={retryAction}>
								<input type="hidden" name="id" value={row.id} />
								<button
									type="submit"
									className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-accent-text border border-border bg-surface-raised hover:bg-surface-base transition-smooth"
								>
									Retry now
								</button>
							</form>
						) : (
							<p className="text-sm text-muted-foreground">
								Retry limit reached.
							</p>
						)}
						{showCancel ? (
							<form action={cancelAction}>
								<input type="hidden" name="id" value={row.id} />
								<button
									type="submit"
									className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground border border-border bg-surface-raised hover:bg-surface-base transition-smooth"
								>
									Cancel
								</button>
							</form>
						) : null}
					</div>
				) : row.status === 'sent' ? (
					<p className="text-sm text-muted-foreground">
						Already sent. No actions available.
					</p>
				) : row.status === 'cancelled' ? (
					<p className="text-sm text-muted-foreground">
						Already cancelled. Delete below if no longer needed.
					</p>
				) : (
					<p className="text-sm text-muted-foreground">No actions available.</p>
				)}
			</section>

			<section className="rounded-xl border border-destructive/40 bg-surface-raised p-6 space-y-4">
				<h2 className="text-sm font-semibold text-foreground">Danger</h2>
				<DeleteButton
					action={deleteScheduledEmailAction}
					id={row.id}
					label="Delete email"
					confirmMessage={`Delete scheduled email to "${row.recipientEmail}"? This removes the queue row permanently.`}
				/>
			</section>
		</div>
	)
}

export default function EmailDetailPage({ params }: EmailDetailPageProps) {
	return (
		<Suspense
			fallback={
				<div className="text-sm text-muted-foreground">Loading email...</div>
			}
		>
			<EmailDetailLoader params={params} />
		</Suspense>
	)
}
