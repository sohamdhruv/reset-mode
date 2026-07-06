# Reset Mode

Reset Mode is a mobile-first, dark-themed PWA that helps people break compulsive digital habits (endless scrolling, dating apps, porn, in-app spending) with a fast 2-minute "reset" flow, streaks, journaling, and guided practice.

## Run & Operate

- `pnpm --filter @workspace/reset-mode run dev` — run the PWA (Vite dev server; workflow `artifacts/reset-mode: web`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (workflow `artifacts/api-server: API Server`; dev script builds then starts, so **restart the workflow to pick up route changes** — there is no watch)
- `pnpm --filter @workspace/reset-mode run typecheck` — typecheck the frontend
- `pnpm --filter @workspace/api-server run typecheck` — typecheck the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate Zod schemas / hooks from the OpenAPI spec after editing `lib/api-spec/openapi.yaml`
- Curl services through the shared proxy at `localhost:80` (e.g. `localhost:80/api/reset-master/guidance`), never the raw service port.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter (routing), TanStack Query, framer-motion, Tailwind + shadcn/ui, lucide-react
- API: Express 5; AI via Replit AI Integrations OpenAI proxy (server-side only)
- Validation: Zod (`zod/v4`); API codegen: Orval from OpenAPI
- Persistence: browser `localStorage` only (no database)

## Where things live

- `artifacts/reset-mode/src/lib/storage.ts` — all persisted state: typed `localStorage` hooks (`useStorage`, `useSettings`, `useSimulations`, `useReflections`, streaks, spendings, journal) and the `resetMode_*` storage keys. Source of truth for user data shapes. `HabitType` + `HABIT_LABELS` define the selectable habits.
- `artifacts/reset-mode/src/lib/habitContent.ts` — additive per-habit content overrides (reminder/danger messages, streak-bucketed daily-reminder copy, journal copy). Habits without an entry return `null`/`undefined` and fall back to the existing generic copy, so it never changes behavior for habits it does not cover.
- `artifacts/reset-mode/src/pages/` — one file per route (`Home`, `Urge`, `Simulation`, `Reflection`, `Story`, `Tracker`, `Spending`, `Journal`, `Plan`, `Settings`); routes wired in `src/App.tsx`.
- `artifacts/reset-mode/src/lib/simulation.ts` — Simulation Mode content (scenarios, actions, reflections), the scripted-guidance fallback, and `fetchResetMasterGuidance` (robust `/api` client that falls back on any failure).
- `artifacts/reset-mode/src/lib/stories.ts` — Storytelling Mode content: scripted Reset Master `STORY_CATEGORIES` (5 categories, 2–3 rotating variations each) and the `PROTECTIVE_CHOICES` shown after each story. Purely scripted; a per-category counter in `resetMode_storyRotation` rotates variations on repeat visits.
- `artifacts/api-server/src/routes/resetMaster.ts` — `POST /api/reset-master/guidance` AI route (guided-only, validated, graceful errors); mounted in `src/routes/index.ts`.
- `lib/api-spec/openapi.yaml` — the API contract (source for codegen; do not change `info.title`).

## Architecture decisions

- **localStorage-only, offline-first.** No backend persistence; the PWA works fully offline. User data must never be deleted/reset/overwritten — all changes are strictly additive (new storage keys, never mutate existing shapes).
- **Vercel deploy hosts only the static SPA** (`vercel.json` builds `reset-mode`, not `api-server`). So `/api` is unreachable in Vercel prod — see the AI fallback decision.
- **Reset Master AI is optional and degrades gracefully.** Real AI runs only where `api-server` runs (Replit dev preview + Replit deployments); on Vercel it falls back to deterministic scripted guidance. The client treats non-200, non-JSON (HTML), timeout, and errors as "no backend."
- **Guided-only AI, not a chatbot.** The client sends only predefined scenario/action labels plus bounded goal/habit strings; the server prompt enforces 2–4 calm, disciplined, non-shaming sentences with no medical advice. API keys stay server-side.
- **Contract-first API.** Edit `openapi.yaml`, run codegen, then validate requests server-side with the generated Zod schemas.

## Product

- **Reset / "I have an urge"** — a guided breathing + reframe flow to ride out a craving.
- **Simulation Mode ("Practice a Weak Moment")** — rehearse a hard moment while calm: pick a scenario → choose your response → get short "Reset Master" guidance → breathe → commit to a reflection; results saved to `resetMode_simulations`.
- **Self-Reflection Mode ("Reflect on a Weak Moment")** — after a weak moment, name the trigger → the better choice made → what you learned → what you'll do next time; Reset Master affirmation shown, entry saved to `resetMode_reflections`.
- **Storytelling Mode ("Reset Story")** — short scripted Reset Master stories on discipline (5 themes, rotating variations), each ending with a "what protects your future right now?" choice that routes to breathing/goal/journal or a calm closing screen.
- **Streaks / Tracker, Spending, Journal, Plan, Settings, reminders, onboarding** — supporting habit-reset tools.

## User preferences

- Never delete, reset, or overwrite existing user data or features — only add and improve.

## Gotchas

- The `api-server` dev workflow builds on start with no file watch — **restart the workflow** after changing server routes.
- After editing `openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` before typechecking consumers.
- Do not assume `/api` is reachable in production; keep the scripted fallback working (Vercel has no backend).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- `.agents/memory/reset-mode-deploy-ai.md` — deploy topology + AI fallback rationale
