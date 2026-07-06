/* Reset Mode service worker — offline-first app shell + notifications. */

const STATIC_CACHE = "reset-mode-static-v1";
const RUNTIME_CACHE = "reset-mode-runtime-v1";

// Precache the app shell and known static assets (paths are relative to scope).
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-192-maskable.png",
  "/icon-512-maskable.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/* ─── Fetch — offline-first caching ───────────────────────────────────────── */

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests for same-origin assets.
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Navigation requests (SPA routes) — network-first, fallback to cached shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches
              .open(STATIC_CACHE)
              .then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/")),
        ),
    );
    return;
  }

  // API calls — stale-while-revalidate.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches
                .open(RUNTIME_CACHE)
                .then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            if (cached) return cached;
            throw new Error("API offline and not cached");
          });
        return cached || network;
      }),
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts, etc.) — cache-first.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            const cacheName =
              url.pathname === "/" || url.pathname === "/index.html"
                ? STATIC_CACHE
                : RUNTIME_CACHE;
            caches.open(cacheName).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          if (cached) return cached;
          throw new Error("Asset offline and not cached");
        });
      return cached || network;
    }),
  );
});

/* ─── Notifications (unchanged) ──────────────────────────────────────────── */

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const scopeUrl = self.registration.scope;
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        if ("focus" in client) {
          await client.focus();
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(scopeUrl);
      }
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SHOW_NOTIFICATION") {
    self.registration.showNotification(
      data.title || "Reset Mode",
      data.options || {},
    );
  }
});

self.addEventListener("push", (event) => {
  let payload = { title: "Reset Mode", body: "Time for a quick reset." };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    /* keep default payload */
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "icon-192.png",
      badge: "icon-192.png",
      tag: "reset-mode",
    }),
  );
});
