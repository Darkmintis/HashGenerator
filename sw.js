/**
 * Service Worker for HashGenerator
 * Enables offline functionality
 */

const CACHE_NAME = 'hashgenerator-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/js/app.js',
  '/js/hash-generator.js',
  '/js/offline.js',
  '/config.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js'
];

// Install event - cache assets
globalThis.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => globalThis.skipWaiting())
  );
});

// Activate event - clean old caches
globalThis.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName !== CACHE_NAME;
          }).map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => globalThis.clients.claim())
  );
});

// Fetch event - serve from cache or network
globalThis.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  const url = new URL(event.request.url);
  if (url.origin !== location.origin && 
      !event.request.url.includes('cdnjs.cloudflare.com') && 
      !event.request.url.includes('fonts.googleapis.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(networkResponse => {
            // Cache a copy of the response if it's valid
            if (networkResponse?.status === 200 && networkResponse?.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return networkResponse;
          })
          .catch(() => {
            // If both cache and network fail, return a simple offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return new Response(
                '<html><body><h1>Offline</h1><p>The HashGenerator app requires internet connection for first load.</p></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            }
            
            return new Response('Offline. Cannot load resource.');
          });
      })
  );
});
