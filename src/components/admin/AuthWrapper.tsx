/**
 * Admin Layout Wrapper
 * Passes children through directly (no auth system configured)
 */

import type { ReactNode } from 'react'

interface AuthWrapperProps {
  children: ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  return <>{children}</>
}
