const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

function addToCache (cacheKey, request, response) {
  if (response.ok) {
    var copy = response.clone();
    caches.open(cacheKey).then( cache => {
      cache.put(request, copy);
    });
  }
  return response;
}

function fetchFromCache (event) {
  return caches.match(event.request).then(response => {
    if (!response) {
      throw Error(`${event.request.url} not found in cache`);
    }
    return response;
  });
}

self.addEventListener('install', event => {
  function onInstall (event) {
    return caches.open(PRECACHE)
      .then(cache => cache.addAll([
                    'styles.css',
                    'script.js',
                    'home.html'
            ]));
  }

  event.waitUntil(
    onInstall(event).then( () => self.skipWaiting() )
  );
});

function onActivate(event) {
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
            onActivate(event)
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
