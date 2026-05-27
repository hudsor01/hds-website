/**
 * Admin Showcase list page (server component).
 *
 * Renders showcase rows (published + unpublished) sorted by
 * `displayOrder ASC, createdAt DESC, id ASC` to match the public site.
 * Each row links to its edit page; a small icon-button toggles publish
 * from the list without leaving the page.
 *
 * Phase 10 Wave 2: page now consumes the cursor-paginated + search-aware
 * `listShowcasesForAdmin({ q?, cursor? })` helper. `<SearchInput>` lives
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
import { listShowcasesForAdmin } from '@/lib/admin/showcase-queries'
import { toggleShowcasePublishedAction } from './actions'

export const metadata: Metadata = {
	title: 'Admin: Showcase',
	robots: { index: false, follow: false }
}

interface AdminShowcasePageProps {
	searchParams: Promise<{ q?: string; cursor?: string }>
}

async function ShowcaseList({ searchParams }: AdminShowcasePageProps) {
	await connection()
	const { q: rawQ, cursor } = await searchParams
	const q = (rawQ ?? '').trim()
	const { rows, prevCursor, nextCursor } = await listShowcasesForAdmin({
		q: q.length > 0 ? q : undefined,
		cursor
	})
	const preservedForPagination: Record<string, string> =
		q.length > 0 ? { q } : {}

	return (
		<ResourceListPage
			title="Showcase"
			newHref="/admin/showcase/new"
			newLabel="New showcase"
			isEmpty={rows.length === 0 && q.length === 0}
			emptyMessage="No showcase yet. Create your first one."
		>
			<div className="space-y-4">
				<SearchInput placeholder="Search showcase" />
				{rows.length === 0 ? (
					<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
						<p className="text-sm text-muted-foreground">
							No showcase entries matching{' '}
							<span className="font-mono">{q}</span>.
						</p>
						<Link
							href="/admin/showcase"
							className="inline-block mt-3 text-sm font-medium text-accent-text hover:underline"
						>
							Clear search
						</Link>
					</div>
				) : (
					<>
						<Table>
							<TableCaption className="sr-only">Showcase entries</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead>Title</TableHead>
									<TableHead>Slug</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Featured</TableHead>
									<TableHead>Published</TableHead>
									<TableHead className="text-right">Order</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map(r => (
									<TableRow key={r.id}>
										<TableCell className="text-foreground">
											<Link
												href={`/admin/showcase/${r.id}/edit`}
												className="hover:underline"
											>
												{r.title}
											</Link>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{r.slug}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{r.showcaseType}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{r.featured ? 'Yes' : 'No'}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{r.published ? 'Yes' : 'No'}
										</TableCell>
										<TableCell className="text-right text-muted-foreground">
											{r.displayOrder ?? 0}
										</TableCell>
										<TableCell className="text-right">
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
												'/admin/showcase',
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
												'/admin/showcase',
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

export default function AdminShowcasePage({
	searchParams
}: AdminShowcasePageProps) {
	return (
		<Suspense
			fallback={
				<div className="text-sm text-muted-foreground">Loading showcase...</div>
			}
		>
			<ShowcaseList searchParams={searchParams} />
		</Suspense>
	)
}
