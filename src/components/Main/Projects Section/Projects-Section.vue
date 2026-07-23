<template>
  <div class="projects-section">

    <!-- centred eyebrow (design-standard header) -->
    <div class="proj-header">
      <div ref="eyebrowRef" class="proj-eyebrow">FEATURED WORK</div>
    </div>

    <!-- corner labels (system-wide label-reveal pattern) -->
    <LabelSet :labels="PROJECT_LABELS" section-id="projects" accent="#dc143c" />

    <!-- fanned card feed; each card is a numbered module frame; the centred
         card alone narrows its image and reveals a tech-icon module beside it -->
    <div ref="fanRef" class="proj-fan">
      <div
        v-for="(project, index) in projects"
        :key="project.name"
        ref="cardRefs"
        class="proj-card"
        :class="{ 'proj-card--active': fanOffset(index) === 0 }"
        :data-i="index"
        @click="onCardClick(index)"
      >
        <!-- static-visible on every nested module: their opacity is governed by
             the outer .proj-card's own GSAP-driven fan opacity, not by
             Module's own default container-tween reveal. -->
        <Module :label="`${String(index + 1).padStart(2, '0')} · PROJECT`" accent="#dc143c" :animate-height="false" static-visible class="proj-card-module">
          <div class="proj-card-body">
            <Module label="" :animate-height="false" static-visible class="proj-card-image">
              <div class="proj-card-img" :style="{ backgroundImage: `url(${project.img})` }"></div>
            </Module>
            <Module label="" :animate-height="false" static-visible class="proj-card-tech">
              <div class="proj-card-tech-inner">
                <div class="proj-card-tech-icon"><img :src="project.engine" alt="" /></div>
                <div class="proj-card-tech-icon"><img :src="project.language" alt="" /></div>
                <div class="proj-card-tech-icon"><img :src="project.platform" alt="" /></div>
              </div>
            </Module>
          </div>
        </Module>
      </div>
    </div>

    <!-- info window; name / description / year for the centred card.
         The panel enter/leave (container fade) is animated on our own plain
         DOM ref (infoPanelRef), not on Module's internal exposed element -
         so the panel's own tween can never gate or interfere with the name's
         independent label-reveal animation underneath. -->
    <div ref="infoPanelRef" class="proj-info proj-info-grid">
      <Module accent="#dc143c" static-visible :animate-height="false" class="proj-info-name">
        <template #label>01 · NOW SHOWING</template>
        <div class="proj-info-body">
          <div class="proj-h-wrap">
            <div class="proj-h-inner">
              <div ref="headingRef" class="proj-h">{{ currentProjectName }}</div>
              <div ref="headingBarRef" class="proj-h-bar"></div>
            </div>
          </div>
          <div class="proj-sub-wrap">
            <div class="proj-sub-inner">
              <div ref="yearRef" class="proj-sub proj-sub-year">{{ currentProjectYear }}</div>
              <div ref="yearBarRef" class="proj-sub-bar"></div>
            </div>
          </div>
        </div>
      </Module>
      <Module accent="#dc143c" static-visible :animate-height="false" class="proj-info-genre">
        <template #label>02 · GENRE</template>
        <div class="proj-info-body">
          <div class="proj-sub-wrap">
            <div class="proj-sub-inner">
              <div ref="genreRef" class="proj-sub proj-sub-genre">{{ currentProjectGenre }}</div>
              <div ref="genreBarRef" class="proj-sub-bar"></div>
            </div>
          </div>
        </div>
      </Module>
      <Module accent="#dc143c" static-visible :animate-height="false" class="proj-info-desc">
        <template #label>03 · DESCRIPTION</template>
        <div class="proj-info-body">
          <div class="proj-sub-wrap">
            <div class="proj-sub-inner">
              <div ref="descRef" class="proj-sub proj-sub-desc">{{ currentProjectDescription }}</div>
              <div ref="descBarRef" class="proj-sub-bar"></div>
            </div>
          </div>
        </div>
      </Module>
    </div>

    <!-- controls -->
    <div class="proj-dots">
      <div
        v-for="(project, index) in projects"
        :key="project.name + '-dot'"
        class="proj-dot"
        :class="{ active: index === fanCenter }"
        @click="centerOn(index)"
      ></div>
    </div>

    <!-- sliding detail window (opens on centered-card click) -->
    <ProjectDetailWindow />

  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
  import { gsap } from 'gsap'
  import { projects, activeProjectIndex } from '@modules/sectionsProjects'
  import ProjectDetailWindow from '@components/Main/Projects Section/Project-Detail-Window.vue'
  import LabelSet from '@components/Misc/Label-Set.vue'
  import Module from '@components/Misc/Module.vue'
  import { currentSection } from '@modules/sectionsCore'
  import { getSectionIndexById } from '@modules/sectionLookup'
  import { onSectionStatesChange } from '@modules/sectionsStateMachine'
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'
  import { rippleProjectHelix } from '@modules/miscProjectHelixCanvas'
  import { keepFullMotion } from '@modules/miscReducedMotion'
  import { isLiteMode } from '@modules/miscAnimationMode'
  import { playLiteEnter, playLiteLeave } from '@modules/animationLiteFallback'

  const projectCount = projects.length
  const projectsIndex = getSectionIndexById('projects')

  const PROJECT_LABELS = [
    { text: 'DRAG · OR · ARROWS', pos: { top: '45%', left: '50%', transform: 'translateX(-50%)' } },
  ]

  const eyebrowRef = ref<HTMLElement | null>(null)
  const infoPanelRef = ref<HTMLElement | null>(null)
  const headingRef = ref<HTMLElement | null>(null)
  const headingBarRef = ref<HTMLElement | null>(null)
  const descRef = ref<HTMLElement | null>(null)
  const descBarRef = ref<HTMLElement | null>(null)
  const yearRef = ref<HTMLElement | null>(null)
  const yearBarRef = ref<HTMLElement | null>(null)
  const genreRef = ref<HTMLElement | null>(null)
  const genreBarRef = ref<HTMLElement | null>(null)
  const fanRef = ref<HTMLElement | null>(null)
  const cardRefs = ref<HTMLElement[]>([])

  const fanCenter = ref(Math.floor(projectCount / 2))
  // The info labels render from displayedIndex, not fanCenter: fanCenter moves
  // the instant a project is selected (the fan must react immediately), but the
  // label text may only swap once the leave animation has fully hidden it -
  // otherwise the new value flashes under the outgoing reveal.
  const displayedIndex = ref(fanCenter.value)
  const currentProjectName = computed(() => projects[displayedIndex.value]?.name?.toUpperCase() ?? 'PROJECTS')
  const currentProjectDescription = computed(() => projects[displayedIndex.value]?.description ?? '')
  const currentProjectYear = computed(() => String(projects[displayedIndex.value]?.year ?? '').toUpperCase())
  const currentProjectGenre = computed(() => projects[displayedIndex.value]?.genre ?? '')

  // drag state
  let dragging = false
  let dragMoved = false
  let dragStartX = 0

  const listeners: Array<() => void> = []
  let stopSectionWatch: (() => void) | null = null
  // Handle to the delayed enter timeline so a fast leave can cancel it before its
  // deferred card/heading/strand tweens fire; otherwise they animate content back
  // in on top of the leave when the section is exited before SECTION_ENTER_DELAY.
  let feedTl: gsap.core.Timeline | null = null

  function on(target: Window | HTMLElement, type: string, handler: EventListenerOrEventListenerObject, options?: AddEventListenerOptions) {
    target.addEventListener(type, handler, options)
    listeners.push(() => target.removeEventListener(type, handler, options))
  }

  // ── fan geometry ──
  function fanDims() {
    // Fixed slot spacing, not a fan spread; only the centre ± one neighbour
    // are ever visible (see reference image), so this is just the gap between
    // those three flat slots, proportional to viewport width.
    return { slotSpacing: window.innerWidth * 0.27 }
  }

  function fanOffset(cardIndex: number) {
    let offset = cardIndex - fanCenter.value
    offset = ((offset % projectCount) + projectCount) % projectCount
    if (offset > projectCount / 2) offset -= projectCount
    return offset
  }

  // Three flat, evenly-sized slots (left / centre / right); no rotation,
  // no scale falloff, no vertical cascade. Anything beyond the immediate
  // neighbours is fully hidden off-slot, not faded into a deep fan.
  function fanTarget(offset: number) {
    const distance = Math.abs(offset)
    // Cards beyond the visible ±1 neighbours travel to a fixed off-screen rest
    // position (viewport edge + 20vw) rather than growing proportionally with
    // their fan offset; otherwise a card several slots away drifts to an
    // arbitrary point mid-transition and fades out short of the actual edge.
    const offscreenX = window.innerWidth * 0.5 + window.innerWidth * 0.2
    const x = distance > 1 ? Math.sign(offset) * offscreenX : offset * fanDims().slotSpacing
    return {
      xPercent: -50,
      yPercent: -50,
      x,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: distance > 1 ? 0 : 1,
    }
  }

  function fanStyle(card: HTMLElement, offset: number) {
    const distance = Math.abs(offset)
    card.style.zIndex = String(100 - distance * 10)
    card.style.borderColor = distance === 0 ? '#DC143C' : 'transparent'
    card.style.boxShadow = distance === 0 ? '0 30px 72px rgba(220,20,60,0.42)' : '0 22px 56px rgba(0,0,0,0.55)'
    card.style.pointerEvents = distance > 1 ? 'none' : 'auto'
  }

  function layoutFan(animate: boolean) {
    cardRefs.value.forEach((card) => {
      const offset = fanOffset(Number(card.getAttribute('data-i')))
      fanStyle(card, offset)
      const target = fanTarget(offset)
      if (animate) gsap.to(card, { ...target, duration: 1.0, ease: 'expo.out', transformOrigin: 'center bottom', overwrite: 'auto' })
      else gsap.set(card, { ...target, transformOrigin: 'center bottom' })
    })
  }

  // ── heading label reveal (system-wide label-reveal pattern; see CLAUDE.md) ──
  // A bar sweeps across the project name, covering it while the text swaps
  // underneath, then recedes to leave the new name behind.
  function playHeadingReveal(delay = 0) {
    const text = headingRef.value
    const bar = headingBarRef.value
    if (!text || !bar) return
    gsap.killTweensOf([text, bar])
    gsap.set(text, { clipPath: 'inset(0 100% 0 0)' })
    gsap.set(bar, { scaleX: 0, opacity: 1, transformOrigin: 'left center' })
    // Modules 01-03 are carved out of reduced motion (see TASKS.md) — the bar sweep
    // is how the project's name changes hands, not decoration around it.
    const timeline = keepFullMotion(gsap.timeline({ delay }))
    timeline.to(bar, { scaleX: 1, duration: 0.3, ease: 'power3.inOut' })
      .set(text, { clipPath: 'inset(0 0% 0 0)' })
      .set(bar, { transformOrigin: 'right center' })
      .to(bar, { scaleX: 0, duration: 0.36, ease: 'power3.inOut' })
      .set(bar, { opacity: 0 })
  }

  const HEADING_LEAVE_DURATION = 0.25

  // Leave re-collapses instantly, no stagger; per the enter/leave asymmetry rule.
  // Returns the leave duration so callers can gate the next reveal on it.
  function playHeadingLeave() {
    const text = headingRef.value
    const bar = headingBarRef.value
    if (!text || !bar) return
    gsap.killTweensOf([text, bar])
    keepFullMotion(gsap.to(text, { clipPath: 'inset(0 100% 0 0)', duration: HEADING_LEAVE_DURATION, ease: 'power2.in', overwrite: 'auto' }))
    gsap.set(bar, { opacity: 0 })
  }

  // Description + year underneath the heading, same label-reveal pattern
  // (see CLAUDE.md), staggered slightly after the heading's own reveal.
  function playSubReveal(delay = 0) {
    const pairs: [HTMLElement | null, HTMLElement | null][] = [
      [descRef.value, descBarRef.value],
      [yearRef.value, yearBarRef.value],
      [genreRef.value, genreBarRef.value],
    ]
    pairs.forEach(([text, bar], i) => {
      if (!text || !bar) return
      gsap.killTweensOf([text, bar])
      gsap.set(text, { clipPath: 'inset(0 100% 0 0)' })
      gsap.set(bar, { scaleX: 0, opacity: 1, transformOrigin: 'left center' })
      const timeline = keepFullMotion(gsap.timeline({ delay: delay + i * 0.08 }))
      timeline.to(bar, { scaleX: 1, duration: 0.36, ease: 'power3.inOut' })
        .set(text, { clipPath: 'inset(0 0% 0 0)' })
        .set(bar, { transformOrigin: 'right center' })
        .to(bar, { scaleX: 0, duration: 0.42, ease: 'power3.inOut' })
        .set(bar, { opacity: 0 })
    })
  }

  function playSubLeave() {
    const elements = [descRef.value, yearRef.value, genreRef.value]
    const bars = [descBarRef.value, yearBarRef.value, genreBarRef.value]
    gsap.killTweensOf([...elements, ...bars])
    elements.forEach((text) => { if (text) keepFullMotion(gsap.to(text, { clipPath: 'inset(0 100% 0 0)', duration: 0.25, ease: 'power2.in', overwrite: 'auto' })) })
    bars.forEach((bar) => { if (bar) gsap.set(bar, { opacity: 0 }) })
  }

  // Bumped on every centerOn call (and on section leave). All info labels run
  // one strict sequence per cycle: leave animation → swap displayed values →
  // enter animation. A queued step from a superseded cycle bails out instead
  // of flashing stale content; the replacing cycle's own leave picks the
  // labels up from wherever the killed tweens left them (mid-enter included),
  // so rapid cycling stays continuous instead of snapping or hiding.
  let labelRequestToken = 0

  function centerOn(targetIndex: number) {
    const next = ((targetIndex % projectCount) + projectCount) % projectCount
    if (next === fanCenter.value) return

    // Cards move the instant the switch is triggered; the fan is the primary
    // motion and must never wait on the info text.
    fanCenter.value = next
    layoutFan(true)
    rippleProjectHelix()

    // Leave first; the label text must not change while it is still visible.
    const token = ++labelRequestToken
    playHeadingLeave()
    playSubLeave()
    // Exempt alongside the leave it waits on: a collapsed delay against a real-time
    // leave would swap the text while the old value is still on screen.
    keepFullMotion(gsap.delayedCall(HEADING_LEAVE_DURATION, () => {
      if (token !== labelRequestToken) return
      // Leave finished with the old values fully hidden; only now swap the
      // rendered text to the newly selected project, then reveal it.
      displayedIndex.value = fanCenter.value
      nextTick(() => {
        if (token !== labelRequestToken) return
        playHeadingReveal(0)
        playSubReveal(0.08)
      })
    }))
  }
  function feedNext() { centerOn(fanCenter.value + 1) }
  function feedPrev() { centerOn(fanCenter.value - 1) }

  // ── pointer tilt + parallax (ported from the Sandbox section) ──
  function initCardTilt() {
    cardRefs.value.forEach((card) => {
      on(card, 'mousemove', (event) => {
        const mouseEvent = event as MouseEvent
        const bounds = card.getBoundingClientRect()
        const pointerX = (mouseEvent.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)
        const pointerY = (mouseEvent.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)
        // tilt toward the cursor; fan layout owns x/y/scale/rotationZ, so no overwrite
        gsap.to(card, { rotationY: pointerX * 14, rotationX: -pointerY * 14, duration: 0.4, ease: 'power3.out' })
      })
      on(card, 'mouseleave', () => {
        gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' })
      })
    })
  }

  function onCardClick(cardIndex: number) {
    if (dragMoved) return
    // Off-centre card → bring it to the front. Centre card → open the detail window.
    if (fanOffset(cardIndex) !== 0) { centerOn(cardIndex); return }
    activeProjectIndex.value = cardIndex
  }

  // ── enter reveal (adapted from the design's playFeed) ──
  function playFeed() {
    const eyebrow = eyebrowRef.value
    const panel = infoPanelRef.value
    const cards = cardRefs.value

    fanCenter.value = Math.floor(projectCount / 2)
    // Section enter starts from a fully hidden state; sync the rendered label
    // values immediately and invalidate any pending centerOn label sequence.
    displayedIndex.value = fanCenter.value
    labelRequestToken++

    feedTl?.kill()
    gsap.killTweensOf([eyebrow, panel, fanRef.value, ...cards])
    gsap.set(eyebrow, { y: -20, opacity: 0 })
    gsap.set(panel, { opacity: 0, y: 40, scale: 0.96 })
    gsap.set(cards, { xPercent: -50, yPercent: -50, x: 0, y: 180, opacity: 0, scale: 0.7, rotation: 0, rotationX: 0, rotationY: 0 })

    // Lite: the cards snap straight to their laid-out fan — the arrangement is
    // information, the per-card flight in is not — and the fan arrives as one
    // element, so the reveal costs a single tween instead of one per card.
    if (isLiteMode.value) {
      cards.forEach((card) => {
        const offset = fanOffset(Number(card.getAttribute('data-i')))
        fanStyle(card, offset)
        gsap.set(card, { ...fanTarget(offset), transformOrigin: 'center bottom' })
      })
      playLiteEnter([eyebrow, panel, fanRef.value])
      playHeadingReveal(SECTION_ENTER_DELAY)
      playSubReveal(SECTION_ENTER_DELAY + 0.1)
      return
    }

    // Wait for the section-cut curtain to fully close before fanning the feed in,
    // so the reveal happens behind the curtain rather than alongside it.
    const timeline = gsap.timeline({ delay: SECTION_ENTER_DELAY })
    feedTl = timeline
    timeline.to(eyebrow, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1)
    timeline.to(panel, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, 0.18)
    timeline.add(() => playHeadingReveal(0), 0.32)
    timeline.add(() => playSubReveal(0.1), 0.32)
    timeline.add(() => {
      const ordered = cards.slice().sort(
        (first, second) => Math.abs(fanOffset(Number(first.getAttribute('data-i')))) - Math.abs(fanOffset(Number(second.getAttribute('data-i'))))
      )
      ordered.forEach((card, index) => {
        const offset = fanOffset(Number(card.getAttribute('data-i')))
        fanStyle(card, offset)
        gsap.to(card, { ...fanTarget(offset), duration: 0.7, ease: 'back.out(1.4)', delay: index * 0.06, transformOrigin: 'center bottom' })
      })
    }, 0.35)
  }

  function playLeave() {
    const eyebrow = eyebrowRef.value
    const panel = infoPanelRef.value
    const cards = cardRefs.value

    // Cancel a still-pending enter timeline first; its deferred callback would
    // otherwise re-spawn card/heading tweens after this leave has run.
    feedTl?.kill()
    feedTl = null
    // Invalidate any pending centerOn label sequence so it can't reveal text
    // after the section has left.
    labelRequestToken++
    gsap.killTweensOf([eyebrow, panel, fanRef.value, ...cards])
    playHeadingLeave()
    playSubLeave()

    // The fan leaves as one element too, so the cards keep the transforms that
    // encode their positions; the next enter re-lays them out from scratch.
    if (isLiteMode.value) {
      playLiteLeave([eyebrow, panel, fanRef.value])
      return
    }

    gsap.to(eyebrow, { y: -20, opacity: 0, duration: 0.22, ease: 'power3.in', overwrite: 'auto' })
    gsap.to(panel, { opacity: 0, y: 40, scale: 0.96, duration: 0.24, ease: 'power2.in', overwrite: 'auto' })
    gsap.to(cards, { opacity: 0, y: 180, scale: 0.7, duration: 0.18, ease: 'power3.in', overwrite: 'auto' })
  }

  // ── interactions ──
  function initDrag() {
    const fan = fanRef.value
    if (!fan) return
    on(fan, 'mousedown', (event) => {
      dragging = true
      dragMoved = false
      dragStartX = (event as MouseEvent).clientX
    })
    on(window, 'mousemove', (event) => {
      if (!dragging) return
      if (Math.abs((event as MouseEvent).clientX - dragStartX) > 6) dragMoved = true
    })
    on(window, 'mouseup', (event) => {
      if (!dragging) return
      dragging = false
      const dragDistanceX = (event as MouseEvent).clientX - dragStartX
      if (dragDistanceX > 45) feedPrev()
      else if (dragDistanceX < -45) feedNext()
    })
    on(window, 'keydown', (event) => {
      if (currentSection.value !== projectsIndex) return
      if (activeProjectIndex.value !== null) return
      const key = (event as KeyboardEvent).key
      if (key === 'ArrowLeft') feedPrev()
      else if (key === 'ArrowRight') feedNext()
    })
  }

  onMounted(() => {
    layoutFan(false)
    initDrag()
    if (!isLiteMode.value) initCardTilt()

    stopSectionWatch = onSectionStatesChange((meta) => {
      if (meta.isLeavingSection(projectsIndex)) playLeave()
      else if (meta.isEnteringSection(projectsIndex)) playFeed()
    })

    if (currentSection.value === projectsIndex) playFeed()
  })

  onBeforeUnmount(() => {
    stopSectionWatch?.()
    stopSectionWatch = null
    feedTl?.kill()
    feedTl = null
    listeners.forEach((off) => off())
    listeners.length = 0
  })
