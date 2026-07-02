---
title: README & submission polish
labels: [ready-for-agent]
status: open
---

## What to build

The README is itself a required deliverable per the source requirement doc's Submission section, not optional documentation. Write a root `README.md` covering:

- A brief overview of the approach (two-service architecture, backend-as-PokéAPI-proxy, file-based favorites persistence).
- Instructions to run both the frontend and backend locally (from issue 001's dev scripts).
- Additional features or assumptions made — explicitly including the detail-endpoint addition called out in `PRD.md` (a fifth backend endpoint beyond the four the source doc literally lists), and the single-shared-favorites-list assumption (no per-user accounts).
- Live links, if issue 008 (deployment) was completed.

## Acceptance criteria

- [ ] README includes a brief approach overview.
- [ ] README includes step-by-step local run instructions for both `backend/` and `frontend/`, verified by actually following them from a clean checkout.
- [ ] README documents assumptions made, including the detail-endpoint addition and the single-shared-favorites-list decision.
- [ ] README includes live links if issue 008 shipped, or explicitly notes deployment was skipped if not.

## Blocked by

- 002 — Pokémon list, end-to-end
- 003 — Pokémon detail, end-to-end
- 004 — favorites add/remove, end-to-end
- 005 — favorites filter & reload persistence
