---
paths:
  - "src/modules/**"
  - "src/components/**"
  - "src/App.vue"
---

# Animation & GSAP Rules

## GSAP Rules

- **Every section component and animation module must define BOTH an enter and a leave animation, and every element animated on enter must also be animated on leave (and vice-versa).** A reveal without a matching exit strands content on screen during the transition and breaks the game-menu feel. When adding a new animated element, register it in both the enter (`playReveal`) and leave (`playLeave`) paths.
- Never animate components that can be `v-if`'d out of the DOM — sections stay always mounted.
- Always use `overwrite: 'auto'` when enter/leave animations can race.
- Always return the cleanup function from `gsap.matchMedia().add()` callbacks.
- Set initial GSAP state (`gsap.set(...)`) inside the `matchMedia` callback so it re-runs on breakpoint change.
- `gsap.defaults({ immediateRender: false })` is set globally; don't override it.

## Animation Style Guide

`sectionCoverSlices.ts` is the canonical reference for enter/leave motion system-wide.

### Timing constants

| Constant | Value | Purpose |
|---|---|---|
| `ENTER_DELAY` | `0.5s` | Wait after a section becomes active before content animates in |
| Enter duration | `0.35–0.6s` (UI), `0.45–0.95s` (backgrounds) | Content arrives faster than it leaves |
| Leave duration | `0.21–0.5s` | Leave is always noticeably shorter than enter |
| Multi-layer offset | `0.1s` | Stagger between back/front layers of the same element group |

### Easing

- **Enter:** `back.out` for prominent/large elements (overshoot lands with snap); `power2.out` for most UI.
- **Leave:** `back.in` for backgrounds/large layers; `power2.in` or `power2.inOut` for UI content.
- **Drifting/floating elements:** `power4.inOut` for position, `power2.in` for opacity.

### Enter vs leave asymmetry (never reverse)

1. **Leave fires immediately at time `0`** — no delay, fast ease-in.
2. **Enter fires at `ENTER_DELAY` (0.5s)** — content waits for the outgoing section to clear.

### Timelines & stagger

- Use **absolute time positions** (`tl.to(el, {...}, 0.55)`), not `>` sequential chaining — precise overlap control, predictable when interrupted.
- Stagger absolute start times manually (`0.55`, `0.60`, `0.65`) rather than relying on `stagger:` alone.
- Use `gsap.timeline()` whenever two properties on one element need different easing (both tweens at position `0`).
- `stagger: 0.03–0.12` between sibling UI elements; `stagger: { each: 0.15–0.2, from: 'random' }` for 3+ ambient/decorative elements.
- Stagger direction matches travel direction: elements further from the viewport edge arrive later.

### Off-screen start positions

