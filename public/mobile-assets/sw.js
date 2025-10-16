// public/sw.js
const CACHE_NAME = 'ostrom-v1';
const STATIC_CACHE_NAME = 'ostrom-static-v1';
const DYNAMIC_CACHE_NAME = 'ostrom-dynamic-v1';

// Critical assets that should be cached immediately
const CRITICAL_ASSETS = [
  '/',
  '/favicon.png',
  '/images/logo.svg',
  '/images/background.webp',
  '/images/divider.png',
  '/fonts/bellefair/Bellefair-Regular.woff2',
  '/fonts/playground/PPPlayground-Variable.woff2',
  '/vite.svg'
];

// Static assets that can be cached for longer periods
const STATIC_ASSETS = [
  '/images/logo_black.svg',
  '/images/logo_white.png',
  '/images/trophy_1.png',
  '/images/trophy_2.png',
  '/images/trophy_3.png',
  '/images/icon_sound_on.svg',
  '/images/icon_sound_off.svg',
  '/images/arrow_bottom.svg',
  '/images/timeline_line.png',
  '/images/secrets_divider.png',
  '/images/paper.webp',
  '/images/sand.png',
  '/images/smoke.png',
  '/images/mask2.png',
  '/images/mask3.png',
  '/images/bush.png',
  '/images/car.png',
  '/images/floor.png',
  '/images/floor_heightmap.png',
  '/images/Ground_Dirt_009_BaseColor.jpg',
  '/images/Ground_Dirt_009_Normal.jpg',
  '/images/Ground_Dirt_009_Height.png',
  '/images/Ground_Dirt_009_AmbientOcclusion.jpg',
  '/images/history-1.jpg',
  '/images/history-2.jpg',
  '/images/bg-test.jpg',
  '/images/bush_1.png',
  '/images/bush_2.png',
  '/images/bushD.png',
  '/images/bushN.png',
  '/images/car_1.png',
  '/images/test.png',
  '/images/test_2.png',
  '/images/test_3.png',
  '/textures/floor.jpg',
  '/fonts/bellefair/stylesheet.css',
  '/fonts/playground/stylesheet.css',
  '/fonts/romana/stylesheet.css',
  '/fonts/youngserif/stylesheet.css'
];

// Audio files for caching
const AUDIO_ASSETS = [
  '/mp3/click.mp3',
  '/mp3/plane.mp3',
  '/mp3/road.mp3',
  '/mp3/street.mp3'
];

// Video files (these are large, so we'll cache them on demand)
const VIDEO_ASSETS = [
  '/videos/intro.mp4',
  '/videos/intro_mobile.mp4'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('🔧 [ServiceWorker] Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical assets immediately
      caches.open(CACHE_NAME).then(cache => {
        console.log('📦 [ServiceWorker] Caching critical assets...');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('📦 [ServiceWorker] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache audio assets
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        console.log('📦 [ServiceWorker] Caching audio assets...');
        return cache.addAll(AUDIO_ASSETS);
      })
    ]).then(() => {
      console.log('✅ [ServiceWorker] All critical assets cached successfully');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    }).catch(error => {
      console.error('❌ [ServiceWorker] Failed to cache assets:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 [ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches that don't match current version
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('🗑️ [ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ [ServiceWorker] Activated successfully');
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle different types of requests with appropriate strategies
  if (isCriticalAsset(request.url)) {
    // Cache First strategy for critical assets
    event.respondWith(cacheFirst(request, CACHE_NAME));
  } else if (isStaticAsset(request.url)) {
    // Cache First strategy for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (isAudioAsset(request.url)) {
    // Cache First strategy for audio assets
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE_NAME));
  } else if (isVideoAsset(request.url)) {
    // Stale While Revalidate for video assets (they're large)
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
  } else if (isAPIRequest(request.url)) {
    // Network First strategy for API requests
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  } else if (isHTMLRequest(request)) {
    // Network First strategy for HTML requests
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  } else {
    // Stale While Revalidate for everything else
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
  }
});

// Helper functions to identify asset types
function isCriticalAsset(url) {
  return CRITICAL_ASSETS.some(asset => url.includes(asset));
}

function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('/images/') ||
         url.includes('/fonts/') ||
         url.includes('/textures/');
}

function isAudioAsset(url) {
  return AUDIO_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('/mp3/') ||
         url.match(/\.(mp3|wav|ogg|aac)$/i);
}

function isVideoAsset(url) {
  return VIDEO_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('/videos/') ||
         url.match(/\.(mp4|webm|ogg|avi)$/i);
}

function isAPIRequest(url) {
  return url.includes('/api/') || url.includes('/graphql');
}

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

// Caching strategies
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 [ServiceWorker] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('🌐 [ServiceWorker] Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && networkResponse.status !== 206) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ [ServiceWorker] Cache first failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    console.log('🌐 [ServiceWorker] Trying network first:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && networkResponse.status !== 206) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📦 [ServiceWorker] Network failed, trying cache:', request.url);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline content not available', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok && response.status !== 206) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.log('🌐 [ServiceWorker] Network fetch failed:', error);
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    console.log('📦 [ServiceWorker] Serving stale while revalidating:', request.url);
    return cachedResponse;
  }
  
  // Otherwise wait for network
  console.log('🌐 [ServiceWorker] No cache, waiting for network:', request.url);
  return networkResponsePromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 [ServiceWorker] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('🔄 [ServiceWorker] Performing background sync...');
  // Implement background sync logic here
}

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
  console.log('📱 [ServiceWorker] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/images/logo.svg',
    badge: '/images/logo.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('O.Strom Experience', options)
  );
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('💬 [ServiceWorker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('🚀 [ServiceWorker] Script loaded successfully');
