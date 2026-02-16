/**
 * Portfolio Project Loading UI
 * Displays while portfolio project data is being fetched
 */

import { Card } from '@/components/ui/card'

export default function PortfolioLoading() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-section-sm">
				{/* Hero Section Skeleton */}
				<div className="mb-12 animate-pulse">
					<div className="h-8 bg-muted rounded-lg w-48 mb-4" />
					<div className="h-14 bg-muted rounded-lg w-3/4 mb-6" />
					<div className="h-6 bg-muted rounded-lg w-full max-w-2xl" />
				</div>

				{/* Image Skeleton */}
				<Card variant="glass" className="mb-12 animate-pulse">
					<div className="aspect-video bg-muted rounded-lg" />
				</Card>

				{/* Content Skeleton */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-content animate-pulse">
					<div className="lg:col-span-2 space-y-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-5 bg-muted rounded w-full" />
						))}
					</div>
					<Card variant="glass">
						<div className="space-y-content">
							<div className="h-5 bg-muted rounded w-24" />
							<div className="h-4 bg-muted rounded w-32" />
							<div className="h-4 bg-muted rounded w-28" />
						</div>
					</Card>
				</div>
			</div>
		</div>
	)
}
