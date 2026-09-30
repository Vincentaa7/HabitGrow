// public/sw.js - HabitGrow Service Worker for Background Web Push Notifications & PWA Installation

const CACHE_NAME = 'habitgrow-cache-v2';
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Pre-caching warning:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      }),
    ])
  );
});

// Fetch event listener required by Google Chrome for PWA installability criteria
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

self.addEventListener('push', (event) => {
  let data = {
    title: '🌿 HabitGrow',
    body: 'Pohon virtualmu menanti nutrisi! Jangan lupa selesaikan kebiasaanmu hari ini.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    url: '/app/dashboard',
  };

  if (event.data) {
    try {
      const json = event.data.json();
      data = { ...data, ...json };
    } catch {
      data.body = event.data.text();
    }
  }

  // Ensure PNG raster icon for Android compatibility (SVG is rejected by Android NotificationManager)
  const iconUrl = data.icon && !data.icon.endsWith('.svg') ? data.icon : '/icons/icon-192x192.png';
  const badgeUrl = data.badge && !data.badge.endsWith('.svg') ? data.badge : '/icons/icon-192x192.png';
  const uniqueTag = (data.tag ? data.tag : 'habitgrow') + '-' + Date.now();

  const options = {
    body: data.body,
    icon: iconUrl,
    badge: badgeUrl,
    vibrate: [200, 100, 200],
    tag: uniqueTag,
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/app/dashboard',
    },
    actions: [
      {
        action: 'open',
        title: 'Buka Dashboard',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options).catch((err) => {
      console.warn('showNotification failed with full options, retrying with fallback:', err);
      return self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192x192.png',
      });
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/app/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/app') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
