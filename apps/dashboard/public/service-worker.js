/**
 * Progressive Web App Service Worker
 * Enables offline functionality for Ghana OMC field operations
 * Handles poor network connectivity in rural areas
 */

const CACHE_NAME = 'omc-erp-v1.0.0';
const OFFLINE_URL = '/offline.html';
const API_CACHE = 'api-cache-v1';
const IMAGE_CACHE = 'image-cache-v1';

// Critical assets to cache for offline operation
const CRITICAL_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/js/offline-db.js',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// API endpoints to cache
const CACHEABLE_API_ROUTES = [
  '/api/v1/stations',
  '/api/v1/products',
  '/api/v1/pricing/current',
  '/api/v1/customers/frequent',
  '/api/v1/inventory/levels',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching critical assets');
      return cache.addAll(CRITICAL_ASSETS);
    }).then(() => {
      console.log('[ServiceWorker] Skip waiting');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE && cacheName !== IMAGE_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle image requests
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Default strategy: network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

/**
 * Handle API requests with intelligent caching
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const isCacheable = CACHEABLE_API_ROUTES.some(route => url.pathname.includes(route));
  
  // For POST/PUT/DELETE, queue for sync if offline
  if (request.method !== 'GET') {
    return handleMutationRequest(request);
  }
  
  // Network first for fresh data
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && isCacheable) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network request failed, checking cache');
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Add header to indicate cached response
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-From-Cache', 'true');
      headers.set('X-Cache-Time', new Date(cachedResponse.headers.get('date')).toISOString());
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers,
      });
    }
    
    // Return offline response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'No cached data available',
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Handle mutation requests (POST, PUT, DELETE)
 */
async function handleMutationRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Queuing mutation for background sync');
    
    // Clone request for storage
    const body = await request.text();
    const mutation = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
      timestamp: Date.now(),
    };
    
    // Store in IndexedDB for later sync
    await queueMutation(mutation);
    
    // Register background sync
    if ('sync' in self.registration) {
      await self.registration.sync.register('sync-mutations');
    }
    
    // Return optimistic response
    return new Response(JSON.stringify({
      status: 'queued',
      message: 'Request queued for synchronization',
      id: mutation.timestamp,
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Handle navigation requests
 */
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return cache.match(OFFLINE_URL);
  }
}

/**
 * Handle image requests with progressive loading
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Return cached image immediately
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return placeholder image
    return new Response(null, { status: 404 });
  }
}

/**
 * Background sync event
 */
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync triggered');
  
  if (event.tag === 'sync-mutations') {
    event.waitUntil(syncMutations());
  }
});

/**
 * Sync queued mutations when online
 */
async function syncMutations() {
  const mutations = await getQueuedMutations();
  
  for (const mutation of mutations) {
    try {
      const response = await fetch(mutation.url, {
        method: mutation.method,
        headers: mutation.headers,
        body: mutation.body,
      });
      
      if (response.ok) {
        await removeMutation(mutation.timestamp);
        
        // Notify clients of successful sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'sync-success',
            id: mutation.timestamp,
          });
        });
      }
    } catch (error) {
      console.error('[ServiceWorker] Sync failed for mutation:', mutation);
    }
  }
}

/**
 * Push notification handler
 */
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'view',
        title: 'View',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification('OMC ERP Alert', options)
  );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * Periodic background sync for data freshness
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCache());
  }
});

/**
 * Update cache with fresh data
 */
async function updateCache() {
  const cache = await caches.open(API_CACHE);
  
  for (const route of CACHEABLE_API_ROUTES) {
    try {
      const response = await fetch(route);
      if (response.ok) {
        cache.put(route, response);
      }
    } catch (error) {
      console.log(`[ServiceWorker] Failed to update cache for ${route}`);
    }
  }
}

// IndexedDB operations for offline queue
const DB_NAME = 'omc-offline-db';
const DB_VERSION = 1;
const STORE_NAME = 'mutations';

/**
 * Queue mutation in IndexedDB
 */
async function queueMutation(mutation) {
  const db = await openDB();
  const tx = db.transaction([STORE_NAME], 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.add(mutation);
}

/**
 * Get queued mutations from IndexedDB
 */
async function getQueuedMutations() {
  const db = await openDB();
  const tx = db.transaction([STORE_NAME], 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return store.getAll();
}

/**
 * Remove mutation from IndexedDB
 */
async function removeMutation(timestamp) {
  const db = await openDB();
  const tx = db.transaction([STORE_NAME], 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.delete(timestamp);
}

/**
 * Open IndexedDB
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' });
      }
    };
  });
}

console.log('[ServiceWorker] Loaded successfully');