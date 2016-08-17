const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

self.addEventListener('install', event => {
    event.waitUntil(
            caches.open(PRECACHE)
            .then(cache => cache.addAll([
                    'styles.css',
                    'script.js',
                    'home.html'
            ]))
            .then(self.skipWaiting())
            );
});

self.addEventListener('activate', event => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
            caches.keys()
            .then(cacheNames => {
                return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
            })
            .then(cachesToDelete => {
                return Promise.all(cachesToDelete.map(cacheToDelete => {
                    return caches.delete(cacheToDelete);
                }));
            })
            .then(() => self.clients.claim())
            );
});

self.addEventListener('fetch', event => {
    console.log('fetch event triggered');
    var url = new URL(event.request.url)

        if (url.origin === self.location.origin) {
            event.respondWith(
                    caches.match(event.request).then(cachedResponse => {
                        if (cachedResponse) {
                            console.log('cache has got you covered')
                            return cachedResponse;
                        }
                        return caches.open(RUNTIME).then(cache => {
                            return fetch(event.request)
                                .then(response => {
                                    return cache.put(event.request, response.clone())
                                        .then(() => {
                                            return response;
                                        });
                                });
                        });
                    })
                    )
        }
});
