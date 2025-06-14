const CACHE_NAME = 'escritores-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/manifest.json',
  '/icon-ep-192.png',
  '/icon-ep-512.png'
];

// --- Instalar el service worker y guardar archivos en caché ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  // Activar inmediatamente si es necesario
  self.skipWaiting();
});

// --- Activar y limpiar cachés viejas si hay ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// --- Interceptar peticiones y responder desde la caché si está disponible ---
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// --- Soporte para SKIP_WAITING desde la página ---
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// --- (Opcional) Soporte avanzado con Workbox ---
// Si quieres usar Workbox, descomenta esta línea y configura rutas más complejas.
// importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
// Puedes definir estrategias más inteligentes con Workbox aquí.
