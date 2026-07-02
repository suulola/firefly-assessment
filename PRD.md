# PRD: Pokémon Explorer & Favorites App

Source: `requirement.pdf` (Firefly — Full-Stack Engineer, Live AI Coding assessment)

## Problem Statement

A user wants to browse the original 150 Pokémon, inspect a Pokémon's details (abilities, types, evolutions), and curate a personal list of favorites — without having to talk to the public PokéAPI directly or lose their favorites between visits. Today there is no application that does this: the user would have to hit raw PokéAPI JSON in a browser tab and has nowhere to persist a "favorites" list at all.

## Solution

Build a two-service full-stack app:

- A **Node.js backend** that proxies the PokéAPI (so the frontend never talks to a third-party host directly), exposes REST endpoints for listing the first 150 Pokémon and for managing a favorites list, and persists that favorites list across restarts.
- A **React frontend** that lists the first 150 Pokémon in a scrollable list, shows abilities/types/evolutions on click, lets the user add/remove favorites via the backend, and can filter the list down to favorites only. Favorite Pokémon are visually marked in the list. Loading and error states are handled gracefully.

## User Stories

1. As a visitor, I want to see a scrollable list of the first 150 Pokémon on page load, so that I can browse the full original roster without pagination clicks.
2. As a visitor, I want to see a loading indicator while the Pokémon list is being fetched, so that I know the app is working and not frozen.
3. As a visitor, I want to see a clear error message if the Pokémon list fails to load, so that I understand something went wrong rather than seeing a blank screen.
4. As a visitor, I want each list item to show at least the Pokémon's name, sprite/image, and number, so that I can recognize it at a glance.
5. As a visitor, I want to click a Pokémon in the list and see its abilities, so that I can learn its move-support kit.
6. As a visitor, I want to click a Pokémon in the list and see its types (e.g. Fire, Water), so that I understand its battle strengths/weaknesses.
7. As a visitor, I want to click a Pokémon in the list and see its evolution options, so that I understand how it fits into its evolutionary line.
8. As a visitor, I want to see a clear "no evolutions" state for Pokémon with no evolution chain, so that I don't mistake missing data for a loading bug.
9. As a visitor, I want the detail view to show a loading state while abilities/types/evolutions are being fetched, so that I get feedback during the request.
10. As a visitor, I want the detail view to show an error state if the detail fetch fails, so that I can retry or move on instead of seeing stale/blank data.
11. As a visitor, I want to mark a Pokémon as a favorite directly from the list or detail view, so that I can save Pokémon I care about without leaving my current context.
12. As a visitor, I want to unmark a Pokémon as a favorite, so that I can remove Pokémon I no longer want tracked.
13. As a visitor, I want the favorite/unfavorite action to be reflected immediately in the UI, so that the app feels responsive even while the backend request is in flight.
14. As a visitor, I want to see a clear error if a favorite/unfavorite action fails, so that I know my change wasn't saved and can retry.
15. As a visitor, I want favorite Pokémon visually highlighted in the list (badge/icon), so that I can spot them at a glance while scrolling.
16. As a visitor, I want to toggle a "favorites only" filter on the list, so that I can quickly review just the Pokémon I've saved.
17. As a visitor, I want my favorites to still be there if I refresh the page, so that my curation effort isn't lost.
18. As a visitor, I want my favorites to still be there if the backend restarts, so that a server redeploy doesn't wipe my list.
19. As a developer integrating with the backend, I want a REST endpoint that returns the first 150 Pokémon with the fields the frontend needs, so that I don't have to call the PokéAPI directly from the browser.
20. As a developer integrating with the backend, I want a REST endpoint to fetch a single Pokémon's full detail (abilities, types, evolution chain), so that the detail view has one call to make per Pokémon.
21. As a developer integrating with the backend, I want a REST endpoint to add a Pokémon to favorites, so that the frontend can persist a favorite action.
22. As a developer integrating with the backend, I want a REST endpoint to remove a Pokémon from favorites, so that the frontend can persist an unfavorite action.
23. As a developer integrating with the backend, I want a REST endpoint to list current favorites, so that the frontend can render the favorites filter and list badges on load.
24. As a developer operating the backend, I want PokéAPI failures (timeouts, 4xx/5xx, network errors) to be caught and translated into a clean error response, so that the frontend never has to parse PokéAPI-shaped errors.
25. As a developer operating the backend, I want favorites persisted to disk (or a lightweight DB) rather than only in a JS variable, so that a process restart doesn't silently wipe user data.
26. As a visitor, I want to search the Pokémon list by name, so that I can jump straight to a specific Pokémon instead of scrolling. *(bonus)*
27. As a visitor, I want smooth transitions when opening a detail view or toggling favorites, so that the app feels polished rather than jumpy. *(bonus)*
28. As a visitor, I want the list to load progressively (lazy-load/infinite scroll) rather than all 150 details up front, so that the initial page load is fast. *(bonus)*
29. As a visitor using a screen reader or keyboard only, I want the list and detail view to be operable without a mouse, so that the app is accessible.
30. As a reviewer of this submission, I want a README with setup steps for both services and a summary of assumptions made, so that I can run the app locally without guesswork.

## Implementation Decisions

