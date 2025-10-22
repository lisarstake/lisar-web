const CACHE_NAME = 'lisar-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/onyx.png',
  '/manifest.json',
  '/browserconfig.xml',
  // Android icons
  '/android/android-launchericon-48-48.png',
  '/android/android-launchericon-72-72.png',
  '/android/android-launchericon-96-96.png',
  '/android/android-launchericon-144-144.png',
  '/android/android-launchericon-192-192.png',
  '/android/android-launchericon-512-512.png',
  // iOS icons
  '/ios/120.png',
  '/ios/144.png',
  '/ios/152.png',
  '/ios/167.png',
  '/ios/180.png',
  '/ios/192.png',
  '/ios/256.png',
  '/ios/512.png',
  // Windows icons
  '/windows11/Square44x44Logo.scale-100.png',
  '/windows11/SmallTile.scale-100.png',
  '/windows11/Square150x150Logo.scale-100.png',
  '/windows11/Wide310x150Logo.scale-100.png',
  '/windows11/LargeTile.scale-100.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
