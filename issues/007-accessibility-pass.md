---
title: Accessibility pass
labels: [ready-for-agent]
status: open
---

## What to build

Make the list, detail view, favorite toggle, and filter operable without a mouse and usable with a screen reader: keyboard focus order, visible focus states, semantic roles/labels on interactive elements (list items, favorite toggle, filter toggle, search input if issue 006 landed), and accessible names for icon-only controls (e.g. the favorite badge/icon).

## Acceptance criteria

- [x] Every interactive element (list item, favorite toggle, filter toggle, search input) is reachable and operable via keyboard alone — every control is a real `<button>`/`<input>`, none are `<div onClick>`. (No literal "detail close action" exists — the layout is a persistent two-pane split, not a modal that opens/closes, so there's nothing to close.)
- [x] Icon-only controls (favorite badge/icon) have an accessible name via `aria-label`.
- [x] Focus is visibly indicated: a global `:focus-visible` ring covers every button app-wide (`index.css`), plus a dedicated focus style on the search input.
- [ ] Focus/announcement "moves sensibly when opening the detail view" — not implemented. Selecting a Pokémon updates the detail panel's content but doesn't move focus into it or announce the change via a live region; a screen reader user gets no signal that content changed unless they navigate there themselves. The list (`<nav aria-label="Pokémon list">`) and detail panel (`<main aria-label="Pokémon detail">`) are now real landmarks with a correct `<h1>`→`<h2>`→`<h3>` heading structure (Types/Abilities/Evolution line are `<h3>`), so at least jump-by-landmark/heading navigation works — but that's a partial answer to this criterion, not a full one.
- [ ] Manually verified with a screen reader (or axe-style automated check) — not done. No axe-core integration exists yet and no real screen-reader pass was performed.

## Blocked by

- 002 — Pokémon list, end-to-end
- 003 — Pokémon detail, end-to-end
- 004 — favorites add/remove, end-to-end
- 005 — favorites filter & reload persistence
