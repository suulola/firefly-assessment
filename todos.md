# TODO Review

## Implemented

- Cleaned up `App.tsx` by moving favorite state/mutations into `src/hooks/useFavorites.ts`.
- Added frontend service modules under `src/services/`, including `healthService.ts` for `getBackendHealth`.
- Added backend response helpers:
  - `successResponse`
  - `errorResponse`
  - `catchErrorResponse`
- Standardized backend responses to `{ success: boolean, data: T | null, message: string }`.
- Added frontend API response unwrapping in `src/services/apiResponse.ts`.
- Switched source imports to the `@/` alias where appropriate.
- Added design tokens as CSS custom properties in `src/index.scss` (migrated from `.css` to Sass Modules across the frontend).
- Trimmed and corrected `CLAUDE.md`.
- Added `sonner` toast notifications for favorite save/remove failures and successes.
- Changed Pokémon list loading to fetch backend pages as the user scrolls instead of fetching all 150 up front.
- Adopted TanStack Query for API state:
  - `useInfiniteQuery` for paginated Pokémon loading.
  - `useQuery` for detail and favorites reads.
  - `useMutation` for optimistic favorite add/remove updates.
- Extracted `usePokemonListView` (filtering/search/favorites-only + fetch-more decision) out of `PokemonList.tsx`, and `useProgressiveSearchFetch` out of that hook, so the fetch-coordination logic is unit-testable via `renderHook` instead of only through scroll-event simulation.
- Replaced `useFavorites`'s hand-rolled pending-state refs (`pendingIdsRef`, `wasFavoritedByIdRef`) with reads from TanStack Query's own mutation cache (`useMutationState`, `getMutationCache().find()`, `isMutating()`).
- Added a responsive single-pane mobile layout (list ↔ detail, with a back control) below a 767px breakpoint.
- Added `src/lib/observability.ts` (`reportError`/`reportQueryError`/`reportMutationError`, swappable sink) and wired it into `ErrorBoundary`, `useFavorites`'s mutation `onError`, schema-validation failures, and `queryClient.ts`'s global `QueryCache`/`MutationCache` `onError`.
- Added Zod schema validation of API response payloads (`src/services/schemas.ts`, `parsePayload()`) on top of the existing envelope validation in `apiResponse.ts`.
- Virtualized `PokemonList`'s row list with `@tanstack/react-virtual`; removed the old client-side `visibleCount` batching it superseded.
- Hardened `queryClient.ts` defaults: network-failure-only retry (`TypeError`, capped at 2 attempts), explicit `staleTime`/`gcTime`/`refetchOnWindowFocus`/`refetchOnReconnect`, `mutations.retry: false`.
- Accessibility pass: `aria-current` for the selected list item, `aria-busy` on pending favorite buttons, autofocused retry button in `ErrorFallback`, a live-region result-count announcement while searching/filtering.
- Reassessed the Suspense decision (still not adopted — see `CLAUDE.md`).
- Hardened backend architecture:
  - Added centralized config (`src/config.ts`) with fail-fast numeric env validation.
  - Added request ids, structured request/error logging, typed HTTP errors, central error middleware, and route-edge validation.
  - Added `helmet` and a 16kb JSON body limit while preserving existing CORS behavior.
  - Added PokéAPI timeout/abort handling, upstream response validation, and bounded in-memory TTL caching.
  - Added file-store parent directory creation, JSON validation, and per-store serialized favorite mutations.
  - Changed file-store writes to temp-file-plus-rename to avoid partially-written JSON.
  - Added `/health/ready` readiness checks and graceful shutdown in `server.ts`.
  - Added envelope-based 404 responses for unknown routes.
  - Added backend ESLint via `npm run lint`.
  - Added `express-rate-limit`, returning the standard API envelope for `429` responses.
  - Added an OpenAPI contract at `/openapi.json` and Swagger UI at `/docs`.

## Deferred

- API versioning remains documented-only; deployed routes stay `/pokemon`, `/favorites`, and `/health`.
- File-backed favorites storage remains assessment-scope; no database migration.
- No authentication, metrics endpoint, APM/distributed tracing, or multi-instance-safe favorites persistence yet.
