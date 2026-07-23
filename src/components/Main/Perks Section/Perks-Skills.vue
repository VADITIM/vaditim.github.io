<template>
  <!-- Perks showpiece column (left half; the name block owns the right).
       The PERK-CRYSTAL canvas is the interaction surface: picking a category
       headline unfolds that category's skills as satellite nodes around the
       crystal, and clicking a node opens its detail panel underneath. The
       skills deliberately carry no module chrome of their own — the crystal is
       the frame. -->
  <div class="perk-column">
    <div class="perk-body">
      <div ref="showpieceRef" class="perk-showpiece">
        <canvas ref="canvasRef" class="perk-crystal"></canvas>
      </div>
    </div>

    <!-- One shared panel; `displayedSkill` is only written the instant
         before an enter, so a click during its leave animation can never
         blank or rewrite the text that is still fading out. -->
    <div ref="detailRef" class="perk-detail">
      <Module
        :label="(displayedSkill ?? '').toUpperCase()"
        :accent="displayedPerk?.color ?? CRYSTAL_ACCENT"
        static-visible
        :animate-height="false"
        class="perk-detail-module"
      >
        <div class="perk-detail-body">
          <div class="perk-detail-title">{{ displayedSkill }}</div>
          <div class="perk-detail-text">{{ perkInfo[displayedSkill ?? ''] ?? '' }}</div>
        </div>
      </Module>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
  import { gsap } from 'gsap'
  import Module from '@components/Misc/Module.vue'
  import { perkGraph, perkInfo, selectedPerkId, type PerkGraphNode } from '@modules/sectionsPerksGraph'
  import { onSectionStatesChange } from '@modules/sectionsStateMachine'
  import { getSectionIndexById } from '@modules/sectionLookup'
  import { currentSection } from '@modules/sectionsCore'
  import { finished } from '@modules/sectionsStateMachine'
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'
  import {
    initializePerkCrystalCanvas,
    showPerkCrystal,
    hidePerkCrystal,
    setPerkCrystalSelectedSkill,
  } from '@modules/miscPerkCrystalCanvas'

  gsap.defaults({ immediateRender: false })

  const CRYSTAL_ACCENT = '#7e55dd'
  // Offset from SECTION_ENTER_DELAY; the crystal grows once its container has landed.
  const CRYSTAL_GROW_OFFSET = 0.75

  const showpieceRef = ref<HTMLElement | null>(null)
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const detailRef = ref<HTMLElement | null>(null)

  const selectedSkill = ref<string | null>(null)
  // What the panel renders. Diverges from selectedSkill for the length of a
  // leave animation, so outgoing text stays intact while it fades.
  const displayedSkill = ref<string | null>(null)
  // Guards the leave→enter handoff: a click that lands while an older leave is
  // still running invalidates that leave's completion callback.
  let skillClickToken = 0

  const perksIndex = getSectionIndexById('perks')
  let cleanupStates: (() => void) | null = null
  let cleanupCanvas: (() => void) | null = null

  const displayedPerk = computed<PerkGraphNode | null>(() =>
    displayedSkill.value
      ? perkGraph.find((perk) => perk.children.includes(displayedSkill.value!)) ?? null
      : null,
  )

  // ── detail panel ──
  function enterDetail() {
    const element = detailRef.value
    if (!element) return
    gsap.killTweensOf(element)
    element.style.pointerEvents = 'auto'
    gsap.fromTo(element,
      { y: -28, opacity: 0, scale: 0.94 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)', overwrite: 'auto' },
    )
  }

  function leaveDetail(instant = false, onDone?: () => void) {
    const element = detailRef.value
    if (!element) { onDone?.(); return }
    gsap.killTweensOf(element)
    element.style.pointerEvents = 'none'
    if (instant) {
      gsap.set(element, { y: -28, opacity: 0, scale: 0.94 })
      onDone?.()
      return
    }
    gsap.to(element, {
      y: -18, opacity: 0, scale: 0.96,
      duration: 0.2, ease: 'power2.in', overwrite: 'auto',
      onComplete: onDone,
    })
  }

  // ── interaction ──
  // The category selection itself lives with the slice band (Name.vue), which
  // drives the crystal. Here we only react to a category change to close any
  // open skill detail — a swapped or cleared category invalidates it.
  watch(selectedPerkId, () => {
    if (!selectedSkill.value) return
    skillClickToken++
    selectedSkill.value = null
    setPerkCrystalSelectedSkill(null)
    leaveDetail()
  })

  function onSkillNodeClick(name: string) {
    skillClickToken++
    const token = skillClickToken
    const isStale = () => token !== skillClickToken

    if (selectedSkill.value === name) {
      selectedSkill.value = null
      setPerkCrystalSelectedSkill(null)
      leaveDetail()
      return
    }
    if (selectedSkill.value) {
      leaveDetail(false, () => {
        if (isStale()) return
        selectedSkill.value = name
        displayedSkill.value = name
        setPerkCrystalSelectedSkill(name)
        enterDetail()
      })
      return
    }
    selectedSkill.value = name
    displayedSkill.value = name
    setPerkCrystalSelectedSkill(name)
    enterDetail()
  }

  // ── section enter/leave (Perks content enters from off-screen left) ──
  function playEnter() {
    const showpiece = showpieceRef.value
    gsap.killTweensOf(showpiece)

    resetSelection()

    if (showpiece) {
      gsap.fromTo(showpiece,
        { opacity: 0, y: 36, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: SECTION_ENTER_DELAY + 0.15, ease: 'back.out(1.6)', overwrite: 'auto' },
      )
    }

    showPerkCrystal(SECTION_ENTER_DELAY + CRYSTAL_GROW_OFFSET)
  }

  function playLeave() {
    const showpiece = showpieceRef.value
    gsap.killTweensOf(showpiece)

    resetSelection()

    if (showpiece) {
      gsap.to(showpiece, { opacity: 0, y: 36, scale: 0.96, duration: 0.3, ease: 'power2.in', overwrite: 'auto' })
    }

    hidePerkCrystal()
  }

  // Drop any open skill so the section is never re-entered mid-state. The
  // category itself is reset by the band (Name.vue) on the same transition.
  function resetSelection() {
    skillClickToken++
    selectedSkill.value = null
    leaveDetail(true)
  }

  onMounted(() => {
    gsap.set(showpieceRef.value, { opacity: 0, y: 36, scale: 0.96 })
    gsap.set(detailRef.value, { y: -28, opacity: 0, scale: 0.94 })

    if (canvasRef.value) {
      cleanupCanvas = initializePerkCrystalCanvas(canvasRef.value, { onSkillClick: onSkillNodeClick })
    }

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
    cleanupStates?.()
    cleanupStates = null
    cleanupCanvas?.()
    cleanupCanvas = null
  })
