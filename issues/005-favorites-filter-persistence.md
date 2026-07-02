---
title: Favorites filter & reload persistence, end-to-end
labels: [ready-for-agent]
status: done
---

## What to build

Users can filter the list to favorites only, and that list (and the filter's source data) survives a page reload.

- Backend: `GET` list-favorites endpoint returning the current favorites list.
- Frontend: on load, fetch current favorites (to drive both the list's badge highlighting and the filter), and add a "favorites only" toggle that filters the already-fetched 150-item list client-side — no new backend call needed per toggle.

## Acceptance criteria

- [x] Backend integration test (supertest): list-favorites endpoint returns the current favorites after adds/removes from issue 004's endpoints.
- [x] Frontend RTL test (backend mocked via msw): toggling "favorites only" shows just favorited Pokémon and hides the rest.
- [x] Frontend RTL test: toggling back off restores the full list.
- [x] Manually verified: confirmed via curl against the live backend/frontend proxy that `POST /favorites` persists to `backend/data/favorites.json` and `GET /favorites` (the exact call `App.tsx` makes on mount) returns the persisted ids — the same code path a real page reload triggers.

## Blocked by

- 004 — favorites add/remove, end-to-end
