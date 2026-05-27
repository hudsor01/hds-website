/**
 * Admin blog list page (server component).
 *
 * Phase 10 Wave 2: page now consumes the cursor-paginated + search-aware
 * `listBlogPostsForAdmin({ q?, cursor? })` helper. `<SearchInput>` lives
 * above the table (nuqs-driven `?q=`); shadcn `<Pagination>` lives below
 * (server-rendered `<Link>`s built from `buildPaginationHref`). When
 * `?q=` returns zero rows, the inline empty state surfaces a "Clear search"
 * link that drops `q` from the URL.
 *
 * Sort: `publishedAt DESC NULLS LAST, createdAt DESC, id ASC` -- same
 * ordering the public site uses, plus `id ASC` as a tuple tiebreaker for
 * the cursor (CONTEXT.md 5.2).
 *
 * Empty cells use the literal string "Unpublished" for missing
 * publishedAt and "No author" for an orphaned post. We never render an
 * em-dash / en-dash placeholder per the project-wide dash ban in
 * CLAUDE.md.
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
import { SearchInput } from '@/components/admin/SearchInput'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { listBlogPostsForAdmin } from '@/lib/admin/blog-queries'
import { buildPaginationHref } from '@/lib/admin/list-cursor'
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

interface AdminBlogPageProps {
	searchParams: Promise<{ q?: string; cursor?: string }>
}

async function BlogList({ searchParams }: AdminBlogPageProps) {
	await connection()
	const { q: rawQ, cursor } = await searchParams
	const q = (rawQ ?? '').trim()
	const { rows, prevCursor, nextCursor } = await listBlogPostsForAdmin({
		q: q.length > 0 ? q : undefined,
		cursor
	})
	const preservedForPagination: Record<string, string> =
		q.length > 0 ? { q } : {}

	return (
		<ResourceListPage
			title="Blog"
			newHref="/admin/blog/new"
			newLabel="New post"
			isEmpty={rows.length === 0 && q.length === 0}
			emptyMessage="No posts yet. Create your first one."
		>
			<div className="space-y-4">
				<SearchInput placeholder="Search posts" />
				{rows.length === 0 ? (
					<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
						<p className="text-sm text-muted-foreground">
							No posts matching <span className="font-mono">{q}</span>.
						</p>
						<Link
							href="/admin/blog"
							className="inline-block mt-3 text-sm font-medium text-accent-text hover:underline"
						>
							Clear search
						</Link>
					</div>
				) : (
					<>
						<Table>
							<TableCaption className="sr-only">Blog posts</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead>Title</TableHead>
									<TableHead>Slug</TableHead>
									<TableHead>Author</TableHead>
									<TableHead>Featured</TableHead>
									<TableHead>Published</TableHead>
									<TableHead>Published at</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map(row => (
									<TableRow key={row.post.id}>
										<TableCell className="font-medium text-foreground">
											<Link
												href={`/admin/blog/${row.post.id}/edit`}
												className="hover:underline"
											>
												{row.post.title}
											</Link>
										</TableCell>
										<TableCell className="text-muted-foreground font-mono text-xs">
											{row.post.slug}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{row.author?.name ?? 'No author'}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{row.post.featured ? 'Yes' : 'No'}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{row.post.published ? 'Yes' : 'No'}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{formatPublishedAt(row.post.publishedAt)}
										</TableCell>
										<TableCell className="text-right">
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
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<Pagination className="mt-4 justify-between">
							<PaginationContent>
								<PaginationItem>
									{prevCursor === null ? (
										<PaginationPrevious
											aria-disabled="true"
											className="pointer-events-none opacity-50"
										/>
									) : (
										<PaginationPrevious
											href={buildPaginationHref(
												'/admin/blog',
												prevCursor,
												preservedForPagination
											)}
										/>
									)}
								</PaginationItem>
								<PaginationItem>
									{nextCursor === null ? (
										<PaginationNext
											aria-disabled="true"
											className="pointer-events-none opacity-50"
										/>
									) : (
										<PaginationNext
											href={buildPaginationHref(
												'/admin/blog',
												nextCursor,
												preservedForPagination
											)}
										/>
									)}
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</>
				)}
			</div>
		</ResourceListPage>
	)
}

export default function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
	return (
		<Suspense
			fallback={
				<div className="text-sm text-muted-foreground">Loading blog...</div>
			}
		>
			<BlogList searchParams={searchParams} />
		</Suspense>
	)
}