- Desktop backgrounds enter from **left or right** (the section's side of the screen).
- Mobile backgrounds enter from **bottom** (`top: 100%`) and exit upward.
- Perks/logs content enters from **left**; Projects content from **right/bottom**.
- Floating/ambient elements enter from **below** with a larger offset than interactive elements.

### What not to do

- No `ease: 'linear'` for enter/leave transitions.
- No `delay` on leave animations — exits are instant.
- No `>` sequential chaining in section-transition timelines.
- No `px` offsets where the layout uses `%` — match units so hidden positions stay consistent across viewports.

### Intentional exceptions

- **Logs cards:** `power2.out` without `back.out` (overshoot reads as jitter at that scale); rapid-pass-through detection skips animations on fast navigation.
- **Loading section notes:** `power4.inOut` + `power2.in` split-property easing for drifting momentum.
- **Projects container enter:** `1.6s power4.inOut` slide — intentionally slow and dramatic.

## Label Reveal Pattern (system-wide default for text)

Every text element (headings, labels, captions, static copy) must use this reveal unless explicitly told otherwise. Plain fades/slides for text are the exception.

**Structure:** `.pc-label > .pc-label-inner > (.pc-label-text, .pc-label-bar)`.
- `.pc-label-text` starts hidden via `clip-path: inset(0 100% 0 0)`.
- `.pc-label-bar` is a solid glowing bar the same size as the text, at `scaleX(0)`, `transform-origin: left center`.

**Reveal sequence** (one timeline per label):
1. Bar grows left→right (`scaleX 0→1`, `power3.inOut`, ~0.42s).
2. The instant it's full, the text's clip-path is set to fully revealed *under* the opaque bar.
3. `transform-origin` flips to `right center`; bar shrinks back to `scaleX(0)` (`power3.inOut`, ~0.5s), uncovering the text.
4. Bar opacity → `0` once collapsed.

**Positional stagger — top-left first, bottom-right last:** each label's start delay is a single scalar derived from its distance from the top-left corner (combine `top%` and effective `left%`). Two labels at equal height but different `x` are never simultaneous — the more left one fires first. Never the reverse order, never perfectly synced across different positions. On leave, labels re-collapse **without** the positional stagger (leave is instant per the asymmetry rule).

## Lite Mode (hardware acceleration off)

`miscAnimationMode.ts` owns the visitor's choice (`animationMode`, `isLiteMode`), made in the hardware-acceleration notice ("DONE!" vs "CONTINUE WITHOUT.") and changeable later in `Settings-Panel.vue`. It persists to `localStorage['animation-mode']` and is read as handlers register — changing it reloads the page rather than switching live.

- **`animationLiteFallback.ts` is the single definition of lite motion.** Components choose *which* elements fall back; the module decides how they move. Never write a lite-only duration, ease or delay anywhere else.
- **The substitute pair** is `playLiteEnter` / `playLiteLeave`: `opacity` + `y: 18` only (no `scale`, `force3D: false` — an extra composited layer costs rather than saves without acceleration), `power2.out` at `SECTION_ENTER_DELAY`, and its exact reverse `power2.in` at `0`. Every generic element falls back to it.
- **Leave finishes before the next section's enter starts.** `LITE_ENTER_GATE` (exported from `animationLiteFallback.ts`, consumed by `activateSectionEnterGate`) is the lite leave duration plus a gap, so the two sections never animate against each other.
- **Labels have no lite branch to write** — `hideLabels` / `playLabelReveals` / `playLabelLeave` in `miscLabelReveal.ts` route to the lite pair themselves. The bar sweep (clip-path + scaling bar) and its positional stagger are dropped: the stagger trailed ~2.4s behind the swap and the clip-path was the priciest paint on the page. `buildLabelReveal` is untouched (loading page).
- **Registering a new animated element means registering it in the lite path too.** A missing lite branch strands content exactly like a missing leave animation.
- **Unique animations stay**, simplified: the Perks crystal, the Perks name typewriter, Projects info modules and heading reveals, Pong, the heatmap, the Sandbox zero-g window, the Logs cubes. What goes is the ambience around them.
- **Dropped in lite:** `Section-Transition.vue` (the shutter/label overlay), `Magnetic-Dots`, the Projects helix canvas, floating drift (`animationFloatingElements`), the Logs idle bob and per-face cube build, the Sandbox title physics and tilt parallax, the Projects card tilt, the Classified per-word glitch, and the `.module-hue` pointer glow. CSS-side, `html.is-lite-mode` (in `style.scss`) kills `backdrop-filter`, `box-shadow`, `text-shadow` and `will-change`.
- **Section slices stay** — every section still needs its background (see below).
- **`SECTION_ENTER_DELAY` drops to `LITE_ENTER_GATE` (0.36s)** in lite, because there is no curtain to wait out; only the slices cover the swap.
- **The loading page is untouched** — `Start-Section.vue` / `Start-Transition.vue` run in full regardless of mode.

## Breakpoints

Defined in the animation handler as `breakpoints`:

```typescript
{ mobile: 360, tablet: 768, tabletLandscape: 1024, smallDesktop: 1200, midDesktop: 1550, desktop: 1825 }
```

Primary split: **mobile `< 1200px`** vs **desktop `>= 1200px`** (`breakpoints.smallDesktop`). Intermediate values fine-tune animation positions (layout variants, not full layout changes). Mobile has separate templates in `App.vue`. **Mobile development is paused until desktop is finished** — treat `< 1200px` paths as frozen unless explicitly asked.

## Section Backgrounds (required per section)

Every section **must** have a slice background — the slanted `clip-path` polygon layer that enters/leaves with the section. They live in `Section-Cover-Slice.vue` (one `<div>` per section, e.g. `.logs-back`/`-front`) and are animated by `sectionCoverSlices.ts`. A section without one reads as unfinished.

## Responsive Sizing

- Use `vh`/`vw` and `clamp()` for proportional sizes; avoid hardcoded `px` for alignment-critical positioning.
- CSS custom properties (`--card-size`, `--cards-container-size`) are defined in `variables.scss` and overridden at the mobile breakpoint.
- Logs cards use percentage-based positioning via their GSAP handler, not CSS position.
