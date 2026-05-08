'use client'

import { type ReactNode, useEffect } from 'react'
import { QueryProvider } from '@/providers/QueryProvider'

interface ClientProvidersProps {
	children: ReactNode
}

/**
 * Adds an `a11y-ready` class to the document root on mount so CSS can
 * style focus/contrast rules that should only apply once JS has hydrated.
 * Removed on unmount per MDN cleanup guidance.
 */
export default function ClientProviders({ children }: ClientProvidersProps) {
	useEffect(() => {
		document.documentElement.classList.add('a11y-ready')
		return () => {
			document.documentElement.classList.remove('a11y-ready')
		}
	}, [])

	return <QueryProvider>{children}</QueryProvider>
}
