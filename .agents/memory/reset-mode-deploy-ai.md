---
name: Reset Mode deploy topology & AI fallback
description: Why AI features in reset-mode must degrade to scripted fallback — the Vercel prod deploy has no backend.
---

# Reset Mode: deploy topology & AI fallback

Root `vercel.json` builds **only** the `reset-mode` static SPA (`buildCommand: pnpm --filter @workspace/reset-mode run build`, output `artifacts/reset-mode/dist/public`) and rewrites everything to `index.html`. The `api-server` artifact is **not** part of the Vercel deploy.

**Consequence:** any feature in reset-mode that calls `/api/*` will NOT reach a backend on Vercel prod — the SPA rewrite serves `index.html` (HTML, not JSON) for those requests. Such features must degrade gracefully.

**Rule:** every reset-mode `/api` call must have a client-side fallback that treats non-200, non-JSON (HTML) responses, timeouts, and thrown errors as "no backend" and uses a deterministic offline result instead. The AI "Reset Master" guidance follows this: real AI runs only where `api-server` runs (Replit dev preview + Replit deployments); on Vercel it falls back to scripted, per-action guidance.

**Why:** the app is marketed as a free, offline-capable PWA; a hard dependency on a backend that isn't deployed would break the core flow in production. Fallback keeps it functional everywhere.

**How to apply:** if you add another AI/backend-backed feature to reset-mode, either (a) give it the same graceful scripted fallback, or (b) change the deploy topology to also host `api-server` (and update this note). Do not assume `/api` is reachable in prod.

## Product invariant (do not violate)
Reset Mode is **localStorage-only** and must **never delete/reset/overwrite** user data: settings, journal, streaks, reminders, onboarding, spending, or existing features. All work is strictly additive. Storage lives in `artifacts/reset-mode/src/lib/storage.ts` (keys are `resetMode_*`); add new state under a new key rather than mutating existing shapes.
