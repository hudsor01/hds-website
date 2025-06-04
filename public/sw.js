// Service Worker for caching strategies
const CACHE_NAME = 'hudson-digital-v1';
const STATIC_CACHE_NAME = 'hudson-static-v1';
const API_CACHE_NAME = 'hudson-api-v1';

// Resources to cache immediately
const PRECACHE_URLS = [
  '/',
  '/about',
  '/services',
  '/contact',
  '/manifest.json',
  '/favicon.ico',
];

// API endpoints that can be cached
const CACHEABLE_API_PATTERNS = [
  /^\/api\/lead-magnet\/resources$/,
  /^\/api\/analytics\/track/,
];

// Static asset patterns
const STATIC_ASSET_PATTERNS = [
  /\.(?:js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|otf|eot|webp|avif)$/,
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      )).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip requests with auth headers (user-specific content)
  if (request.headers.get('authorization')) {
    return;
  }

  // Handle different types of requests
  if (STATIC_ASSET_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    // Static assets - cache first strategy
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (CACHEABLE_API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    // API requests - network first with cache fallback
    event.respondWith(networkFirst(request, API_CACHE_NAME));
  } else if (url.pathname.startsWith('/api/')) {
    // Other API requests - network only (no caching)
    return;
  } else {
    // HTML pages - stale while revalidate
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
  }
});

// Cache first strategy (for static assets)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('Cache first failed:', error);
    throw error;
  }
}

// Network first strategy (for API requests)
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Only cache successful responses
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Fall back to cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale while revalidate strategy (for HTML pages)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Always try to fetch from network in background
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Network failed, ignore
  });
  
  // Return cached version immediately if available
  if (cached) {
    // Trigger background update
    event.waitUntil(networkPromise);
    return cached;
  }
  
  // No cached version, wait for network
  try {
    const response = await networkPromise;
    return response;
  } catch (error) {
    // Return a basic offline page if available
    const offlinePage = await cache.match('/offline.html');
    return offlinePage || new Response('Offline', { status: 503 });
  }
}

// Handle background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForms());
  }
});

// Sync queued contact forms when online
async function syncContactForms() {
  // This would handle offline form submissions
  // Implementation depends on IndexedDB storage
  console.log('Syncing offline form submissions...');
}