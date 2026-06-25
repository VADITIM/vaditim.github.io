# Portfolio — Architecture Guide

## What This Is

A Vue 3 + TypeScript + GSAP single-page portfolio that behaves like a game menu. Sections animate in and out like game screens; there is no visual scrollbar — the scroll wheel only signals intent. Sections are never unmounted (GSAP requires persistent DOM targets).

---

## Adding a New Section

Three steps, nothing else needs touching:

1. **Create the Vue component** in `src/components/Pages/Main/<Name> Section/a<Name>-Section.vue`

2. **Create an animation handler** in `src/modules/Sections/<Name> Section/<Name>-Animation-Handler.ts`
   ```typescript
   import { getSectionIndexById } from '../section-registry'
   import { onSectionEnterLeaveAnimation, type SectionTransitionMeta } from '../section-state-machine'
   
   export function register<Name>Animations() {
     const myIndex = getSectionIndexById('<name>')
     const isEnter = (meta: SectionTransitionMeta) => meta.isEnteringSection(myIndex)
     const isLeave = (meta: SectionTransitionMeta) => meta.isLeavingSection(myIndex)
     // register GSAP animations using onSectionEnterLeaveAnimation or onSectionStatesChange
   }
   ```

3. **Register in `src/modules/Sections/section-registry.ts`**:
   ```typescript
   { id: '<name>', label: '<LABEL>', component: <Name>Page, registerAnimations: register<Name>Animations }
   ```

The section automatically appears in the nav menu and renders in the correct position. The virtual scroll count, section tracking guards, and nav menu all derive from this array.

---

## Module Responsibilities

### `src/modules/Sections/section-registry.ts`
Single source of truth. Ordered array of `SectionDefinition`. Array index === section's numeric index. Import `SECTIONS` here, not from individual section files.

### `src/modules/Sections/sections.ts`
Runtime state: `currentSection`, `previousSection`, `ChangeSection()`, `ChangeToSectionID()`, `setSectionCount()`. Does not know section names — only indices.

### `src/modules/Sections/section-state-machine.ts`
Transition event system. Core exports:
- `buildTransitionMeta(current, prev, dir)` — returns `SectionTransitionMeta` with helper functions
- `onSectionStatesChange(cb)` — fires on every section change, passes meta
- `onSectionEnterLeaveAnimation(opts)` — convenience wrapper for enter/leave pairs
- `CreateSectionLayerStyleController()` — manages z-index/opacity for section layers

### `src/modules/Misc/virtual-scroll.ts`
Manages DOM body height and smooth wheel snapping. Drives scroll position only — does NOT call `ChangeSection`. Gets section count from `InitializeVirtualScroll(count, vh)` called in `App.vue`.

### `src/modules/animations/animation-handler.ts`
Entry point: `PageAnimations(sections)` loops the registry calling each section's `registerAnimations()`. Also exports `breakpoints` constants used by all animation handlers.

### `src/modules/Sections/section-backgrounds.ts`
Background-layer GSAP animations. Exported as `ScrollBackgroundSections()`. Called from `Section-Background-Display.vue`. Uses `getSectionIndexById` to resolve indices at runtime — does not hardcode them.

---

## SectionTransitionMeta API

Every `onSectionStatesChange` callback receives a `SectionTransitionMeta`:

```typescript
meta.current                    // current section index
meta.previous                   // previous section index
meta.direction                  // 'forward' | 'backward' | 'none'
meta.isEnteringSection(i)       // current === i && previous !== i
meta.isLeavingSection(i)        // previous === i && current !== i
meta.isFromSection(i)           // previous === i
meta.isToSection(i)             // current === i
meta.isSkippingSection(i)       // section i is between previous and current but neither
```

**Never** use hardcoded index literals (`0`, `1`, `2`) in animation handlers. Always call `getSectionIndexById('id')` to resolve the index, so swapping section order in the registry automatically updates all animations.

---

## Layer Visibility Rules

`CreateSectionLayerStyleController` manages stacking:
- **Active section**: `z-index: 2, opacity: 1, pointerEvents: auto`
- **Lingering section** (within `lingerMs` after leaving): `z-index: 1, opacity: 1 → 0`
- **Inactive section**: `z-index: -100, opacity: 0, pointerEvents: none`

Sections are never unmounted. The `-100` z-index fully removes them from the stacking context without touching the DOM.

---

## GSAP Rules

- Never animate components that can be `v-if`'d out of the DOM — keep sections always mounted
- Always use `overwrite: 'auto'` when enter/leave animations can race
- Always return the cleanup function from `gsap.matchMedia().add()` callbacks
- Set initial GSAP state (`gsap.set(...)`) inside the `matchMedia` callback so it re-runs on breakpoint change
- `gsap.defaults({ immediateRender: false })` is set globally; don't override it

---

## Breakpoints

Defined in `src/modules/animations/animation-handler.ts` as `breakpoints`:

```typescript
{ mobile: 360, tablet: 768, tabletLandscape: 1024, smallDesktop: 1200, midDesktop: 1550, desktop: 1825 }
```

The primary split is **mobile `< 1200px`** vs **desktop `>= 1200px`** (`breakpoints.smallDesktop`). The intermediate values exist for fine-tuning animation positions but represent layout variants, not full layout changes.

Mobile layout is fundamentally different from desktop — separate templates in `App.vue` handle this.

---

## Responsive Sizing

- Use `vh`/`vw` units and `clamp()` for sizes that should scale proportionally
- Avoid hardcoded `px` values for positioning elements that need to stay aligned across viewport sizes
- CSS custom properties (`--card-size`, `--cards-container-size`) are defined in `variables.scss` and overridden at the mobile breakpoint
- Profile cards use percentage-based positioning via the GSAP animation handler (`Profile-Animation-Handler.ts`) — not CSS position

---

## Path Aliases (vite.config.ts)

```
@styleVariables  →  src/style/variables.scss
@components      →  src/components
@modules         →  src/modules
@sections        →  src/components/Sections
@perks           →  src/components/Pages/Main/Perks Section
@profile         →  src/components/Pages/Main/Profile Section
@projects        →  src/components/Pages/Main/Projects Section
```
