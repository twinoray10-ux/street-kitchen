const CACHE = 'sk-v1';
const ASSETS = [
  '/street-kitchen/',
  '/street-kitchen/index.html',
  '/street-kitchen/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network first, fallback to cache
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || '🔥 New Order!', {
      body: data.body || 'A new order just came in.',
      icon: '/street-kitchen/icon-192.png',
      badge: '/street-kitchen/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'new-order',
      requireInteraction: true,
      data: { url: '/street-kitchen/orders.html' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/street-kitchen/orders.html'));
});