</script>

<style scoped lang="scss">
  @use "@styleVariables" as *;

  // Plain flex child now — Perks-Section.vue owns the full-viewport frame and
  // the flexbox that positions this against Name, so its width is resolved by
  // flexbox against Name's own width rather than a guessed fixed percentage.
  .perk-column {
    flex: 0 1 auto;
    min-width: 0;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    pointer-events: none;
  }

  // Crystal centered on top, categories in a row underneath it.
  .perk-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(2px, 0.25vw, 8px);
  }

  // Sized by the canvas it holds; the wrapper exists purely as the GSAP target
  // for the showpiece's enter/leave.
  .perk-showpiece {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    will-change: transform, opacity;
  }

  // Scales with viewport width instead of a fixed px box — CANVAS_WIDTH /
  // CANVAS_HEIGHT in miscPerkCrystalCanvas.ts (820×820) only fix the drawing
  // resolution and aspect ratio; toCanvasPoint() already maps pointer
  // coordinates through getBoundingClientRect(), so the on-screen CSS size is
  // free to scale as long as this aspect-ratio matches that resolution.
  .perk-crystal {
    width: clamp(400px, 38vw, 1080px);
    aspect-ratio: 1 / 1;
    height: auto;
    cursor: grab;
    pointer-events: auto;
    @extend .disable-selection;

    // Vertical layout: size the crystal off the smaller viewport dimension so
    // it's the section's hero yet never overflows width or height. The canvas
    // drawing resolution is fixed and pointer mapping goes through
    // getBoundingClientRect, so the CSS size is free to scale (see above).
    @include vertical {
      width: min(96vw, 54vh);
    }
  }

  // Pulled out of flow deliberately: the column centres its content, so a panel
  // that took part in layout would shunt the crystal and headlines every time it
  // opened, closed, or swapped to a skill whose text wraps to a different height.
  .perk-detail {
    position: absolute;
    top: calc(100% + 16px);
    left: 0;
    right: 0;
    z-index: 6;
    opacity: 0;
    pointer-events: none;
    will-change: transform, opacity;
  }

  .perk-detail-module {
    :deep(.module-content) {
      padding: 40px 16px 16px;
    }
  }

  .perk-detail-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .perk-detail-title {
    font-family: 'Mono';
    font-size: clamp(16px, 1.3vw, 22px);
    letter-spacing: 2px;
    color: #ffdd1b;
  }

  .perk-detail-text {
    font-family: 'Mono';
    font-size: clamp(12px, 0.95vw, 15px);
    line-height: 1.55;
    color: #cfcfcf;
  }
</style>
