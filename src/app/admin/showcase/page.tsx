/**
 * Admin Showcase list page (server component).
 *
 * Renders every showcase row (published + unpublished) sorted by
 * `displayOrder ASC, createdAt DESC` to match the public site. Each row
 * links to its edit page; a small icon-button toggles publish from the
 * list without leaving the page.
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
import { listShowcasesForAdmin } from '@/lib/admin/showcase-queries'
import { toggleShowcasePublishedAction } from './actions'

export const metadata: Metadata = {
	title: 'Admin: Showcase',
	robots: { index: false, follow: false }
}

async function ShowcaseList() {
	await connection()
	const rows = await listShowcasesForAdmin()
	return (
		<ResourceListPage
			title="Showcase"
			newHref="/admin/showcase/new"
			newLabel="New showcase"
			isEmpty={rows.length === 0}
			emptyMessage="No showcase yet. Create your first one."
		>
			<div className="overflow-x-auto rounded-xl border border-border bg-surface-raised">
				<table className="w-full text-sm">
					<thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-surface-base">
						<tr>
							<th className="px-4 py-3 font-medium">Title</th>
							<th className="px-4 py-3 font-medium">Slug</th>
							<th className="px-4 py-3 font-medium">Type</th>
							<th className="px-4 py-3 font-medium">Featured</th>
							<th className="px-4 py-3 font-medium">Published</th>
							<th className="px-4 py-3 font-medium text-right">Order</th>
							<th className="px-4 py-3 font-medium text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{rows.map(r => (
							<tr key={r.id} className="border-t border-border">
								<td className="px-4 py-3 text-foreground">
									<Link
										href={`/admin/showcase/${r.id}/edit`}
										className="hover:underline"
									>
										{r.title}
									</Link>
								</td>
								<td className="px-4 py-3 text-muted-foreground">{r.slug}</td>
								<td className="px-4 py-3 text-muted-foreground">
									{r.showcaseType}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{r.featured ? 'Yes' : 'No'}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{r.published ? 'Yes' : 'No'}
								</td>
								<td className="px-4 py-3 text-right text-muted-foreground">
									{r.displayOrder ?? 0}
								</td>
								<td className="px-4 py-3 text-right">
									<div className="inline-flex items-center gap-2">
										<PublishToggle
											action={toggleShowcasePublishedAction}
											id={r.id}
											published={r.published ?? false}
											resourceLabel="showcase"
										/>
										<Link
											href={`/admin/showcase/${r.id}/edit`}
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

export default function AdminShowcasePage() {
	return (
		<Suspense
			fallback={
				<div className="text-sm text-muted-foreground">Loading showcase...</div>
			}
		>
			<ShowcaseList />
		</Suspense>
	)
}
