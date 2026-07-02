---
title: Favorites filter & reload persistence, end-to-end
labels: [ready-for-agent]
status: open
---

## What to build

Users can filter the list to favorites only, and that list (and the filter's source data) survives a page reload.

- Backend: `GET` list-favorites endpoint returning the current favorites list.
- Frontend: on load, fetch current favorites (to drive both the list's badge highlighting and the filter), and add a "favorites only" toggle that filters the already-fetched 150-item list client-side — no new backend call needed per toggle.

## Acceptance criteria

- [ ] Backend integration test (supertest): list-favorites endpoint returns the current favorites after adds/removes from issue 004's endpoints.
- [ ] Frontend RTL test (backend mocked via msw): toggling "favorites only" shows just favorited Pokémon and hides the rest.
- [ ] Frontend RTL test: toggling back off restores the full list.
- [ ] Manually verified: refreshing the page preserves both the favorites badges and correct filter behavior (favorites re-fetched from backend on load, not lost).

## Blocked by

- 004 — favorites add/remove, end-to-end
