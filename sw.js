const CACHE = 'passminne-cache';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.add('./')));
});

self.addEventListener('activate', () => self.clients.claim());

// Hämtar alltid senaste versionen när det finns nät, annars sparad kopia.
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('./')))
    );
  } else if (e.request.url.startsWith('https://cdnjs.cloudflare.com/')) {
    // PDF-läsaren ändras aldrig för en given version, så sparad kopia räcker.
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }))
    );
  }
});
