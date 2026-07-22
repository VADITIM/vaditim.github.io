<template>
  <div ref="rootRef" class="classified-section">

    <div class="sc-header">
      <div ref="eyebrowRef" class="sc-eyebrow">ACCESS GRANTED · CLASSIFIED</div>
    </div>

    <LabelSet
      :labels="CLASSIFIED_LABELS"
      section-id="classified"
      accent="#8a2be2"
      glitch
    />

    <div ref="lorePanelRef" class="sc-lore">
      <p class="sc-lore-text">
        MANY ITERATIONS WERE RUN TO GET HERE THIS IS <span class="sc-redact">VERSION 03</span>.
        FIRST INSPIRED BY <span class="sc-redact">GEOMETRIC ABSTRACT SHAPES & SLICES</span>.
        TODAY IT HAS GROWN INTO SOMETHING <span class="sc-redact">LIKE A PASSION PROJECT</span> AND A KINDA <span class="sc-redact">SUPER SMASH BROS X OVERWATCH</span> MASHUP.
        I HAVE TRIED TO REPRESENT MY <span class="sc-redact">STYLE AS A DEVELOPER </span>WITH THIS PROJECT AND FOCUS ON <span class="sc-redact">INTERACTIVITY, ANIMATION & POLISH</span> INSTEAD OF <span class="sc-redact">STATIC DESIGN</span>.
        <br /><br />
        <span class="sc-redact">THIS IS MEANT AS A PROOF OF CONCEPT THAT UI/UX DESIGN ISN'T ONLY WHAT WE'RE TAUGHT TO KNOW</span>
      </p>
    </div>

    <ModuleDisplay ref="qrPanelRef" accent="#8a2be2" class="sc-qr-panel" caption="scan at your own risk">
      <template #label>04 · ARCHIVE</template>
      <div class="sc-qr-body">
        <img :src="rickrollQr" alt="" class="sc-qr-image" />
      </div>
    </ModuleDisplay>

    <div class="sc-grid">
      <div class="sc-grid-left">
        <ModuleDisplay ref="panelRef" accent="#8a2be2" class="sc-panel">
          <template #label>01 · CLASSIFIED</template>
          <div class="sc-body sc-log">
            <p class="sc-note">
              FILE 003-A · SUBJECT: VISITOR - {{ (visitorName ?? 'UNIDENTIFIED').toUpperCase() }} -
              <span class="sc-redact">{{ visitorSignature }}</span><br />
              STATUS: <span class="sc-redact">FULLY COMPROMISED</span><br />
              LAST SEEN: querying <span class="sc-redact">classified-section-unlocked</span><br />
              CLEARANCE: <span class="sc-redact">NONE - SCANNED A STICKER ANYWAY</span><br />
              NOTE: DELETING DATA DELETES *EVERYTHING* INCLUDING YOUR COMMENT. THIS CANNOT BE UNDONE.
            </p>
            <button type="button" class="sc-purge" :disabled="isPurging" @click="handlePurgeClick">
              {{ isPurging ? 'PURGING…' : isPurgeArmed ? 'CONFIRM — THIS CANNOT BE UNDONE' : 'DELETE DATA' }}
            </button>
          </div>
        </ModuleDisplay>

        <ModuleDisplay ref="pongPanelRef" accent="#8a2be2" class="sc-panel" caption="first to nothing. It never ends">
          <template #label>02 · PONG</template>
          <PongGame ref="pongGameRef" />
        </ModuleDisplay>
      </div>

      <ModuleDisplay ref="heatmapPanelRef" accent="#8a2be2" class="sc-panel sc-heatmap-panel" :animate-height="false" caption="one point per visitor, per 6 hours">
        <template #label>03 · HEATMAP</template>
        <div class="sc-body sc-heatmap-body">
          <TrafficHeatmap />
        </div>
      </ModuleDisplay>
    </div>

  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { gsap } from 'gsap'
  import { currentSection } from '@modules/sectionsCore'
  import { getSectionIndexById } from '@modules/sectionLookup'
  import { onSectionStatesChange } from '@modules/sectionsStateMachine'
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'
  import { isLiteMode } from '@modules/miscAnimationMode'
  import { playLiteEnter, playLiteLeave } from '@modules/animationLiteFallback'
  import LabelSet from '@components/Misc/Label-Set.vue'
  import ModuleDisplay from '@components/Misc/Module-Display.vue'
  import PongGame from './Pong-Game.vue'
  import TrafficHeatmap from './Traffic-Heatmap.vue'
  import { deleteAllVisitorData } from '@modules/visitorDataReset'
  import { visitorName } from '@modules/extraComments'
  import { visitorSignature } from '@modules/visitorSignature'
  import rickrollQr from '@assets/images/rickroll-qr.png'

  const CLASSIFIED_LABELS = [
    { text: 'ACCESS GRANTED', pos: { top: '2%', left: '10%' }, stretch: true },
    { text: 'NOTHING HERE IS REAL', pos: { bottom: '2%', right: '10%' } },
  ]

  const rootRef = ref<HTMLElement | null>(null)
  const eyebrowRef = ref<HTMLElement | null>(null)
  const panelRef = ref<InstanceType<typeof ModuleDisplay> | null>(null)
  const pongPanelRef = ref<InstanceType<typeof ModuleDisplay> | null>(null)
  const pongGameRef = ref<InstanceType<typeof PongGame> | null>(null)
  const heatmapPanelRef = ref<InstanceType<typeof ModuleDisplay> | null>(null)
  const qrPanelRef = ref<InstanceType<typeof ModuleDisplay> | null>(null)
  const lorePanelRef = ref<HTMLElement | null>(null)

  const classifiedIndex = getSectionIndexById('classified')

  // ── purge ──
  // Two-step so a curious visitor cannot wipe their comment on a single stray click.
  const isPurgeArmed = ref(false)
  const isPurging = ref(false)

  function handlePurgeClick() {
    if (!isPurgeArmed.value) {
      isPurgeArmed.value = true
      return
    }
    isPurging.value = true
    void deleteAllVisitorData()
  }

  // ── enter / leave ──
  function playReveal() {
    const panelEl = panelRef.value?.element ?? null
    const pongEl = pongPanelRef.value?.element ?? null
    const heatmapEl = heatmapPanelRef.value?.element ?? null
    const qrElement = qrPanelRef.value?.element ?? null
    const loreEl = lorePanelRef.value
    const redactEls = loreEl?.querySelectorAll<HTMLElement>('.sc-redact') ?? []
    gsap.killTweensOf([eyebrowRef.value, panelEl, pongEl, heatmapEl, qrElement, loreEl, ...redactEls])

    if (isLiteMode.value) {
      playLiteEnter([eyebrowRef.value, loreEl, qrElement, panelEl, pongEl, heatmapEl])
      // The redaction bars are the section's point, not decoration; they stay,
      // just as a plain cover-up with no stagger.
      gsap.set(redactEls, { '--redact-cover': 1 })
      pongGameRef.value?.start()
      return
    }

    const timeline = gsap.timeline({ delay: SECTION_ENTER_DELAY })
    timeline.fromTo(eyebrowRef.value, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1)
    timeline.fromTo(loreEl, { x: '-20vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.3)' }, 0.14)
    timeline.fromTo(qrElement, { x: '-20vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.3)' }, 0.14)
    timeline.fromTo(panelEl, { y: '20vh', opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.3)' }, 0.18)
    timeline.fromTo(pongEl, { y: '20vh', opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.3)' }, 0.28)
    timeline.fromTo(heatmapEl, { x: '20vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.3)' }, 0.36)
    timeline.fromTo(redactEls, { '--redact-cover': 0 }, { '--redact-cover': 1, duration: 0.4, ease: 'power2.out', stagger: 0.04 }, 0.4)
    pongGameRef.value?.start()
  }

  function playLeave() {
    const panelEl = panelRef.value?.element ?? null
    const pongEl = pongPanelRef.value?.element ?? null
    const heatmapEl = heatmapPanelRef.value?.element ?? null
    const qrElement = qrPanelRef.value?.element ?? null
    const loreEl = lorePanelRef.value
    const redactEls = loreEl?.querySelectorAll<HTMLElement>('.sc-redact') ?? []
    gsap.killTweensOf([eyebrowRef.value, panelEl, pongEl, heatmapEl, qrElement, loreEl, ...redactEls])

    if (isLiteMode.value) {
      playLiteLeave([eyebrowRef.value, loreEl, qrElement, panelEl, pongEl, heatmapEl])
      gsap.set(redactEls, { '--redact-cover': 0 })
      pongGameRef.value?.stop()
      return
    }

    gsap.to(eyebrowRef.value, { y: -20, opacity: 0, duration: 0.22, ease: 'power3.in', overwrite: 'auto' })
    gsap.to(loreEl, { x: '-20vw', opacity: 0, duration: 0.25, ease: 'power2.in', overwrite: 'auto' })
    gsap.to(qrElement, { x: '-20vw', opacity: 0, duration: 0.25, ease: 'power2.in', overwrite: 'auto' })
    gsap.to(panelEl, { y: '20vh', opacity: 0, duration: 0.28, ease: 'power2.in', overwrite: 'auto' })
    gsap.to(pongEl, { y: '20vh', opacity: 0, duration: 0.28, ease: 'power2.in', overwrite: 'auto' })
    gsap.to(heatmapEl, { x: '20vw', opacity: 0, duration: 0.28, ease: 'power2.in', overwrite: 'auto' })
    gsap.to(redactEls, { '--redact-cover': 0, duration: 0.2, ease: 'power2.in', overwrite: 'auto' })
    pongGameRef.value?.stop()
  }

  let stopSectionWatch: (() => void) | null = null

  // Wrap each word of the given roots in its own `.sc-glitch-word` span so every
  // word flickers on its own randomised clock rather than the whole block at
  // once. Text inside `.sc-redact` is skipped (it sits under an opaque bar) and
  // `<br>`/whitespace nodes are preserved so layout is unchanged.
  function splitWordsForGlitch(roots: (HTMLElement | null | undefined)[]) {
    // Every word gets its own infinite CSS animation — the single cheapest thing
    // to drop when the visitor has no compositing to spare.
    if (isLiteMode.value) return
    roots.forEach((root) => {
      if (!root) return
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      const textNodes: Text[] = []
      let node: Node | null
      while ((node = walker.nextNode())) {
        if (!node.textContent?.trim()) continue
        if (node.parentElement?.closest('.sc-redact')) continue
        textNodes.push(node as Text)
      }
      textNodes.forEach((textNode) => {
        const fragment = document.createDocumentFragment()
        textNode.textContent!.split(/(\s+)/).forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part))
            return
          }
          const span = document.createElement('span')
          span.className = 'sc-glitch-word'
          span.textContent = part
          span.style.animationDelay = `${-Math.random() * 30}s`
          span.style.animationDuration = `${20 + Math.random() * 15}s`
          fragment.appendChild(span)
        })
        textNode.parentNode!.replaceChild(fragment, textNode)
      })
    })
  }

  onMounted(() => {
    const panelEl = panelRef.value?.element ?? null
    const qrElement = qrPanelRef.value?.element ?? null
    splitWordsForGlitch([
      eyebrowRef.value,
      lorePanelRef.value?.querySelector<HTMLElement>('.sc-lore-text'),
      panelEl?.querySelector<HTMLElement>('.sc-note'),
      panelEl?.querySelector<HTMLElement>('.module-display-label'),
      panelEl?.querySelector<HTMLElement>('.module-display-caption'),
      qrElement?.querySelector<HTMLElement>('.module-display-label'),
      qrElement?.querySelector<HTMLElement>('.module-display-caption'),
    ])

    stopSectionWatch = onSectionStatesChange((meta) => {
      if (meta.isLeavingSection(classifiedIndex)) playLeave()
      else if (meta.isEnteringSection(classifiedIndex)) playReveal()
    })
    if (currentSection.value === classifiedIndex) playReveal()
  })

  onBeforeUnmount(() => {
    stopSectionWatch?.()
    stopSectionWatch = null
  })
