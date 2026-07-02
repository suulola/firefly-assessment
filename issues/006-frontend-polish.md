---
title: Frontend polish — search, lazy-loading, animations (bonus)
labels: [ready-for-agent]
status: open
---

## What to build

Bonus-points polish, bundled into one slice since all three touch the same list/detail/favorite surfaces built in issues 002–004:

- **Search**: a name search input that filters the already-fetched 150-item list client-side (no new backend call, same pattern as the favorites filter in issue 005).
- **Lazy-loading / infinite scroll**: render the list progressively instead of all 150 items (and their images) at once, to keep initial load fast.
- **Animations/transitions**: smooth transitions for opening the detail view and for the favorite-toggle state change.

These are explicitly lower priority than issues 002–005 per `PRD.md` (bonus points, not core requirements) — safe to defer or drop under time pressure.

## Acceptance criteria

- [ ] Frontend RTL test (backend mocked via msw): typing in the search input filters the list to matching names.
- [ ] Frontend RTL test: clearing the search input restores the full list.
- [ ] Manually verified: list renders progressively (lazy-load/infinite scroll) rather than blocking on all 150 items up front.
- [ ] Manually verified: detail view open/close and favorite-toggle have a visible transition, not an instant snap.

## Blocked by

- 002 — Pokémon list, end-to-end
- 003 — Pokémon detail, end-to-end
- 004 — favorites add/remove, end-to-end
