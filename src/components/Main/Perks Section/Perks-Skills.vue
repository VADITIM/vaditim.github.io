<template>
  <!-- Quick-glance skills board: one Module-Display per perk category, each
       holding a flex grid of clickable skill cards; one card per label.
       Clicking a card opens ITS OWN category's detail popup right next to
       that module (not one shared panel), game-character-sheet style rather
       than a graph/skill-tree. -->
  <div class="perk-frame">
    <div ref="rootRef" class="perk-outer-wrap">
      <!-- one outer module nests the 3 category modules inside it; each
           category module still nests its own skill entries. -->
      <ModuleDisplay
        label="SKILLS"
        accent="#5bfd5b"
        static-visible
        :animate-height="false"
        class="perk-outer"
      >
        <div class="perk-grid">
          <div v-for="(perk, pi) in perkGraph" :key="perk.id" class="perk-row">
            <ModuleDisplay
              :label="`0${pi + 1} · ${perk.label.toUpperCase()}`"
              :accent="perk.color"
              static-visible
              :animate-height="false"
              class="perk-module"
            >
              <div class="perk-skills">
                <button
                  v-for="child in perk.children"
                  :key="child"
                  class="perk-skill"
                  :class="{ selected: selectedSkill === child }"
                  :style="{ '--accent': perk.color }"
                  @click="onChildClick(child)"
                >
                  {{ child }}
                </button>
              </div>
            </ModuleDisplay>

            <!-- this category's own detail popup; only ever shows content for
                 one of ITS skills, positioned flush right of its own module.
                 Reads displayedSkill[perk.id], its own independent state, so a
                 click in a different module can never rewrite this one's text
                 while it's still mid-leave-animation. -->
            <div class="perk-detail" :data-perk="perk.id">
              <ModuleDisplay
                :label="`${(displayedSkill[perk.id] ?? '').toUpperCase()}`"
                :accent="perk.color"
                static-visible
                :animate-height="false"
                class="perk-detail-module"
              >
                <div class="perk-detail-body">
                  <div class="perk-detail-title">{{ displayedSkill[perk.id] }}</div>
                  <div class="perk-detail-text">{{ perkInfo[displayedSkill[perk.id] ?? ''] ?? '' }}</div>
                </div>
              </ModuleDisplay>
            </div>
          </div>
        </div>
      </ModuleDisplay>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onBeforeUnmount, reactive, ref } from 'vue'
  import { gsap } from 'gsap'
  import ModuleDisplay from '@components/Misc/Module-Display.vue'
  import { perkGraph, perkInfo } from '@modules/sectionsPerksGraph'
  import { onSectionStatesChange } from '@modules/sectionsStateMachine'
  import { getSectionIndexById } from '@modules/sectionLookup'
  import { currentSection } from '@modules/sectionsCore'
  import { finished } from '@modules/sectionsStateMachine'
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'

  gsap.defaults({ immediateRender: false })

  const rootRef = ref<HTMLElement | null>(null)
  // Which skill is currently "open" overall (drives the .selected class on
  // skill cards and same-skill-toggle-closes logic).
  const selectedSkill = ref<string | null>(null)
  // Per-category last-shown skill; each popup's own state, only written when
  // its own category opens, so it never gets overwritten by another
  // category's click while it's still animating out.
  const displayedSkill = reactive<Record<string, string | null>>(
    Object.fromEntries(perkGraph.map((perk) => [perk.id, null]))
  )
  const perksIndex = getSectionIndexById('perks')
  let cleanupStates: (() => void) | null = null

  function perkIdForSkill(skill: string): string | null {
    return perkGraph.find((perk) => perk.children.includes(skill))?.id ?? null
  }

  function detailElementFor(perkId: string) {
    return rootRef.value?.querySelector<HTMLElement>(`.perk-detail[data-perk="${perkId}"]`) ?? null
  }

  // ── per-module detail popup ──
  function enterDetail(perkId: string) {
    const el = detailElementFor(perkId)
    if (!el) return
    gsap.killTweensOf(el)
    gsap.fromTo(el,
      { yPercent: -50, x: -40, opacity: 0, scale: 0.94 },
      { yPercent: -50, x: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)', overwrite: 'auto' }
    )
  }

  function leaveDetail(perkId: string, instant = false, onDone?: () => void) {
    const el = detailElementFor(perkId)
    if (!el) { onDone?.(); return }
    gsap.killTweensOf(el)
    if (instant) {
      gsap.set(el, { yPercent: -50, x: -40, opacity: 0, scale: 0.94 })
      onDone?.()
      return
    }
    gsap.to(el, {
      yPercent: -50, x: -24, opacity: 0, scale: 0.96,
      duration: 0.2, ease: 'power2.in', overwrite: 'auto',
      onComplete: onDone,
    })
  }

  function closeDetail(instant = false) {
    const openPerkId = selectedSkill.value ? perkIdForSkill(selectedSkill.value) : null
    if (!openPerkId) { selectedSkill.value = null; return }
    leaveDetail(openPerkId, instant, () => { selectedSkill.value = null })
  }

  function onChildClick(child: string) {
    if (selectedSkill.value === child) { closeDetail(); return }
    const newPerkId = perkIdForSkill(child)
    const oldPerkId = selectedSkill.value ? perkIdForSkill(selectedSkill.value) : null
    selectedSkill.value = child
    if (!newPerkId) return

    if (!oldPerkId) {
      // Nothing was open; just enter fresh.
      displayedSkill[newPerkId] = child
      enterDetail(newPerkId)
    } else if (oldPerkId === newPerkId) {
      // Same category's popup: it's the same element, so the swap must be
      // sequential; play the old skill's leave out in full, only then swap
      // the text and play the new skill's enter. Running both at once on one
      // element would just cut the leave short instead of animating it.
      leaveDetail(oldPerkId, false, () => {
        displayedSkill[newPerkId] = child
        enterDetail(newPerkId)
      })
    } else {
      // Different category's popup; separate elements, so the old one can
      // leave and the new one can enter independently, at the same time. The
      // old category's displayedSkill is left untouched (it's mid-leave,
      // then hidden) rather than cleared, so it never flashes new content.
      displayedSkill[newPerkId] = child
      leaveDetail(oldPerkId)
      enterDetail(newPerkId)
    }
  }

  // ── section enter/leave (Perks content enters from off-screen left) ──
  function modules() {
    return rootRef.value ? [...rootRef.value.querySelectorAll<HTMLElement>('.perk-module')] : []
  }

  function skillElements() {
    return rootRef.value ? [...rootRef.value.querySelectorAll<HTMLElement>('.perk-skill')] : []
  }

  function detailElements() {
    return rootRef.value ? [...rootRef.value.querySelectorAll<HTMLElement>('.perk-detail')] : []
  }

  function playEnter() {
    const mods = modules()
    const skills = skillElements()
    gsap.killTweensOf([...mods, ...skills])
    // Modules slide+pop in from the left…
    gsap.fromTo(mods,
      { x: '-120%', opacity: 0, scale: 0.92 },
      { x: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, delay: SECTION_ENTER_DELAY, ease: 'back.out(1.4)', overwrite: 'auto' }
    )
    // …then each skill card pops into place inside its module.
    gsap.fromTo(skills,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.04, delay: SECTION_ENTER_DELAY + 0.4, ease: 'back.out(2.2)', overwrite: 'auto' }
    )
  }

  function playLeave() {
    const mods = modules()
    const skills = skillElements()
    gsap.killTweensOf([...mods, ...skills])
    closeDetail(true)
    // Everything animated on enter leaves too: skill cards shrink, modules
    // slide out. Leave is snappier than enter, no stagger.
    gsap.to(skills, { scale: 0, opacity: 0, duration: 0.18, ease: 'power2.in', overwrite: 'auto' })
    gsap.to(mods, {
      x: '-120%', opacity: 0, scale: 0.92,
      duration: 0.3,
      stagger: 0.06,
      ease: 'power2.in',
      overwrite: 'auto',
    })
  }

  onMounted(() => {
    gsap.set(modules(), { x: '-120%', opacity: 0, scale: 0.92 })
    gsap.set(skillElements(), { scale: 0, opacity: 0 })
    gsap.set(detailElements(), { yPercent: -50, x: -40, opacity: 0, scale: 0.94 })

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
  })
