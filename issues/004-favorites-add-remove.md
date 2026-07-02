---
title: Favorites add/remove, end-to-end
labels: [ready-for-agent]
status: open
---

## What to build

Users can mark/unmark a Pokémon as a favorite, persisted through the backend.

- Backend: `POST` add-favorite and `DELETE` remove-favorite endpoints, both idempotent (adding an already-favorited Pokémon, or removing a non-favorited one, is not an error). Wire the scaffolded persistence module (issue 001) to real file-based JSON storage of favorite Pokémon ids.
- Frontend: a favorite toggle control on the list item (and/or detail view). Toggling is optimistic — the UI updates immediately — and rolls back with an inline error if the backend call fails. Favorited Pokémon are visually highlighted in the list (badge/icon).

## Acceptance criteria

- [ ] Backend integration test (supertest): adding a favorite persists it (verified via storage or the list-favorites read path stubbed in issue 001).
- [ ] Backend integration test: adding an already-favorited Pokémon is idempotent (no error, no duplicate).
- [ ] Backend integration test: removing a favorite persists the removal.
- [ ] Backend integration test: removing a non-favorited Pokémon is idempotent (no error).
- [ ] Backend integration test: favorites survive a process restart (read back from the file store on a fresh app instance in the test).
- [ ] Frontend RTL test (backend mocked via msw): toggling favorite updates the UI immediately (optimistic).
- [ ] Frontend RTL test: a failed toggle call rolls back the UI change and shows an inline error.
- [ ] Frontend RTL test: favorited Pokémon show a visible badge/icon in the list.

## Blocked by

- 002 — Pokémon list, end-to-end
