/**
 * Admin Lead Detail page (server component).
 *
 * Loads a lead + its attribution touchpoints + its operator notes via the
 * admin query layer's `getLeadById` (one Promise.all under the hood). 404s
 * when the row is missing. Renders five sections:
 *
 *   1. Contact info  -- phone / source / score / metadata (jsonb)
 *   2. Status        -- 4 chip-shaped buttons, one per LEAD_STATUSES value,
 *                       each posting to `updateLeadStatusAction`
 *   3. Touchpoints   -- chronological `lead_attribution` list
 *   4. Notes         -- inline add-note form + list of existing notes,
 *                       each note with a delete button
 *   5. Danger        -- `DeleteButton` (cascades to attribution + notes)
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
import { getLeadById } from '@/lib/admin/leads-queries'
import { LEAD_STATUSES } from '@/lib/schemas/admin-leads'
import {
	addLeadNoteAction,
	deleteLeadAction,
	deleteLeadNoteAction,
	updateLeadStatusAction
} from '../actions'

export const metadata: Metadata = {
	title: 'Admin: Lead detail',
	robots: { index: false, follow: false }
}

// `cacheComponents` rejects an empty static-params list; the loader
// short-circuits the placeholder to `notFound()` before `connection()`
// to avoid a PPR postponed-boundary marker the client can't reveal. See
// `@/lib/admin/build-placeholder` for the full root-cause analysis.
export function generateStaticParams() {
	return [{ id: BUILD_PLACEHOLDER_ID }]
}

interface AdminLeadDetailPageProps {
	params: Promise<{ id: string }>
}

const STATUS_BTN_BASE =
	'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-border transition-smooth'
const STATUS_BTN_INACTIVE =
	'text-muted-foreground bg-surface-raised hover:bg-surface-base'
const STATUS_BTN_ACTIVE = 'text-foreground bg-surface-base'

async function LeadDetailLoader({ params }: AdminLeadDetailPageProps) {
	const { id } = await params
	if (id === BUILD_PLACEHOLDER_ID) {
		notFound()
	}
	await connection()
	const routing = routeDetailResult(await getLeadById(id))
	if (routing.kind === 'not-found') {
		notFound()
	}
	if (routing.kind === 'error') {
		return <AdminErrorState resource="lead" />
	}
	const { lead, attribution, notes } = routing.data

	return (
		<div className="space-y-6">
			<div>
				<Link
					href="/admin/leads"
					className="text-sm text-accent-text hover:underline"
				>
					Back to leads
				</Link>
				<h1 className="text-2xl font-semibold text-foreground mt-2">
					{lead.name ?? lead.email}
				</h1>
				<div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
					<span>{lead.email}</span>
					{lead.company && (
						<>
							<span aria-hidden="true">·</span>
							<span>{lead.company}</span>
						</>
					)}
					<StatusBadge status={lead.status} />
				</div>
			</div>

			<section>
				<h2 className="text-lg font-semibold text-foreground">Contact info</h2>
				<div className="rounded-xl border border-border bg-surface-raised p-4 mt-2">
					<dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
						{lead.phone && (
							<div>
								<dt className="text-xs uppercase tracking-wider text-muted-foreground">
									Phone
								</dt>
								<dd className="text-foreground">{lead.phone}</dd>
							</div>
						)}
						{lead.source && (
							<div>
								<dt className="text-xs uppercase tracking-wider text-muted-foreground">
									Source
								</dt>
								<dd className="text-foreground">{lead.source}</dd>
							</div>
						)}
						{lead.score !== null && lead.score !== undefined && (
							<div>
								<dt className="text-xs uppercase tracking-wider text-muted-foreground">
									Score
								</dt>
								<dd className="text-foreground">{lead.score}</dd>
							</div>
						)}
						{lead.metadata !== null && lead.metadata !== undefined && (
							<div className="sm:col-span-2">
								<dt className="text-xs uppercase tracking-wider text-muted-foreground">
									Metadata
								</dt>
								<dd>
									<pre className="text-xs overflow-x-auto rounded-md bg-surface-base p-3 text-foreground">
										{JSON.stringify(lead.metadata, null, 2)}
									</pre>
								</dd>
							</div>
						)}
					</dl>
				</div>
			</section>

			<section>
				<h2 className="text-lg font-semibold text-foreground">Status</h2>
				<div className="rounded-xl border border-border bg-surface-raised p-4 mt-2">
					<div className="flex flex-wrap items-center gap-2">
						{LEAD_STATUSES.map(s => {
							const isActive = lead.status === s
							const stateClass = isActive
								? STATUS_BTN_ACTIVE
								: STATUS_BTN_INACTIVE
							return (
								<form key={s} action={updateLeadStatusAction}>
									<input type="hidden" name="id" value={lead.id} />
									<input type="hidden" name="status" value={s} />
									<button
										type="submit"
										aria-current={isActive ? 'true' : undefined}
										className={`${STATUS_BTN_BASE} ${stateClass}`}
									>
										{s.charAt(0).toUpperCase() + s.slice(1)}
									</button>
								</form>
							)
						})}
					</div>
				</div>
			</section>

			<section>
				<h2 className="text-lg font-semibold text-foreground">Touchpoints</h2>
				<div className="rounded-xl border border-border bg-surface-raised p-4 mt-2">
					{attribution.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No touchpoints recorded.
						</p>
					) : (
						<ol className="space-y-3">
							{attribution.map(t => (
								<li
									key={t.id}
									className="rounded-md border border-border bg-surface-base p-3"
								>
									<dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 text-sm">
										<div>
											<dt className="text-xs uppercase tracking-wider text-muted-foreground">
												Touchpoint
											</dt>
											<dd className="text-foreground">{t.touchpoint}</dd>
										</div>
										{t.source && (
											<div>
												<dt className="text-xs uppercase tracking-wider text-muted-foreground">
													Source
												</dt>
												<dd className="text-foreground">{t.source}</dd>
											</div>
										)}
										{t.medium && (
											<div>
												<dt className="text-xs uppercase tracking-wider text-muted-foreground">
													Medium
												</dt>
												<dd className="text-foreground">{t.medium}</dd>
											</div>
										)}
										{t.campaign && (
											<div>
												<dt className="text-xs uppercase tracking-wider text-muted-foreground">
													Campaign
												</dt>
												<dd className="text-foreground">{t.campaign}</dd>
											</div>
										)}
										{t.referrer && (
											<div className="sm:col-span-2">
												<dt className="text-xs uppercase tracking-wider text-muted-foreground">
													Referrer
												</dt>
												<dd className="text-foreground break-all">
													{t.referrer}
												</dd>
											</div>
										)}
										{t.landingPage && (
											<div className="sm:col-span-2">
												<dt className="text-xs uppercase tracking-wider text-muted-foreground">
													Landing page
												</dt>
												<dd className="text-foreground break-all">
													{t.landingPage}
												</dd>
											</div>
										)}
										{t.timestamp && (
											<div>
												<dt className="text-xs uppercase tracking-wider text-muted-foreground">
													Timestamp
												</dt>
												<dd className="text-foreground">
													{t.timestamp.toLocaleString('en-US')}
												</dd>
											</div>
										)}
									</dl>
								</li>
							))}
						</ol>
					)}
				</div>
			</section>

			<section>
				<h2 className="text-lg font-semibold text-foreground">Notes</h2>
				<div className="rounded-xl border border-border bg-surface-raised p-4 mt-2 space-y-4">
					<form action={addLeadNoteAction} className="space-y-2">
						<input type="hidden" name="leadId" value={lead.id} />
						<label htmlFor="add-note-content" className="sr-only">
							Add a note
						</label>
						<textarea
							id="add-note-content"
							name="content"
							rows={3}
							maxLength={4000}
							required
							className="w-full rounded-md border border-border bg-surface-base p-2 text-sm text-foreground"
							placeholder="Type a note about this lead..."
						/>
						<button
							type="submit"
							className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-accent-text border border-border bg-surface-raised hover:bg-surface-base transition-smooth"
						>
							Add note
						</button>
					</form>
					{notes.length === 0 ? (
						<p className="text-sm text-muted-foreground">No notes yet.</p>
					) : (
						<ul className="space-y-3">
							{notes.map(n => (
								<li
									key={n.id}
									className="rounded-md border border-border bg-surface-base p-3"
								>
									<p className="whitespace-pre-wrap text-sm text-foreground">
										{n.content}
									</p>
									<div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
										<span>{n.createdAt.toLocaleString('en-US')}</span>
										{n.createdBy && (
											<>
												<span aria-hidden="true">·</span>
												<span>{n.createdBy}</span>
											</>
										)}
										<form action={deleteLeadNoteAction} className="inline">
											<input type="hidden" name="noteId" value={n.id} />
											<input type="hidden" name="leadId" value={lead.id} />
											<button
												type="submit"
												className="text-xs text-destructive hover:underline"
											>
												Delete
											</button>
										</form>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</section>

			<section>
				<h2 className="text-lg font-semibold text-foreground">Danger</h2>
				<div className="rounded-xl border border-border bg-surface-raised p-4 mt-2">
					<DeleteButton
						action={deleteLeadAction}
						id={lead.id}
						label="Delete lead"
						confirmMessage={`Delete lead "${lead.email}"? This removes attribution and notes. Cannot be undone.`}
					/>
				</div>
			</section>
		</div>
	)
}

export default function AdminLeadDetailPage({
	params
}: AdminLeadDetailPageProps) {
	return (
		<Suspense
			fallback={
				<div className="text-sm text-muted-foreground">Loading lead...</div>
			}
		>
			<LeadDetailLoader params={params} />
		</Suspense>
	)
}
