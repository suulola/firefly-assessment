# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A take-home assessment: a full-stack Pokémon explorer. React frontend, Node.js/Express backend that proxies the PokéAPI and manages a favorites list. Full requirements are in `requirement.pdf`; the working spec derived from it is `PRD.md`. Work is broken into vertical-slice issues in `issues/` (see `issues/README.md` for build order and dependencies) — check there before starting new work, since each issue has its own acceptance criteria and test-seam expectations.

Two independently-run services, no shared runtime coupling:
- `backend/` — Node.js, Express, TypeScript
- `frontend/` — React, Vite, TypeScript

## Commands

All commands run from inside `backend/` or `frontend/` respectively — there is no root package.json or workspace tooling tying them together.

**Backend** (`cd backend`):
- `npm run dev` — start with hot reload (tsx watch), listens on `:4000`
- `npm test` — run the full test suite once (vitest)
- `npm run test:watch` — watch mode
- `npx vitest run test/health.test.ts` — run a single test file
- `npx tsc -p tsconfig.json --noEmit` — typecheck (includes `src` and `test`)
- `npm run build` — compile `src` only to `dist` (uses `tsconfig.build.json`)

**Frontend** (`cd frontend`):
- `npm run dev` — start Vite dev server on `:5173`
- `npm test` — run the full test suite once (vitest)
- `npm run test:watch` — watch mode
- `npx vitest run test/App.test.tsx` — run a single test file
- `npx tsc -b` — typecheck
- `npm run lint` — oxlint
- `npm run build` — production build

## Backend architecture: module-based

Backend code is organized by domain under `src/modules/<name>/`, not by technical layer. Each module owns the layers it needs:

- `route.ts` — Express router, HTTP concerns only (status codes, request/response shape). No business logic.
- `service.ts` — business logic. Only add this file when there's actual logic to hold; a route that just calls a repository doesn't need an empty passthrough service.
- `repository.ts` — the module's only I/O boundary: the PokéAPI HTTP client, or file-based persistence. Nothing outside a module's `repository.ts` should call `fetch()` or touch the filesystem directly for that module's data.

Current modules:
- `modules/health` — liveness (`GET /health`) and a PokéAPI deep-reachability check (`GET /health/pokeapi`). Its service reuses `modules/pokemon/repository.ts` rather than calling PokéAPI itself — this is the pattern for cross-module reuse: import another module's `repository`/`service`, never its `route`.
- `modules/pokemon` — `repository.ts` wraps the only PokéAPI HTTP client in the backend (`pokeApiGet`, `POKEAPI_BASE_URL`). `service.ts`/`route.ts` implement `GET /pokemon` (first 150, list shape) and `GET /pokemon/:id` (types/abilities/flattened evolution chain).
- `modules/favorites` — `repository.ts` is file-based JSON persistence (`createFileFavoritesStore`, backed by `backend/data/favorites.json`) behind a `read`/`write` interface, so the storage mechanism can change without touching callers. Not yet wired to a route.

`src/app.ts` composes the Express app from module routers and exports it (unstarted) for testing; `src/server.ts` is the only place that calls `.listen()`.

When adding backend functionality: create a new `src/modules/<name>/` folder following this pattern rather than adding to a flat `routes/` or `lib/` directory.

## Backend error responses

Every route that can fail (PokéAPI proxy failures, future favorites-storage failures) responds with the same envelope — **not** an ad hoc `{ error: string }` shape:

```json
{ "statusCode": 502, "message": "Failed to load the Pokémon list." }
```

`statusCode` is also the HTTP response status. `modules/pokemon/route.ts` has a small local `sendError(res, statusCode, message)` helper — reuse that pattern (or promote it to a shared helper only once a third module needs the same thing; two call sites in one file doesn't justify a new shared module yet). When writing the integration test for a new failing route, assert against `{ statusCode, message }`, not against whatever shape feels natural in the moment — this exact mismatch (a route-local `{ error }` shape drifting from the documented envelope) has already happened once in this repo.

## Testing seams

Two seams only, agreed in `PRD.md`'s Testing Decisions — don't test at other boundaries (no mocking internal collaborators, no hitting the real PokéAPI in tests, no snapshotting internal state):

- **Backend**: integration tests via `supertest` against the exported `app` (`src/app.ts`). The only thing mocked is the outbound PokéAPI call, via `msw`'s Node server (`backend/test/msw/`). Routing, business logic, and file-based persistence all run for real.
- **Frontend**: React Testing Library tests that render components and interact with them like a user would. The only thing mocked is the backend HTTP layer, via `msw` (`frontend/test/msw/`).

## Local dev cross-service wiring

`frontend/vite.config.ts` proxies `/health` (extend this list as new backend routes land) to `http://localhost:4000`, so the frontend can call the backend same-origin in dev without needing CORS config on the backend. `backendClient.ts`'s `BACKEND_BASE_URL` is `""` in dev (relative, goes through the proxy) and reads `VITE_BACKEND_URL` otherwise. Production CORS + the deployed backend URL are issue 008's concern (deployment), not something to add now.

## Design reference

There is a companion design at claude.ai/design — project `6cc83108-ccfe-453a-b946-765108863820`, file `Pokemon Explorer.dc.html`:
https://claude.ai/design/p/6cc83108-ccfe-453a-b946-765108863820?file=Pokemon+Explorer.dc.html

**Before implementing or changing anything under `frontend/src/`, fetch and reference this file** via the `claude_design` MCP tool (`DesignSync`: `list_files` / `get_file` against that project ID) rather than implementing UI from assumption. If a session hits a "needs design-system authorization" error from `DesignSync`, the user needs to run `/design-login` first — that's an interactive OAuth step only the user can complete.
