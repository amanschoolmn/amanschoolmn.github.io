// AMAN Central — app-shell service worker.
// The page itself (index.html) is NETWORK-FIRST so a new upload shows up on
// the very next open (the old stale-while-revalidate version kept showing the
// previous copy first, which hid every change until a second reload). Icons
// and other files stay fast: cache first, refreshed in the background.
// It does NOT cache DB data — that lives in localStorage.
const CACHE = 'aman-central-v47';
const APP_SHELL = [
  './',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_SHELL)).catch(()=>{}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // Google Fonts etc. pass through untouched

  const isPage = e.request.mode === 'navigate' || e.request.destination === 'document';
  if (isPage) {
    // network-first: always try the newest page, fall back to the saved copy offline
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp && resp.ok) { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return resp;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('./')))
    );
    return;
  }
  // everything else: stale-while-revalidate
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
