# Portfolio — Architecture Guide

## What This Is

A Vue 3 + TypeScript + GSAP single-page portfolio that behaves like a game menu. Sections animate in and out like game screens; there is no visual scrollbar — the scroll wheel only signals intent. Sections are never unmounted (GSAP requires persistent DOM targets).

---

## Adding a New Section

Three steps, nothing else needs touching:

1. **Create the Vue component** in `src/components/Sections/Main/<Name> Section/a<Name>-Section.vue`

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

- **Every section component and animation module must define BOTH an enter and a leave animation, and every element animated on enter must also be animated on leave (and vice-versa).** A reveal without a matching exit — or an element that animates in but never out — is a bug: it strands content on screen during the transition and breaks the game-menu feel. When you add a new animated element, register it in both the enter (`playReveal`) and leave (`playLeave`) paths.
- Never animate components that can be `v-if`'d out of the DOM — keep sections always mounted
- Always use `overwrite: 'auto'` when enter/leave animations can race
- Always return the cleanup function from `gsap.matchMedia().add()` callbacks
- Set initial GSAP state (`gsap.set(...)`) inside the `matchMedia` callback so it re-runs on breakpoint change
- `gsap.defaults({ immediateRender: false })` is set globally; don't override it

---

## Animation Style Guide

These rules preserve the timing and feel established by `section-backgrounds.ts`, which is the canonical reference for enter/leave motion across the whole system.

### Timing constants

| Constant | Value | Purpose |
|---|---|---|
| `ENTER_DELAY` | `0.5s` | How long content waits after its section becomes active before animating in |
| Enter duration | `0.35–0.6s` (UI), `0.45–0.95s` (backgrounds) | Content arrives faster than it leaves |
| Leave duration | `0.21–0.5s` | Leave is always noticeably shorter than enter — snappier exit |
| Multi-layer offset | `0.1s` | Stagger between back and front layers of the same element group |

### Easing

- **Enter ease:** `back.out` for prominent / large elements (slight overshoot lands with snap), `power2.out` for most UI elements (smooth decelerate into place)
- **Leave ease:** `back.in` for backgrounds and large layers, `power2.in` or `power2.inOut` for UI content
- **Drifting / floating elements** (e.g. loading notes): `power4.inOut` for position (accelerates then decelerates), `power2.in` for opacity (fades in gradually as the element gathers speed)

### Enter vs leave asymmetry

Every section transition follows the same contract:
1. **Leave fires immediately at time `0`** — no delay, fast ease-in
2. **Enter fires at `ENTER_DELAY` (0.5s)** — content waits for the outgoing section to clear

Never reverse this order. Entering content that appears before the previous section has moved away breaks the game-menu feel.

### Timelines

- Use **absolute time positions** (`tl.to(el, {...}, 0.55)`) not sequential `>` chaining — this lets you control overlap precisely
- When animating a set of elements staggered by position or layer, stagger the absolute start time manually (e.g. `0.55`, `0.60`, `0.65`) rather than relying on `stagger:` alone — it gives finer control
- Use `gsap.timeline()` any time two or more properties on the same element need different easing curves (put both tweens at position `0`)

### Stagger

- `stagger: 0.03–0.12` between sibling UI elements
- Use `stagger: { each: 0.15–0.2, from: 'random' }` for sets of 3+ ambient / decorative elements (loading notes, floating icons) — gives an organic, non-mechanical feel
- Stagger direction should match the travel direction: elements further from the viewport edge arrive slightly later

### Off-screen start positions

