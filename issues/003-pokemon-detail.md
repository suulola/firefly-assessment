---
title: Pokémon detail, end-to-end
labels: [ready-for-agent]
status: done
---

## What to build

Clicking a Pokémon in the list shows its abilities, types, and evolution options, backend to UI.

Per `PRD.md`'s Implementation Decisions, this endpoint is an intentional addition beyond the four endpoints the source requirement doc literally enumerates — it's required to satisfy the doc's "backend is the only PokéAPI caller" constraint together with its "show abilities/types/evolutions on click" requirement.

- Backend: a `GET` detail endpoint, parameterized by Pokémon id or name, that resolves abilities, types, and the evolution chain from PokéAPI's separate `pokemon-species`/`evolution-chain` resources and flattens them into one response. Evolution chains are flattened into an ordered list of `{ id, name, sprite }` stages — branching chains (e.g. Eevee) should not break this flattening. Same PokéAPI-failure-to-error-envelope handling as the list endpoint.
- Frontend: clicking a list item opens a detail view showing abilities, types, and evolution stages, with its own loading state and error state (independent of the list's loading/error state). Pokémon with no evolutions show an explicit "no evolutions" state rather than an empty-looking gap.

## Acceptance criteria

- [ ] Backend integration test (supertest, PokéAPI mocked): detail endpoint returns abilities, types, and a flattened evolution list for a Pokémon with a linear evolution chain.
- [ ] Backend integration test: detail endpoint correctly flattens a branching evolution chain (e.g. Eevee-like case).
- [ ] Backend integration test: detail endpoint returns a sensible response for a Pokémon with no evolutions.
- [ ] Backend integration test: a mocked PokéAPI failure produces the standard error envelope.
- [ ] Frontend RTL test (backend mocked via msw): clicking a list item renders abilities, types, and evolution stages.
- [ ] Frontend RTL test: detail view shows its own loading state and error state, independent of the list.
- [ ] Frontend RTL test: a Pokémon with no evolutions shows an explicit empty state, not a blank section.

## Blocked by

- 002 — Pokémon list, end-to-end
