'use client'

import { type ReactNode, useEffect } from 'react'
import { QueryProvider } from '@/providers/QueryProvider'
import {
	cleanupAccessibilityFeatures,
	initAccessibilityFeatures
} from '@/utils/accessibility'

interface ClientProvidersProps {
	children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
	// Initialize accessibility features on mount and cleanup on unmount
	// Per MDN: Proper cleanup prevents memory leaks in SPAs
	// Reference: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#memory_concerns
	useEffect(() => {
		initAccessibilityFeatures()

		return () => {
			cleanupAccessibilityFeatures()
		}
	}, [])

	return <QueryProvider>{children}</QueryProvider>
}
