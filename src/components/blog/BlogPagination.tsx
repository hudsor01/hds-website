import { buttonVariants } from '@/components/ui/button-variants'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination'

interface BlogPaginationProps {
	currentPage: number
	totalPages: number
}

/** Page 1 of the listing is /blog itself; later pages are /blog/page/N. */
export function blogPageHref(page: number): string {
	return page <= 1 ? '/blog' : `/blog/page/${page}`
}

/**
 * Plain anchor links between the blog listing pages, so crawlers can reach
 * every post from /blog. Renders nothing when everything fits on one page.
 */
export function BlogPagination({
	currentPage,
	totalPages
}: BlogPaginationProps) {
	if (totalPages <= 1) {
		return null
	}

	const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

	return (
		<Pagination aria-label="Blog pages" className="mt-10">
			<PaginationContent className="flex-wrap justify-center">
				{currentPage > 1 && (
					<PaginationItem>
						<PaginationPrevious href={blogPageHref(currentPage - 1)} />
					</PaginationItem>
				)}
				{pages.map(page => {
					const isCurrent = page === currentPage
					return (
						<PaginationItem key={page}>
							<a
								href={blogPageHref(page)}
								aria-current={isCurrent ? 'page' : undefined}
								aria-label={`Page ${page}`}
								className={buttonVariants({
									variant: isCurrent ? 'outline' : 'ghost',
									size: 'icon'
								})}
							>
								{page}
							</a>
						</PaginationItem>
					)
				})}
				{currentPage < totalPages && (
					<PaginationItem>
						<PaginationNext href={blogPageHref(currentPage + 1)} />
					</PaginationItem>
				)}
			</PaginationContent>
		</Pagination>
	)
}
