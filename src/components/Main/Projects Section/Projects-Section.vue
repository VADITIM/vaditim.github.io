<template>
  <div class="projects-section">

    <!-- centred eyebrow (design-standard header) -->
    <div class="proj-header">
      <div ref="eyebrowRef" class="proj-eyebrow">FEATURED WORK</div>
    </div>

    <!-- corner labels (system-wide label-reveal pattern) -->
    <LabelSet :labels="PROJECT_LABELS" section-id="projects" accent="#dc143c" />

    <!-- fanned card feed — each card is a numbered module frame; the centred
         card alone narrows its image and reveals a tech-icon module beside it -->
    <div ref="fanRef" class="proj-fan">
      <div
        v-for="(project, i) in projects"
        :key="project.name"
        ref="cardRefs"
        class="proj-card"
        :class="{ 'proj-card--active': fanOffset(i) === 0 }"
        :data-i="i"
        @click="onCardClick(i)"
      >
        <!-- static-visible on every nested module: their opacity is governed by
             the outer .proj-card's own GSAP-driven fan opacity, not by
             ModuleDisplay's own default container-tween reveal. -->
        <ModuleDisplay :label="`${String(i + 1).padStart(2, '0')} · PROJECT`" accent="#dc143c" :animate-height="false" static-visible class="proj-card-module">
          <div class="proj-card-body">
            <ModuleDisplay label="" :animate-height="false" static-visible class="proj-card-image">
              <div class="proj-card-img" :style="{ backgroundImage: `url(${project.img})` }"></div>
            </ModuleDisplay>
            <ModuleDisplay label="" :animate-height="false" static-visible class="proj-card-tech">
              <div class="proj-card-tech-inner">
                <div class="proj-card-tech-icon"><img :src="project.engine" alt="" /></div>
                <div class="proj-card-tech-icon"><img :src="project.language" alt="" /></div>
                <div class="proj-card-tech-icon"><img :src="project.platform" alt="" /></div>
              </div>
            </ModuleDisplay>
          </div>
        </ModuleDisplay>
      </div>
    </div>

    <!-- info window — name / description / year for the centred card.
         The panel enter/leave (container fade) is animated on our own plain
         DOM ref (infoPanelRef), not on ModuleDisplay's internal exposed el —
         so the panel's own tween can never gate or interfere with the name's
         independent label-reveal animation underneath. -->
    <div ref="infoPanelRef" class="proj-info">
      <ModuleDisplay accent="#dc143c" static-visible :animate-height="false">
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
              <div ref="descRef" class="proj-sub proj-sub-desc">{{ currentProjectDescription }}</div>
              <div ref="descBarRef" class="proj-sub-bar"></div>
            </div>
          </div>
          <div class="proj-sub-wrap">
            <div class="proj-sub-inner">
              <div ref="yearRef" class="proj-sub proj-sub-year">{{ currentProjectYear }}</div>
              <div ref="yearBarRef" class="proj-sub-bar"></div>
            </div>
          </div>
        </div>
      </ModuleDisplay>
    </div>

    <!-- controls -->
    <div class="proj-dots">
      <div
        v-for="(project, i) in projects"
        :key="project.name + '-dot'"
        class="proj-dot"
        :class="{ active: i === fanCenter }"
        @click="centerOn(i)"
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
  import ModuleDisplay from '@components/Misc/Module-Display.vue'
  import { currentSection } from '@modules/sectionsCore'
  import { getSectionIndexById } from '@modules/sectionLookup'
  import { onSectionStatesChange } from '@modules/sectionsStateMachine'
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'

  const N = projects.length
  const projectsIndex = getSectionIndexById('projects')

  const PROJECT_LABELS = [
    { text: 'DRAG · OR · ARROWS', pos: { top: '92%', left: '10%' } },
  ]

  const eyebrowRef = ref<HTMLElement | null>(null)
  const infoPanelRef = ref<HTMLElement | null>(null)
  const headingRef = ref<HTMLElement | null>(null)
  const headingBarRef = ref<HTMLElement | null>(null)
  const descRef = ref<HTMLElement | null>(null)
  const descBarRef = ref<HTMLElement | null>(null)
  const yearRef = ref<HTMLElement | null>(null)
  const yearBarRef = ref<HTMLElement | null>(null)
  const fanRef = ref<HTMLElement | null>(null)
  const cardRefs = ref<HTMLElement[]>([])

  const fanCenter = ref(Math.floor(N / 2))
  const currentProjectName = computed(() => projects[fanCenter.value]?.name?.toUpperCase() ?? 'PROJECTS')
  const currentProjectDescription = computed(() => projects[fanCenter.value]?.description ?? '')
  const currentProjectYear = computed(() => String(projects[fanCenter.value]?.year ?? '').toUpperCase())

  // drag state
  let dragging = false
  let dragMoved = false
  let dragStartX = 0

  const listeners: Array<() => void> = []
  let stopSectionWatch: (() => void) | null = null
  // Handle to the delayed enter timeline so a fast leave can cancel it before its
  // deferred card/heading/strand tweens fire — otherwise they animate content back
  // in on top of the leave when the section is exited before SECTION_ENTER_DELAY.
  let feedTl: gsap.core.Timeline | null = null

  function on(target: Window | HTMLElement, type: string, handler: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) {
    target.addEventListener(type, handler, opts)
    listeners.push(() => target.removeEventListener(type, handler, opts))
  }

  // ── fan geometry ──
  function fanDims() {
    const h = window.innerHeight
    // Fixed slot spacing, not a fan spread — only the centre ± one neighbour
    // are ever visible (see reference image), so this is just the gap between
    // those three flat slots, proportional to viewport width.
    return { SX: window.innerWidth * 0.27 }
  }

  function fanOffset(k: number) {
    let d = k - fanCenter.value
    d = ((d % N) + N) % N
    if (d > N / 2) d -= N
    return d
  }

  // Three flat, evenly-sized slots (left / centre / right) — no rotation,
  // no scale falloff, no vertical cascade. Anything beyond the immediate
  // neighbours is fully hidden off-slot, not faded into a deep fan.
  function fanTarget(o: number) {
    const ao = Math.abs(o)
    return {
      xPercent: -50,
      yPercent: -50,
      x: o * fanDims().SX,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: ao > 1 ? 0 : 1,
    }
  }

  function fanStyle(card: HTMLElement, o: number) {
    const ao = Math.abs(o)
    card.style.zIndex = String(100 - ao * 10)
    card.style.borderColor = ao === 0 ? '#DC143C' : 'transparent'
    card.style.boxShadow = ao === 0 ? '0 30px 72px rgba(220,20,60,0.42)' : '0 22px 56px rgba(0,0,0,0.55)'
    card.style.pointerEvents = ao > 1 ? 'none' : 'auto'
  }

  function layoutFan(animate: boolean) {
    cardRefs.value.forEach((card) => {
      const o = fanOffset(Number(card.getAttribute('data-i')))
      fanStyle(card, o)
      const t = fanTarget(o)
      if (animate) gsap.to(card, { ...t, duration: 1.0, ease: 'expo.out', transformOrigin: 'center bottom', overwrite: 'auto' })
      else gsap.set(card, { ...t, transformOrigin: 'center bottom' })
    })
  }

  // ── heading label reveal (system-wide label-reveal pattern — see CLAUDE.md) ──
  // A bar sweeps across the project name, covering it while the text swaps
  // underneath, then recedes to leave the new name behind.
  function playHeadingReveal(delay = 0) {
    const text = headingRef.value
    const bar = headingBarRef.value
    if (!text || !bar) return
    gsap.killTweensOf([text, bar])
    gsap.set(text, { clipPath: 'inset(0 100% 0 0)' })
    gsap.set(bar, { scaleX: 0, opacity: 1, transformOrigin: 'left center' })
    const tl = gsap.timeline({ delay })
    tl.to(bar, { scaleX: 1, duration: 0.3, ease: 'power3.inOut' })
      .set(text, { clipPath: 'inset(0 0% 0 0)' })
      .set(bar, { transformOrigin: 'right center' })
      .to(bar, { scaleX: 0, duration: 0.36, ease: 'power3.inOut' })
      .set(bar, { opacity: 0 })
  }

  // Leave re-collapses instantly, no stagger — per the enter/leave asymmetry rule.
  function playHeadingLeave() {
    const text = headingRef.value
    const bar = headingBarRef.value
    if (!text || !bar) return
    gsap.killTweensOf([text, bar])
    gsap.to(text, { clipPath: 'inset(0 100% 0 0)', duration: 0.25, ease: 'power2.in', overwrite: 'auto' })
    gsap.set(bar, { opacity: 0 })
  }

  // Description + year underneath the heading, same label-reveal pattern
  // (see CLAUDE.md), staggered slightly after the heading's own reveal.
  function playSubReveal(delay = 0) {
    const pairs: [HTMLElement | null, HTMLElement | null][] = [
      [descRef.value, descBarRef.value],
      [yearRef.value, yearBarRef.value],
    ]
    pairs.forEach(([text, bar], i) => {
      if (!text || !bar) return
      gsap.killTweensOf([text, bar])
      gsap.set(text, { clipPath: 'inset(0 100% 0 0)' })
      gsap.set(bar, { scaleX: 0, opacity: 1, transformOrigin: 'left center' })
      const tl = gsap.timeline({ delay: delay + i * 0.08 })
      tl.to(bar, { scaleX: 1, duration: 0.36, ease: 'power3.inOut' })
        .set(text, { clipPath: 'inset(0 0% 0 0)' })
        .set(bar, { transformOrigin: 'right center' })
        .to(bar, { scaleX: 0, duration: 0.42, ease: 'power3.inOut' })
        .set(bar, { opacity: 0 })
    })
  }

  function playSubLeave() {
    const els = [descRef.value, yearRef.value]
    const bars = [descBarRef.value, yearBarRef.value]
    gsap.killTweensOf([...els, ...bars])
    els.forEach((text) => { if (text) gsap.to(text, { clipPath: 'inset(0 100% 0 0)', duration: 0.25, ease: 'power2.in', overwrite: 'auto' }) })
    bars.forEach((bar) => { if (bar) gsap.set(bar, { opacity: 0 }) })
  }

  function centerOn(i: number) {
    const next = ((i % N) + N) % N
    if (next === fanCenter.value) return
    // Cards move the instant the switch is triggered — the fan is the primary
    // motion and must never wait on the info text. Text leave/reveal run as a
    // short, independent overlap alongside it instead of gating the fan.
    playHeadingLeave()
    playSubLeave()
    fanCenter.value = next
    layoutFan(true)
    nextTick(() => {
      gsap.delayedCall(0.12, () => { playHeadingReveal(0); playSubReveal(0.08) })
    })
  }
  function feedNext() { centerOn(fanCenter.value + 1) }
  function feedPrev() { centerOn(fanCenter.value - 1) }

  // ── pointer tilt + parallax (ported from the Sandbox section) ──
  function initCardTilt() {
    cardRefs.value.forEach((card) => {
      on(card, 'mousemove', (e) => {
        const ev = e as MouseEvent
        const r = card.getBoundingClientRect()
        const px = (ev.clientX - (r.left + r.width / 2)) / (r.width / 2)
        const py = (ev.clientY - (r.top + r.height / 2)) / (r.height / 2)
        // tilt toward the cursor; fan layout owns x/y/scale/rotationZ, so no overwrite
        gsap.to(card, { rotationY: px * 14, rotationX: -py * 14, duration: 0.4, ease: 'power3.out' })
      })
      on(card, 'mouseleave', () => {
        gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' })
      })
    })
  }

  function onCardClick(i: number) {
    if (dragMoved) return
    // Off-centre card → bring it to the front. Centre card → open the detail window.
    if (fanOffset(i) !== 0) { centerOn(i); return }
    activeProjectIndex.value = i
  }

  // ── enter reveal (adapted from the design's playFeed) ──
  function playFeed() {
    const eyebrow = eyebrowRef.value
    const panel = infoPanelRef.value
    const cards = cardRefs.value

    fanCenter.value = Math.floor(N / 2)

    feedTl?.kill()
    gsap.killTweensOf([eyebrow, panel, ...cards])
    gsap.set(eyebrow, { y: -20, opacity: 0 })
    gsap.set(panel, { opacity: 0, y: 40, scale: 0.96 })
    gsap.set(cards, { xPercent: -50, yPercent: -50, x: 0, y: 180, opacity: 0, scale: 0.7, rotation: 0, rotationX: 0, rotationY: 0 })

    // Wait for the section-cut curtain to fully close before fanning the feed in,
    // so the reveal happens behind the curtain rather than alongside it.
    const tl = gsap.timeline({ delay: SECTION_ENTER_DELAY })
    feedTl = tl
    tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1)
    tl.to(panel, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, 0.18)
    tl.add(() => playHeadingReveal(0), 0.32)
    tl.add(() => playSubReveal(0.1), 0.32)
    tl.add(() => {
      const ordered = cards.slice().sort(
        (a, b) => Math.abs(fanOffset(Number(a.getAttribute('data-i')))) - Math.abs(fanOffset(Number(b.getAttribute('data-i'))))
      )
      ordered.forEach((card, idx) => {
        const o = fanOffset(Number(card.getAttribute('data-i')))
        fanStyle(card, o)
        gsap.to(card, { ...fanTarget(o), duration: 0.7, ease: 'back.out(1.4)', delay: idx * 0.06, transformOrigin: 'center bottom' })
      })
    }, 0.35)
  }

  function playLeave() {
    const eyebrow = eyebrowRef.value
    const panel = infoPanelRef.value
    const cards = cardRefs.value

    // Cancel a still-pending enter timeline first — its deferred callback would
    // otherwise re-spawn card/heading tweens after this leave has run.
    feedTl?.kill()
    feedTl = null
    gsap.killTweensOf([eyebrow, panel, ...cards])
    playHeadingLeave()
    playSubLeave()
    gsap.to(eyebrow, { y: -20, opacity: 0, duration: 0.22, ease: 'power3.in', overwrite: 'auto' })
    gsap.to(panel, { opacity: 0, y: 40, scale: 0.96, duration: 0.24, ease: 'power2.in', overwrite: 'auto' })
    gsap.to(cards, { opacity: 0, y: 180, scale: 0.7, duration: 0.18, ease: 'power3.in', overwrite: 'auto' })
  }

  // ── interactions ──
  function initDrag() {
    const fan = fanRef.value
    if (!fan) return
    on(fan, 'mousedown', (e) => {
      dragging = true
      dragMoved = false
      dragStartX = (e as MouseEvent).clientX
    })
    on(window, 'mousemove', (e) => {
      if (!dragging) return
      if (Math.abs((e as MouseEvent).clientX - dragStartX) > 6) dragMoved = true
    })
    on(window, 'mouseup', (e) => {
      if (!dragging) return
      dragging = false
      const dx = (e as MouseEvent).clientX - dragStartX
      if (dx > 45) feedPrev()
      else if (dx < -45) feedNext()
    })
    on(window, 'keydown', (e) => {
      if (currentSection.value !== projectsIndex) return
      if (activeProjectIndex.value !== null) return
      const key = (e as KeyboardEvent).key
      if (key === 'ArrowLeft') feedPrev()
      else if (key === 'ArrowRight') feedNext()
    })
  }

  onMounted(() => {
    layoutFan(false)
    initDrag()
    initCardTilt()

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
    // wrapper, landing one viewport down — pull back up to fill the viewport.
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

  // ── info window (ModuleDisplay) ──
  .proj-info {
    position: absolute;
    left: 4%;
    top: 15%;
    width: min(40vw, 570px);
    z-index: 6;

    :deep(.module-display-content) {
      padding: 60px 24px 24px;
    }

    :deep(.module-display-label) {
      font-size: 12px;
      padding: 18px 20px;
    }
  }

  .proj-info-body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
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
    // poster — width grows further still for the centred/active card to make
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
    // 3D stage for the pointer-tilt — children pop at different depths (parallax).
    // No overflow:hidden here, as it would flatten the 3D children.
    transform-style: preserve-3d;
  }

  .proj-card--active {
    width: clamp(410px, 33vw, 560px);
  }

  // ── card module frame — fills the card, supplies the numbered "0X · PROJECT"
  // chrome shared with every other window in the app ──
  .proj-card-module {
    position: absolute;
    inset: 0;

    :deep(.module-display-content) {
      padding: 32px 8px 8px;
    }

    :deep(.module-display-label) {
      font-size: 9px;
      padding: 10px 12px;
    }
  }

  .proj-card-body {
    display: flex;
    flex-direction: row;
    height: 100%;
    gap: 8px;
  }

  // Image nested module — full width until the card becomes centred, then
  // narrows to make room for the tech-icon module beside it.
  .proj-card-image {
    flex: 1 1 100%;
    min-width: 0;
    transition: flex-basis 0.4s ease;

    :deep(.module-display-content) {
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

  // Tech-icon nested module — collapsed to nothing for off-centre cards,
  // revealed only for the centred (active) one. The module itself is
  // static-visible (always opacity:1 via inline style), so width/flex-basis
  // do the actual hiding here; the icon fade lives on the inner wrapper below.
  .proj-card-tech {
    flex: 0 0 0%;
    width: 0;
    overflow: hidden;
    transition: flex-basis 0.4s ease, width 0.4s ease;

    :deep(.module-display-content) {
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
