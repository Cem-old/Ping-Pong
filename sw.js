const CACHE_NAME = 'ping-pong-github-v1';
const BASE = '/Ping-Pong/';

const urlsToCache = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'logo.jpg',
  BASE + 'icon-192.svg',
  BASE + 'icon-512.svg',
  BASE + 'assets/index-BxFp-P_I.js',
  BASE + 'assets/index-BVXbDgsd.css'
];

// Instalación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activación y eliminación de cachés anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Caché + red
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Sincronizando datos offline...');
}

// Notificaciones push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: BASE + 'icon-192.svg',
    badge: BASE + 'icon-192.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: BASE + 'icon-192.svg'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: BASE + 'icon-192.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Tenis de SobreMesa', options)
  );
});

// Pulsación sobre una notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(BASE)
    );
  }
});
