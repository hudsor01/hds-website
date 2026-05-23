/**
 * Admin blog list page (server component).
 *
 * Loads every post (published + unpublished) via `listBlogPostsForAdmin`,
 * sorted by publishedAt DESC NULLS LAST, createdAt DESC (CONTEXT.md 5.2).
 * Each row links into the per-post edit page; the publish toggle posts to
 * a dedicated Server Action so the operator can flip published without
 * opening the edit form.
 *
 * Empty cells use the literal string "Unpublished" for missing
 * publishedAt and "No author" for an orphaned post. We never render an
 * em-dash / en-dash placeholder per the project-wide dash ban in
 * CLAUDE.md.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { PublishToggle } from '@/components/admin/PublishToggle'
import { ResourceListPage } from '@/components/admin/ResourceListPage'
import { listBlogPostsForAdmin } from '@/lib/admin/blog-queries'
import { toggleBlogPostPublishedAction } from './actions'

export const metadata: Metadata = {
	title: 'Admin: Blog',
	robots: { index: false, follow: false }
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	day: 'numeric'
})

function formatPublishedAt(value: Date | null): string {
	if (!value) {
		return 'Unpublished'
	}
	return dateFormatter.format(value)
}

export default async function AdminBlogPage() {
	const rows = await listBlogPostsForAdmin()

	return (
		<ResourceListPage
			title="Blog"
			newHref="/admin/blog/new"
			newLabel="New post"
			isEmpty={rows.length === 0}
			emptyMessage="No posts yet. Create your first one."
		>
			<div className="overflow-x-auto rounded-xl border border-border bg-surface-raised">
				<table className="w-full text-sm">
					<thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
						<tr>
							<th className="px-4 py-3 font-medium">Title</th>
							<th className="px-4 py-3 font-medium">Slug</th>
							<th className="px-4 py-3 font-medium">Author</th>
							<th className="px-4 py-3 font-medium">Featured</th>
							<th className="px-4 py-3 font-medium">Published</th>
							<th className="px-4 py-3 font-medium">Published at</th>
							<th className="px-4 py-3 font-medium text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{rows.map(row => (
							<tr key={row.post.id} className="hover:bg-surface-base">
								<td className="px-4 py-3 font-medium text-foreground">
									<Link
										href={`/admin/blog/${row.post.id}/edit`}
										className="hover:underline"
									>
										{row.post.title}
									</Link>
								</td>
								<td className="px-4 py-3 text-muted-foreground font-mono text-xs">
									{row.post.slug}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{row.author?.name ?? 'No author'}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{row.post.featured ? 'Yes' : 'No'}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{row.post.published ? 'Yes' : 'No'}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{formatPublishedAt(row.post.publishedAt)}
								</td>
								<td className="px-4 py-3 text-right">
									<div className="inline-flex items-center gap-2 justify-end">
										<PublishToggle
											action={toggleBlogPostPublishedAction}
											id={row.post.id}
											published={row.post.published ?? false}
											resourceLabel="post"
										/>
										<Link
											href={`/admin/blog/${row.post.id}/edit`}
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
