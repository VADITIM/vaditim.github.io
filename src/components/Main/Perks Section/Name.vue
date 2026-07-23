<template>
  <!-- Replaces Name-Display (see CLAUDE.md "Perks Section overhaul"):
       VADITIM is the main name, "vadim niedental" sits underneath as a small
       suffix/notice. Both type in via the standalone Typewriter API with the
       section's main colour. The labels live on genuinely separate 3D planes
       (preserve-3d + per-plane translateZ + pointer tilt) instead of the old
       stacked-copies/border fake. -->
  <div ref="rootRef" class="name-root">
    <div ref="stageRef" class="name-stage">
      <!-- Perk selector attached atop the name: a row of slanted "trapez"
           slices that tilt with the name's 3D stage. Clicking one selects that
           category (driving the crystal via the shared selectedPerkId) and
           retypes the title below into that category's tagline. -->
      <div ref="bandPlaneRef" class="name-plane name-plane-band">
        <div class="perk-category-band">
          <div class="perk-slice-track">
            <button
              v-for="perk in perkGraph"
              :key="perk.id"
              class="perk-slice"
              :class="{ selected: selectedPerkId === perk.id }"
              :style="{ '--slice-color': perk.color }"
              @click="onCategoryClick(perk)"
            >
              <span class="perk-slice-shape"></span>
              <span class="perk-slice-label">{{ perk.label.toUpperCase() }}</span>
            </button>
          </div>
        </div>
      </div>

      <div ref="mainPlaneRef" class="name-plane name-plane-main">
        <Typewriter
          ref="mainTw"
          text="VADITIM"
          color="#7e55dd"
          caretColor="#FFDD1B"
          class="name-main"
          :options="{ speed: 0.09, caretBlink: 0.45 }"
        />
      </div>
      <div ref="subPlaneRef" class="name-plane name-plane-sub">
        <Typewriter
          ref="subTw"
          text="vadim niedental"
          color="#FFDD1B"
          class="name-sub"
          :options="{ speed: 0.045, caretBlink: 0.45, holdCaret: false }"
        />
      </div>
      <div ref="titlePlaneRef" class="name-plane name-plane-title">
        <Typewriter
          ref="titleTw"
          text="Creative Developer - Designer"
          color="#FFDD1B"
          class="name-title"
          :options="{ speed: 0.045, caretBlink: 0.45, holdCaret: false }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref } from 'vue'
  import { gsap } from 'gsap'
  import Typewriter from '@components/Misc/Typewriter.vue'
  import { onSectionStatesChange } from '@modules/sectionsStateMachine'
  import { getSectionIndexById } from '@modules/sectionLookup'
  import { currentSection } from '@modules/sectionsCore'
  import { finished } from '@modules/sectionsStateMachine'
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'
  import { keepFullMotion } from '@modules/miscReducedMotion'
  import { perkGraph, selectedPerkId, type PerkGraphNode } from '@modules/sectionsPerksGraph'
  import { setPerkCrystalCategory, setPerkCrystalSelectedSkill } from '@modules/miscPerkCrystalCanvas'

  gsap.defaults({ immediateRender: false })

  // The title the name reverts to when no category is selected; must match the
  // Typewriter's `text` prop below.
  const DEFAULT_TITLE = 'Creative Developer - Designer'

  const rootRef = ref<HTMLElement | null>(null)
  const stageRef = ref<HTMLElement | null>(null)
  const bandPlaneRef = ref<HTMLElement | null>(null)
  const mainPlaneRef = ref<HTMLElement | null>(null)
  const subPlaneRef = ref<HTMLElement | null>(null)
  const titlePlaneRef = ref<HTMLElement | null>(null)
  const mainTw = ref<InstanceType<typeof Typewriter> | null>(null)
  const subTw = ref<InstanceType<typeof Typewriter> | null>(null)
  const titleTw = ref<InstanceType<typeof Typewriter> | null>(null)

  const perksIndex = getSectionIndexById('perks')
  let cleanupStates: (() => void) | null = null
  let typeCall: gsap.core.Tween | null = null

  // Per-slice stagger (first → last) for the band's enter reveal.
  const SLICE_ENTER_STAGGER = 0.15

  function sliceElements() {
    return bandPlaneRef.value ? [...bandPlaneRef.value.querySelectorAll<HTMLElement>('.perk-slice')] : []
  }

  // ── perk band: owns the category selection, drives the crystal, and retypes
  // the title into the selected category's tagline (or back to the default).
  function onCategoryClick(perk: PerkGraphNode) {
    const isClosing = selectedPerkId.value === perk.id
    const active = isClosing ? null : perk
    selectedPerkId.value = active?.id ?? null
    setPerkCrystalSelectedSkill(null)
    setPerkCrystalCategory(active)
    titleTw.value?.retype(active ? active.tagline : DEFAULT_TITLE)
  }

  // ── pointer tilt; the whole stage sits in real 3D space and leans toward
  // the cursor; the two planes' differing translateZ makes them shift against
  // each other (true parallax depth, not layered copies).
  function onPointerMove(event: MouseEvent) {
    if (!stageRef.value) return
    const px = event.clientX / window.innerWidth - 0.5
    const py = event.clientY / window.innerHeight - 0.5
    gsap.to(stageRef.value, {
      rotationY: -14 + px * -10,
      rotationX: -6 + py * 10,
      transformOrigin: 'left center',
      duration: 0.6,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  function playEnter() {
    if (!mainPlaneRef.value) return
    const slices = sliceElements()
    gsap.killTweensOf(mainPlaneRef.value)
    gsap.killTweensOf([subPlaneRef.value, titlePlaneRef.value, ...slices])
    typeCall?.kill()

    // Fresh selection each entry: clear the category (band + crystal) and put
    // the title text back to the default before it types in.
    selectedPerkId.value = null
    setPerkCrystalCategory(null)
    mainTw.value?.reset()
    subTw.value?.reset()
    titleTw.value?.reset()
    titleTw.value?.setText(DEFAULT_TITLE)
    // Slices start off to the right, hidden, until VADITIM finishes typing.
    gsap.set(slices, { opacity: 0, xPercent: 60 })

    // VADITIM's plane slides in from the right (the name's side of the
    // screen); the "vadim niedental" suffix stays put and only ever animates
    // via its own typewriter reveal, never a container move.
    // The Perks info module is carved out of reduced motion (see TASKS.md), so its
    // planes and the typewriters underneath keep real-time playback.
    keepFullMotion(gsap.fromTo(mainPlaneRef.value,
      { x: '40%', opacity: 0 },
      { x: '0%', opacity: 1, duration: 0.5, delay: SECTION_ENTER_DELAY, ease: 'back.out(1.2)', overwrite: 'auto' }
    ))
    keepFullMotion(gsap.to([subPlaneRef.value, titlePlaneRef.value], { opacity: 1, duration: 0.35, delay: SECTION_ENTER_DELAY, ease: 'power2.out', overwrite: 'auto' }))
    // …then the typewriters run: VADITIM first, the suffix follows. Once
    // VADITIM has finished, the band's slices slide in from the right, one
    // after the next, while the suffix/title type underneath.
    typeCall = gsap.delayedCall(SECTION_ENTER_DELAY + 0.35, async () => {
      await mainTw.value?.type()
      keepFullMotion(gsap.to(slices, {
        opacity: 1, xPercent: 0, duration: 0.5, ease: 'back.out(1.2)',
        stagger: SLICE_ENTER_STAGGER, overwrite: 'auto',
      }))
      await subTw.value?.type()
      await titleTw.value?.type()
    })
  }

  function playLeave() {
    if (!mainPlaneRef.value) return
    const slices = sliceElements()
    typeCall?.kill()
    typeCall = null
    // Clear the category so the band and crystal re-enter clean.
    selectedPerkId.value = null
    setPerkCrystalCategory(null)
    // Typed lines clear (fast backspace); but the backspace on longer lines
    // (e.g. the title) can outlast the leave duration, so the caret/text
    // would otherwise linger visibly into the next section. Fade the sub and
    // title planes out immediately alongside VADITIM's exit rather than
    // waiting on the backspace to finish.
    mainTw.value?.clear()
    subTw.value?.clear()
    titleTw.value?.clear()
    gsap.to(mainPlaneRef.value, { x: '40%', opacity: 0, duration: 0.3, ease: 'power2.in', overwrite: 'auto' })
    gsap.to([subPlaneRef.value, titlePlaneRef.value], { opacity: 0, duration: 0.25, ease: 'power2.in', overwrite: 'auto' })
    // Slices slide back out to the right (first → last), faster than they enter.
    gsap.to(slices, { opacity: 0, xPercent: 60, duration: 0.25, ease: 'power2.in', stagger: 0.06, overwrite: 'auto' })
  }

  onMounted(() => {
    if (mainPlaneRef.value) gsap.set(mainPlaneRef.value, { x: '40%', opacity: 0 })
    // The band plane stays visible; its slices carry the enter/leave reveal.
    if (bandPlaneRef.value) gsap.set(bandPlaneRef.value, { opacity: 1 })
    gsap.set(sliceElements(), { opacity: 0, xPercent: 60 })
    if (subPlaneRef.value) gsap.set(subPlaneRef.value, { opacity: 0 })
    if (titlePlaneRef.value) gsap.set(titlePlaneRef.value, { opacity: 0 })

    window.addEventListener('mousemove', onPointerMove)

    cleanupStates = onSectionStatesChange((meta) => {
      if (meta.isEnteringSection(perksIndex)) playEnter()
      else if (meta.isLeavingSection(perksIndex)) playLeave()
    })

    // Only auto-play here for a genuine remount after the loading intro has
    // already finished (e.g. dev HMR); at cold boot currentSection is
    // already perksIndex (its default) well before ChangeSection ever fires,
    // so without the finished.value gate this would play the enter animation
    // under the loading curtain instead of waiting for the real transition.
    if (currentSection.value === perksIndex && finished.value) playEnter()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onPointerMove)
    cleanupStates?.()
    cleanupStates = null
    typeCall?.kill()
    typeCall = null
  })
</script>

<style scoped lang="scss">
  @use "@styleVariables" as *;

  // Plain flex child now — Perks-Section.vue owns the full-viewport frame and
  // the flexbox that positions this against Perks-Skills' column, so no
  // absolute positioning or right-edge offset is needed here.
  .name-root {
    @extend .disable-selection;
    flex: 0 0 auto;
    perspective: 1100px;
    pointer-events: none;
    will-change: transform, opacity;
  }

  .name-stage {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    transform-style: preserve-3d;
    transform-origin: left center;
    transform: rotateY(-14deg) rotateX(-6deg);
  }

  // Two real 3D planes; the main name floats nearest the viewer, the suffix
  // sits deeper, so the pointer tilt reads as genuine depth.
  .name-plane {
    transform-style: preserve-3d;
  }

  // Sits nearest the viewer, just above the name, and stretches to the name's
  // full width so the slice row caps the name like a header. The plane stays
  // visible; its individual slices carry the staggered enter/leave reveal.
  .name-plane-band {
    align-self: stretch;
    transform: translateZ(55px);
    margin-bottom: 0.45rem;
  }

  .name-plane-main {
    transform: translateZ(60px);
  }

  .name-plane-sub {
    transform: translateZ(10px);
    margin-top: 0.4rem;
  }

  .name-plane-title {
    transform: translateZ(10px);
    margin-top: 0.3rem;
  }

  .name-main {
    font-family: Wosker;
    font-size: clamp(6rem, 12vw, 13rem);
    line-height: 1;
    filter: drop-shadow(0.6rem 0.9rem 0.9rem rgba(0, 0, 0, 0.55));
  }

  .name-sub {
    font-family: 'Mono';
    font-size: clamp(0.9rem, 1.2vw, 1.4rem);
    letter-spacing: 5px;
    opacity: 0.75;
  }

  .name-title {
    font-family: 'Mono';
    font-size: clamp(0.9rem, 1.2vw, 1.4rem);
    letter-spacing: 5px;
    opacity: 0.75;
  }

  // ── perk slice band (atop the name) ──
  // A row of slanted "trapez" slices spanning the name's width; the plane above
  // gives it depth/tilt, so here it is a plain contained block.
  .perk-category-band {
    position: relative;
    width: 100%;
    height: clamp(30px, 3vh, 46px);
    pointer-events: none;

    --skew-base: 20px; // horizontal lean of each slice's slanted edges
    --skew: var(--skew-base);
    --hover-grow: 3;   // height multiplier for a hovered slice
    --active-grow: calc(var(--hover-grow) * 0.7); // active slice: ~30% shorter than a hover
    --gap: 8px;        // slanted background gap between adjacent slices

    // style.scss rounds every element via `*`; the slices are cut by clip-path,
    // so clear the radius across the band.
    &, * {
      border-radius: 0;
    }
  }

  .perk-slice-track {
    position: absolute;
    inset: 0;
    display: flex;
  }

  .perk-slice {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    appearance: none;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    pointer-events: auto;
    will-change: transform;
    // Only flex-grow animates on select; the reveal rides the plane's opacity.
    transition: flex-grow 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    @extend .disable-selection;

    // Overlap adjacent slices by (skew - gap) so their slanted edges leave a
    // constant-width slanted gap (--gap) of background between them.
    & + & {
      margin-left: calc(var(--gap) - var(--skew));
    }
  }

  // The parallelogram itself: a gradient built from the category colour. The
  // first/last slices square their outer edge (below) so the band ends clean.
  // --grow (1 = resting) drives all three of height, the clip's skew, and a
  // re-centring translate together: height scales by --grow, skew scales by the
  // same factor so the slant angle (atan(skew / height)) is preserved, and the
  // translate re-centres the taller shape on the row (translation, unlike
  // scaleY, never distorts a clip). Hover/active states below just raise --grow.
  .perk-slice-shape {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    --grow: 1;
    --skew: calc(var(--skew-base) * var(--grow));
    height: calc(100% * var(--grow));
    transform: translateY(calc(-100% * (var(--grow) - 1) / (2 * var(--grow))));
    background: linear-gradient(
      115deg,
      var(--slice-color) 0%,
      color-mix(in srgb, var(--slice-color) 55%, #000) 100%
    );
    clip-path: polygon(var(--skew) 0, 100% 0, calc(100% - var(--skew)) 100%, 0 100%);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, #000 25%, transparent);
    transition: height 0.25s ease, transform 0.25s ease, clip-path 0.25s ease, filter 0.25s ease;
  }

  // Square the band's outer edges: first slice's left, last slice's right.
  .perk-slice:first-child .perk-slice-shape {
    clip-path: polygon(0 0, 100% 0, calc(100% - var(--skew)) 100%, 0 100%);
  }

  .perk-slice:last-child .perk-slice-shape {
    clip-path: polygon(var(--skew) 0, 100% 0, 100% 100%, 0 100%);
  }

  .perk-slice-label {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-family: 'Mono';
    font-weight: 700;
    font-size: clamp(12px, 1vw, 18px);
    letter-spacing: 3px;
    color: #0e0e0e;
  }

  .perk-slice:hover .perk-slice-shape,
  .perk-slice.selected .perk-slice-shape {
    filter: brightness(1.15) saturate(1.1);
  }

  // Active selection: the selected slice grows to --active-grow, the other two
  // to half that, and these heights persist without hover. Only an active
  // selection scales the non-focused slices — a bare hover never does. The half
  // slices lag their size change so the focused one leads and they follow; the
  // focused rule resets the delay so it reacts immediately.
  .perk-slice-track:has(.selected) .perk-slice-shape {
    --grow: calc(var(--active-grow) * 0.5);
    transition-delay: 0.1s;
  }

  .perk-slice.selected .perk-slice-shape {
    --grow: var(--active-grow);
    transition-delay: 0s;
  }

  // Hover only ever grows the hovered slice itself (never its neighbours), and
  // comes last so it wins over the active sizing for the slice under the cursor.
  .perk-slice:hover .perk-slice-shape {
    --grow: var(--hover-grow);
    transition-delay: 0s;
  }

  // Keep the focused (tallest) slice above its neighbours so it isn't clipped.
  .perk-slice.selected {
    z-index: 2;
  }

  .perk-slice:hover {
    z-index: 3;
  }

  // Selected slice grows ~50% (flex-grow 1 -> 1.5); the other two shrink evenly
  // (1 -> 0.75), so the row keeps its total width. The selected rule is written
  // more specifically than the shrink rule so it wins over it.
  .perk-slice-track:has(.selected) .perk-slice {
    flex-grow: 0.75;
  }

  .perk-slice-track:has(.selected) .perk-slice.selected {
    flex-grow: 1.5;
  }
</style>
