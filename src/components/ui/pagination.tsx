import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'

import {
	type ButtonProps,
	buttonVariants
} from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
	<nav
		role="navigation"
		aria-label="pagination"
		className={cn('mx-auto flex w-full justify-center', className)}
		{...props}
	/>
)
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<
	HTMLUListElement,
	React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
	<ul
		ref={ref}
		className={cn('flex flex-row items-center gap-1', className)}
		{...props}
	/>
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
	HTMLLIElement,
	React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
	<li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

type PaginationLinkProps = {
	isActive?: boolean
} & Pick<ButtonProps, 'size'> &
	React.ComponentProps<'a'>

const PaginationLink = ({
	className,
	isActive,
	size = 'icon',
	...props
}: PaginationLinkProps) => (
	<a
		aria-current={isActive ? 'page' : undefined}
		className={cn(
			buttonVariants({
				variant: isActive ? 'outline' : 'ghost',
				size
			}),
			className
		)}
		{...props}
	/>
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink
		aria-label="Go to previous page"
		size="default"
		className={cn('gap-1 pl-2.5', className)}
		{...props}
	>
		<ChevronLeft className="h-4 w-4" />
		<span>Previous</span>
	</PaginationLink>
)
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink
		aria-label="Go to next page"
		size="default"
		className={cn('gap-1 pr-2.5', className)}
		{...props}
	>
		<span>Next</span>
		<ChevronRight className="h-4 w-4" />
	</PaginationLink>
)
PaginationNext.displayName = 'PaginationNext'

// `PaginationLink` is intentionally not exported — it is an internal
// primitive used by PaginationNext/PaginationPrevious. Re-add to the
// barrel below if a consumer needs to render a custom page link.
export {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious
}