</script>

<style scoped lang="scss">
  @use "@styleVariables" as *;

  .classified-section {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    // Section wrappers collapse to 0 height and stack below the full-height Perks
    // wrapper; pull back up to fill the viewport, same as every other section.
    transform: translateY(-100vh);
    background: transparent;
    overflow: hidden;
  }

  .sc-header {
    position: absolute;
    top: 4%;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 3;
  }

  .sc-eyebrow {
    font-family: 'Audiowide';
    font-size: 11px;
    letter-spacing: 5px;
    color: #8a2be2;
    opacity: 0;
    will-change: transform, opacity;
  }

  // Vertical archival note running the height of the left edge; reads top to
  // bottom like a margin annotation, scaled tall/narrow rather than a normal
  // horizontal block.
  .sc-lore {
    position: absolute;
    top: 50%;
    left: 3%;
    transform: translateY(-50%);
    z-index: 3;
    height: 76vh;
    width: 40px;
    opacity: 0;
    will-change: transform, opacity;
  }

  .sc-lore-text {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    height: 100%;
    margin: 0;
    font-family: 'Mono';
    font-size: 11px;
    letter-spacing: 2px;
    line-height: 1.8;
    color: #6a6a6a;
  }

  .sc-qr-panel {
    position: absolute;
    bottom: 10%;
    right: clamp(4%, 6dvw, 8%);
    z-index: 3;
    width: 190px;
    height: 230px;
  }

  .sc-qr-body {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sc-qr-image {
    width: 100%;
    height: auto;
    border-radius: 4px;
    filter: blur(6px);
    transition: filter 0.25s ease;
  }

  .sc-qr-panel:hover .sc-qr-image {
    filter: blur(0);
  }

  .sc-grid {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(1180px, 88vw);
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 24px;
  }

  .sc-grid-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 24px;
    flex: 1 1 auto;
    min-width: 0;
  }

  .sc-heatmap-panel {
    flex: 0 0 min(700px, 46vw);
    // Fixed tall panel: the heatmap solves its own cell size against this box,
    // so the height is the knob that decides how big the year grid renders.
    height: 70dvh;
  }

  .sc-body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    padding: 8px;
  }

  .sc-note {
    font-family: 'Mono';
    font-size: 13px;
    line-height: 1.6;
    color: #9a9a9a;
    text-align: center;
  }

  // Stacks the log text above the purge button; .sc-body alone is a centred row.
  .sc-log {
    flex-direction: column;
  }

  .sc-log .sc-note {
    text-align: left;
  }

  .sc-heatmap-body {
    width: 100%;
    height: 100%;
    min-height: 0;
    flex: 1;
  }

  .sc-purge {
    align-self: center;
    margin-top: 14px;
    padding: 8px 14px;
    font-family: 'Audiowide';
    font-size: 9px;
    letter-spacing: 3px;
    color: #b06a6a;
    background: transparent;
    border: 1px dashed #4a2a2a;
    border-radius: 6px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background-color 0.2s;

    &:hover {
      color: #ff6a6a;
      border-color: #ff6a6a;
      background: rgba(255, 106, 106, 0.08);
    }

    &:disabled {
      cursor: default;
      opacity: 0.5;
    }
  }

  // Black-bar redaction; the text underneath is real and always rendered at
  // full colour; an opaque bar painted above it (not a color:transparent trick)
  // is what hides it, and peels back on hover to reveal what was underneath.
  .sc-redact {
    position: relative;
    display: inline-block;
    color: #d8d8d8;
    border-radius: 2px;
    cursor: default;

    &::before {
      content: '';
      position: absolute;
      inset: -1px -3px;
      z-index: 1;
      background: #1a1a1a;
      border-radius: 2px;
      transform-origin: left center;
      transition: transform 0.35s ease;
    }

    &:hover::before {
      transform: scaleX(0);
    }
  }

  // The lore panel's text is vertical (writing-mode + rotate(180deg)), so its
  // redact bars need a different sweep axis than module 01's horizontal text:
  // scaleY anchored at the local top, which lands at the screen's bottom edge
  // once the parent's 180deg rotation is applied.
  .sc-lore-text .sc-redact {
    &::before {
      transform-origin: center top;
    }

    &:hover::before {
      transform: scaleY(0);
    }
  }

</style>

<!-- Non-scoped: `.sc-glitch-word` spans are created at runtime (and some live
     inside ModuleDisplay's own DOM), so they carry no scope attribute and can't
     be reached by scoped rules. Per-word timing is randomised inline in JS. -->
<style lang="scss">
  .sc-glitch-word {
    display: inline-block;
    animation-name: sc-word-glitch;
    animation-timing-function: steps(1, end);
    animation-iteration-count: infinite;
  }

  @keyframes sc-word-glitch {
    0%, 97%, 100% {
      text-shadow: none;
      transform: translateX(0);
    }
    97.5% {
      text-shadow: -2px 0 #ff2e88, 2px 0 #2ee6ff;
      transform: translateX(1px);
    }
    98.5% {
      text-shadow: 2px 0 #ff2e88, -2px 0 #2ee6ff;
      transform: translateX(-2px);
    }
    99.5% {
      text-shadow: -1px 0 #ff2e88, 1px 0 #2ee6ff;
      transform: translateX(1px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sc-glitch-word {
      animation: none;
    }
  }
</style>
