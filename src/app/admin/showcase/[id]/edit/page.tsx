/**
 * Admin Edit Showcase page (server component).
 *
 * Loads the row by id via the admin query layer, 404s when missing, and
 * hands the row to the client form island. Wrapped in <Suspense> + `await
 * connection()` so the DB read stays out of any partial-prerender step at
 * build time (same pattern as the dashboard page).
 *
 * Next.js 16 `params` is async AND is uncached request data. Awaiting it
 * outside a Suspense boundary blocks the entire route's prerender shell,
 * which `cacheComponents` flags as an error. We pass the `params` Promise
 * straight through to the EditLoader subtree and await inside Suspense.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { getShowcaseById } from '@/lib/admin/showcase-queries'
import { EditShowcaseForm } from './EditShowcaseForm'

export const metadata: Metadata = {
	title: 'Admin: Edit showcase',
	robots: { index: false, follow: false }
}

// `cacheComponents` requires at least one sample id so the build can
// validate dynamic accesses against a real prerender. The placeholder
// never resolves to a real row (getShowcaseById returns null which
// triggers notFound()), so the only thing that ships from this prerender
// is the 404 path -- real ids render on first request via ISR.
export function generateStaticParams() {
	return [{ id: '__build_placeholder__' }]
}

interface EditShowcasePageProps {
	params: Promise<{ id: string }>
}

async function EditLoader({ params }: EditShowcasePageProps) {
	await connection()
	const { id } = await params
	const row = await getShowcaseById(id)
	if (!row) {
		notFound()
	}
	return <EditShowcaseForm row={row} />
}

export default function EditShowcasePage({ params }: EditShowcasePageProps) {
	return (
		<div className="space-y-6">
			<div>
				<Link
					href="/admin/showcase"
					className="text-sm text-accent-text hover:underline"
				>
					Back to showcase
				</Link>
				<h1 className="text-2xl font-semibold text-foreground mt-2">
					Edit showcase
				</h1>
			</div>
			<Suspense
				fallback={
					<div className="text-sm text-muted-foreground">Loading...</div>
				}
			>
				<EditLoader params={params} />
			</Suspense>
		</div>
	)
}
