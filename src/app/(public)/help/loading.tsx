/**
 * Help Center Loading UI
 * Displays while help content is being fetched
 */

export default function HelpLoading() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container-wide py-section-sm">
				{/* Header Skeleton */}
				<div className="text-center mb-12 animate-pulse">
					<div className="h-12 bg-muted rounded-md w-48 mx-auto mb-heading" />
					<div className="h-6 bg-muted rounded-md w-80 mx-auto" />
				</div>

				{/* Categories Grid Skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-content">
					{[...Array(6)].map((_, i) => (
						<div
							key={i}
							className="rounded-xl border border-border bg-card p-8 animate-pulse"
						>
							<div className="space-y-content">
								<div className="h-10 w-10 bg-muted rounded-xl" />
								<div className="h-6 bg-muted rounded-md w-32" />
								<div className="h-4 bg-muted rounded-md w-full" />
								<div className="h-4 bg-muted rounded-md w-3/4" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
