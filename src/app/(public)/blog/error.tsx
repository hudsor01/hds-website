'use client'

/**
 * Section-scoped error boundary for the blog tree.
 *
 * Without this, a throw inside any of the Suspense-bounded async
 * sections in `/blog/page.tsx` (FeaturedSection, AllPostsSection,
 * TagsSection) bubbles to the root `src/app/error.tsx`, which resets
 * the entire navbar+page shell instead of just the failed section.
 * Co-locating an error.tsx with the Suspense-using page contains the
 * blast radius and offers a "Try again" reset that re-runs the data
 * fetches without a full reload.
 */

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface BlogErrorProps {
	error: Error & { digest?: string }
	reset: () => void
}

export default function BlogError({ error, reset }: BlogErrorProps) {
	useEffect(() => {
		// No-op until the client SDK is initialised (NEXT_PUBLIC_SENTRY_DSN).
		Sentry.captureException(error)
	}, [error])

	return (
		<div className="container-wide py-section-sm text-center">
			<h2 className="text-h3 text-foreground mb-3">
				Couldn't load the blog right now
			</h2>
			<p className="text-sm text-muted-foreground mb-6">
				A temporary error stopped a section from rendering. Try again or come
				back in a minute.
			</p>
			{error.digest && (
				<p className="text-xs text-muted-foreground mb-6 font-mono">
					Error ID: {error.digest}
				</p>
			)}
			<Button onClick={reset} variant="accent">
				Try again
			</Button>
		</div>
	)
}
