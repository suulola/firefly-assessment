---
title: Deployment (bonus)
labels: [ready-for-agent]
status: open
---

## What to build

Deploy both services and confirm they talk to each other in production, per `PRD.md`'s bonus deployment guidance: frontend to Vercel, backend to Railway. Wire up production environment variables (backend base URL for the frontend, CORS allow-list on the backend for the deployed frontend origin) and confirm favorites persistence works against the deployed backend's filesystem/storage.

**Prep status (not deployment itself):** environment/config prep is done — see `README.md`'s Deployment section for exact steps, and Environment variables / Production notes for the env vars and the Railway ephemeral-filesystem caveat. Backend CORS (`CORS_ORIGIN`, comma-separated, fails closed to `localhost:5173` if unset — see `backend/src/corsConfig.ts`) and `FAVORITES_STORE_PATH` are implemented and tested (`backend/test/cors.test.ts`, `backend/test/favorites.test.ts`). No actual Railway service or Vercel project has been created, and nothing has been deployed — the checklist below stays unchecked until real URLs exist and have been manually verified.

## Acceptance criteria

- [ ] Backend deployed and reachable at a public URL; health-check route responds.
- [ ] Frontend deployed and reachable at a public URL, configured to call the deployed backend (not localhost).
- [ ] CORS is configured so the deployed frontend can call the deployed backend.
- [ ] End-to-end manual check against the deployed app: list loads, detail view works, favorites add/remove/filter work and survive a page refresh.
- [ ] Live links recorded for the submission (README, per issue 009).

## Blocked by

- 002 — Pokémon list, end-to-end
- 003 — Pokémon detail, end-to-end
- 004 — favorites add/remove, end-to-end
- 005 — favorites filter & reload persistence
