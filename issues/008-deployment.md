---
title: Deployment (bonus)
labels: [ready-for-agent]
status: open
---

## What to build

Deploy both services and confirm they talk to each other in production, per `PRD.md`'s bonus deployment guidance: frontend to Vercel or Netlify, backend to Render (or equivalent). Wire up production environment variables (e.g. backend base URL for the frontend, CORS allow-list on the backend for the deployed frontend origin) and confirm favorites persistence works against the deployed backend's filesystem/storage.

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
