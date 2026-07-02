# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Shape

This is a full-stack Pokémon Explorer take-home assessment.

- `backend/`: Node.js, Express, TypeScript. The backend is the only caller of PokéAPI.
- `frontend/`: React, Vite, TypeScript. The frontend talks only to the backend.
- `PRD.md` and `issues/` contain the implementation spec and issue breakdown.

There is no root package manager workspace. Run commands from the service folder.

## Commands

Backend:

```bash
cd backend
npm run dev
npm test
npm run build
```

Frontend:

```bash
cd frontend
npm run dev
npm test
npm run lint
npm run build
```

## Backend Conventions

Code is organized by domain module:

- `route.ts`: HTTP request/response concerns only.
- `service.ts`: business logic.
- `repository.ts`: I/O boundary, such as PokéAPI or file persistence.

Current modules:

- `health`: liveness and PokéAPI reachability checks.
- `pokemon`: list/detail/evolution data from PokéAPI.
- `favorites`: file-backed favorite Pokémon ids.

Use `src/http/response.ts` for all backend route responses:

```ts
successResponse(res, data, message);
errorResponse(res, statusCode, message);
catchErrorResponse(res, message);
```

API responses should consistently follow:

```json
{ "success": true, "data": {}, "message": "OK" }
```

Errors use:

```json
{ "success": false, "data": null, "message": "Failure reason." }
```

## Frontend Conventions

- Use `@/` imports for source files instead of deep relative imports.
- Backend HTTP calls live in `src/services/`.
- `src/services/apiResponse.ts` unwraps the backend response envelope.
- TanStack Query owns API state, caching, infinite pagination, and optimistic favorite mutations.
- Shared design values live as CSS custom properties in `src/index.css`.
- Keep components focused on rendering and interaction. Move reusable data access or side-effect code into services/hooks.

## Testing

Backend tests use Supertest against the exported Express app and MSW for outbound PokéAPI calls.

Frontend tests use React Testing Library and MSW for backend HTTP calls.

Do not hit the real PokéAPI in tests.
