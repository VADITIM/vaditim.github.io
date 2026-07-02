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

### `src/modules/sectionCoverSlices.ts`
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

These rules preserve the timing and feel established by `sectionCoverSlices.ts`, which is the canonical reference for enter/leave motion across the whole system.

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
- Perks / logs content enters from **left** (slides in from off-screen-left)
- Projects content enters from **right/bottom**
- Floating / ambient elements (notes, decorative text) enter from **below** with a larger offset than interactive elements

### What not to do

- Do not use `ease: 'linear'` for enter/leave transitions — it reads as mechanical
- Do not set `delay` on leave animations — exits must be instant
- Do not use `>` sequential chaining in section-transition timelines — it makes timing unpredictable when animations are interrupted
- Do not hardcode offsets in `px` when the layout uses `%` — use matching units so the hidden position stays consistent across viewport sizes

### Exceptions (intentional divergence from the above)

- **Logs cards** (front + back): use `power2.out` without `back.out` because the cards are physically large and the overshoot reads as jitter at that scale; they also use rapid-pass-through detection to skip animations when the user navigates through logs quickly
- **Loading section notes**: use `power4.inOut` + `power2.in` split-property easing to simulate drifting momentum — the notes are ambient decoration, not navigation feedback, so they follow a different rhythm
- **Projects container** enter: uses a `1.6s power4.inOut` slide — intentionally slow and dramatic as the section's visual centrepiece

---

## Label Reveal Pattern (system-wide)

Any set of static corner/edge labels (first introduced in `Cubes.vue`, Logs section) uses
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

**Mobile development is currently paused.** Do not add or modify mobile-specific
layouts, breakpoints, or animations unless explicitly asked. Treat `< 1200px` code
paths as frozen; focus all unprompted work on desktop (`>= 1200px`).

---

## Section Backgrounds (required per section)

Every section **must** have a **slice background** — the slanted, `clip-path`
polygon coloured layer that enters/leaves with the section. These live in
`Section-Background-Display.vue` (one `<div>` per section, e.g.
`.logs-back` / `-front`) and are animated by
`sectionCoverSlices.ts`. The diagonal slice is the signature look of the whole
menu; a section without one reads as unfinished. When adding a section, add its
background layer(s) here and register enter/leave motion in `sectionCoverSlices.ts`.

---

## Responsive Sizing

- Use `vh`/`vw` units and `clamp()` for sizes that should scale proportionally
- Avoid hardcoded `px` values for positioning elements that need to stay aligned across viewport sizes
- CSS custom properties (`--card-size`, `--cards-container-size`) are defined in `variables.scss` and overridden at the mobile breakpoint
- Logs cards use percentage-based positioning via the GSAP animation handler (`sectionsLogsAnimationHandler.ts`) — not CSS position

---

## Path Aliases (vite.config.ts)

```
@styleVariables  →  src/style/variables.scss
@components      →  src/components
@modules         →  src/modules
@sections        →  src/components/Sections/Main
@perks           →  src/components/Sections/Main/Perks Section
@logs            →  src/components/Sections/Main/Logs Section
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
- **Never add `Co-Authored-By: Claude ...` (or any assistant co-author trailer) to
  commit messages.** Commits are authored solely as the user (`VADITIM`). This
  applies to every commit on every branch, including ones generated by Claude Code.

---


## Future Tasks

### Comments Section (backed by a database)

Build a comments feature backed by a database so visitors can leave a message that
persists and is shown to future visitors.

- **Storage:** a database (table/collection) holding each comment with its text,
  timestamp, an owner token hash (see below), and a like count.
- **Visitor identity — crypto token / proof-of-work, not IP.** IP-based identity was
  rejected (shared/NAT'd IPs, VPNs, changing IPs make it both leaky and unreliable).
  Instead use a web3-style local identity:
  - On first visit, the client generates a keypair (or a random high-entropy secret)
    entirely client-side and stores it in `localStorage`. This is the visitor's
    **owner token** — nothing server-generated, nothing tied to IP.
  - Before the comment is accepted, the client must complete a small **proof-of-work**
    challenge (server sends a nonce/difficulty target, client hashes
    `token + nonce + text` until the hash meets the target, e.g. leading zero bits).
    This is the anti-spam gate instead of IP rate-limiting — cheap for a real visitor,
    expensive to script at scale.
  - The server stores only a **hash of the owner token** (never the raw token) against
    the comment row. The one-comment-per-identity rule is enforced by rejecting a new
    comment if that token hash already owns one.
  - **Edit / delete:** the same owner token is required to prove ownership — the client
    resends the token, the server re-hashes and compares against the stored hash before
    allowing `PATCH`/`DELETE` on that comment. Losing `localStorage` means losing the
    ability to edit/delete (acceptable trade-off, no account system).
- **Likes:** any visitor (not just the comment's owner) can like a comment, keyed by
  their own owner token so a given visitor can only like a given comment once. Likes
  don't require proof-of-work — only new comment creation does.
- **Display:** a later-built Comments section reads from the database and renders the
  stored comments, their like counts, and edit/delete controls (shown only when the
  local owner token matches the comment's stored hash) to all visitors.

Notes / open questions to resolve when implementing:
- Needs a backend/API (this is currently a static SPA deployed to GitHub Pages) —
  choose a hosted DB + serverless endpoint, since GitHub Pages can't run server code.
- Add basic abuse protection (length limits, sanitization/escaping, profanity or spam
  filtering) before displaying user-submitted text, in addition to the proof-of-work
  gate.
- Proof-of-work difficulty should be tunable server-side so it can be raised if spam
  volume increases, without a client redeploy.

#### Candidate backend: ASP.NET Core Minimal API

A .NET **Minimal API** is a good fit — a full comments backend (DB + token-hash
ownership + PoW-gated create + edit/delete/like endpoints) is still a small handful of
endpoints. Store only `Sha256(ownerToken)` per comment; verify ownership by re-hashing
the token sent with edit/delete/like requests and comparing.

Sketch:
```csharp
app.MapPost("/comments", async (CommentInput input, CommentsDb db) =>
{
    if (!ProofOfWork.Verify(input.Token, input.Nonce, input.Text, difficulty: 20))
        return Results.BadRequest("Invalid proof of work.");
    var tokenHash = Sha256(input.Token);
    if (await db.Comments.AnyAsync(c => c.OwnerTokenHash == tokenHash))
        return Results.Conflict("You've already posted a comment.");
    db.Comments.Add(new Comment { Text = input.Text.Trim(), OwnerTokenHash = tokenHash, CreatedAt = DateTime.UtcNow });
    await db.SaveChangesAsync();
    return Results.Created(...);
});

