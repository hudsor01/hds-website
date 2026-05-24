/**
 * Admin "New post" page (server component).
 *
 * Fetches author + tag options server-side via the existing public read
 * helpers in `src/lib/blog.ts` (no admin-specific fetch needed because
 * authors / tags are not filtered by `published`). Passes the lists to
 * the client form as plain prop arrays so the client island does not
 * need to call the DB itself.
 *
 * Author and tag CRUD are explicitly out of scope for Phase 04 (CONTEXT.md
 * D-07); the create form picks from existing rows only.
 *
 * Wrapped in <Suspense> + `await connection()` so the DB read stays out
 * of any partial prerender step in `next build` (same pattern as the
 * dashboard page).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { getAuthors, getTags } from '@/lib/blog'
import { CreateBlogForm } from './CreateBlogForm'

export const metadata: Metadata = {
	title: 'Admin: New post',
	robots: { index: false, follow: false }
}

async function NewPostLoader() {
	await connection()
	const [authors, tags] = await Promise.all([getAuthors(), getTags()])
	return (
		<CreateBlogForm
			authorOptions={authors.map(a => ({ id: a.id, name: a.name }))}
			tagOptions={tags.map(t => ({ id: t.id, name: t.name }))}
		/>
	)
}

export default function NewBlogPostPage() {
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
					New post
				</h1>
			</div>
			<Suspense
				fallback={
					<div className="text-sm text-muted-foreground">Loading...</div>
				}
			>
				<NewPostLoader />
			</Suspense>
		</div>
	)
}
