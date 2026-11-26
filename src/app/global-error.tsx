'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { fontVariables } from './fonts'
import './globals.css'

export default function GlobalError({
	error,
	reset
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		// No-op until the client SDK is initialised (NEXT_PUBLIC_SENTRY_DSN).
		Sentry.captureException(error)
	}, [error])

	return (
		<html lang="en" className={fontVariables}>
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
						<Button type="button" size="lg" onClick={reset}>
							Try again
						</Button>
						<Button
							type="button"
							variant="secondary"
							size="lg"
							onClick={() => {
								window.location.href = '/'
							}}
						>
							Go home
						</Button>
					</div>

					<div className="mt-8 p-4 bg-muted rounded-xl">
						<p className="text-sm text-muted-foreground">
							If this issue persists, please contact{' '}
							<a
								href={`mailto:${BUSINESS_INFO.email}`}
								className="link-primary"
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
