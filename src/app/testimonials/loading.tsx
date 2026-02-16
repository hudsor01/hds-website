/**
 * Testimonials Loading UI
 * Displays while testimonials are being fetched
 */

import { Card } from '@/components/ui/card'

export default function TestimonialsLoading() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-section-sm">
				{/* Header Skeleton */}
				<div className="text-center mb-12 animate-pulse">
					<div className="h-12 bg-muted rounded-lg w-64 mx-auto mb-heading" />
					<div className="h-6 bg-muted rounded-lg w-96 mx-auto" />
				</div>

				{/* Testimonials Grid Skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-content">
					{[...Array(4)].map((_, i) => (
						<Card key={i} variant="glass" className="animate-pulse">
							<div className="space-y-content">
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 bg-muted rounded-full" />
									<div className="space-y-2">
										<div className="h-5 bg-muted rounded w-32" />
										<div className="h-4 bg-muted rounded w-24" />
									</div>
								</div>
								<div className="space-y-2">
									<div className="h-4 bg-muted rounded w-full" />
									<div className="h-4 bg-muted rounded w-5/6" />
									<div className="h-4 bg-muted rounded w-4/6" />
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</div>
	)
}
