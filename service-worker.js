const CACHE_NAME = 'gofitgym-pt-v87';
const APP_SHELL = [
  './index.html',
  './manage.html',
  './privacy.html',
  './manifest.webmanifest?v=33',
  './icons/icon-192.png?v=2',
  './icons/icon-512.png?v=2',
  './icons/maskable-512.png?v=2',
  './icons/apple-touch-icon.png?v=2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function createFreshRequest(request) {
  try {
    return new Request(request, { cache: 'no-store' });
  } catch (err) {
    return request;
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;
  const requestUrl = new URL(request.url);

  if (requestUrl.origin === self.location.origin && requestUrl.pathname.endsWith('/service-worker.js')) {
    event.respondWith(fetch(createFreshRequest(request)));
    return;
  }

  if (request.mode === 'navigate') {
    const isPrivacyPage = requestUrl.pathname.endsWith('/privacy.html');
    const fallbackPage = isPrivacyPage ? './privacy.html' : './manage.html';
    event.respondWith(
      fetch(createFreshRequest(request))
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(fallbackPage, copy));
          return response;
        })
        .catch(() => caches.match(fallbackPage))
    );
    return;
  }

  if (requestUrl.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && (response.ok || response.type === 'opaque')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || Response.error()))
  );
});