app.MapDelete("/comments/{id}", async (Guid id, string token, CommentsDb db) =>
{
    var comment = await db.Comments.FindAsync(id);
    if (comment is null || comment.OwnerTokenHash != Sha256(token)) return Results.Forbid();
    db.Comments.Remove(comment);
    await db.SaveChangesAsync();
    return Results.NoContent();
});
```

Hosting caveat: **GitHub Pages cannot run the API** — it serves static files only. The
API must be hosted separately (Azure App Service free tier, Azure Container Apps,
Fly.io, or Render) and the SPA calls it cross-origin. For persistent storage use a
hosted DB (Azure SQL free tier, or Postgres on Neon/Supabase); a local SQLite file
resets on hosts with an ephemeral filesystem.

Trade-off: Minimal API is the right call if working in C# is preferred. For a single
endpoint, a serverless function or a BaaS (Supabase/Firebase — DB + API bundled) is
less infrastructure to run than an always-on server, though proof-of-work verification
logic still needs to live somewhere server-side either way.

#### Perks Section overhaul
For the Perks on the left side we will develop a interactive node graph like in obsidian the graph view. Each main perk can be clicked on and will reveal its children as new nodes. Each perk will get its own Module-Display.
Change the Perks as following:
- C# Developer > C#
  - Will feature C# related skills
- Vue & Typescript > Web
  - Vue
  - Angular
  - Typescript
  - mySQL
- UI/UX Aimator > UI/UX
- Game Designer > [REMOVE]
- Techinal Designer > [REMOVE]
The Module-Displays wwill be alinged in a vertical grid. dynamic scalling.

Name-Display will be replaced for Name.
current name "vadim niedental" will be changed to VADITIM. vadim niedental will be shown underneath the main name as a little suffix/notice.
Enter and Leave animations feature an overhaul.
VADITIM and vadim niedental will feature a typewriter animation. The Typewriter animation should be a standalone API like the Label-Set, with configurable delays, speed, etc.
Typewriter API bar (the normal bar you see flashing in a text editor when typing) color is sections main color, just as the text. Also the Label should display 3D labels. Old setup overlaps multiple copies and borders, create real 3D for these labels. 


# IMPORTANT
- DO NEVER RUN A PREVIEW EVAL
- OUTPUT LESS TEXT, COMPACT EVERYTHING AT THE END



# Current Ideas
- Project-Section. When switching between projects the helix should ripple itself from a random position on its strang in all directions.
- Landing-Section. While there have an even-listener running for keypress "S". If it is pressed  twice the whole Loading-Section will be skipped, only its leave animation is played, no matter how far each element is in their timelime, they will be stopped. (This will make debugging easier and without needing to wait for landing-page to finish)


# KNOWN ISSUES
- Project-Section, Module-Displays in Module-Display-Projects are not parallax. 
- Project-Section, Module-Displays in Module-Display-Projects border hover should be section main color 
- Project-Section, Project-Name in Module-Display-Project-Info doesnt properly play its leave animation, before showing new content. Uncouple Module-Display-Projects animation from Project-Name leave animation. They should be two seperate animation and handle their data differently. Projects-Name will always play its leave animation, before showing new content, no matter how fast projects are cycled. To ensure the wrong name is not shown, before playing enter animation check whats the current project now and paste their data in, to not play animations in queue, if there are any.
- Landing-Page & Section-Cover-Slices should not use border-radius.
- Landing-Page. Greetings User should be shown first. it stays for one second and then plays its leave animation. after Greetings User leave animation, wait .35s and Explore your experience plays and stays also for 1s. Both labels are positioned within the same position, basically cycled. Proceed with normal animation timeline.
