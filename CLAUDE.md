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
@sections        →  src/components/Sections/Main
@perks           →  src/components/Sections/Main/Perks Section
@profile         →  src/components/Sections/Main/Profile Section
@projects        →  src/components/Sections/Main/Projects Section
```

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
