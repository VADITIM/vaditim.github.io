<template>
  <!-- Perks showpiece column (left half; the name block owns the right).
       The PERK-CRYSTAL canvas is the interaction surface: picking a category
       headline unfolds that category's skills as satellite nodes around the
       crystal, and clicking a node opens its detail panel underneath. The
       skills deliberately carry no module chrome of their own — the crystal is
       the frame. -->
  <div ref="rootRef" class="perk-column">
    <div class="perk-body">
      <div ref="showpieceRef" class="perk-showpiece">
        <canvas ref="canvasRef" class="perk-crystal"></canvas>
      </div>

      <div class="perk-category-row">
        <button
          v-for="perk in perkGraph"
          :key="perk.id"
          class="perk-category pc-label--pressable"
          :class="{ selected: selectedCategory === perk.id }"
          @click="onCategoryClick(perk)"
        >
          <span class="pc-label-inner">
            <span class="pc-label-text">{{ perk.label.toUpperCase() }}</span>
            <span class="pc-label-bar"></span>
          </span>
          <span class="perk-category-underline"></span>
        </button>
      </div>
    </div>

    <!-- One shared panel; `displayedSkill` is only written the instant
         before an enter, so a click during its leave animation can never
         blank or rewrite the text that is still fading out. -->
    <div ref="detailRef" class="perk-detail">
      <ModuleDisplay
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
      </ModuleDisplay>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
  import { gsap } from 'gsap'
  import ModuleDisplay from '@components/Misc/Module-Display.vue'
  import { perkGraph, perkInfo, type PerkGraphNode } from '@modules/sectionsPerksGraph'
  import { onSectionStatesChange } from '@modules/sectionsStateMachine'
  import { getSectionIndexById } from '@modules/sectionLookup'
  import { currentSection } from '@modules/sectionsCore'
  import { finished } from '@modules/sectionsStateMachine'
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'
  import { hideLabels, buildLabelReveal, playLabelLeave } from '@modules/miscLabelReveal'
  import {
    initializePerkCrystalCanvas,
    showPerkCrystal,
    hidePerkCrystal,
    setPerkCrystalCategory,
    setPerkCrystalSelectedSkill,
    PERK_CRYSTAL_REVEAL_DURATION_SECONDS,
  } from '@modules/miscPerkCrystalCanvas'

  gsap.defaults({ immediateRender: false })

  const CRYSTAL_ACCENT = '#7e55dd'
  // Offset from SECTION_ENTER_DELAY; the crystal grows once its container has landed.
  const CRYSTAL_GROW_OFFSET = 0.75
  // The category headlines only start revealing once the crystal above them has
  // fully arrived — they read as the crystal's caption, not as a parallel entrance.
  const CATEGORY_REVEAL_DELAY = SECTION_ENTER_DELAY + CRYSTAL_GROW_OFFSET + PERK_CRYSTAL_REVEAL_DURATION_SECONDS
  // Left-to-right, matching the label pattern's top-left-first ordering.
  const CATEGORY_REVEAL_STAGGER = 0.12
  const CATEGORY_UNDERLINE_DURATION = 0.5

  const rootRef = ref<HTMLElement | null>(null)
  const showpieceRef = ref<HTMLElement | null>(null)
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const detailRef = ref<HTMLElement | null>(null)

  const selectedCategory = ref<string | null>(null)
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

  function categoryLabelElements() {
    return rootRef.value ? [...rootRef.value.querySelectorAll<HTMLElement>('.perk-category .pc-label-inner')] : []
  }

  function categoryUnderlineElements() {
    return rootRef.value ? [...rootRef.value.querySelectorAll<HTMLElement>('.perk-category-underline')] : []
  }

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
  function onCategoryClick(perk: PerkGraphNode) {
    const isClosing = selectedCategory.value === perk.id
    skillClickToken++
    if (selectedSkill.value) leaveDetail()
    selectedSkill.value = null
    setPerkCrystalSelectedSkill(null)

    if (isClosing) {
      selectedCategory.value = null
      setPerkCrystalCategory(null)
      return
    }
    selectedCategory.value = perk.id
    setPerkCrystalCategory(perk)
  }

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
    const labels = categoryLabelElements()
    const underlines = categoryUnderlineElements()
    gsap.killTweensOf([showpiece, ...underlines])

    resetSelection()

    if (showpiece) {
      gsap.fromTo(showpiece,
        { opacity: 0, y: 36, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: SECTION_ENTER_DELAY + 0.15, ease: 'back.out(1.6)', overwrite: 'auto' },
      )
    }
    // Bar-sweep reveal (see the Label Reveal Pattern in CLAUDE.md). The
    // positional stagger of playLabelReveals doesn't apply here — these sit on
    // one row at the same height, so the delay is a plain left-to-right step.
    labels.forEach((label, index) => {
      buildLabelReveal(label).delay(CATEGORY_REVEAL_DELAY + index * CATEGORY_REVEAL_STAGGER)
    })
    underlines.forEach((underline, index) => {
      gsap.fromTo(underline,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: CATEGORY_UNDERLINE_DURATION,
          // Lands with the bar's collapse, so the rule draws itself in as the text appears.
          delay: CATEGORY_REVEAL_DELAY + index * CATEGORY_REVEAL_STAGGER + 0.42,
          ease: 'power3.inOut',
          overwrite: 'auto',
        },
      )
    })

    showPerkCrystal(SECTION_ENTER_DELAY + CRYSTAL_GROW_OFFSET)
  }

  function playLeave() {
    const showpiece = showpieceRef.value
    const underlines = categoryUnderlineElements()
    gsap.killTweensOf([showpiece, ...underlines])

    resetSelection()

    if (showpiece) {
      gsap.to(showpiece, { opacity: 0, y: 36, scale: 0.96, duration: 0.3, ease: 'power2.in', overwrite: 'auto' })
    }
    playLabelLeave(categoryLabelElements())
    gsap.to(underlines, { scaleX: 0, duration: 0.3, ease: 'power2.in', overwrite: 'auto' })

    hidePerkCrystal()
  }

  // Drop any open category/skill so the section is never re-entered mid-state.
  function resetSelection() {
    skillClickToken++
    selectedCategory.value = null
    selectedSkill.value = null
    setPerkCrystalCategory(null)
    leaveDetail(true)
  }

  onMounted(() => {
    gsap.set(showpieceRef.value, { opacity: 0, y: 36, scale: 0.96 })
    hideLabels(categoryLabelElements())
    gsap.set(categoryUnderlineElements(), { scaleX: 0 })
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
  // CANVAS_HEIGHT in miscPerkCrystalCanvas.ts (820×684) only fix the drawing
  // resolution and aspect ratio; toCanvasPoint() already maps pointer
  // coordinates through getBoundingClientRect(), so the on-screen CSS size is
  // free to scale as long as this aspect-ratio matches that resolution.
  .perk-crystal {
    width: clamp(400px, 38vw, 1080px);
    aspect-ratio: 820 / 684;
    height: auto;
    cursor: grab;
    pointer-events: auto;
    @extend .disable-selection;
  }

  // Category headlines: bare text with an underline rule, no module chrome —
  // a row underneath the crystal.
  .perk-category-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: clamp(18px, 2vw, 36px);
    // The crystal canvas reserves empty space below the drawn shape for the
    // orbit's lowest excursion. Shifted with a transform rather than a negative
    // margin so the column keeps its height — shrinking it would re-centre the
    // body and drag the crystal down with it.
    transform: translateY(clamp(-90px, -6vw, -30px));
  }

  // Headline text uses the shared bar-sweep reveal (Label Reveal Pattern), so the
  // button itself carries no opacity animation — the clip-path and the underline
  // scale are what bring it in.
  .perk-category {
    // Section main colour, shared by all three headlines. The per-category hues
    // in `perkGraph` still drive the crystal and the detail panel, but the
    // headlines themselves read as one set.
    --accent: #ffdd1b;
    position: relative;
    appearance: none;
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 0.3em 0.15em 0.45em;
    font-family: 'Mono';
    font-weight: 700;
    font-size: clamp(18px, 1.7vw, 28px);
    letter-spacing: 4px;
    color: #e8e8e8;
    @extend .disable-selection;

    transition:
      color 0.25s ease,
      text-shadow 0.25s ease;

    &:hover,
    &.selected {
      color: var(--accent);
      text-shadow: 0 0 18px color-mix(in srgb, var(--accent) 40%, transparent);

      .perk-category-underline {
        background: var(--accent);
      }
    }
  }

  // Same opt-in as Label-Set's pressable labels: label-pattern text is inert
  // unless it is wired to an action.
  .pc-label--pressable {
    pointer-events: auto;
    cursor: pointer;
  }

  .pc-label-inner {
    position: relative;
    display: inline-block;
    overflow: hidden;
  }

  .pc-label-text {
    display: block;
    white-space: pre;
    clip-path: inset(0 100% 0 0);
  }

  .pc-label-bar {
    position: absolute;
    top: -6%;
    bottom: -6%;
    left: 0;
    width: 100%;
    background: var(--accent);
    box-shadow: 0 0 26px var(--accent);
    transform-origin: left center;
    transform: scaleX(0);
  }

  // Replaces the old border-bottom so the rule can be drawn in with the label
  // instead of sitting there fully formed before the text arrives.
  .perk-category-underline {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: rgba(255, 255, 255, 0.15);
    transform-origin: left center;
    transform: scaleX(0);
    will-change: transform;
    transition: background 0.25s ease;
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
    :deep(.module-display-content) {
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
