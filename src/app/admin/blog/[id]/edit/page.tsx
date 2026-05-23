/**
 * Admin "Edit post" page (server component).
 *
 * Loads the post via `getBlogPostForAdmin(id)`; 404s on miss so the
 * operator gets the platform 404 instead of an empty form. Author / tag
 * options come from the same public read helpers as the create page so
 * the dropdowns stay in sync with what the public site sees.
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

// `cacheComponents` requires at least one sample id so the build can
// validate dynamic accesses against a real prerender. The placeholder
// never resolves to a real post (getBlogPostForAdmin returns null which
// triggers notFound()), so the only thing that ships from this prerender
// is the 404 path -- real ids render on first request via ISR.
export function generateStaticParams() {
	return [{ id: '__build_placeholder__' }]
}

async function EditLoader({ params }: EditBlogPostPageProps) {
	await connection()
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
		<EditBlogForm
			row={row}
			authorOptions={authors.map(a => ({ id: a.id, name: a.name }))}
			tagOptions={tags.map(t => ({ id: t.id, name: t.name }))}
		/>
	)
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
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
