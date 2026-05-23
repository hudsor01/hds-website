/**
 * Admin Testimonials list page (server component).
 *
 * Renders every testimonial row (published + unpublished) sorted by
 * `createdAt DESC`. Each row links to its edit page; a small icon-button
 * toggles publish from the list without leaving the page.
 *
 * Wrapped in <Suspense> + `await connection()` so the DB read stays out
 * of any partial prerender step in `next build` (the dashboard page uses
 * the same pattern).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { PublishToggle } from '@/components/admin/PublishToggle'
import { ResourceListPage } from '@/components/admin/ResourceListPage'
import { listTestimonialsForAdmin } from '@/lib/admin/testimonials-queries'
import { toggleTestimonialPublishedAction } from './actions'

export const metadata: Metadata = {
	title: 'Admin: Testimonials',
	robots: { index: false, follow: false }
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	day: 'numeric'
})

async function TestimonialsList() {
	await connection()
	const rows = await listTestimonialsForAdmin()
	return (
		<ResourceListPage
			title="Testimonials"
			newHref="/admin/testimonials/new"
			newLabel="New testimonial"
			isEmpty={rows.length === 0}
			emptyMessage="No testimonials yet. Create your first one."
		>
			<div className="overflow-x-auto rounded-xl border border-border bg-surface-raised">
				<table className="w-full text-sm">
					<thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-surface-base">
						<tr>
							<th className="px-4 py-3 font-medium">Name</th>
							<th className="px-4 py-3 font-medium">Role</th>
							<th className="px-4 py-3 font-medium">Company</th>
							<th className="px-4 py-3 font-medium">Rating</th>
							<th className="px-4 py-3 font-medium">Featured</th>
							<th className="px-4 py-3 font-medium">Published</th>
							<th className="px-4 py-3 font-medium">Created</th>
							<th className="px-4 py-3 font-medium text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{rows.map(r => (
							<tr key={r.id} className="border-t border-border">
								<td className="px-4 py-3 text-foreground">
									<Link
										href={`/admin/testimonials/${r.id}/edit`}
										className="hover:underline"
									>
										{r.name}
									</Link>
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{r.role ?? 'Unspecified'}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{r.company ?? 'Unspecified'}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{r.rating == null ? 'Unrated' : `${r.rating}/5`}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{r.featured ? 'Yes' : 'No'}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{r.published ? 'Yes' : 'No'}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{r.createdAt ? dateFormatter.format(r.createdAt) : 'Unknown'}
								</td>
								<td className="px-4 py-3 text-right">
									<div className="inline-flex items-center gap-2">
										<PublishToggle
											action={toggleTestimonialPublishedAction}
											id={r.id}
											published={r.published ?? false}
											resourceLabel="testimonial"
										/>
										<Link
											href={`/admin/testimonials/${r.id}/edit`}
											className="text-sm font-medium text-accent-text hover:underline"
										>
											Edit
										</Link>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</ResourceListPage>
	)
}

export default function AdminTestimonialsPage() {
	return (
		<Suspense
			fallback={
				<div className="text-sm text-muted-foreground">
					Loading testimonials...
				</div>
			}
		>
			<TestimonialsList />
		</Suspense>
	)
}
