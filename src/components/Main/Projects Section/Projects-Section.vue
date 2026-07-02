<template>
  <div class="projects-section">

    <!-- rotating helix backdrop -->
    <div ref="helixRef" class="proj-helix"></div>

    <!-- heading -->
    <div class="proj-head">
      <div class="proj-kicker-clip">
        <div ref="kickerRef" class="proj-kicker">FEATURED&nbsp;·&nbsp;SELECTED&nbsp;WORK</div>
      </div>
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

    <!-- fanned card feed -->
    <div ref="fanRef" class="proj-fan">
      <div
        v-for="(project, i) in projects"
        :key="project.name"
        ref="cardRefs"
        class="proj-card"
        :data-i="i"
        @click="onCardClick(i)"
      >
        <div class="proj-card-media">
          <div class="proj-card-img" :style="{ backgroundImage: `url(${project.img})` }"></div>
          <div class="proj-card-grad"></div>
        </div>
        <div class="proj-card-label">
          <div class="proj-card-meta">{{ String(project.year).toUpperCase() }}</div>
          <div class="proj-card-name">{{ project.name }}</div>
        </div>
      </div>
    </div>

    <!-- controls -->
    <div class="proj-prev" @click="feedPrev">◂</div>
    <div class="proj-next" @click="feedNext">▸</div>
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
  import { currentSection } from '@modules/sectionsCore'
  import { getSectionIndexById } from '@modules/sectionLookup'
  import { onSectionStatesChange } from '@modules/sectionsStateMachine'
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'

  const N = projects.length
  const projectsIndex = getSectionIndexById('projects')

  const helixRef = ref<HTMLElement | null>(null)
  const kickerRef = ref<HTMLElement | null>(null)
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
    return { SX: Math.max(96, h * 0.16), DY: h * 0.03 }
  }

  function fanOffset(k: number) {
    let d = k - fanCenter.value
    d = ((d % N) + N) % N
    if (d > N / 2) d -= N
    return d
  }

  function fanTarget(o: number) {
    const ao = Math.abs(o)
    return {
      xPercent: -50,
      yPercent: -50,
      x: o * fanDims().SX,
      y: ao * fanDims().DY,
      rotation: o * 8,
      scale: 1 - ao * 0.07,
      opacity: ao > 3 ? 0 : 1,
    }
  }

  function fanStyle(card: HTMLElement, o: number) {
    const ao = Math.abs(o)
    card.style.zIndex = String(100 - ao * 10 + (o <= 0 ? 1 : 0))
    card.style.borderColor = ao < 0.5 ? '#DC143C' : 'transparent'
    card.style.boxShadow = ao < 0.5 ? '0 30px 72px rgba(220,20,60,0.42)' : '0 22px 56px rgba(0,0,0,0.55)'
    const label = card.querySelector<HTMLElement>('.proj-card-label')
    if (label) label.style.opacity = ao < 1.5 ? '1' : '0'
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
    fanCenter.value = ((i % N) + N) % N
    layoutFan(true)
    nextTick(() => { playHeadingReveal(0); playSubReveal(0.1) })
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

  // ── helix backdrop ──
  function buildHelix() {
    const wrap = helixRef.value
    if (!wrap || wrap.childElementCount) return
    const spacing = 22
    const count = Math.ceil(window.innerHeight / spacing) + 1
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div')
      s.className = 'proj-strand'
      s.style.top = i * spacing + 'px'
      s.style.animationDelay = -0.34 * i + 's'
      const d1 = document.createElement('div')
      d1.className = 'proj-strand-dot'
      const d2 = d1.cloneNode() as HTMLElement
      d2.style.left = 'auto'
      d2.style.right = '-13px'
      s.appendChild(d1)
      s.appendChild(d2)
      wrap.appendChild(s)
    }
  }

  // ── enter reveal (adapted from the design's playFeed) ──
  function playFeed() {
    const kicker = kickerRef.value
    const cards = cardRefs.value
    const strands = gsap.utils.toArray<HTMLElement>(helixRef.value?.querySelectorAll('.proj-strand') ?? [])

    fanCenter.value = Math.floor(N / 2)

    feedTl?.kill()
    gsap.killTweensOf([kicker, ...cards, ...strands])
    gsap.set(kicker, { yPercent: 110, skewY: 3 })
    gsap.set(cards, { xPercent: -50, yPercent: -50, x: 0, y: 180, opacity: 0, scale: 0.7, rotation: 0, rotationX: 0, rotationY: 0 })
    gsap.set(strands, { opacity: 0 })

    // Wait for the section-cut curtain to fully close before fanning the feed in,
    // so the reveal happens behind the curtain rather than alongside it.
    const tl = gsap.timeline({ delay: SECTION_ENTER_DELAY })
    feedTl = tl
    strands.forEach((s, i) => {
      tl.to(s, { opacity: 1, duration: 0.22, ease: 'power2.out' }, i * 0.03)
    })
    tl.to(kicker, { yPercent: 0, skewY: 0, duration: 0.55, ease: 'expo.out' }, 0.1)
    tl.add(() => playHeadingReveal(0), 0.22)
    tl.add(() => playSubReveal(0.1), 0.22)
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
    const kicker = kickerRef.value
    const cards = cardRefs.value
    const strands = gsap.utils.toArray<HTMLElement>(helixRef.value?.querySelectorAll('.proj-strand') ?? [])

    // Cancel a still-pending enter timeline first — its deferred callback would
    // otherwise re-spawn card/heading tweens after this leave has run.
    feedTl?.kill()
    feedTl = null
    gsap.killTweensOf([kicker, ...cards, ...strands])
    playHeadingLeave()
    playSubLeave()
    gsap.to(kicker, { yPercent: -110, skewY: -2, duration: 0.25, ease: 'power2.in', overwrite: 'auto' })
    gsap.to(cards, { opacity: 0, y: 180, scale: 0.7, duration: 0.18, ease: 'power3.in', overwrite: 'auto' })
    strands.forEach((s, i) => {
      gsap.to(s, { opacity: 0, duration: 0.12, ease: 'power2.in', delay: i * 0.008, overwrite: 'auto' })
    })
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
    buildHelix()
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

  // ── helix backdrop ──
  .proj-helix {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 100%;
    perspective: 1000px;
    opacity: 0.2;
    z-index: 0;
    overflow: visible;
    pointer-events: none;
  }

  :deep(.proj-strand) {
    position: absolute;
    left: 50%;
    width: 180px;
    height: 2px;
    margin-left: -90px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.55);
    transform-style: preserve-3d;
    animation: projHelixRot 9s linear infinite;
    will-change: transform;
  }

  :deep(.proj-strand-dot) {
    position: absolute;
    top: -5px;
    left: -13px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #dc143c;
    box-shadow: 0 0 16px #dc143c;
    opacity: 0.9;
  }

  @keyframes projHelixRot {
    from { transform: rotateY(0deg); }
    to { transform: rotateY(360deg); }
  }

  // ── heading ──
  .proj-head {
    position: absolute;
    top: 5%;
    left: 4%;
    z-index: 6;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .proj-kicker-clip {
    overflow: hidden;
    padding: 2px 0;
  }

  .proj-kicker {
    font-family: 'Audiowide';
    font-size: 11px;
    letter-spacing: 5px;
    color: #ff506e;
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
    font-size: clamp(42px, 6vw, 72px);
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
    font-size: clamp(13px, 1.1vw, 16px);
    max-width: 44vw;
  }

  .proj-sub-year {
    font-size: 11px;
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
    top: 22%;
    bottom: 10%;
    z-index: 5;
    perspective: 1400px;
  }

  .proj-card {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 26vh;
    height: 39vh;
    min-width: 160px;
    min-height: 240px;
    border-radius: 18px;
    background: #1b1012;
    border: 2px solid transparent;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
    cursor: pointer;
    will-change: transform;
    // 3D stage for the pointer-tilt — children pop at different depths (parallax).
    // No overflow:hidden here, as it would flatten the 3D children.
    transform-style: preserve-3d;
  }

  // Clipping layer: rounds the image to the card corners without flattening the
  // card's 3D space (it sits flush at depth 0).
  .proj-card-media {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    overflow: hidden;
  }

  .proj-card-img {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .proj-card-grad {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 48%;
    background: linear-gradient(transparent, rgba(10, 3, 5, 0.92));
    pointer-events: none;
  }

  .proj-card-label {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 14px 16px;
    pointer-events: none;
    // Floats above the image so the tilt reveals genuine parallax depth.
    transform: translateZ(45px);
  }

  .proj-card-meta {
    font-family: 'Audiowide';
    font-size: 9px;
    letter-spacing: 3px;
    color: #ff7588;
  }

  .proj-card-name {
    font-family: 'Wosker';
    font-size: 22px;
    color: #fff;
    margin-top: 4px;
    line-height: 1;
  }

  // ── controls ──
  .proj-prev,
  .proj-next {
    position: absolute;
    top: calc(50% + 14px);
    transform: translateY(-50%);
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 1px solid #6a2c38;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
    font-size: 20px;
    background: rgba(20, 8, 11, 0.55);
    backdrop-filter: blur(4px);
    z-index: 7;
  }

  .proj-prev { left: 4%; }
  .proj-next { right: 4%; }

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
