const CACHE_NAME = 'emitia-pro-v1';
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
  './js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
