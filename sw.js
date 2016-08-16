const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

const PRECACHE_URLS = [
    'styles.css',
    'script.js'
];

self.addEventListener('install', event => {
    console.log('install event happened');
    // caches is an object called CacheStorage
    event.waitUntil(
            // opens the cache with name PRECACHE
            caches.open(PRECACHE)
            // adds the URLs to the cache
            .then(cache => cache.addAll(PRECACHE_URLS))
            // this forces this service worker to become active
            .then(self.skipWaiting())
            );
});

self.addEventListener('activate', event => {
    console.log('activate event happened');

    const currentCaches = [PRECACHE, RUNTIME];

    event.waitUntil(
            caches.keys().then(cacheNames => {
                console.log("cacheNames: " + cacheNames);
                return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
            }).then(cachesToDelete => {
                return Promise.all(cachesToDelete.map(cacheToDelete => {
                    console.log("cacheToDelete: " + cacheToDelete);
                    return caches.delete(cacheToDelete);
                }));
                // the Client interface of the ServiceWorker API represents the scope of a service worker client (a document in a browser context or a SharedWorker) This method clients.claim() allows an active ServiceWorker to set itself as the active worker for a client page.
            }).then(() => self.clients.claim())
            );
});

self.addEventListener('fetch', event => {
    console.log('fetch event happened');
    // FetchEvent has respondWith() method.
    event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    console.log('Found response in cache: ', cachedResponse)
                        return cachedResponse;
                }
                console.log('No response in cache found')

                    //opens the other cache
                    return caches.open(RUNTIME).then(cache => {
                        console.log('Fetch the response from the network instead')
                            return fetch(event.request).then(response => {
                                // duplicate response and add it to the cache
                            return cache.put(event.request, response.clone()).then(() => {
                                return response;
                            });
                        });
                    });
            }))
});
