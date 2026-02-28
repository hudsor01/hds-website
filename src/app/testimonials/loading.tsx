/**
 * Testimonials Loading UI
 * Displays while testimonials are being fetched
 */

export default function TestimonialsLoading() {
	return (
		<main className="min-h-screen bg-background">
			{/* Hero Skeleton */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center animate-pulse">
					<div className="h-4 bg-muted rounded w-32 mx-auto mb-3" />
					<div className="h-12 bg-muted rounded-lg w-64 mx-auto mb-6" />
					<div className="h-6 bg-muted rounded-lg w-96 mx-auto" />
				</div>
			</section>

			{/* Testimonials Grid Skeleton */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(6)].map((_, i) => (
							<div
								key={i}
								className="rounded-xl border border-border bg-surface-raised p-8 animate-pulse"
							>
								<div className="space-y-4">
									<div className="flex gap-1">
										{[...Array(5)].map((__, j) => (
											<div key={j} className="h-5 w-5 bg-muted rounded" />
										))}
									</div>
									<div className="h-6 bg-muted rounded-full w-28" />
									<div className="space-y-2">
										<div className="h-4 bg-muted rounded w-full" />
										<div className="h-4 bg-muted rounded w-5/6" />
										<div className="h-4 bg-muted rounded w-4/6" />
									</div>
									<div className="border-t border-border pt-4 space-y-2">
										<div className="h-4 bg-muted rounded w-32" />
										<div className="h-3 bg-muted rounded w-24" />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</main>
	)
}
