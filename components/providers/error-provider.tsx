'use client'

import { useEffect } from 'react'
import { setupGlobalErrorHandling } from '@/lib/error-tracking'

/**
 * Error provider that sets up global error handling
 */
export function ErrorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set up global error handlers
    setupGlobalErrorHandling()
  }, [])

  return <>{children}</>
}