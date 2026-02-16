/**
 * Root Loading UI
 * Displays during initial page load or navigation
 */

export default function Loading() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center">
			<div className="animate-pulse text-center">
				<div className="h-12 w-12 mx-auto mb-4 rounded-full bg-muted" />
				<div className="h-4 bg-muted rounded w-32 mx-auto" />
			</div>
		</div>
	)
}
