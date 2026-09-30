const CACHE_NAME = "agro-farm-calc-v6";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./green.png"
];

// Install the service worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate the new service worker
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Serve cached files when offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {

            // Cache successful GET requests
            if (
              event.request.method === "GET" &&
              networkResponse &&
              networkResponse.status === 200
            ) {
              const responseClone = networkResponse.clone();

              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }

            return networkResponse;
          })
          .catch(() => {
            // If offline and nothing is cached
            return new Response(
              "Agro Farm Calc is currently offline.",
              {
                status: 503,
                headers: {
                  "Content-Type": "text/plain"
                }
              }
            );
          });
      })
  );
});