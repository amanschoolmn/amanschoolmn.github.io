// AMAN Central — app-shell service worker.
// Caches the shell (this page, manifest, icons) so the app opens instantly
// and still opens with no signal. It does NOT cache DB data — that already
// lives in localStorage and behaves the same online or offline.
const CACHE = 'aman-central-v46';
const APP_SHELL = [
  './',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_SHELL)).catch(()=>{}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Stale-while-revalidate for same-origin GETs: serve cache instantly if we
// have it, refresh the cache in the background, fall back to cache if the
// network fails (offline / GitHub Pages hiccup).
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // Google Fonts etc. pass through untouched

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(resp => {
        if (resp && resp.ok) { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return resp;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
