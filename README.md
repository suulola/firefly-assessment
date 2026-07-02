# Pokémon Explorer

A full-stack Pokémon browser: view the first 150 Pokémon, click one to see its abilities/types/evolution line, and manage a favorites list — built for the Firefly Full-Stack Engineer take-home assessment (`requirement.pdf`).

## Approach

- **Frontend**: React + TypeScript, built with Vite.
- **Backend**: Node.js + Express + TypeScript. It is the *only* caller of the public PokéAPI — the frontend never talks to `pokeapi.co` directly, only to this backend.
- **Favorites persistence**: a single shared favorites list, stored as file-based JSON on the backend (no database — see [Assumptions](#assumptions) for why, and [Production notes](#production-notes-file-persistence-on-railway) for the hosting caveat that comes with that choice).

Full requirements/spec derivation live in [`PRD.md`](PRD.md); the implementation is broken into vertical-slice issues in [`issues/`](issues/) (see [`issues/README.md`](issues/README.md) for build order).

## Local setup

Two independently-run services, no shared workspace tooling — install and run each from its own directory.

### Backend

```bash
cd backend
npm install
npm run dev
```

Listens on **http://localhost:4000** by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Serves on **http://localhost:5173** by default. In dev, Vite proxies `/health`, `/pokemon`, and `/favorites` requests to `http://localhost:4000` (see `frontend/vite.config.ts`), so the two services talk to each other same-origin without needing `VITE_BACKEND_URL` or backend CORS config locally.

Run both at once from two terminals; there's no single top-level script that starts both.

## Tests, builds, lint

**Backend** (from `backend/`):
```bash
npm test        # vitest run — full suite once
npm run build   # tsc -p tsconfig.build.json — compiles src/ to dist/
```

**Frontend** (from `frontend/`):
```bash
npm test        # vitest run — full suite once
npm run build   # tsc -b && vite build — typecheck + production bundle to dist/
npm run lint    # oxlint
```

## Environment variables

### Backend

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | No | `4000` | Port the Express server listens on. Railway sets this automatically. |
| `CORS_ORIGIN` | Recommended in production | unset → only `http://localhost:5173` is allowed | Comma-separated list of allowed frontend origins, e.g. `https://my-app.vercel.app,https://my-app-preview.vercel.app`. See [CORS behavior](#cors-behavior) below. |
| `FAVORITES_STORE_PATH` | No | `backend/data/favorites.json` | Absolute path to the favorites JSON file. Point this at a mounted volume path in production — see [Production notes](#production-notes-file-persistence-on-railway). |

### Frontend

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_BACKEND_URL` | Required for a deployed build | `""` (relative, uses the dev proxy) | Base URL of the deployed backend, e.g. `https://my-backend.up.railway.app`. |

**Important**: Vite inlines `VITE_`-prefixed env vars into the JavaScript bundle *at build time*, not read at runtime. On Vercel, `VITE_BACKEND_URL` must be set as a project environment variable *before* the build runs (Vercel does this automatically for builds triggered after you add the variable — just make sure it's set before the deploy you want it to take effect on, and redeploy if you add/change it after an existing build).

### CORS behavior

`CORS_ORIGIN` unset falls back to allowing only `http://localhost:5173` — **not** a wildcard. This is a deliberate departure from "wildcard if nothing is configured": the `/favorites` endpoints accept mutating `POST`/`DELETE` requests, so an open CORS policy on a misconfigured deployment (env var forgotten) would silently accept cross-origin writes from any site. Failing closed means a deployed backend without `CORS_ORIGIN` set simply won't work from the deployed frontend (visible immediately as failed requests) instead of silently accepting requests from anywhere.

## Deployment

**Backend on Railway:**
1. Create a new Railway service from this repository.
2. In the service's **Settings → Root Directory**, set it to `backend`. Railway's Nixpacks build will then run `npm install` and `npm run build` (via the `backend/package.json` scripts) and start with `npm start` in that subdirectory — no `railway.json` needed for this.
3. Set environment variables: `CORS_ORIGIN` (to the Vercel frontend's domain, added once that's known — see below), and optionally `FAVORITES_STORE_PATH` if you've attached a Railway volume (see [Production notes](#production-notes-file-persistence-on-railway)). Leave `PORT` unset — Railway injects it.

**Frontend on Vercel:**
1. Create a new Vercel project from this repository.
2. In **Project Settings → General → Root Directory**, set it to `frontend`. Vercel auto-detects the Vite framework preset (build command `npm run build`, output directory `dist`) — no `vercel.json` needed for this.
3. Set the environment variable `VITE_BACKEND_URL` to the Railway backend's public URL, then deploy (or redeploy if the backend URL wasn't known yet at first deploy).
4. Once you have the Vercel domain, go back to the Railway service and set `CORS_ORIGIN` to that domain, then redeploy the backend.

**Live links**: Deployment pending — no live URLs yet. This section will be updated with the deployed frontend/backend URLs once both are live and manually verified end-to-end (list loads, detail view works, favorites add/remove/filter survive a refresh).

### Production notes: file persistence on Railway

Favorites are stored as a JSON file on the backend's local filesystem (`FAVORITES_STORE_PATH`, default `backend/data/favorites.json`). Railway's default filesystem is **ephemeral** — it does not necessarily persist across redeploys or restarts. For favorites to survive a redeploy in production, attach a [Railway volume](https://docs.railway.app/reference/volumes) mounted at a persistent path and set `FAVORITES_STORE_PATH` to a file path inside that mount. Without a volume, favorites will reset on every redeploy; this is an accepted limitation for this assessment's scope (the requirement doc explicitly allows "in-memory or simple file-based storage," not a database).

## Assumptions

- **Single shared favorites list, no accounts/auth.** The requirement doc doesn't mention users or authentication, so favorites are one global list for the running instance rather than per-user.
- **A fifth backend endpoint beyond the source doc's literal four.** `requirement.pdf`'s Technical Guidelines enumerate exactly four endpoints (fetch-150, add-favorite, remove-favorite, list-favorites). This implementation adds a fifth, non-enumerated `GET /pokemon/:id` detail endpoint — it's the only way to satisfy two other explicit requirements at once: the backend must be the *only* PokéAPI caller, and clicking a Pokémon must show its abilities/types/evolutions. See `PRD.md`'s Implementation Decisions for the full reasoning.
- **File-based persistence, not a database**, per the requirement doc's explicit allowance — see the Railway ephemeral-filesystem caveat above.
- **No production browser/visual QA was performed on issue 002's "scrollable in a real browser" criterion** — verified instead via the underlying CSS pattern and real data reaching the DOM (see `issues/002-pokemon-list.md`).

## API reference

All endpoints are served by the backend; the frontend never calls PokéAPI directly.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness check. |
| `GET` | `/health/pokeapi` | Deep health check — confirms the backend can reach PokéAPI. |
| `GET` | `/pokemon` | First 150 Pokémon: `{ id, name, spriteUrl }[]`. |
| `GET` | `/pokemon/:id` | One Pokémon's abilities, types, and flattened evolution chain. |
| `GET` | `/favorites` | Current favorite Pokémon ids: `number[]`. |
| `POST` | `/favorites` | Add a favorite. Body: `{ id: number }`. Idempotent. |
| `DELETE` | `/favorites/:id` | Remove a favorite. Idempotent. |

Errors from any endpoint use a consistent envelope: `{ "statusCode": number, "message": string }`, with the same value as the HTTP status code.
