---
title: Project scaffolding & test tooling
labels: [ready-for-agent]
status: done
---

## What to build

Prefactor step — no user-visible behavior, but it makes every later slice an "easy change." Set up the two-service repo layout described in `PRD.md`:

- `backend/` — a Node.js service skeleton with a health-check route, an HTTP client wrapper for calling the PokéAPI, and a persistence module stub (file-based JSON) behind a small read/write interface.
- `frontend/` — a React app skeleton (routing not required — this is effectively a single view with a detail panel/modal) with an HTTP client wrapper for calling the backend.
- Test tooling for both HTTP-boundary seams defined in `PRD.md`'s Testing Decisions:
  - Backend: an integration test harness that boots the Express (or equivalent) app and issues requests via `supertest` (or equivalent), with the outbound PokéAPI call mockable per-test (`nock`/`msw` Node server).
  - Frontend: React Testing Library configured with `msw` to mock the backend HTTP layer.
- Dev scripts to run each service locally (documented later in the README slice), plus a root-level script or doc note on running both together.

## Acceptance criteria

- [ ] `backend/` starts locally and responds on a health-check route.
- [ ] `frontend/` starts locally and renders a placeholder page.
- [ ] A trivial backend integration test passes, demonstrating the supertest + mocked-PokéAPI harness works end-to-end.
- [ ] A trivial frontend RTL test passes, demonstrating the msw-mocked-backend harness works end-to-end.
- [ ] Persistence module stub exposes a read/write interface (not yet wired to real favorites data).

## Blocked by

None — can start immediately.
