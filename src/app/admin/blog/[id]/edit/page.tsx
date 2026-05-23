/**
 * Admin "Edit post" page (server component).
 *
 * Loads the post via `getBlogPostForAdmin(id)`; 404s on miss so the
 * operator gets the platform 404 instead of an empty form. Author / tag
 * options come from the same public read helpers as the create page so
 * the dropdowns stay in sync with what the public site sees.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPostForAdmin } from '@/lib/admin/blog-queries'
import { getAuthors, getTags } from '@/lib/blog'
import { EditBlogForm } from './EditBlogForm'

export const metadata: Metadata = {
	title: 'Admin: Edit post',
	robots: { index: false, follow: false }
}

interface EditBlogPostPageProps {
	params: Promise<{ id: string }>
}

export default async function EditBlogPostPage({
	params
}: EditBlogPostPageProps) {
	const { id } = await params
	const [row, authors, tags] = await Promise.all([
		getBlogPostForAdmin(id),
		getAuthors(),
		getTags()
	])
	if (!row) {
		notFound()
	}
	return (
		<div className="space-y-6">
			<div>
				<Link
					href="/admin/blog"
					className="text-sm text-accent-text hover:underline"
				>
					Back to blog
				</Link>
				<h1 className="text-2xl font-semibold text-foreground mt-2">
					Edit post
				</h1>
			</div>
			<EditBlogForm
				row={row}
				authorOptions={authors.map(a => ({ id: a.id, name: a.name }))}
				tagOptions={tags.map(t => ({ id: t.id, name: t.name }))}
			/>
		</div>
	)
}
