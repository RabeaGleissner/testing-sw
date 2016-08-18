const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

function cacheAssets(event) {
    return caches.open(PRECACHE)
        .then(cache => cache.addAll([
                    'styles.css',
                    'script.js',
                    'home.html'
        ]));
}

self.addEventListener('install', event => {
    event.waitUntil(
        cacheAssets(event).then( () => self.skipWaiting() )
    );
});

function clearOldCaches(event) {
    var currentCaches = [PRECACHE, RUNTIME];
    return caches.keys()
        .then(cacheNames => {
            var cachesToDelete = cacheNames.filter(name => !currentCaches.includes(name));
            var deletePromises = cachesToDelete.map(oldCache => caches.delete(oldCache))
                return Promise.all(deletePromises)
        })
}

self.addEventListener('activate', event => {
    event.waitUntil(
            clearOldCaches(event)
            .then(() => self.clients.claim())
            );
});

function addToCache (cacheKey, request, response) {
    if (response.ok) {
        var copy = response.clone();
        caches.open(cacheKey).then( cache => {
            cache.put(request, copy);
        });
    }
    return response;
}

self.addEventListener('fetch', event => {
    var url = new URL(event.request.url)
    if (url.origin === self.location.origin) {
        event.respondWith(
                caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(event.request).then(response => addToCache(RUNTIME, event.request, response))
                })
        )
    }
});
