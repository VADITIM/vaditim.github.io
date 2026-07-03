---
paths:
  - "src/**"
---

# Architecture

## Adding a New Section

Three steps, nothing else needs touching:

1. **Create the Vue component** in `src/components/Main/<Name> Section/<Name>-Section.vue`
2. **Create an animation handler** module:
   ```typescript
   import { getSectionIndexById } from './sectionLookup'
   import { onSectionEnterLeaveAnimation, type SectionTransitionMeta } from './sectionsStateMachine'

   export function register<Name>Animations() {
     const myIndex = getSectionIndexById('<name>')
     const isEnter = (meta: SectionTransitionMeta) => meta.isEnteringSection(myIndex)
     const isLeave = (meta: SectionTransitionMeta) => meta.isLeavingSection(myIndex)
     // register GSAP animations via onSectionEnterLeaveAnimation or onSectionStatesChange
   }
   ```
3. **Register in the section registry** (`sectionsRegistry.ts`) and add the id to `SECTION_IDS` in `sectionLookup.ts`:
   ```typescript
   { id: '<name>', label: '<LABEL>', color: '#xxxxxx', component: <Name>Page, registerAnimations: register<Name>Animations }
   ```

The section then automatically appears in the nav menu and renders in position. Virtual scroll count, tracking guards, and the nav menu all derive from the registry array.

Every section **must** also get a slice background (see the Section Backgrounds rule in `animations.md`).

## Module Responsibilities

- **Section registry** (`sectionsRegistry.ts`): single source of truth — ordered array of `SectionDefinition`; array index === section index. Import `SECTIONS` from here only.
- **Section lookup** (`sectionLookup.ts`): `getSectionIndexById(id)` with no component imports — import it from here inside Vue components to avoid the registry→component→registry circular dependency. Its `SECTION_IDS` array must stay in sync with `SECTIONS` order.
- **`sectionsCore.ts`**: runtime state — `currentSection`, `previousSection`, `ChangeSection()`, `ChangeToSectionID()`, `setSectionCount()`. Knows indices, not names.
- **Section state machine** (`sectionsStateMachine.ts`): transition events — `buildTransitionMeta(current, prev, dir)`, `onSectionStatesChange(cb)`, `onSectionEnterLeaveAnimation(opts)`, `CreateSectionLayerStyleController()`.
- **Virtual scroll** (`miscVirtualScroll.ts`): DOM body height + smooth wheel snapping. Drives scroll position only — does NOT call `ChangeSection`. Initialized from `App.vue` via `InitializeVirtualScroll(count, vh)`.
- **Animation handler entry** (`animationHandler.ts`): `PageAnimations(sections)` loops the registry calling each `registerAnimations()`; exports the shared `breakpoints` constants.
- **`sectionCoverSlices.ts`**: background-layer GSAP animations (`ScrollBackgroundSections()`), called from `Section-Cover-Slice.vue`; resolves indices at runtime via `getSectionIndexById`.

## SectionTransitionMeta API

```typescript
meta.current                // current section index
meta.previous               // previous section index
meta.direction              // 'forward' | 'backward' | 'none'
meta.isEnteringSection(i)   // current === i && previous !== i
meta.isLeavingSection(i)    // previous === i && current !== i
meta.isFromSection(i)       // previous === i
meta.isToSection(i)         // current === i
meta.isSkippingSection(i)   // i lies between previous and current but is neither
```

**Never** hardcode index literals in animation handlers — always `getSectionIndexById('id')`, so reordering the registry updates all animations automatically.

## Layer Visibility Rules

`CreateSectionLayerStyleController` manages stacking:
- Active: `z-index: 2, opacity: 1, pointerEvents: auto`
- Lingering (within `lingerMs` after leave): `z-index: 1, opacity: 1 → 0`
- Inactive: `z-index: -100, opacity: 0, pointerEvents: none`

Sections are never unmounted; `-100` removes them from the stacking context without touching the DOM.

## Path Aliases (vite.config.ts)

```
@styleVariables → src/style/variables.scss
@components     → src/components
@modules        → src/modules
@assets         → src/assets
@sections       → src/components/Main
@perks          → src/components/Main/Perks Section
@logs           → src/components/Main/Logs Section
@projects       → src/components/Main/Projects Section
```

## Naming & File Conventions

- **Vue components — `Vue-File`:** PascalCase words separated by hyphens (`Label-Set.vue`, `Section-Cover-Slice.vue`). No `a` prefixes; no redundant section-name prefixes on components that don't use that section's API.
- **TypeScript modules — `typescriptFile`:** camelCase (`sectionsRegistry.ts`). Name describes what the module does, not its folder.
- **SCSS — `scss-file`:** kebab-case (`variables.scss`).
- **Styles live in the component:** component-specific SCSS goes in that component's `<style>` block; standalone `.scss` files only for genuinely shared variables/mixins/extends.
- **Folder shape (target):** sections live flat in `components/Main/` (one file per section plus sub-components); non-sections belong in `components/`; `modules/` is flat, no per-section subfolders.
