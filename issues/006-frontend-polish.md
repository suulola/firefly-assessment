---
title: Frontend polish — search, lazy-loading, animations (bonus)
labels: [ready-for-agent]
status: done
---

## What to build

Bonus-points polish, bundled into one slice since all three touch the same list/detail/favorite surfaces built in issues 002–004:

- **Search**: a name search input that filters the already-fetched 150-item list client-side (no new backend call, same pattern as the favorites filter in issue 005).
- **Lazy-loading / infinite scroll**: render the list progressively instead of all 150 items (and their images) at once, to keep initial load fast.
- **Animations/transitions**: smooth transitions for opening the detail view and for the favorite-toggle state change.

These are explicitly lower priority than issues 002–005 per `PRD.md` (bonus points, not core requirements) — safe to defer or drop under time pressure.

## Acceptance criteria

- [x] Frontend RTL test (backend mocked via msw): typing in the search input filters the list to matching names.
- [x] Frontend RTL test: clearing the search input restores the full list. Also covered against a 150-item fixture (larger than the 30-item lazy-load batch) that exercises search + scroll + clear together, since a small fixture alone couldn't distinguish "search cleared correctly" from "the lazy-load batch reset happened to cover everything because the list was tiny" (`Search.test.tsx`).
- [x] Lazy-loading implemented (30-item batches, more loaded on scroll near the bottom of the list panel) and covered by an RTL test that scrolls the list and asserts more items render. **Not manually verified in a real browser** — no live visual/screenshot check was performed (see `issues/002-pokemon-list.md` for the same honesty note on browser verification in this project).
- [x] Transitions implemented: the detail panel's content fades/slides in per Pokémon (`fadeUp`, keyed by `detail.id` so it replays on each new selection) and the favorite star pops on toggle (`favPop`, keyed by favorited state) in both the list row and detail panel. **Not manually verified in a real browser** — confirmed via code/CSS inspection and that the full test suite still passes with these changes, not via a live visual check.

None of the "manually verified" boxes above claim a real-browser check happened — see the notes on each. A live `/browse` pass (declined earlier in this session due to onboarding overhead) would be the way to close that gap if it matters for submission.

## Blocked by

- 002 — Pokémon list, end-to-end
- 003 — Pokémon detail, end-to-end
- 004 — favorites add/remove, end-to-end
