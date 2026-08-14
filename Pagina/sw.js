// Dummy Service Worker to handle browser cache requests cleanly
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
