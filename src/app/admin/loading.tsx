/**
 * Admin Loading UI
 * Displays while admin dashboard data is being fetched
 */

import { Card } from '@/components/ui/card'

export default function AdminLoading() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-section-sm">
				{/* Header Skeleton */}
				<div className="mb-8 animate-pulse">
					<div className="h-10 bg-muted rounded-lg w-64 mb-4" />
					<div className="h-5 bg-muted rounded-lg w-96" />
				</div>

				{/* Stats Cards Skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-content mb-8">
					{[...Array(3)].map((_, i) => (
						<Card key={i} variant="glass" className="animate-pulse">
							<div className="space-y-content">
								<div className="h-4 bg-muted rounded w-24" />
								<div className="h-8 bg-muted rounded w-16" />
							</div>
						</Card>
					))}
				</div>

				{/* Table Skeleton */}
				<Card variant="glass" className="animate-pulse">
					<div className="space-y-4">
						<div className="h-6 bg-muted rounded w-32" />
						{[...Array(5)].map((_, i) => (
							<div key={i} className="h-12 bg-muted rounded" />
						))}
					</div>
				</Card>
			</div>
		</div>
	)
}
