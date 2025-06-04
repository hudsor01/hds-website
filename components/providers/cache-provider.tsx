'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/cache/service-worker'

/**
 * Cache Provider Component
 * 
 * Handles service worker registration and cache management
 */
export function CacheProvider() {
  useEffect(() => {
    // Register service worker for caching in production
    registerServiceWorker()
  }, [])

  // This component doesn't render anything
  return null
}