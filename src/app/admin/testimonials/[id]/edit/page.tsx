/**
 * Admin Edit Testimonial page (server component).
 *
 * Loads the row by id; calls `notFound()` for unknown ids so the operator
 * gets the standard 404 instead of an empty form. The pre-filled form +
 * delete button live in the client island.
 *
 * Wrapped in <Suspense> + `await connection()` so the DB read stays out
 * of any partial-prerender step in `next build`. Next.js 16 `params` is
 * async AND counts as uncached request data; we pass the Promise through
 * to the EditLoader subtree and await inside Suspense so the page shell
 * still prerenders.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { getTestimonialById } from '@/lib/admin/testimonials-queries'
import { EditTestimonialForm } from './EditTestimonialForm'

export const metadata: Metadata = {
	title: 'Admin: Edit testimonial',
	robots: { index: false, follow: false }
}

// `cacheComponents` requires at least one sample id so the build can
// validate dynamic accesses against a real prerender. The placeholder
// never resolves to a real row (getTestimonialById returns null which
// triggers notFound()), so the only thing that ships from this prerender
// is the 404 path -- real ids render on first request via ISR.
export function generateStaticParams() {
	return [{ id: '__build_placeholder__' }]
}

interface EditTestimonialPageProps {
	params: Promise<{ id: string }>
}

async function EditLoader({ params }: EditTestimonialPageProps) {
	await connection()
	const { id } = await params
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
