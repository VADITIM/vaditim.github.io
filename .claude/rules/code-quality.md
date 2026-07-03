# Code Quality

## Anti-defaults (counter common Claude tendencies)

- No premature abstractions. Three similar lines beats a helper used once.
- Don't add features or improvements beyond what was asked.
- Don't refactor adjacent code while fixing a bug.
- No dead code or commented-out blocks. Git has history.
- WHY comments, never WHAT. If code needs a "what" comment, rename instead.
- API docs at module boundaries only, not every internal function.

## Naming

- Files: `Vue-File` convention for components (PascalCase words separated by hyphens: `Label-Set.vue`), camelCase for TypeScript modules (`sectionsRegistry.ts`), kebab-case for SCSS (`variables.scss`). See `.claude/rules/architecture.md`.
- Booleans: `is` / `has` / `should` / `can` prefix. Functions: verb-first (`getUser`). Handlers: `handle*` internal, `on*` as props.
- Factories: `create*`. Converters: `to*`. Predicates: `is*` / `has*`. Constants: `SCREAMING_SNAKE`.
- Abbreviations only when universally known (`id`, `url`, `api`, `db`, `auth`). Acronyms as words: `userId`, not `userID`.

## Code Markers

`TODO(author): desc` for planned work. `FIXME(author): desc` for known bugs. `HACK(author): desc` for ugly workarounds (explain the proper fix). `NOTE: desc` for non-obvious context. Never `XXX`, `TEMP`, `REMOVEME`.

## File Organization

- Imports: builtins, external, internal, relative, types. Blank line between groups.
- Exports: named over default. One component or class per file.
- Function order: public API first, then helpers in call order.
