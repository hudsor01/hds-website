import { Tag } from 'lucide-react'
import Link from 'next/link'
import type { BlogTag } from '@/lib/blog'
import { cn } from '@/lib/utils'

type TagWithCount = BlogTag & { count?: number }

interface TagListProps {
	tags: Array<BlogTag | TagWithCount>
	activeSlug?: string
}

export function TagList({ tags, activeSlug }: TagListProps) {
	if (tags.length === 0) {
		return null
	}

	return (
		<div className="flex flex-wrap gap-2">
			{tags.map(tag => {
				const isActive = tag.slug === activeSlug
				const count = (tag as TagWithCount).count
				return (
					<Link
						key={tag.id}
						href={`/blog/tag/${tag.slug}`}
						aria-current={isActive ? 'page' : undefined}
						className={cn(
							'flex items-center gap-1 text-sm px-3 py-1 border rounded-md transition-colors',
							isActive
								? 'text-accent-foreground bg-accent border-accent'
								: 'text-accent border-accent/30 hover:text-accent-foreground hover:bg-accent'
						)}
					>
						<Tag className="w-4 h-4" />
						{tag.name}
						{typeof count === 'number' && (
							<span
								className={cn(
									'tabular-nums text-xs',
									isActive ? 'opacity-90' : 'opacity-70'
								)}
							>
								({count})
							</span>
						)}
					</Link>
				)
			})}
		</div>
	)
}
