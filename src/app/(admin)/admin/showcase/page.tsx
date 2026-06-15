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
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import { AdminListPagination } from '@/components/admin/AdminListPagination'
import { AdminSearchEmptyState } from '@/components/admin/AdminSearchEmptyState'
import { PublishToggle } from '@/components/admin/PublishToggle'
import { ResourceListPage } from '@/components/admin/ResourceListPage'
import { SearchInput } from '@/components/admin/SearchInput'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
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
	const result = await listShowcasesForAdmin({
		q: q.length > 0 ? q : undefined,
		cursor
	})
	if (!result.ok) {
		return <AdminErrorState resource="showcase entries" />
	}
	const { rows, prevCursor, nextCursor } = result.data
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
					<AdminSearchEmptyState
						query={q}
						label="showcase entries"
						clearHref="/admin/showcase"
					/>
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
						<AdminListPagination
							basePath="/admin/showcase"
							prevCursor={prevCursor}
							nextCursor={nextCursor}
							preservedParams={preservedForPagination}
						/>
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
