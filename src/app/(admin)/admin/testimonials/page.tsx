/**
 * Admin Testimonials list page (server component).
 *
 * Renders every testimonial row (published + unpublished) sorted by
 * `createdAt DESC, id ASC`. Each row links to its edit page; a small
 * icon-button toggles publish from the list without leaving the page.
 *
 * Phase 10 Wave 2: page now consumes the cursor-paginated + search-aware
 * `listTestimonialsForAdmin({ q?, cursor? })` helper. `<SearchInput>` lives
 * above the table (nuqs-driven `?q=`); shadcn `<Pagination>` lives below
 * (server-rendered `<Link>`s built from `buildPaginationHref`). When
 * `?q=` returns zero rows, the inline empty state surfaces a "Clear search"
 * link that drops `q` from the URL.
 *
 * Wrapped in <Suspense> + `await connection()` so the DB read stays out
 * of any partial prerender step in `next build` (the dashboard page uses
 * the same pattern).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { AdminErrorState } from '@/components/admin/AdminErrorState'
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
import { buildPaginationHref } from '@/lib/admin/list-cursor'
import { listTestimonialsForAdmin } from '@/lib/admin/testimonials-queries'
import { toggleTestimonialPublishedAction } from './actions'

export const metadata: Metadata = {
	title: 'Admin: Testimonials',
	robots: { index: false, follow: false }
}

interface AdminTestimonialsPageProps {
	searchParams: Promise<{ q?: string; cursor?: string }>
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	day: 'numeric'
})

async function TestimonialsList({ searchParams }: AdminTestimonialsPageProps) {
	await connection()
	const { q: rawQ, cursor } = await searchParams
	const q = (rawQ ?? '').trim()
	const result = await listTestimonialsForAdmin({
		q: q.length > 0 ? q : undefined,
		cursor
	})
	if (!result.ok) {
		return <AdminErrorState resource="testimonials" />
	}
	const { rows, prevCursor, nextCursor } = result.data
	const preservedForPagination: Record<string, string> =
		q.length > 0 ? { q } : {}

	return (
		<ResourceListPage
			title="Testimonials"
			newHref="/admin/testimonials/new"
			newLabel="New testimonial"
			isEmpty={rows.length === 0 && q.length === 0}
			emptyMessage="No testimonials yet. Create your first one."
		>
			<div className="space-y-4">
				<SearchInput placeholder="Search testimonials" />
				{rows.length === 0 ? (
					<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
						<p className="text-sm text-muted-foreground">
							No testimonials matching <span className="font-mono">{q}</span>.
						</p>
						<Link
							href="/admin/testimonials"
							className="inline-block mt-3 text-sm font-medium text-accent-text hover:underline"
						>
							Clear search
						</Link>
					</div>
				) : (
					<>
						<Table>
							<TableCaption className="sr-only">Testimonials</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Company</TableHead>
									<TableHead>Rating</TableHead>
									<TableHead>Featured</TableHead>
									<TableHead>Published</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map(r => (
									<TableRow key={r.id}>
										<TableCell className="text-foreground">
											<Link
												href={`/admin/testimonials/${r.id}/edit`}
												className="hover:underline"
											>
												{r.name}
											</Link>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{r.role ?? 'Unspecified'}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{r.company ?? 'Unspecified'}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{r.rating == null ? 'Unrated' : `${r.rating}/5`}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{r.featured ? 'Yes' : 'No'}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{r.published ? 'Yes' : 'No'}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{r.createdAt
												? dateFormatter.format(r.createdAt)
												: 'Unknown'}
										</TableCell>
										<TableCell className="text-right">
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
												'/admin/testimonials',
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
												'/admin/testimonials',
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

export default function AdminTestimonialsPage({
	searchParams
}: AdminTestimonialsPageProps) {
	return (
		<Suspense
			fallback={
				<div className="text-sm text-muted-foreground">
					Loading testimonials...
				</div>
			}
		>
			<TestimonialsList searchParams={searchParams} />
		</Suspense>
	)
}
