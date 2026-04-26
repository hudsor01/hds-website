'use client'

import { useEffect } from 'react'
import { BUSINESS_INFO } from '@/lib/constants/business'
import './globals.css'

export default function GlobalError({
	error,
	reset
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		// Use console.error — cannot import server-side logger here as
		// global-error.tsx is a 'use client' component and importing logger.ts
		// pulls in db.ts which accesses DATABASE_URL, crashing client hydration.
		console.error('[GlobalError] CRITICAL: Global Application Error', {
			name: error.name,
			message: error.message,
			digest: error.digest
		})
	}, [error])

	return (
		<html lang="en">
			<body className="min-h-screen flex items-center justify-center p-6 font-sans bg-background text-foreground">
				<div className="max-w-md w-full text-center">
					<div className="w-16 h-16 mx-auto mb-6 bg-destructive-light rounded-full flex items-center justify-center">
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-destructive"
							aria-hidden="true"
						>
							<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
							<line x1="12" y1="9" x2="12" y2="13" />
							<line x1="12" y1="17" x2="12.01" y2="17" />
						</svg>
					</div>

					<h1 className="text-2xl font-bold mb-3 text-foreground">
						Application Error
					</h1>

					<p className="text-muted-foreground mb-6 leading-snug">
						A critical error occurred and the application could not recover.
						Please refresh the page or try again later.
					</p>

					{error.digest && (
						<p className="text-xs text-muted-foreground mb-6 font-mono">
							Error ID: {error.digest}
						</p>
					)}

					<div className="flex gap-3 justify-center flex-wrap">
						<button
							type="button"
							onClick={reset}
							className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium cursor-pointer border-0"
						>
							Try again
						</button>
						<button
							type="button"
							onClick={() => {
								window.location.href = '/'
							}}
							className="px-6 py-3 bg-border text-foreground rounded-lg text-base font-medium cursor-pointer border-0"
						>
							Go home
						</button>
					</div>

					<div className="mt-8 p-4 bg-muted rounded-lg">
						<p className="text-sm text-muted-foreground">
							If this issue persists, please contact{' '}
							<a
								href={`mailto:${BUSINESS_INFO.email}`}
								className="text-primary underline"
							>
								support
							</a>
						</p>
					</div>
				</div>
			</body>
		</html>
	)
}