</script>

<style scoped lang="scss">
  @use "@styleVariables" as *;

  .projects-section {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    // Section wrappers collapse to 0 height and stack below the full-height Perks
    // wrapper, landing one viewport down; pull back up to fill the viewport.
    transform: translateY(-100vh);
    // Transparent so the animated red section-background panels (rendered behind
    // by Section-Cover-Slice) remain visible behind the fan.
    background: transparent;
    overflow: hidden;
  }

  // ── centred eyebrow header (design-standard) ──
  .proj-header {
    position: absolute;
    top: 4%;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 6;
  }

  .proj-eyebrow {
    font-family: 'Audiowide';
    font-size: 11px;
    letter-spacing: 5px;
    color: #ff506e;
    will-change: transform, opacity;
  }

  // ── info window (Module) ──
  .proj-info {
    position: absolute;
    left: 4%;
    top: 15%;
    width: min(40vw, 570px);
    z-index: 6;
  }

  // Name/year - Genre - Description laid out side by side, description gets
  // double the width since it carries the most text.
  .proj-info-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr;
    gap: 14px;
    align-items: stretch;
    width: min(62vw, 1900px);
    height: min(30vh, 230px);

    :deep(.module-content) {
      padding: 52px 18px 18px;
    }

    :deep(.module-label) {
      font-size: 11px;
      padding: 16px 18px;
    }
  }

  .proj-info-body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    // Fill the module's content box so the release year can be pinned to the
    // bottom regardless of how tall the project name wraps.
    flex: 1;
    min-height: 0;
  }

  // Release year sits at the bottom of the name module; its position stays
  // fixed no matter how many lines the project name occupies above it.
  .proj-info-name .proj-sub-wrap {
    margin-top: auto;
  }

  // ── heading label reveal (system-wide label-reveal pattern) ──
  .proj-h-wrap {
    position: relative;
    display: inline-block;
    overflow: hidden;
  }

  .proj-h-inner {
    position: relative;
    display: inline-block;
  }

  .proj-h {
    font-family: 'Wosker';
    font-size: clamp(38px, 4.2vw, 62px);
    line-height: 1;
    color: #fff;
    will-change: transform;
    clip-path: inset(0 100% 0 0);
  }

  .proj-h-bar {
    position: absolute;
    top: -4%;
    bottom: -4%;
    left: 0;
    width: 100%;
    background: #ff506e;
    box-shadow: 0 0 26px #ff506e;
    border-radius: 0;
    transform-origin: left center;
    transform: scaleX(0);
  }

  // ── description / year (same label-reveal pattern, underneath the name) ──
  .proj-sub-wrap {
    position: relative;
    display: inline-block;
    overflow: hidden;
    margin-top: 4px;
  }

  .proj-sub-inner {
    position: relative;
    display: inline-block;
  }

  .proj-sub {
    font-family: Mono, monospace;
    line-height: 1.3;
    color: #d8c3c8;
    will-change: transform;
    clip-path: inset(0 100% 0 0);
  }

  .proj-sub-desc {
    font-size: clamp(14px, 1.2vw, 18px);
    max-width: 36vw;
  }

  .proj-sub-year {
    font-size: 13px;
    letter-spacing: 3px;
    color: #ff7588;
  }

  .proj-sub-genre {
    font-size: clamp(13px, 1.1vw, 16px);
    color: #d8c3c8;
  }

  .proj-sub-bar {
    position: absolute;
    top: -8%;
    bottom: -8%;
    left: 0;
    width: 100%;
    background: #ff506e;
    box-shadow: 0 0 18px #ff506e;
    border-radius: 0;
    transform-origin: left center;
    transform: scaleX(0);
  }

  // ── fan ──
  .proj-fan {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 30%;
    z-index: 5;
    perspective: 1400px;
  }

  .proj-card {
    position: absolute;
    left: 50%;
    top: 50%;
    // Landscape module-frame proportions (reference image), not a portrait
    // poster; width grows further still for the centred/active card to make
    // room for the tech-icon module beside its (now narrower) image.
    width: clamp(320px, 25vw, 430px);
    height: clamp(240px, 19vw, 340px);
    border-radius: 18px;
    background: #1b1012;
    border: 2px solid transparent;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
    cursor: pointer;
    will-change: transform;
    transition: width 0.4s ease;
    // 3D stage for the pointer-tilt; children pop at different depths (parallax).
    // No overflow:hidden here, as it would flatten the 3D children.
    transform-style: preserve-3d;
  }

  .proj-card--active {
    width: clamp(410px, 33vw, 560px);
  }

  // ── card module frame; fills the card, supplies the numbered "0X · PROJECT"
  // chrome shared with every other window in the app ──
  .proj-card-module {
    position: absolute;
    inset: 0;
    // Carries the pointer-tilt parallax down from .proj-card; without
    // preserve-3d here the nested image/tech modules' translateZ below gets
    // flattened and the card tilts as one flat plane instead of layers popping
    // at their own depth.
    transform-style: preserve-3d;
    // Module clips its content by default, and any overflow other than
    // visible forces transform-style back to flat — which is what was killing
    // the parallax. The card's own rounded frame does the clipping instead.
    overflow: visible;

    :deep(.module-content) {
      padding: 32px 8px 8px;
      // Sits between the frame and .proj-card-body in the 3D chain; a flat link
      // anywhere along it collapses every depth below.
      transform-style: preserve-3d;
    }

    :deep(.module-label) {
      font-size: 9px;
      padding: 10px 12px;
      transform: translateZ(45px);
    }
  }

  .proj-card-body {
    display: flex;
    flex-direction: row;
    height: 100%;
    gap: 8px;
    transform-style: preserve-3d;
  }

  // Image nested module; full width until the card becomes centred, then
  // narrows to make room for the tech-icon module beside it. Sits nearest the
  // card plane so the tech module (below) pops further forward on tilt.
  .proj-card-image {
    flex: 1 1 100%;
    min-width: 0;
    transition: flex-basis 0.4s ease;
    transform: translateZ(15px);

    :deep(.module-content) {
      padding: 0;
    }
  }

  .proj-card-img {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    border-radius: 6px;
  }

  // Tech-icon nested module; collapsed to nothing for off-centre cards,
  // revealed only for the centred (active) one. The module itself is
  // static-visible (always opacity:1 via inline style), so width/flex-basis
  // do the actual hiding here; the icon fade lives on the inner wrapper below.
  .proj-card-tech {
    flex: 0 0 0%;
    width: 0;
    overflow: hidden;
    transition: flex-basis 0.4s ease, width 0.4s ease;
    transform: translateZ(35px);

    :deep(.module-content) {
      padding: 8px;
    }
  }

  .proj-card-tech-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 100%;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .proj-card--active {
    .proj-card-image {
      flex-basis: 64%;
    }

    .proj-card-tech {
      flex: 0 0 32%;
      width: auto;
    }

    .proj-card-tech-inner {
      opacity: 1;
      transition-delay: 0.15s;
    }
  }

  .proj-card-tech-icon {
    flex: 0 0 auto;
    width: clamp(38px, 4.2vw, 62px);
    height: clamp(38px, 4.2vw, 62px);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid #3a3a3a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  // ── controls ──
  .proj-dots {
    position: absolute;
    bottom: 4%;
    left: 0;
    right: 0;
    z-index: 7;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
  }

  .proj-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #5a2630;
    transition: all 0.3s;
    cursor: pointer;

    &.active {
      background: #dc143c;
      transform: scale(1.5);
    }
  }
</style>
