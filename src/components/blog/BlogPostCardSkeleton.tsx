/**
 * Loading placeholder that mirrors the real BlogPostCard layout
 * (aspect-video image + p-6 content with title, excerpt, and a meta
 * row) so the skeleton occupies the same shape the content will, with
 * no layout shift when posts resolve. Audit #275.
 */
export function BlogPostCardSkeleton() {
	return (
		<article
			className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface-raised"
			aria-hidden="true"
		>
			{/* Image */}
			<div className="aspect-video bg-muted/40 animate-pulse" />

			{/* Content */}
			<div className="flex flex-1 flex-col p-6">
				{/* Title (two lines) */}
				<div className="mb-3 space-y-2">
					<div className="h-5 w-11/12 rounded bg-muted/40 animate-pulse" />
					<div className="h-5 w-2/3 rounded bg-muted/40 animate-pulse" />
				</div>
				{/* Excerpt (three lines) */}
				<div className="mb-4 space-y-2">
					<div className="h-3 w-full rounded bg-muted/30 animate-pulse" />
					<div className="h-3 w-full rounded bg-muted/30 animate-pulse" />
					<div className="h-3 w-4/5 rounded bg-muted/30 animate-pulse" />
				</div>
				{/* Meta row (date + reading time) */}
				<div className="mt-auto flex items-center gap-4">
					<div className="h-3 w-20 rounded bg-muted/30 animate-pulse" />
					<div className="h-3 w-14 rounded bg-muted/30 animate-pulse" />
				</div>
			</div>
		</article>
	)
}
