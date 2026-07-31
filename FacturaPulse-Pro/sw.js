const CACHE_NAME = 'emitia-pro-v28';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/main.css',
  './css/document.css',
  './css/print.css',
  './js/storage.js',
  './js/i18n.js',
  './js/templates.js',
  './js/editor.js',
  './js/export.js',
  './js/dashboard.js',
  './js/cloud-sync.js',
  './js/auth-subscription.js',
  './js/app.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Network First strategy (Always get latest version when online, use cache when offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
