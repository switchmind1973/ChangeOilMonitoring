const CACHE_NAME = 'oil-monitor-v1';
const ASSETS = [
  '/ChangeOilMonitoring/',
  '/ChangeOilMonitoring/index.html',
  '/ChangeOilMonitoring/styles.css',
  '/ChangeOilMonitoring/script.js',
  '/ChangeOilMonitoring/manifest.json',
  '/ChangeOilMonitoring/icon-192x192.png',
  '/ChangeOilMonitoring/icon-512x512.png'
];

// Install the service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS.map((asset) => {
          return fetch(asset)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch ${asset}: ${response.statusText}`);
              }
              return cache.put(asset, response);
            })
            .catch((error) => {
              console.error(`Error caching ${asset}:`, error);
            });
        })
      );
    })
  );
});

// Fetch cached assets when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
