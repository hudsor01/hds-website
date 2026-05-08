'use client'

import { type ReactNode, useEffect } from 'react'

interface ClientProvidersProps {
	children: ReactNode
}

/**
 * Adds an `a11y-ready` class to the document root on mount so CSS can
 * style focus/contrast rules that should only apply once JS has hydrated.
 * Removed on unmount per MDN cleanup guidance.
 *
 * QueryClientProvider used to live here, but it was scoped down — only
 * ContactForm and NewsletterSignup actually use TanStack Query, and each
 * now wraps itself in its own QueryProvider. This shaves the bootstrap
 * cost + dehydrated-state hydration off every page that doesn't need it.
 */
export default function ClientProviders({ children }: ClientProvidersProps) {
	useEffect(() => {
		document.documentElement.classList.add('a11y-ready')
		return () => {
			document.documentElement.classList.remove('a11y-ready')
		}
	}, [])

	return <>{children}</>
}