Elements always start off-screen in the direction they logically come from:
- Desktop backgrounds enter from **left or right** (matching the section's side of the screen)
- Mobile backgrounds enter from **bottom** (`top: 100%`) and exit upward
- Perks / profile content enters from **left** (slides in from off-screen-left)
- Projects content enters from **right/bottom**
- Floating / ambient elements (notes, decorative text) enter from **below** with a larger offset than interactive elements

### What not to do

- Do not use `ease: 'linear'` for enter/leave transitions — it reads as mechanical
- Do not set `delay` on leave animations — exits must be instant
- Do not use `>` sequential chaining in section-transition timelines — it makes timing unpredictable when animations are interrupted
- Do not hardcode offsets in `px` when the layout uses `%` — use matching units so the hidden position stays consistent across viewport sizes

### Exceptions (intentional divergence from the above)

- **Profile cards** (front + back): use `power2.out` without `back.out` because the cards are physically large and the overshoot reads as jitter at that scale; they also use rapid-pass-through detection to skip animations when the user navigates through profile quickly
- **Loading section notes**: use `power4.inOut` + `power2.in` split-property easing to simulate drifting momentum — the notes are ambient decoration, not navigation feedback, so they follow a different rhythm
- **Projects container** enter: uses a `1.6s power4.inOut` slide — intentionally slow and dramatic as the section's visual centrepiece

---

## Label Reveal Pattern (system-wide)

Any set of static corner/edge labels (first introduced in `Profile-Cubes.vue`) uses
this reveal, and it should be reused as-is for future sections rather than
reinvented per-component.

**Structure**: each label is `.pc-label > .pc-label-inner > (.pc-label-text, .pc-label-bar)`.
- `.pc-label-text` starts fully hidden via `clip-path: inset(0 100% 0 0)` (clipped from the right).
- `.pc-label-bar` is a solid, glowing (`box-shadow`) bar the same size as the text, starting at `scaleX(0)` with `transform-origin: left center`.

**Reveal sequence** (one GSAP timeline per label):
1. Bar grows left→right (`scaleX(0)` → `scaleX(1)`, `power3.inOut`, ~0.42s) — it visually "covers" the text as it grows, since text is invisible until step 2.
2. The instant the bar has fully grown, the text's clip-path is set to `inset(0 0% 0 0)` (fully revealed) *underneath* the now-opaque bar — the swap is invisible because the bar is on top.
3. `transform-origin` flips to `right center`, and the bar shrinks back to `scaleX(0)` (`power3.inOut`, ~0.5s) — it "uncovers" the text as it recedes, exiting to the right.
4. Bar opacity is set to `0` once fully collapsed.

The net effect: a bar sweeps across each label, and the text is left behind once the bar has passed — never a plain fade or slide.

**Positional stagger — top-left first, bottom-right last**: labels do not all fire at the same delay. Each label's start delay is derived from its screen position:
- Vertical position (`top` as a fraction of viewport height, 0 = top, ~1 = bottom) sets the primary delay offset — lower labels start later.
- Horizontal position works the same way on the same row: two labels at equal height but different `x` are **not simultaneous** — the more left-aligned one starts (and therefore finishes) first, the more right-aligned one starts later. The rule generalizes to “distance from the top-left corner”: compute a combined offset from both the label's `top%` and `left%` (treating `right`-anchored labels by their effective left position), and use that single scalar as the delay multiplier. Top-left labels are always the fastest/first to animate; bottom-right labels are always the slowest/last — never the reverse, and never perfectly synced across different (x, y) positions.
- On leave, labels re-collapse **without** re-running the positional stagger — leave is instant per the enter/leave asymmetry rule above (no `delay`, snappier duration).

**Default requirement**: every text element (headings, labels, captions, static copy) must use this Label Reveal API unless explicitly told otherwise for that element. Plain fades/slides for text are the exception, not the default.

---

## Breakpoints

Defined in `src/modules/animations/animation-handler.ts` as `breakpoints`:

```typescript
{ mobile: 360, tablet: 768, tabletLandscape: 1024, smallDesktop: 1200, midDesktop: 1550, desktop: 1825 }
```

The primary split is **mobile `< 1200px`** vs **desktop `>= 1200px`** (`breakpoints.smallDesktop`). The intermediate values exist for fine-tuning animation positions but represent layout variants, not full layout changes.

Mobile layout is fundamentally different from desktop — separate templates in `App.vue` handle this.

---

## Section Backgrounds (required per section)

Every section **must** have a **slice background** — the slanted, `clip-path`
polygon coloured layer that enters/leaves with the section. These live in
`Section-Background-Display.vue` (one `<div>` per section, e.g.
`.profile-section-background-back` / `-front`) and are animated by
`section-backgrounds.ts`. The diagonal slice is the signature look of the whole
menu; a section without one reads as unfinished. When adding a section, add its
background layer(s) here and register enter/leave motion in `section-backgrounds.ts`.

---

## Profile Section: desktop vs mobile layouts

The Profile section renders **two different layouts** by breakpoint:

- **Desktop (`>= 1200px`):** `Profile-Cubes.vue` — four rotating wireframe cubes
  (one per category: TECHNICAL, PROFESSIONAL, ACHIEVEMENTS, MINDSET), each with six
  labelled faces. On enter the faces drop in from above with a per-cube and per-face
  stagger (like building blocks), then three corner labels are uncovered by a bar
  that wipes across them. The cubes idle-spin and are drag-rotatable. The whole
  build/reveal/leave choreography is **self-contained in the component**, driven by
  `onSectionStatesChange` and gated behind `SECTION_ENTER_DELAY`, following the
  enter/leave asymmetry in the Animation Style Guide. Cubes are `display: none`
  below `1200px` (`allMobile`).
- **Mobile (`< 1200px`):** the original **card stack** (`Profile-Cards.vue` +
  `Profile-Animation-Handler.ts`) — the rotated, stacked cards that read as a single
  3D cube. This is the layout to keep building on for mobile; it is hidden on desktop
  (the `.container` is `display: none` at `smallDesktop`). `Profile-Animation-Handler.ts`
  now only owns the mobile card animations — the old desktop card timelines were
  removed when desktop switched to cubes.

`Profile-Contact.vue` is rendered inside the **Extra** section's contact panel
(right side of the split layout) — not in the Profile section itself.

---

## Extra Section

The last section (`id: 'extra'`, accent `#f09b3a`). Split layout like the Sandbox's
window panels: **left** a comments/guestbook skeleton (placeholder list + disabled
input — the database backend is a Future Task below), **right** the existing
`Profile-Contact.vue` container re-anchored into the panel. At the bottom centre a
**liquid Impressum tab** (SVG blob fused with the screen edge, pointer-draggable)
opens the Impressum panel when pulled past its threshold. All animation/interaction
logic is co-located in `aExtra-Section.vue` (Playground-style); the registry handler
is a stub.

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
@sections        →  src/components/Sections/Main
@perks           →  src/components/Sections/Main/Perks Section
@profile         →  src/components/Sections/Main/Profile Section
@projects        →  src/components/Sections/Main/Projects Section
```

---

## Naming & File Conventions

- **Vue components — `Vue-File` convention:** PascalCase words separated by hyphens
  (e.g. `Label-Set.vue`, `Section-Cover-Slice.vue`). No `a` prefixes, no redundant
  section-name prefixes on components that don't use that section's API.
- **TypeScript modules — `typescriptFile` convention:** camelCase file names
  (e.g. `sectionRegistry.ts`, `labelReveal.ts`). Module names describe what the file
  belongs to / does, not the folder it sits in.
- **SCSS files — `scss-file` convention:** kebab-case (e.g. `variables.scss`).
- **Styles live in the component:** when the majority of a component's CSS is
  component-specific, the SCSS belongs in that component's `<style>` block.
  Standalone `.scss` files are only for genuinely shared variables/mixins/extends.
- **Folder shape (target, see Current Tasks):** sections live flat in
  `components/Main/` (one file per section plus its sub-components); anything in
  there that is not a section belongs in `components/`; `modules/` is flat, no
  per-section subfolders.

---

## Git & Branch Strategy

- **`dev`** — the development environment. Everything needed for development lives
  here, including all Claude files (`CLAUDE.md`, `.claude/`, etc.). All work happens
  on `dev`.
- **`main`** — clean source-of-truth: `src/` + `README.md` only. **No Claude files.**
- **`gh-pages`** — build output only; just the files the published site needs.
  **No Claude files, no README.**
- Per-branch `.gitignore` rules keep Claude files from ever reaching `main` or
  `gh-pages` when merging/pushing from `dev`.
- **"Build the app" procedure:** build on `dev` → push the build output to
  `gh-pages` → publish. The `gh-pages` build must never be broken and no source may
  ever be lost during branch operations.

---

## Current Tasks (ordered)

Work these in order — each is scoped so later steps don't churn earlier ones:
small API changes first, then features that use them, then the big rename refactor
(done once, over final code), then cleanups that depend on the final structure, and
the git restructure last on a stable tree.

1. ~~**Landing section → labels API.** Convert all landing text (greeting lines,
   subtitle, credit) to the shared label-reveal API (`buildLabelReveal` /
   `playLabelLeave` in `label-reveal.ts`). PORTFOLIO keeps its char-pop (hero
   centrepiece exception).~~ **Done 2026-07-02.**

2. ~~**Labels API `stretch` option.** Add a `stretch?: boolean` per label in
   `Label-Set.vue` — same idea as `wrap` but horizontal: the text splits into
   words laid out side by side, each word revealed as its own label (own bar sweep
   + own positional delay).~~ **Done** — see the `stretch` branch (`.pc-label-row`)
   in `Label-Set.vue`; per-element positional delay in `miscLabelReveal.ts` already
   generalizes to it with no extra code.

3. ~~**Standalone `Module-Display` component.** Extract the panel "window" used by
   Sandbox (`.pg-win`) and Extra (`.ex-panel`) into one reusable component
   (`components/Misc/Module-Display.vue` — box/border + label header, section-accent
   aware). Replace the duplicated markup/styles in both sections with it.~~ **Done —
   see `Module-Display.vue`.**

4. ~~**Profile cubes in module displays.** Wrap the four desktop cubes
   (`Cubes.vue`) in `Module-Display` — one box per cube, like Sandbox/Extra — and
   make the cubes a little bigger, contained within their boxes.~~ **Done** — see
   `.pc-cell` (430×430px `ModuleDisplay`) in `Cubes.vue`.

5. ~~**Perks slice enter parity.** The perks background slice's enter animation does
   not match profile/projects (they animate `top`/layer offsets consistently; perks
   differs). Align it with the same enter choreography.~~ **Done 2026-07-02** — perks
   is now a `-back`/`-front` two-layer slice with the same `FRONT_LAYER_OFFSET`
   stagger as profile/projects, see `playPerksEnterDesktop`/`playPerksLeaveDesktop`
   in `sectionsBackgrounds.ts`.

6. ~~**Extra background slices rework.** Replace the current right-side slices with
   slices at **bottom-left** and **top-right**. The top-right slice enters from the
   top, the bottom-left slice from the bottom. Slices still play before all other
   enter animations (current sequencing stays).~~ **Done 2026-07-02** — see
   `.extra-section-background-topright` / `-bottomleft` in `Section-Cover-Slice.vue`
   and `playExtraEnterDesktop`/`playExtraLeaveDesktop` in `sectionsBackgrounds.ts`.

7. ~~**Sandbox background.** Corner-accent slices (top-left, top-right, bottom-left,
   bottom-right) matching the same slice system as the other sections, entering from
   top/bottom per corner.~~ **Done 2026-07-02** — see `.sandbox-corner-*` in
   `Section-Cover-Slice.vue` and `playSandboxEnterDesktop`/`playSandboxLeaveDesktop`
   in `sectionsBackgrounds.ts`.

---

## Future Tasks

### Comments Section (backed by a database)

Build a comments feature backed by a database so visitors can leave a message that
persists and is shown to future visitors.

- **Storage:** a database (table/collection) holding each comment with its text,
  timestamp, and a per-visitor identifier.
- **Visitor identity & rate limit:** identify anonymous visitors by their IP address
  (or another device-derived fingerprint) so each visitor can post **only one**
  comment. Enforce the one-comment-per-identity rule on write.
- **Display:** a later-built Comments section reads from the database and renders the
  stored comments to all visitors.

Notes / open questions to resolve when implementing:
- IP alone is imperfect (shared/NAT'd IPs, changing IPs) — decide whether to combine
  it with a browser fingerprint or a cookie/localStorage token.
- Needs a backend/API (this is currently a static SPA deployed to GitHub Pages) —
  choose a hosted DB + serverless endpoint, since GitHub Pages can't run server code.
- Add basic abuse protection (length limits, sanitization/escaping, profanity or spam
  filtering) before displaying user-submitted text.

#### Candidate backend: ASP.NET Core Minimal API

A .NET **Minimal API** is a good fit — a full comments backend (DB + one-comment-per-IP
rule + read endpoint) is ~40 lines. Read the IP via `ctx.Connection.RemoteIpAddress`,
reject the POST with `Results.Conflict(...)` if that IP already has a row, and enable
CORS for the GitHub Pages origin so the Vue app can call it cross-origin.

Sketch:
```csharp
app.MapPost("/comments", async (CommentInput input, HttpContext ctx, CommentsDb db) =>
{
    var ip = ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    if (await db.Comments.AnyAsync(c => c.Ip == ip))
        return Results.Conflict("You've already posted a comment.");
    db.Comments.Add(new Comment { Text = input.Text.Trim(), Ip = ip, CreatedAt = DateTime.UtcNow });
    await db.SaveChangesAsync();
    return Results.Created(...);
});
```

Hosting caveat: **GitHub Pages cannot run the API** — it serves static files only. The
API must be hosted separately (Azure App Service free tier, Azure Container Apps,
Fly.io, or Render) and the SPA calls it cross-origin. For persistent storage use a
hosted DB (Azure SQL free tier, or Postgres on Neon/Supabase); a local SQLite file
resets on hosts with an ephemeral filesystem.

Trade-off: Minimal API is the right call if working in C# is preferred. For a single
endpoint, a serverless function or a BaaS (Supabase/Firebase — DB + API + rate limiting
bundled) is less infrastructure to run than an always-on server.
