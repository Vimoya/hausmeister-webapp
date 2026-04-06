// ═══════════════════════════════════════════════
// HAUSMEISTER PRO — Service Worker
// ═══════════════════════════════════════════════
const CACHE_NAME = 'hausmeister-pro-v1';
const OFFLINE_URL = '/offline.html';

// Dateien die sofort gecacht werden
const PRECACHE = [
  '/',
  '/app.html',
  '/login.html',
  '/index.html',
  '/manifest.json',
  '/firebase-config.js',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── Install: Precache ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

// ── Activate: Alte Caches löschen ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Network-first für API, Cache-first für Assets ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Firebase / externe Dienste immer live lassen
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('google') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('cloudflare') ||
    url.hostname.includes('fonts') ||
    request.method !== 'GET'
  ) return;

  // HTML-Seiten: Network-first, Fallback auf Cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Alles andere: Cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return res;
      }).catch(() => caches.match(OFFLINE_URL));
    })
  );
});
