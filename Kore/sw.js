self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('kore-store').then((cache) => cache.addAll([
            '/index.html',
            '/manifest.json'
        ]))
    );
});

self.addEventListener('fetch', (e) => {
    // Only intercept basic GET requests to non-API routes for offline fallback if needed
    // But since this is highly dynamic, we just do a network first strategy
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
