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
    // Register service worker for caching
    registerServiceWorker()
    
    // Preconnect to external domains for better performance
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://plausible.io',
    ]
    
    preconnectDomains.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = domain
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
    
  }, [])

  // This component doesn't render anything
  return null
}