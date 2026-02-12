// sw.js — version améliorée
const CACHE_NAME = "pulvmalin-v2";
const RUNTIME = "pulvmalin-runtime-v1";

// Liste minimale d'assets à mettre en cache à l'installation.
// IMPORTANT: ajoute ici les fichiers générés par ton build (ex: /assets/index-xxxxx.js)
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  // Exemple: ajouter le bundle produit par Vite/rollup
  // "/assets/index-B-8u5YxX.js"
];

// Utilitaire pour log côté SW (facultatif, utile pour debug)
function swLog(...args) {
  // console.log("[SW]", ...args);
}

// Install : cache des assets essentiels
self.addEventListener("install", (event) => {
  swLog("install");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => {
        swLog("cache.addAll failed", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate : nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  swLog("activate");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== RUNTIME)
          .map((key) => caches.delete(key))
      )
    ).then(() => {
      // Prendre le contrôle immédiatement
      return self.clients.claim();
    })
  );
});

// Helper network-first with cache fallback for navigation and API
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    // Optionally cache successful GET responses (runtime cache)
    if (request.method === "GET" && response && response.ok) {
      const cache = await caches.open(RUNTIME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // If navigation and nothing in cache, return cached index.html as fallback
    if (request.mode === "navigate") {
      return caches.match("/index.html");
    }
    throw err;
  }
}

// Helper cache-first for static assets
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(RUNTIME);
    cache.put(request, response.clone());
  }
  return response;
}

// Fetch handler
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Ignore non-GET requests
  if (req.method !== "GET") {
    return;
  }

  // Navigation requests (HTML) -> network-first with index fallback
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }

  // For same-origin static assets (css, js, images) use cache-first
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (req.destination === "style" || req.destination === "script" || req.destination === "image" || req.destination === "font") {
      event.respondWith(cacheFirst(req));
      return;
    }
  }

  // Default to network-first
  event.respondWith(networkFirst(req));
});

// Message handler to support skipWaiting from the page
self.addEventListener("message", (event) => {
  if (!event.data) return;
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
  