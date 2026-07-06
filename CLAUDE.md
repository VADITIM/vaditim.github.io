# Portfolio

A Vue 3 + TypeScript + GSAP single-page portfolio that behaves like a game menu. Sections animate in/out like game screens; no visual scrollbar — the scroll wheel only signals intent. Sections are never unmounted (GSAP needs persistent DOM targets).

## Commands

- `npm run dev` — Vite dev server (port 5173, listens on LAN)
- `npm run build` — builds to `docs/` (NOT documentation — it's the gh-pages output)
- `npm run typecheck` — vue-tsc against `tsconfig.app.json` (a bare `vue-tsc --noEmit` checks nothing — the root tsconfig is solution-style)
- `npm run deploy` — build + publish `docs/` to gh-pages

## Key Decisions

- Section indices are never hardcoded — always resolve via `getSectionIndexById('id')` from the section registry (single source of truth).
- Every enter animation must have a matching leave animation, and vice-versa. See `.claude/rules/animations.md`.
- Mobile development is paused until the desktop version is finished. Treat `< 1200px` code paths as frozen; focus unprompted work on desktop.
- Docs follow code: when a change renames/moves modules or alters conventions documented in CLAUDE.md or `.claude/rules/`, update those docs in the same task.

## Git

- Branches: `dev` (all work + Claude files), `main` (clean `src/` + README only, no Claude files), `gh-pages` (build output only).
- NEVER add `Co-Authored-By: Claude` or any assistant trailer to commits. Author is solely VADITIM.

## Don'ts

- Never run a preview eval (`npm run preview`).
- Never edit `docs/` by hand — it's generated build output.
- Task backlog and known issues live in `TASKS.md`, not here.

## Output style

Output less text; compact everything at the end.
