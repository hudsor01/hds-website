/**
 * Admin "Edit post" page (server component).
 *
 * Loads the post via `getBlogPostForAdmin(id)`; 404s on miss so the
 * operator gets the platform 404 instead of an empty form. Author / tag
 * options come from the same public read helpers as the create page so
 * the dropdowns stay in sync with what the public site sees.
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
import { getBlogPostForAdmin } from '@/lib/admin/blog-queries'
import { BUILD_PLACEHOLDER_ID } from '@/lib/admin/build-placeholder'
import { routeDetailResult } from '@/lib/admin/detail-result-routing'
import { getAuthors, getTags } from '@/lib/blog'
import { EditBlogForm } from './EditBlogForm'

export const metadata: Metadata = {
	title: 'Admin: Edit post',
	robots: { index: false, follow: false }
}

// `cacheComponents` rejects an empty static-params list; the loader
// short-circuits the placeholder to `notFound()` before `connection()`
// to avoid a PPR postponed-boundary marker the client can't reveal. See
// `@/lib/admin/build-placeholder` for the full root-cause analysis.
export function generateStaticParams() {
	return [{ id: BUILD_PLACEHOLDER_ID }]
}

interface EditBlogPostPageProps {
	params: Promise<{ id: string }>
}

async function EditLoader({ params }: EditBlogPostPageProps) {
	const { id } = await params
	if (id === BUILD_PLACEHOLDER_ID) {
		notFound()
	}
	await connection()
	const [postResult, authors, tags] = await Promise.all([
		getBlogPostForAdmin(id),
		getAuthors(),
		getTags()
	])
	const routing = routeDetailResult(postResult)
	if (routing.kind === 'not-found') {
		notFound()
	}
	if (routing.kind === 'error') {
		return <AdminErrorState resource="blog post" />
	}
	const post = routing.data
	return (
		<EditBlogForm
			row={post}
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
