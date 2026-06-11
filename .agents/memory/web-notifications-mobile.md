---
name: Web notifications on mobile (Reset Mode)
description: Platform constraints for browser/PWA notifications, esp. Android Chrome and backend-less apps.
---

# Browser / PWA notification constraints

**Rule:** To show notifications that work on Android Chrome, you MUST use
`ServiceWorkerRegistration.showNotification(title, options)`. The `new Notification()`
constructor is unsupported on Android Chrome (throws "Illegal constructor") and only
works on desktop. So: register a service worker, then send via the registration; keep
`new Notification()` only as a desktop fallback.

**Why:** Reset Mode notifications "only showed when the app was open" because the code
used `new Notification()` (silently failing on mobile) and no service worker was
registered. Switching to SW `showNotification()` is what made them appear in the system
tray on Android.

**How to apply:** When a notification must reach mobile users, ensure a SW is registered
(`navigator.serviceWorker.register`) before sending, and call
`(await navigator.serviceWorker.getRegistration())?.showNotification(...)`. Use
`getRegistration()` not `serviceWorker.ready` (ready hangs forever if no SW exists).

## True background / closed-app push
Fully-closed-app delivery is **not possible** without a push server: it requires Web Push
with VAPID keys + a backend that pushes to the subscription. Reset Mode is localStorage-only
with no backend, so closed-app push cannot be implemented. Page-JS `setInterval` scheduling
only fires while the tab/PWA is alive (foreground or briefly backgrounded). The SW `push`
handler can be left in place as future-ready, but it never fires without a server.
Be honest about this limit; surface a Settings hint about installing to home screen.

## Paths / scope (this repo)
Register the SW and reference icons with `import.meta.env.BASE_URL` prefix so it works at
both Vercel root (BASE_URL="/") and the Replit base-path preview. Files in `public/`
(sw.js, manifest.webmanifest, icons) are served at `${BASE_URL}<file>`. Vercel serves
filesystem matches before the SPA catch-all rewrite, so static SW/manifest resolve fine.
SW-internal icon paths (in sw.js) should be scope-relative (e.g. `"icon-192.png"`).
