// Service Worker for Hudson Digital Solutions
// Version: 1.0.0

const CACHE_NAME = 'hds-v1';
const OFFLINE_URL = '/offline.html';

// URLs to cache for offline use
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Next.js static files will be cached dynamically
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS).catch((error) => {
        console.error('Failed to cache:', error);
      });
    })
  );
  // Force immediate activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {return;}

  // Skip admin, API routes, and development assets
  if (url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/admin') ||
      url.pathname.startsWith('/_next/webpack-hmr') ||
      url.hostname === 'localhost' && url.port !== location.port) {
    return;
  }

  // Skip caching in development mode
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  // Network-first strategy for HTML documents
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses in production
          if (response.status === 200 && url.protocol === 'https:') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache).catch(() => {
                // Silently handle cache errors
              });
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Cache-first strategy for static assets (production only)
  if (
    (request.destination === 'style' ||
     request.destination === 'script' ||
     request.destination === 'image' ||
     request.destination === 'font') &&
    url.protocol === 'https:'
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((response) => {
            // Only cache successful responses
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache).catch(() => {
                  // Silently handle cache errors
                });
              });
            }
            return response;
          }).catch(() => {
            // Return from cache if network fails
            return caches.match(request);
          })
        );
      })
    );
    return;
  }

  // Network-first for everything else
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForms());
  }
  
  // Pre-warm functions when connection is restored
  if (event.tag === 'warm-functions') {
    event.waitUntil(
      Promise.all([
        fetch('/api/warm'),
        fetch('/api/contact', { method: 'HEAD' }),
      ])
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update from Hudson Digital Solutions',
    icon: '/HDS-Logo.jpeg',
    badge: '/HDS-Logo.jpeg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(
    self.registration.showNotification('Hudson Digital Solutions', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://hudsondigitalsolutions.com')
  );
});

// Sync pending contact form submissions
async function syncContactForms() {
  // This would sync any offline form submissions
  // Implementation depends on your offline storage strategy
  console.warn('Syncing contact forms...');
}