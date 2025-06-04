'use client'

/**
 * Cal.com Atoms CalProvider Wrapper
 * 
 * Provides Cal.com scheduling infrastructure using the modern Atoms API
 * This replaces the legacy embed script approach with better integration
 */

import { CalProvider } from '@calcom/atoms'
import '@calcom/atoms/globals.min.css'
import { calProviderConfig } from '@/lib/integrations/cal-config'
import { logger } from '@/lib/logger'

interface CalProviderWrapperProps {
  children: React.ReactNode
}

export function CalProviderWrapper({ children }: CalProviderWrapperProps) {
  // Only render CalProvider if we have the required configuration
  const hasRequiredConfig = Boolean(
    calProviderConfig.clientId && 
    calProviderConfig.options.apiUrl,
  )

  if (!hasRequiredConfig) {
    // In development, warn about missing configuration
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Cal.com CalProvider not configured. Set CAL_OAUTH_CLIENT_ID environment variable.')
    }
    
    // Render children without CalProvider for graceful degradation
    return <>{children}</>
  }

  return (
    <CalProvider
      clientId={calProviderConfig.clientId}
      options={calProviderConfig.options}
      accessToken={calProviderConfig.accessToken}
      autoUpdateTimezone={calProviderConfig.autoUpdateTimezone}
      language={calProviderConfig.language}
      organizationId={calProviderConfig.organizationId}
    >
      {children}
    </CalProvider>
  )
}

/**
 * Hook to check if CalProvider is available
 */
export function useCalProviderStatus() {
  return {
    isConfigured: Boolean(
      calProviderConfig.clientId && 
      calProviderConfig.options.apiUrl,
    ),
    hasAccessToken: Boolean(calProviderConfig.accessToken),
    organizationId: calProviderConfig.organizationId,
  }
}