</script>

<style scoped lang="scss">
  @use "@styleVariables" as *;

  // Section layer wrappers collapse to 0 height; re-establish a
  // full-viewport coordinate space (same workaround as Projects-Section).
  .perk-frame {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;

    > * {
      pointer-events: auto;
    }
  }

  // Outer frame positions the whole nested board; the outer module itself
  // just wraps and sizes to its content.
  .perk-outer-wrap {
    position: absolute;
    left: 5%;
    top: 15%;
    z-index: 5;
  }

  .perk-outer {
    will-change: transform, opacity;
    // Detail popups sit outside a perk-row's own bounds, flush right of it;
    // the base module-display's overflow:hidden would otherwise clip them.
    overflow: visible;

    :deep(.module-display-content) {
      padding: 56px 26px 26px;
      overflow: visible;
    }

    :deep(.module-display-label) {
      font-size: 13px;
    }
  }

  // Category modules stack under each other inside the outer module.
  .perk-grid {
    display: flex;
    flex-direction: column;
    gap: clamp(20px, 2.4vw, 36px);
    width: clamp(500px, 18vw, 1000px);
  }

  // Each row holds one module and (positioned absolutely, so it never
  // affects the row's own width) that module's own detail popup.
  .perk-row {
    position: relative;
  }

  .perk-module {
    will-change: transform, opacity;

    :deep(.module-display-content) {
      padding: 52px 22px 22px;
    }

    :deep(.module-display-label) {
      font-size: 13px;
    }
  }

  // Skill entries wrap so more than one can share a line.
  .perk-skills {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .perk-skill {
    --accent: #ffdd1b;
    appearance: none;
    background: rgba(24, 24, 24, 0.92);
    border: 1.5px solid color-mix(in srgb, var(--accent) 65%, transparent);
    border-radius: 8px;
    color: #fff;
    font-family: 'Mono';
    font-size: clamp(14px, 1.15vw, 17px);
    letter-spacing: 0.5px;
    padding: 0.75em 1.1em;
    cursor: pointer;
    @extend .disable-selection;

    transition:
      background 0.25s ease,
      box-shadow 0.25s ease,
      border-color 0.25s ease;

    &:hover,
    &.selected {
      background: color-mix(in srgb, var(--accent) 22%, rgba(24, 24, 24, 0.92));
      border-color: var(--accent);
      box-shadow: 0 0 16px color-mix(in srgb, var(--accent) 45%, transparent);
    }
  }

  // ── per-module detail popup; sits directly to the right of its own
  // module, not the whole grid. Vertical centring lives in the GSAP yPercent
  // (not a CSS transform) so the enter/leave x/scale tweens can't clobber it.
  .perk-detail {
    position: absolute;
    left: calc(100% + clamp(20px, 2.4vw, 36px));
    top: 50%;
    width: clamp(220px, 18vw, 340px);
    z-index: 6;
    opacity: 0;
    pointer-events: none;
    will-change: transform, opacity;
  }

  .perk-detail-module {
    :deep(.module-display-content) {
      padding: 44px 18px 18px;
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
