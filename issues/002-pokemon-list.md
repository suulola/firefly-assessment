---
title: Pokémon list, end-to-end
labels: [ready-for-agent]
status: open
---

## What to build

The first full vertical slice: browsing the first 150 Pokémon, backend to UI.

- Backend: a `GET` list endpoint that proxies the PokéAPI, resolves the first 150 Pokémon, and returns id, name, sprite URL, and enough summary data for a list item — not full detail (kept light on purpose; detail is a separate endpoint in a later slice). PokéAPI failures (timeout, network error, non-2xx) are caught and translated into the backend's error envelope rather than leaking PokéAPI's raw error shape.
- Frontend: a scrollable list rendering all 150 items, with a loading state while the fetch is in flight and a clear error state if it fails.

## Acceptance criteria

- [ ] Backend integration test (supertest, PokéAPI mocked): list endpoint returns 150 items with the expected shape.
- [ ] Backend integration test: a mocked PokéAPI failure produces the backend's standard error envelope, not a raw passthrough or a 500 with no body.
- [ ] Frontend RTL test (backend mocked via msw): list renders 150 items with name, sprite, and number visible.
- [ ] Frontend RTL test: a loading indicator is shown while the request is in flight.
- [ ] Frontend RTL test: a clear error message is shown when the backend call fails.
- [ ] Manually verified: list is scrollable in a real browser.

## Blocked by

- 001 — project scaffolding
