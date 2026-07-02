---
title: Accessibility pass
labels: [ready-for-agent]
status: open
---

## What to build

Make the list, detail view, favorite toggle, and filter operable without a mouse and usable with a screen reader: keyboard focus order, visible focus states, semantic roles/labels on interactive elements (list items, favorite toggle, filter toggle, search input if issue 006 landed), and accessible names for icon-only controls (e.g. the favorite badge/icon).

## Acceptance criteria

- [ ] Every interactive element (list item, favorite toggle, filter toggle, detail close action) is reachable and operable via keyboard alone.
- [ ] Icon-only controls (favorite badge/icon) have an accessible name (e.g. `aria-label`), not just a visual icon.
- [ ] Focus is visibly indicated and moves sensibly when opening/closing the detail view.
- [ ] Manually verified with a screen reader (or axe-style automated check) on the list, detail view, and filter.

## Blocked by

- 002 — Pokémon list, end-to-end
- 003 — Pokémon detail, end-to-end
- 004 — favorites add/remove, end-to-end
- 005 — favorites filter & reload persistence
