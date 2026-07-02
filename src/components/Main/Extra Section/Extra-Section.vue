<template>
  <div ref="rootRef" class="extra-section">

    <div class="ex-header">
      <div ref="eyebrowRef" class="ex-eyebrow">GUESTBOOK&nbsp;·&nbsp;EXTRA</div>
    </div>

    <LabelSet
      :labels="EXTRA_LABELS"
      section-id="extra"
      accent="#f09b3a"
    />

    <div class="ex-grid">

      <!-- LEFT · comments layout (skeleton, no backend yet) -->
      <ModuleDisplay ref="commentsPanelRef" accent="#f09b3a" class="ex-comments">
        <template #label>01 · COMMENTS</template>
        <div class="ex-comment-list">
          <div v-for="c in PLACEHOLDER_COMMENTS" :key="c.name" class="ex-comment">
            <div class="ex-comment-avatar">{{ c.name.charAt(0) }}</div>
            <div class="ex-comment-body">
              <div class="ex-comment-meta">
                <span class="ex-comment-name">{{ c.name }}</span>
                <span class="ex-comment-date">{{ c.date }}</span>
              </div>
              <div class="ex-comment-text">{{ c.text }}</div>
            </div>
          </div>
        </div>
        <div class="ex-comment-input">
          <textarea
            class="ex-input"
            rows="2"
            maxlength="280"
            placeholder="Leave a message… (coming soon)"
            disabled
          ></textarea>
          <button type="button" class="ex-send" disabled>SEND</button>
        </div>
        <div class="ex-caption">one message per visitor · stored for everyone</div>
      </ModuleDisplay>

      <!-- RIGHT · contacts (existing container, repositioned into the panel) -->
      <ModuleDisplay ref="contactPanelRef" accent="#f09b3a" class="ex-contact">
        <template #label>02 · CONTACT</template>
        <div class="ex-contact-host">
          <ProfileContact />
        </div>
      </ModuleDisplay>

    </div>

    <!-- Liquid Impressum tab — fused with the bottom edge, pull it up -->
    <div ref="liquidRef" class="ex-liquid">
      <svg
        ref="liquidSvgRef"
        class="ex-liquid-svg"
        viewBox="0 0 400 130"
        preserveAspectRatio="none"
        @pointerdown="onLiquidDown"
      >
        <path ref="liquidPathRef" fill="#f09b3a" :d="blobPath(0)" />
      </svg>
      <div class="ex-liquid-hint">IMPRESSUM&nbsp;▲</div>
    </div>

    <!-- Impressum panel revealed by pulling the liquid tab -->
    <div ref="impressumRef" class="ex-impressum">
      <button type="button" class="ex-impressum-close" @click="closeImpressum">✕</button>
      <div class="ex-impressum-title">IMPRESSUM</div>
      <div class="ex-impressum-body">
        <p>Vadim Niedental</p>
        <p>Musterstraße 1 · 00000 Musterstadt</p>
        <p>vadim.niedental@gmail.com</p>
        <p class="ex-impressum-note">— placeholder, to be filled in —</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { gsap } from 'gsap'
  import { currentSection } from '@modules/sectionsCore'
  import { getSectionIndexById } from '@modules/sectionsRegistry'
  import { onSectionStatesChange } from '@modules/sectionsStateMachine'
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'
  import LabelSet from '@components/Misc/Label-Set.vue'
  import ModuleDisplay from '@components/Misc/Module-Display.vue'
  import ProfileContact from '@components/Main/Profile Section/Contact.vue'

  const EXTRA_LABELS = [
    { text: 'IMPRESSED?', pos: { top: '5%', left: '4%' } },
    { text: 'SAY HI!', pos: { top: '5%', left: '20%' } },
    { text: 'LEGAL BELOW', pos: { bottom: '5%', right: '4%' } },
  ]

  const PLACEHOLDER_COMMENTS = [
    { name: 'Visitor', date: '··/··/····', text: 'Comments will live here once the backend lands.' },
    { name: 'Someone', date: '··/··/····', text: 'One message per visitor, shown to everyone after.' },
    { name: 'You?', date: 'soon', text: 'This slot is waiting for a real database row.' },
  ]

  const rootRef = ref<HTMLElement | null>(null)
  const eyebrowRef = ref<HTMLElement | null>(null)
  const commentsPanelRef = ref<InstanceType<typeof ModuleDisplay> | null>(null)
  const contactPanelRef = ref<InstanceType<typeof ModuleDisplay> | null>(null)
  const liquidRef = ref<HTMLElement | null>(null)
  const liquidSvgRef = ref<SVGSVGElement | null>(null)
  const liquidPathRef = ref<SVGPathElement | null>(null)
  const impressumRef = ref<HTMLElement | null>(null)

  const extraIndex = getSectionIndexById('extra')

  // ── liquid tab physics ──
  // The blob is a bump fused with the bottom edge; pulling stretches its apex
  // upward. Past PULL_THRESHOLD on release the Impressum slides up, otherwise
  // the blob snaps back elastically.
  const BLOB_REST = 26          // apex height at rest (viewBox units)
  const PULL_MAX = 78           // max additional lift while dragging
  const PULL_THRESHOLD = 48     // release past this → open Impressum
  const pull = { v: 0 }
  let draggingLiquid = false
  let dragStartY = 0
  let impressumOpen = false

  function blobPath(p: number): string {
    const lift = BLOB_REST + p
    const apex = 130 - lift
    const shoulder = 130 - lift * 0.32
    return `M0,130 C90,${shoulder} 135,${apex} 200,${apex} C265,${apex} 310,${shoulder} 400,130 Z`
  }

  function drawBlob() {
    liquidPathRef.value?.setAttribute('d', blobPath(pull.v))
  }

  function onLiquidDown(e: PointerEvent) {
    if (impressumOpen) return
    draggingLiquid = true
    dragStartY = e.clientY
    gsap.killTweensOf(pull)
    liquidSvgRef.value?.setPointerCapture(e.pointerId)
  }

  function onLiquidMove(e: PointerEvent) {
    if (!draggingLiquid) return
    pull.v = Math.max(0, Math.min(dragStartY - e.clientY, PULL_MAX))
    drawBlob()
  }

  function onLiquidUp() {
    if (!draggingLiquid) return
    draggingLiquid = false
    if (pull.v >= PULL_THRESHOLD) openImpressum()
    else settleBlob()
  }

  function settleBlob() {
    gsap.to(pull, { v: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', onUpdate: drawBlob })
  }

  function openImpressum() {
    impressumOpen = true
    gsap.to(pull, { v: 0, duration: 0.3, ease: 'power2.out', onUpdate: drawBlob })
    gsap.to(liquidRef.value, { opacity: 0, duration: 0.25, ease: 'power2.in', overwrite: 'auto' })
    // fromTo (not set+to): the global immediateRender:false default means a bare
    // gsap.set() never renders — fromTo captures the hidden state at tween start.
    gsap.fromTo(impressumRef.value,
      { xPercent: -50, yPercent: 100 },
      { xPercent: -50, yPercent: 0, duration: 0.55, ease: 'power3.out', overwrite: 'auto' })
  }

  function closeImpressum() {
    if (!impressumOpen) return
    impressumOpen = false
    gsap.to(impressumRef.value, { xPercent: -50, yPercent: 100, duration: 0.4, ease: 'power3.in', overwrite: 'auto' })
    gsap.to(liquidRef.value, { opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.25, overwrite: 'auto' })
  }

  // ── enter / leave ──
  function playReveal() {
    const commentsEl = commentsPanelRef.value?.el, contactEl = contactPanelRef.value?.el
    gsap.killTweensOf([eyebrowRef.value, commentsEl, contactEl, liquidRef.value])

    // fromTo throughout — the global immediateRender:false default means a bare
    // gsap.set() never renders, so seed the hidden state at each tween's start.
    const tl = gsap.timeline({ delay: SECTION_ENTER_DELAY })
    tl.fromTo(eyebrowRef.value, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1)
    tl.fromTo(commentsEl, { x: '-60vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.4)' }, 0.15)
    tl.fromTo(contactEl, { x: '60vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.4)' }, 0.25)
    tl.fromTo(liquidRef.value, { y: '18vh' }, { y: 0, opacity: impressumOpen ? 0 : 1, duration: 0.5, ease: 'back.out(1.6)' }, 0.45)
  }

  function playLeave() {
    const commentsEl = commentsPanelRef.value?.el, contactEl = contactPanelRef.value?.el
    gsap.killTweensOf([eyebrowRef.value, commentsEl, contactEl, liquidRef.value])
    if (impressumOpen) closeImpressum()
    gsap.to(eyebrowRef.value, { y: -20, opacity: 0, duration: 0.22, ease: 'power3.in', overwrite: 'auto' })
    gsap.to(commentsEl, { x: '-60vw', opacity: 0, duration: 0.28, ease: 'power2.in', overwrite: 'auto' })
    gsap.to(contactEl, { x: '60vw', opacity: 0, duration: 0.28, ease: 'power2.in', delay: 0.05, overwrite: 'auto' })
    gsap.to(liquidRef.value, { y: '18vh', duration: 0.24, ease: 'power2.in', overwrite: 'auto' })
  }

  let stopSectionWatch: (() => void) | null = null
  const listeners: Array<() => void> = []

  function on(target: Window, type: string, handler: EventListenerOrEventListenerObject) {
    target.addEventListener(type, handler)
    listeners.push(() => target.removeEventListener(type, handler))
  }

  onMounted(() => {
    drawBlob()

    on(window, 'pointermove', onLiquidMove as EventListener)
    on(window, 'pointerup', onLiquidUp as EventListener)

    stopSectionWatch = onSectionStatesChange((meta) => {
      if (meta.isLeavingSection(extraIndex)) playLeave()
      else if (meta.isEnteringSection(extraIndex)) playReveal()
    })

    if (currentSection.value === extraIndex) playReveal()
  })

  onBeforeUnmount(() => {
    stopSectionWatch?.()
    stopSectionWatch = null
    listeners.forEach((off) => off())
    listeners.length = 0
    gsap.killTweensOf(pull)
  })
</script>

<style scoped lang="scss">
  @use "@styleVariables" as *;

  .extra-section {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    // Section wrappers collapse to 0 height and stack below the full-height Perks
    // wrapper, landing one viewport down — pull back up to fill the viewport.
    transform: translateY(-100vh);
    // Transparent so the animated orange section-background slices (rendered
    // behind by Section-Cover-Slice) remain visible behind the content.
    background: transparent;
    overflow: hidden;
  }

  .ex-header {
    position: absolute;
    top: 4%;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 3;
  }

  .ex-eyebrow {
    font-family: 'Audiowide';
    font-size: 11px;
    letter-spacing: 5px;
    color: #f09b3a;
    opacity: 0;
    will-change: transform, opacity;
  }

  .ex-grid {
    position: absolute;
    left: 0;
    right: 0;
    top: 12%;
    bottom: 12%;
    padding: 0 5%;
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 18px;

    @include allMobile {
      grid-template-columns: 1fr;
      grid-template-rows: 1.2fr 1fr;
    }
  }

  // ── comments skeleton ──
  .ex-comment-list {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 4px 16px;
  }

  .ex-comment {
    display: flex;
    gap: 12px;
    padding: 12px;
    border: 1px solid #222;
    border-radius: 8px;
    background: #171717;
  }

  .ex-comment-avatar {
    flex: 0 0 auto;
    width: 2.4rem;
    height: 2.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #232323;
    border: 1px solid #2e2e2e;
    font-family: 'Audiowide';
    font-size: 0.9rem;
    color: #f09b3a;
  }

  .ex-comment-body {
    min-width: 0;
  }

  .ex-comment-meta {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 4px;
  }

  .ex-comment-name {
    font-family: 'Audiowide';
    font-size: 11px;
    letter-spacing: 1px;
    color: #ddd;
  }

  .ex-comment-date {
    font-family: 'Mono';
    font-size: 9px;
    color: #4a4a4a;
  }

  .ex-comment-text {
    font-family: 'Mono';
    font-size: 12px;
    line-height: 1.5;
    color: #8a8a8a;
  }

  .ex-comment-input {
    display: flex;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid #202020;
  }

  .ex-input {
    flex: 1;
    resize: none;
    padding: 10px 12px;
    font-family: 'Mono';
    font-size: 12px;
    color: #bbb;
    background: #181818;
    border: 1px solid #2a2a2a;
    border-radius: 6px;

    &::placeholder { color: #4a4a4a; }
    &:disabled { cursor: not-allowed; }
  }

  .ex-send {
    align-self: stretch;
    padding: 0 22px;
    font-family: 'Audiowide';
    font-size: 12px;
    letter-spacing: 2px;
    color: #0e0e0e;
    background: #f09b3a;
    border: none;
    border-radius: 6px;
    opacity: 0.35;
    cursor: not-allowed;
  }

  .ex-caption {
    font-family: 'Mono';
    font-size: 10px;
    color: #4a4a4a;
    text-align: center;
    padding: 0 16px 12px;
  }

  // ── contact panel: re-anchor the existing container inside the panel ──
  .ex-contact-host {
    position: relative;
    flex: 1;
    min-height: 0;

    :deep(.contact-container) {
      @include absoluteCenter(50%, 50%);
    }
  }

  // ── liquid Impressum tab ──
  // Centered, spanning ~17% outwards in both directions from centre.
  .ex-liquid {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 34vw;
    height: 13vh;
    z-index: 5;
    will-change: transform, opacity;

    @include allMobile {
      width: 70vw;
    }
  }

  .ex-liquid-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    cursor: grab;
    touch-action: none;

    &:active { cursor: grabbing; }

    path {
      filter: drop-shadow(0 0 18px rgba(240, 155, 58, 0.45));
    }
  }

  .ex-liquid-hint {
    position: absolute;
    left: 50%;
    bottom: 6px;
    transform: translateX(-50%);
    font-family: 'Mono';
    font-size: 9px;
    letter-spacing: 3px;
    color: #161616;
    pointer-events: none;
  }

  // ── impressum panel ──
  .ex-impressum {
    position: absolute;
    left: 50%;
    bottom: 0;
    // Hidden at rest below the viewport edge; GSAP takes over with
    // xPercent/yPercent on open/close.
    transform: translate(-50%, 100%);
    width: min(560px, 90vw);
    padding: 26px 30px 30px;
    background: #f09b3a;
    color: #161616;
    border-radius: 16px 16px 0 0;
    z-index: 6;
    will-change: transform;
  }

  .ex-impressum-close {
    position: absolute;
    top: 12px;
    right: 14px;
    width: 1.8rem;
    height: 1.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Mono';
    font-size: 0.9rem;
    color: #161616;
    background: rgba(0, 0, 0, 0.12);
    border: none;
    border-radius: 50%;
    cursor: pointer;

    &:hover { background: rgba(0, 0, 0, 0.25); }
  }

  .ex-impressum-title {
    font-family: 'Audiowide';
    font-size: 14px;
    letter-spacing: 4px;
    margin-bottom: 12px;
  }

  .ex-impressum-body {
    font-family: 'Mono';
    font-size: 12px;
    line-height: 1.7;

    p { margin: 0; }
  }

  .ex-impressum-note {
    margin-top: 10px !important;
    opacity: 0.55;
  }
</style>
