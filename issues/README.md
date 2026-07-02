# Issues

Local issue tracker for this repo — no GitHub tracker set up yet. Each file is a self-contained vertical-slice issue derived from `../PRD.md` (itself derived from `../requirement.pdf`). If/when this moves to GitHub, each file's frontmatter `title` and body map directly to `gh issue create --title ... --body-file ...` / `--label ready-for-agent`.

| # | Title | Blocked by |
|---|-------|------------|
| [001](001-project-scaffolding.md) | Project scaffolding & test tooling | none |
| [002](002-pokemon-list.md) | Pokémon list, end-to-end | 001 |
| [003](003-pokemon-detail.md) | Pokémon detail, end-to-end | 002 |
| [004](004-favorites-add-remove.md) | Favorites add/remove, end-to-end | 002 |
| [005](005-favorites-filter-persistence.md) | Favorites filter & reload persistence, end-to-end | 004 |
| [006](006-frontend-polish.md) | Frontend polish — search, lazy-loading, animations (bonus) | 002, 003, 004 |
| [007](007-accessibility-pass.md) | Accessibility pass | 002, 003, 004, 005 |
| [008](008-deployment.md) | Deployment (bonus) | 002, 003, 004, 005 |
| [009](009-readme-submission-polish.md) | README & submission polish | 002, 003, 004, 005 |

Suggested build order: 001 → 002 → 003 & 004 (parallel-able) → 005 → 006 / 007 / 008 (parallel-able, all bonus/polish) → 009 last.
