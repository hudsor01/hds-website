/**
 * Admin Edit Testimonial page (server component).
 *
 * Loads the row by id; calls `notFound()` for unknown ids so the operator
 * gets the standard 404 instead of an empty form. The pre-filled form +
 * delete button live in the client island.
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
import { BUILD_PLACEHOLDER_ID } from '@/lib/admin/build-placeholder'
import { getTestimonialById } from '@/lib/admin/testimonials-queries'
import { EditTestimonialForm } from './EditTestimonialForm'

export const metadata: Metadata = {
	title: 'Admin: Edit testimonial',
	robots: { index: false, follow: false }
}

// `cacheComponents` rejects an empty static-params list; the loader
// short-circuits the placeholder to `notFound()` before `connection()`
// to avoid a PPR postponed-boundary marker the client can't reveal. See
// `@/lib/admin/build-placeholder` for the full root-cause analysis.
export function generateStaticParams() {
	return [{ id: BUILD_PLACEHOLDER_ID }]
}

interface EditTestimonialPageProps {
	params: Promise<{ id: string }>
}

async function EditLoader({ params }: EditTestimonialPageProps) {
	const { id } = await params
	if (id === BUILD_PLACEHOLDER_ID) {
		notFound()
	}
	await connection()
	const row = await getTestimonialById(id)
	if (!row) {
		notFound()
	}
	return <EditTestimonialForm row={row} />
}

export default function EditTestimonialPage({
	params
}: EditTestimonialPageProps) {
	return (
		<div className="space-y-6">
			<div>
				<Link
					href="/admin/testimonials"
					className="text-sm text-accent-text hover:underline"
				>
					Back to testimonials
				</Link>
				<h1 className="text-2xl font-semibold text-foreground mt-2">
					Edit testimonial
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
