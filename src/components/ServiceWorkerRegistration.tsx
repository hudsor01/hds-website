"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // In development, unregister any existing service workers
      if (process.env.NODE_ENV === 'development') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
        });
        return;
      }

      // Only register service worker in production
      if (process.env.NODE_ENV === 'production') {
        // Register service worker
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);

            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000); // Check every hour

            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content available, show update prompt
                    if (confirm('New content available! Reload to update?')) {
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });

        // Handle offline/online events
        window.addEventListener('online', () => {
          console.log('Back online');
          // Could show a toast notification
        });

        window.addEventListener('offline', () => {
          console.log('Gone offline');
          // Could show a toast notification
        });
      }
    }
  }, []);

  return null;
}