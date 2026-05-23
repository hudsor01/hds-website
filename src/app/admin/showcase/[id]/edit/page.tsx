/**
 * Admin Edit Showcase page (server component).
 *
 * Loads the row by id via the admin query layer, 404s when missing, and
 * hands the row to the client form island. Wrapped in <Suspense> + `await
 * connection()` so the DB read stays out of any partial-prerender step at
 * build time (same pattern as the dashboard page).
 *
 * Next.js 16 `params` is async; we await it once at the page top and pass
 * the resolved id into the loader subtree.
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

async function EditLoader({ id }: { id: string }) {
	await connection()
	const row = await getShowcaseById(id)
	if (!row) {
		notFound()
	}
	return <EditShowcaseForm row={row} />
}

export default async function EditShowcasePage({
	params
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
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
				<EditLoader id={id} />
			</Suspense>
		</div>
	)
}
