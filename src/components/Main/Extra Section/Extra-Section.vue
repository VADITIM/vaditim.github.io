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
      <ModuleDisplay ref="commentsPanelRef" accent="#f09b3a" class="ex-comments" caption="one message per visitor · stored for everyone">
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
          <MagneticButton type="button" class="ex-send-wrap" :zone="16" :disabled="true">SEND</MagneticButton>
        </div>
      </ModuleDisplay>

      <!-- RIGHT · contacts (existing container, repositioned into the panel) -->
      <ModuleDisplay ref="contactPanelRef" accent="#f09b3a" class="ex-contact">
        <template #label>02 · CONTACT</template>
        <div class="ex-contact-host">
          <LogsContact />
        </div>
      </ModuleDisplay>

    </div>

    <!-- Impressum bottom-sheet — drag the handle up to reveal -->
    <DraggableSheet ref="sheetRef" v-model="impressumOpen" accent="#f09b3a">
      <template #hint>IMPRESSUM&nbsp;▲</template>
      <MagneticButton type="button" class="ex-impressum-close-wrap" :zone="14" @click="impressumOpen = false">✕</MagneticButton>

      <div class="ex-impressum-title">IMPRESSUM</div>

      <div class="ex-impressum-body">

        <section class="imp-block">
          <h3 class="imp-section-label">Angaben gemäß § 5 TMG</h3>
          <p>Vadim Niedental</p>
          <p>Musterstraße 1</p>
          <p>00000 Musterstadt</p>
          <p>Deutschland</p>
        </section>

        <section class="imp-block">
          <h3 class="imp-section-label">Kontakt</h3>
          <p>E-Mail: <a class="imp-link" href="mailto:vadim.niedental@gmail.com">vadim.niedental@gmail.com</a></p>
        </section>

        <section class="imp-block">
          <h3 class="imp-section-label">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
          <p>Vadim Niedental</p>
          <p>Musterstraße 1</p>
          <p>00000 Musterstadt</p>
        </section>

        <section class="imp-block">
          <h3 class="imp-section-label">Haftungsausschluss</h3>
          <p class="imp-paragraph">
            Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt.
            Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann
            jedoch keine Gewähr übernommen werden.
          </p>
        </section>

        <section class="imp-block">
          <h3 class="imp-section-label">Urheberrecht</h3>
          <p class="imp-paragraph">
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen
            Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
            Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
            Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
            jeweiligen Autors bzw. Erstellers.
          </p>
        </section>

        <p class="ex-impressum-note">— Adresse und weitere Angaben werden noch ergänzt —</p>

      </div>
    </DraggableSheet>

  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { gsap } from 'gsap'
  import { currentSection } from '@modules/sectionsCore'
  import { getSectionIndexById } from '@modules/sectionLookup'
  import { onSectionStatesChange } from '@modules/sectionsStateMachine'
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'
  import LabelSet from '@components/Misc/Label-Set.vue'
  import ModuleDisplay from '@components/Misc/Module-Display.vue'
  import MagneticButton from '@components/Misc/Magnetic-Button.vue'
  import LogsContact from '@components/Main/Logs Section/Contact.vue'
  import DraggableSheet from '@components/Misc/Draggable-Sheet.vue'

  const EXTRA_LABELS = [
    { text: 'IMPRESSED? SAY HI!', pos: { top: '5%', left: '4%' }, stretch: true },
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
  const sheetRef = ref<InstanceType<typeof DraggableSheet> | null>(null)
  const impressumOpen = ref(false)

  const extraIndex = getSectionIndexById('extra')

  // ── enter / leave ──
  function playReveal() {
    const commentsEl = commentsPanelRef.value?.el, contactEl = contactPanelRef.value?.el
    gsap.killTweensOf([eyebrowRef.value, commentsEl, contactEl])

    const tl = gsap.timeline({ delay: SECTION_ENTER_DELAY })
    tl.fromTo(eyebrowRef.value, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1)
    tl.fromTo(commentsEl, { x: '28vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.65, ease: 'back.out(1.3)' }, 0.18)
    tl.fromTo(contactEl, { x: '-28vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.65, ease: 'back.out(1.3)' }, 0.18)
    sheetRef.value?.reveal(SECTION_ENTER_DELAY + 0.35)
  }

  function playLeave() {
    const commentsEl = commentsPanelRef.value?.el, contactEl = contactPanelRef.value?.el
    gsap.killTweensOf([eyebrowRef.value, commentsEl, contactEl])
    gsap.to(eyebrowRef.value, { y: -20, opacity: 0, duration: 0.22, ease: 'power3.in', overwrite: 'auto' })
    gsap.to(commentsEl, { x: '28vw', opacity: 0, duration: 0.28, ease: 'power2.in', overwrite: 'auto' })
    gsap.to(contactEl, { x: '-28vw', opacity: 0, duration: 0.28, ease: 'power2.in', overwrite: 'auto' })
    sheetRef.value?.hide()
  }

  let stopSectionWatch: (() => void) | null = null

  onMounted(() => {
    stopSectionWatch = onSectionStatesChange((meta) => {
      if (meta.isLeavingSection(extraIndex)) playLeave()
      else if (meta.isEnteringSection(extraIndex)) playReveal()
    })
    if (currentSection.value === extraIndex) playReveal()
  })

  onBeforeUnmount(() => {
    stopSectionWatch?.()
    stopSectionWatch = null
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

  .ex-send-wrap {
    align-self: stretch;

    :deep(.mag-btn) {
      height: 100%;
      padding: 0 22px;
      font-family: 'Audiowide';
      font-size: 12px;
      letter-spacing: 2px;
      color: #0e0e0e;
      background: #f09b3a;
      border-radius: 6px;
      opacity: 0.35;
    }
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

  // ── impressum content (inside DraggableSheet slot) ──
  .ex-impressum-close-wrap {
    position: absolute;
    top: 12px;
    right: 14px;

    :deep(.mag-btn) {
      width: 1.8rem;
      height: 1.8rem;
      font-family: 'Mono';
      font-size: 0.9rem;
      color: #161616;
      background: rgba(0, 0, 0, 0.12);
      border-radius: 50%;
      transition: background 0.2s ease;

      &:hover { background: rgba(0, 0, 0, 0.25); }
    }
  }

  .ex-impressum-title {
    font-family: 'Audiowide';
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 5px;
    margin-bottom: 24px;
  }

  .ex-impressum-body {
    font-family: 'Mono';
    font-size: 14px;
    font-weight: 500;
    line-height: 1.8;
    display: flex;
    flex-direction: column;
    gap: 24px;

    p { margin: 0; }
  }

  .imp-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .imp-section-label {
    font-family: 'Audiowide';
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(22, 22, 22, 0.5);
    margin: 0 0 8px;
  }

  .imp-paragraph {
    font-size: 13px;
    line-height: 1.9;
    color: rgba(22, 22, 22, 0.75);
  }

  .imp-link {
    color: #161616;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .ex-impressum-note {
    font-size: 12px;
    font-weight: 400;
    opacity: 0.45;
  }
</style>
