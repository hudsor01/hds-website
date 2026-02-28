/**
 * Portfolio Project Loading UI
 * Displays while portfolio project data is being fetched
 */

export default function PortfolioLoading() {
	return (
		<main className="min-h-screen bg-background">
			{/* Back button skeleton */}
			<div className="container-wide px-4 sm:px-6 pt-24 pb-8 animate-pulse">
				<div className="h-4 bg-muted rounded w-32" />
			</div>

			{/* Hero Section Skeleton */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide animate-pulse">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-6">
							<div className="h-6 bg-muted rounded-full w-28" />
							<div className="h-14 bg-muted rounded-lg w-3/4" />
							<div className="space-y-2">
								<div className="h-5 bg-muted rounded w-full" />
								<div className="h-5 bg-muted rounded w-5/6" />
							</div>
							<div className="flex gap-3">
								<div className="h-10 bg-muted rounded-lg w-32" />
								<div className="h-10 bg-muted rounded-lg w-28" />
							</div>
						</div>
						<div className="aspect-video bg-muted rounded-2xl" />
					</div>
				</div>
			</section>

			{/* Content Skeleton */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide animate-pulse">
					<div className="rounded-xl border border-border bg-surface-raised p-8">
						<div className="h-6 bg-muted rounded w-40 mb-6" />
						<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="text-center space-y-2">
									<div className="h-8 bg-muted rounded w-16 mx-auto" />
									<div className="h-4 bg-muted rounded w-24 mx-auto" />
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
