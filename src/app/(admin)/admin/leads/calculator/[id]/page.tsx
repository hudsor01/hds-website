/**
 * Admin Calculator-Lead detail page (server component).
 *
 * Loads a single calculator submission by id and renders six sections:
 * Lead / Inputs / Results / Conversion / Attribution / Danger. The inputs
 * and results columns are `jsonb` blobs whose shape varies per calculator
 * type, so they are dumped via `<pre>{JSON.stringify(..., null, 2)}</pre>`
 * with no client-side reshape; admin-only display.
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
import { getCalculatorLeadById } from '@/lib/admin/calculator-leads-queries'
import { routeDetailResult } from '@/lib/admin/detail-result-routing'
import {
	deleteCalculatorLeadAction,
	markCalculatorLeadContactedAction,
	markCalculatorLeadConvertedAction
} from '../actions'

// Thin void-returning wrappers so `<form action={...}>` (which requires
// `void | Promise<void>` per React's DOM types) can bind to the
// `ActionResult`-returning Server Actions. Mutations always revalidate the
// path inside the action body, so the new render reflects the result; we
// drop the `{ ok, errors }` envelope here because these single-button
// forms have no field-level UI to surface errors to. A future plan that
// adds inline error display can switch to `useActionState` against the
// raw actions without touching the actions themselves.
async function markCalculatorLeadContactedForm(
	formData: FormData
): Promise<void> {
	'use server'
	await markCalculatorLeadContactedAction(formData)
}

async function markCalculatorLeadConvertedForm(
	formData: FormData
): Promise<void> {
	'use server'
	await markCalculatorLeadConvertedAction(formData)
}

export const metadata: Metadata = {
	title: 'Admin: Calculator lead detail',
	robots: { index: false, follow: false }
}

// `cacheComponents` rejects an empty static-params list; the loader
// short-circuits the placeholder to `notFound()` before `connection()`
// to avoid a PPR postponed-boundary marker the client can't reveal. See
// `@/lib/admin/build-placeholder` for the full root-cause analysis.
export function generateStaticParams() {
	return [{ id: BUILD_PLACEHOLDER_ID }]
}

interface AdminCalculatorLeadDetailPageProps {
	params: Promise<{ id: string }>
}

function DefinitionRow({
	label,
	value
}: {
	label: string
	value: React.ReactNode
}) {
	return (
		<div className="grid grid-cols-3 gap-2 py-1">
			<dt className="text-xs uppercase tracking-wider text-muted-foreground">
				{label}
			</dt>
			<dd className="col-span-2 text-sm text-foreground">{value}</dd>
		</div>
	)
}

async function CalculatorLeadDetail({
	params
}: AdminCalculatorLeadDetailPageProps) {
	const { id } = await params
	if (id === BUILD_PLACEHOLDER_ID) {
		notFound()
	}
	await connection()
	const routing = routeDetailResult(await getCalculatorLeadById(id))
	if (routing.kind === 'not-found') {
		notFound()
	}
	if (routing.kind === 'error') {
		return <AdminErrorState resource="calculator submission" />
	}
	const row = routing.data

	const leadEntries: Array<[string, React.ReactNode]> = []
	if (row.name) {
		leadEntries.push(['Name', row.name])
	}
	if (row.phone) {
		leadEntries.push(['Phone', row.phone])
	}
	if (row.company) {
		leadEntries.push(['Company', row.company])
	}
	if (row.leadScore !== null && row.leadScore !== undefined) {
		leadEntries.push(['Lead score', String(row.leadScore)])
	}

	const attributionEntries: Array<[string, React.ReactNode]> = []
	if (row.utmSource) {
		attributionEntries.push(['UTM source', row.utmSource])
	}
	if (row.utmMedium) {
		attributionEntries.push(['UTM medium', row.utmMedium])
	}
	if (row.utmCampaign) {
		attributionEntries.push(['UTM campaign', row.utmCampaign])
	}
	if (row.utmTerm) {
		attributionEntries.push(['UTM term', row.utmTerm])
	}
	if (row.utmContent) {
		attributionEntries.push(['UTM content', row.utmContent])
	}
	if (row.referrer) {
		attributionEntries.push(['Referrer', row.referrer])
	}
	if (row.landingPage) {
		attributionEntries.push(['Landing page', row.landingPage])
	}

	const contactedAtLabel = row.contactedAt
		? row.contactedAt.toLocaleString('en-US')
		: '-'
	const convertedAtLabel = row.convertedAt
		? row.convertedAt.toLocaleString('en-US')
		: '-'
	const conversionValueLabel = row.conversionValue
		? `$${row.conversionValue}`
		: '-'

	return (
		<div className="space-y-6">
			<div>
				<Link
					href="/admin/leads/calculator"
					className="text-sm text-accent-text hover:underline"
				>
					Back to calculator leads
				</Link>
				<h1 className="text-2xl font-semibold text-foreground mt-2">
					{row.email}
				</h1>
				<div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
					<span>{row.calculatorType}</span>
					<StatusBadge status={row.leadQuality} />
				</div>
			</div>

			<section>
				<h2 className="text-lg font-semibold text-foreground">Lead</h2>
				<div className="rounded-xl border border-border bg-surface-raised p-4 mt-2">
					{leadEntries.length === 0 ? (
						<p className="text-sm text-muted-foreground">No extra lead info.</p>
					) : (
						<dl>
							{leadEntries.map(([label, value]) => (
								<DefinitionRow key={label} label={label} value={value} />
							))}
						</dl>
					)}
				</div>
			</section>

			<section>
				<h2 className="text-lg font-semibold text-foreground">
					Calculator inputs
				</h2>
				<div className="rounded-xl border border-border bg-surface-raised p-4 mt-2">
					<pre className="text-xs overflow-x-auto text-foreground">
						{JSON.stringify(row.inputs, null, 2)}
					</pre>
				</div>
			</section>

			<section>
				<h2 className="text-lg font-semibold text-foreground">
					Calculator results
				</h2>
				<div className="rounded-xl border border-border bg-surface-raised p-4 mt-2">
					<pre className="text-xs overflow-x-auto text-foreground">
						{JSON.stringify(row.results, null, 2)}
					</pre>
				</div>
			</section>

			<section>
				<h2 className="text-lg font-semibold text-foreground">Conversion</h2>
				<div className="rounded-xl border border-border bg-surface-raised p-4 mt-2 space-y-4">
					<dl>
						<DefinitionRow
							label="Contacted"
							value={row.contacted ? 'Yes' : 'No'}
						/>
						<DefinitionRow label="Contacted at" value={contactedAtLabel} />
						<DefinitionRow
							label="Converted"
							value={row.converted ? 'Yes' : 'No'}
						/>
						<DefinitionRow label="Converted at" value={convertedAtLabel} />
						<DefinitionRow
							label="Conversion value"
							value={conversionValueLabel}
						/>
					</dl>
					<div className="border-t border-border pt-4">
						{!row.contacted ? (
							<form action={markCalculatorLeadContactedForm}>
								<input type="hidden" name="id" value={row.id} />
								<button
									type="submit"
									className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-accent-text border border-border bg-surface-raised hover:bg-surface-base transition-smooth"
								>
									Mark contacted
								</button>
							</form>
						) : !row.converted ? (
							<form
								action={markCalculatorLeadConvertedForm}
								className="flex items-end gap-2"
							>
								<input type="hidden" name="id" value={row.id} />
								<label className="flex flex-col gap-1 text-sm">
									<span className="text-foreground">Conversion value ($)</span>
									<input
										type="number"
										name="conversionValue"
										min="0"
										step="0.01"
										required
										className="w-32 rounded-md border border-border bg-surface-base p-2 text-sm text-foreground"
									/>
								</label>
								<button
									type="submit"
									className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-accent-text border border-border bg-surface-raised hover:bg-surface-base transition-smooth"
								>
									Mark converted
								</button>
							</form>
						) : (
							<p className="text-sm text-muted-foreground">
								No further actions.
							</p>
						)}
					</div>
				</div>
			</section>

			<section>
				<h2 className="text-lg font-semibold text-foreground">Attribution</h2>
				<div className="rounded-xl border border-border bg-surface-raised p-4 mt-2">
					{attributionEntries.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No attribution captured.
						</p>
					) : (
						<dl>
							{attributionEntries.map(([label, value]) => (
								<DefinitionRow key={label} label={label} value={value} />
							))}
						</dl>
					)}
				</div>
			</section>

			<section>
				<h2 className="text-lg font-semibold text-foreground">Danger</h2>
				<div className="rounded-xl border border-border bg-surface-raised p-4 mt-2">
					<DeleteButton
						action={deleteCalculatorLeadAction}
						id={row.id}
						label="Delete calculator lead"
						confirmMessage={`Delete calculator lead "${row.email}"? Cannot be undone.`}
					/>
				</div>
			</section>
		</div>
	)
}

export default function AdminCalculatorLeadDetailPage({
	params
}: AdminCalculatorLeadDetailPageProps) {
	return (
		<Suspense
			fallback={<div className="text-sm text-muted-foreground">Loading...</div>}
		>
			<CalculatorLeadDetail params={params} />
		</Suspense>
	)
}
