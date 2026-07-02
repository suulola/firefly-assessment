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
- Added design tokens as CSS custom properties in `src/index.css`.
- Trimmed and corrected `CLAUDE.md`.
- Added `sonner` toast notifications for favorite save/remove failures and successes.
- Changed Pokémon list loading to fetch backend pages as the user scrolls instead of fetching all 150 up front.
- Adopted TanStack Query for API state:
  - `useInfiniteQuery` for paginated Pokémon loading.
  - `useQuery` for detail and favorites reads.
  - `useMutation` for optimistic favorite add/remove updates.


