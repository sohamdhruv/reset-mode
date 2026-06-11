/* Reset Mode service worker — notifications only (no asset caching). */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Focus an existing window or open the app when a notification is tapped.
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

// Allow the page to request a notification from the SW context.
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SHOW_NOTIFICATION") {
    self.registration.showNotification(
      data.title || "Reset Mode",
      data.options || {},
    );
  }
});

// Push handler — ready for a future push server. Without one, this never fires.
self.addEventListener("push", (event) => {
  let payload = { title: "Reset Mode", body: "Time for a quick reset." };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch (e) {
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
