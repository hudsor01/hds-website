/**
 * Shared cursor-pagination control for the admin list pages (blog,
 * showcase, testimonials). Renders the shadcn `<Pagination>` footer with
 * server-built `<Link>` hrefs from `buildPaginationHref`; a null cursor
 * renders the disabled (non-interactive) variant of that edge.
 *
 * Server-compatible: no `'use client'`, no hooks or events. The three
 * list pages previously inlined this identical block, differing only by
 * `basePath` and the preserved query params.
 */
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination'
import { buildPaginationHref } from '@/lib/admin/list-cursor'

interface AdminListPaginationProps {
	/** List route the cursors resolve against, e.g. "/admin/blog". */
	basePath: string
	/** Previous-page cursor, or null when on the first page. */
	prevCursor: string | null
	/** Next-page cursor, or null when on the last page. */
	nextCursor: string | null
	/** Query params to carry across pages (e.g. the active search `q`). */
	preservedParams?: Record<string, string>
}

export function AdminListPagination({
	basePath,
	prevCursor,
	nextCursor,
	preservedParams
}: AdminListPaginationProps) {
	return (
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
							href={buildPaginationHref(basePath, prevCursor, preservedParams)}
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
							href={buildPaginationHref(basePath, nextCursor, preservedParams)}
						/>
					)}
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	)
}
