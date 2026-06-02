/**
 * Admin Edit Showcase page (server component).
 *
 * Loads the row by id via the admin query layer, 404s when missing, and
 * hands the row to the client form island.
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
import { BUILD_PLACEHOLDER_ID } from '@/lib/admin/build-placeholder'
import { getShowcaseById } from '@/lib/admin/showcase-queries'
import { EditShowcaseForm } from './EditShowcaseForm'

export const metadata: Metadata = {
	title: 'Admin: Edit showcase',
	robots: { index: false, follow: false }
}

// `cacheComponents` rejects an empty static-params list; the loader
// short-circuits the placeholder to `notFound()` before `connection()`
// to avoid a PPR postponed-boundary marker the client can't reveal. See
// `@/lib/admin/build-placeholder` for the full root-cause analysis.
export function generateStaticParams() {
	return [{ id: BUILD_PLACEHOLDER_ID }]
}

interface EditShowcasePageProps {
	params: Promise<{ id: string }>
}

async function EditLoader({ params }: EditShowcasePageProps) {
	const { id } = await params
	if (id === BUILD_PLACEHOLDER_ID) {
		notFound()
	}
	await connection()
	const result = await getShowcaseById(id)
	if (result.status === 'not-found') {
		notFound()
	}
	if (result.status === 'error') {
		return <AdminErrorState resource="showcase entry" />
	}
	return <EditShowcaseForm row={result.data} />
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
