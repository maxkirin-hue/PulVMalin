/* ============================================================
   SERVICE WORKER — PulvMalin
   Cache statique + mise à jour contrôlée
============================================================ */

const CACHE_NAME = "pulvmalin-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png"
];

// Installation : mise en cache des fichiers essentiels
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch : stratégie network-first
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Communication avec sw-updater.ts
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});