// Offline-first reading: cache pages the visitor opens, fall back to cache when offline.
const VERSION = 'v1';
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll(['/', '/offline/']))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => ![PAGES, ASSETS].includes(k)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  if (request.mode === 'navigate') {
    // Network first for HTML so new stories show up; cache for offline.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGES).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match('/offline/'))),
    );
    return;
  }

  // Stale-while-revalidate for static assets (hashed files are immutable anyway).
  event.respondWith(
    caches.open(ASSETS).then((cache) =>
      cache.match(request).then((hit) => {
        const fetched = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => hit);
        return hit || fetched;
      }),
    ),
  );
});
