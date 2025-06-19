const CACHE_NAME = 'aqua-ai-v1';
const STATIC_CACHE_NAME = 'aqua-ai-static-v1';
const API_CACHE_NAME = 'aqua-ai-api-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // Add other static assets as needed
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/tanks',
  '/api/parameters',
  '/api/equipment',
  '/api/livestock'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests (network-first with cache fallback)
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  }
  // Handle static assets (cache-first)
  else if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  }
  // Handle navigation requests
  else if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
  }
});

// Check if request is to API
function isAPIRequest(url) {
  return url.hostname.includes('supabase') || 
         url.pathname.startsWith('/api/') ||
         url.pathname.includes('/rest/v1/');
}

// Check if request is for static asset
function isStaticAsset(url) {
  return request.destination === 'script' ||
         request.destination === 'style' ||
         request.destination === 'image' ||
         request.destination === 'font' ||
         url.pathname.includes('assets/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.ico');
}

// Handle API requests - network first, cache fallback
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const responseToCache = networkResponse.clone();
      
      // Only cache GET requests and successful responses
      if (request.method === 'GET') {
        await cache.put(request, responseToCache);
        
        // For tank parameters, only keep last 5 entries per tank
        if (request.url.includes('water_parameters')) {
          await limitParameterCache(cache);
        }
      }
      
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error);
    
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving from cache');
      return cachedResponse;
    }
    
    // No cache available, return offline response
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'No network connection and no cached data available' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets - cache first
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch static asset', error);
    
    // Return a basic offline response for failed static assets
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Network failed, try to serve cached index.html
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match('/');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback offline page
    return new Response(
      `<!DOCTYPE html>
       <html>
         <head>
           <title>AquaAI - Offline</title>
           <meta name="viewport" content="width=device-width, initial-scale=1">
         </head>
         <body>
           <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
             <h1>🌊 AquaAI</h1>
             <h2>You're Offline</h2>
             <p>Check your internet connection and try again.</p>
           </div>
         </body>
       </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Limit parameter cache to last 5 entries per tank
async function limitParameterCache(cache) {
  try {
    const requests = await cache.keys();
    const parameterRequests = requests.filter(req => 
      req.url.includes('water_parameters')
    );
    
    // Group by tank ID and keep only recent entries
    const tankGroups = {};
    
    for (const request of parameterRequests) {
      const url = new URL(request.url);
      const tankId = extractTankIdFromUrl(url);
      
      if (tankId) {
        if (!tankGroups[tankId]) {
          tankGroups[tankId] = [];
        }
        tankGroups[tankId].push(request);
      }
    }
    
    // For each tank, keep only the 5 most recent entries
    for (const tankId in tankGroups) {
      const tankRequests = tankGroups[tankId];
      
      if (tankRequests.length > 5) {
        // Sort by creation time (this is approximate)
        tankRequests.sort((a, b) => a.url.localeCompare(b.url));
        
        // Remove older entries
        const toDelete = tankRequests.slice(0, tankRequests.length - 5);
        
        for (const request of toDelete) {
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Error limiting parameter cache', error);
  }
}

// Extract tank ID from URL (basic implementation)
function extractTankIdFromUrl(url) {
  const match = url.pathname.match(/tank[s]?[\/=]([a-f0-9-]+)/i);
  return match ? match[1] : null;
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

// Handle background sync
async function handleBackgroundSync() {
  try {
    // Get pending offline actions from IndexedDB or localStorage
    // This would sync any actions performed while offline
    console.log('Service Worker: Performing background sync');
    
    // Implementation would depend on how offline actions are stored
    // For now, just log that sync is happening
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Received message', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