- **Two services, one repo**: `frontend/` (React) and `backend/` (Node.js), each independently runnable; no shared runtime coupling. A root `README.md` documents running both.
- **Backend is the only PokéAPI client.** The frontend never calls `pokeapi.co` directly — this is a hard requirement from the source doc, not just a convenience, since it's what makes the backend a meaningful proxy layer and lets the backend normalize/cache PokéAPI's shape.
- **Backend REST surface** (exact route paths are an implementation detail, not fixed by this PRD). The source doc's Technical Guidelines literally enumerate four endpoints (fetch-150, add-favorite, remove-favorite, list-favorites). This PRD adds a **fifth, non-enumerated endpoint** — per-Pokémon detail — as a deliberate extension, not a misreading: the doc separately requires that clicking a Pokémon show abilities/types/evolutions, and requires the backend to be the *only* PokéAPI caller, so a detail endpoint is the only way to satisfy both constraints at once. This should be called out as an explicit assumption in the README (per story 30).
  - `GET` list endpoint — returns the first 150 Pokémon with id, name, sprite URL, and enough summary data for the list view (not full detail, to keep the initial payload light).
  - `GET` detail endpoint *(addition beyond the doc's four listed endpoints — see above)*, parameterized by Pokémon id or name — returns abilities, types, and evolution chain (resolved from PokéAPI's separate `pokemon-species`/`evolution-chain` resources into one flattened response so the frontend makes one call).
  - `POST` favorites endpoint — adds a Pokémon (by id) to the favorites list; idempotent (adding an already-favorited Pokémon is not an error).
  - `DELETE` favorites endpoint, parameterized by Pokémon id — removes a Pokémon from favorites; idempotent (removing a non-favorited Pokémon is not an error).
  - `GET` favorites endpoint — returns the current favorites list.
- **Persistence**: file-based JSON storage (per the doc's "in-memory or simple file-based storage" allowance) is sufficient — no external DB service required for this scope. The storage layer should sit behind a small interface (read favorites / write favorites) so it could be swapped for a real DB later without touching route handlers.
- **No user accounts / single global favorites list.** The requirement doc doesn't mention auth or multi-user support, so favorites are a single shared list for the running instance, not per-user.
- **Evolution data shape**: PokéAPI's evolution chain is a nested tree (a Pokémon can have branching evolutions, e.g. Eevee). The backend should flatten this into a simple ordered list of `{ id, name, sprite }` stages for the frontend to render, rather than passing through PokéAPI's raw recursive structure.
- **Frontend state management**: React state (hooks/context) is sufficient per the doc ("React, or a library like Redux if preferred") — no requirement to introduce Redux; favorites and list data are the only cross-component state, which doesn't justify a state library on its own.
- **Favorite toggle UX**: optimistic update in the list/detail view, rolled back with an inline error if the backend call fails.
- **Filtering**: "favorites only" filter and (bonus) name search both operate client-side on the already-fetched 150-item list — no new backend endpoint needed for either, since the full list is small enough to hold in memory on the client.
- **Error handling contract between services**: backend responds with a consistent error envelope (status code + message) for both PokéAPI-proxy failures and favorites-storage failures, so the frontend has one error-handling code path rather than per-endpoint special cases.

## Testing Decisions

- Tests target **external behavior at each service's HTTP boundary**, not internal implementation details (no testing of internal function calls, no snapshotting of internal state shapes).
- **Backend seam**: integration tests that hit the running Express (or equivalent) app via `supertest`-style requests. The only thing mocked is the outbound call to the real PokéAPI (e.g. via `nock` or `msw`'s Node server) — routing, request handling, response shaping, and the favorites persistence layer all run for real (against a temp file/test storage location). Covers: list endpoint shape, detail endpoint flattening (including branching evolutions), add/remove/list favorites, idempotency of add/remove, and PokéAPI-failure translation into the error envelope.
- **Frontend seam**: React Testing Library tests that render the app and interact with it the way a user would (click, scroll, type), with only the backend HTTP layer mocked (via `msw`). Covers: list rendering and loading/error states, opening detail view and rendering abilities/types/evolutions, favoriting/unfavoriting and the resulting badge/highlight, the favorites-only filter, and (if built) the search feature.
- Two seams total — one per deployable unit — chosen over a single end-to-end seam because the two services deploy independently (per the doc's bonus deployment guidance of Vercel/Netlify + Render) and a full browser-driven e2e seam would require both services live for every test run, which is disproportionate for this scope.
- No prior art exists in this repo (greenfield project) — these seam choices follow standard practice for a proxy-backend + SPA-frontend split: HTTP-level tests against each service's public interface, with only the true external dependency (PokéAPI) mocked.

## Out of Scope

- User accounts, authentication, or per-user favorites lists.
- A real database (Postgres/Mongo/etc.) — file-based storage is explicitly sufficient per the source doc.
- Server-side rendering or SEO concerns for the frontend.
- Rate-limiting or caching layer in front of PokéAPI beyond basic error handling (not requested; can be a future enhancement).
- Full end-to-end/browser automation test suite (covered by the two HTTP-boundary seams instead; see Testing Decisions).
- Internationalization/localization.
- Mobile app / native clients — web only.

## Further Notes

- The requirement doc explicitly allows framework flexibility ("can use any framework relevant for this task") — Express is a reasonable default for the backend given no framework is mandated, but this PRD doesn't pin one; that's an implementation choice for whoever builds it.
- Bonus items (search, animations, lazy-loading/infinite scroll, deployment to Vercel/Netlify + Render) are included as user stories (26–28) but are explicitly lower priority than the core stories — the doc frames them as bonus points, not required scope.
- Since this is a take-home assessment (per the doc's "Submission" section), the README requirement (overview, local run instructions for both services, assumptions made) is itself a deliverable and should be treated as in-scope work, not optional documentation.
- This PRD was generated directly from `requirement.pdf` with no existing codebase to cross-reference (greenfield repo, no ADRs, no domain glossary yet) — implementation decisions above are the first domain-modeling pass for this project, not a synthesis of prior conventions.
