/**
 * Service Worker registration and management
 */

// Register service worker in production
export function registerServiceWorker(): void {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production'
  ) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        
        console.log('Service Worker registered successfully:', registration.scope)
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                showUpdateAvailable()
              }
            })
          }
        })
        
        // Check for updates every 24 hours
        setInterval(() => {
          registration.update()
        }, 24 * 60 * 60 * 1000)
        
      } catch (error) {
        console.warn('Service Worker registration failed:', error)
      }
    })
  }
}

// Unregister service worker (for development)
export async function unregisterServiceWorker(): Promise<void> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map(registration => registration.unregister()))
      console.log('Service Workers unregistered')
    } catch (error) {
      console.warn('Service Worker unregistration failed:', error)
    }
  }
}

// Show update notification to user
function showUpdateAvailable(): void {
  // This could integrate with your toast/notification system
  console.log('New version available! Please refresh the page.')
  
  // Example: Show a toast notification
  if (typeof window !== 'undefined' && window.confirm) {
    const shouldReload = window.confirm(
      'A new version of the website is available. Would you like to refresh?',
    )
    if (shouldReload) {
      window.location.reload()
    }
  }
}

// Force service worker update
export async function forceServiceWorkerUpdate(): Promise<void> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        console.log('Service Worker update forced')
      }
    } catch (error) {
      console.warn('Failed to force Service Worker update:', error)
    }
  }
}

// Clear all caches
export async function clearAllCaches(): Promise<void> {
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      console.log('All caches cleared')
    } catch (error) {
      console.warn('Failed to clear caches:', error)
    }
  }
}

// Get cache usage information
export async function getCacheUsage(): Promise<{ name: string; size: number }[]> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return []
  }
  
  try {
    const cacheNames = await caches.keys()
    const cacheInfo = await Promise.all(
      cacheNames.map(async name => {
        const cache = await caches.open(name)
        const keys = await cache.keys()
        return { name, size: keys.length }
      }),
    )
    return cacheInfo
  } catch (error) {
    console.warn('Failed to get cache usage:', error)
    return []
  }
}