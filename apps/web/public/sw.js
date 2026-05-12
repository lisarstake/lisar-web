const CACHE_NAME = "lisar-v2.0.2";
const SHELL_URLS = ["/", "/index.html"];

function isHttpLike(url) {
  return url.protocol === "http:" || url.protocol === "https:";
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (request.url.includes("/api/") || request.url.includes("/functions/")) {
    event.respondWith(fetch(request).catch(() => new Response(null, { status: 503 })));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then(async (response) => {
          try {
            const url = new URL(request.url);
            if (response.ok && isHttpLike(url)) {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(request, response.clone());
            }
          } catch {
            // Unsupported schemes (e.g. chrome-extension), quota, etc.
          }
          return response;
        })
        .catch(() => null);

      if (cached) return cached;

      return networkFetch.then((response) => {
        if (response) return response;
        return new Response(null, { status: 503 });
      });
    })
  );
});
