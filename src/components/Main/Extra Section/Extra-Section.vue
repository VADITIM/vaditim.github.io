<template>
  <div ref="rootRef" class="extra-section">

    <div class="ex-header">
      <div ref="eyebrowRef" class="ex-eyebrow">GUESTBOOK&nbsp;·&nbsp;EXTRA</div>
    </div>

    <LabelSet
      :labels="EXTRA_LABELS"
      section-id="extra"
      accent="#f09b3a"
      @press="isLegalOpen = !isLegalOpen"
    />

    <div class="ex-grid">

      <!-- LEFT · comments (live, backed by the comments API) -->
      <ModuleDisplay ref="commentsPanelRef" accent="#f09b3a" class="ex-comments" caption="one message per visitor · stored for everyone">
        <template #label>01 · COMMENTS</template>

        <div class="ex-info" tabindex="0" role="note" aria-label="How the guestbook identifies you">
          <span class="ex-info-mark" aria-hidden="true">i</span>
          <div class="ex-info-card">
            <div class="ex-info-title">HOW ONE-PER-VISITOR WORKS</div>
            <p class="ex-info-text">
              A single request resolves your session, so your comment, your rating and the
              classified unlock can never disagree about who you are.
            </p>
            <p class="ex-info-text">
              You are recognised by a cookie first. If it is gone, a fingerprint built from your
              GPU, screen, timezone and locale finds you again — and a coarser one, paired with a
              hashed IP, still matches you across browsers on the same machine.
            </p>
            <p class="ex-info-text">
              Your message is stored against that identity, so sending again edits the one you
              already left instead of adding a second. It deters double-posting; it is not a login.
            </p>
          </div>
        </div>

        <TransitionGroup
          tag="div"
          class="ex-comment-list"
          name="ex-comment"
          :css="false"
          @enter="handleCommentEnter"
          @leave="handleCommentLeave"
        >
          <div v-if="isCommentsLoaded && comments.length === 0" key="empty" class="ex-comment-empty">
            <div class="ex-comment-empty-title">{{ isCommentsUnavailable ? 'GUESTBOOK OFFLINE' : 'NO MESSAGES YET' }}</div>
            <div class="ex-comment-empty-text">
              {{ isCommentsUnavailable ? 'Could not reach the server — try again later.' : 'Be the first to leave one.' }}
            </div>
          </div>
          <div v-for="comment in comments" :key="comment.id" class="ex-comment">
            <div class="ex-comment-avatar">{{ comment.name.charAt(0).toUpperCase() }}</div>
            <div class="ex-comment-body">
              <div class="ex-comment-meta">
                <span class="ex-comment-name">{{ comment.name }}</span>
                <span class="ex-comment-date">{{ formatCommentDate(comment.createdAtUtc) }}</span>
              </div>
              <div class="ex-comment-text">{{ comment.text }}</div>
            </div>
          </div>
        </TransitionGroup>
        <div class="ex-comment-input">
          <input
            v-model="draftName"
            class="ex-input ex-input-name"
            :class="{ 'ex-input--filled': draftName !== '' }"
            type="text"
            maxlength="40"
            placeholder="Name"
            :disabled="isDraftLocked"
          />
          <textarea
            v-model="draftText"
            class="ex-input"
            :class="{ 'ex-input--filled': draftText !== '' }"
            maxlength="280"
            :placeholder="draftPlaceholder"
            :disabled="isDraftLocked"
          ></textarea>
          <MagneticButton
            type="button"
            class="ex-send-wrap"
            :zone="16"
            :disabled="!isCommentActionEnabled"
            @click="handleCommentAction"
          >{{ commentActionLabel }}</MagneticButton>
        </div>
        <div v-if="submitFeedback" class="ex-submit-feedback">{{ submitFeedback }}</div>
      </ModuleDisplay>

      <!-- MIDDLE · rating (vertical star column, fills bottom-up) -->
      <ModuleDisplay ref="ratingPanelRef" accent="#f09b3a" class="ex-rating" caption="one rating per visitor">
        <template #label>02 · RATING</template>

        <svg class="ex-star-defs" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="exStarGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="#a75f13" />
              <stop offset="55%" stop-color="#f09b3a" />
              <stop offset="100%" stop-color="#ffd08c" />
            </linearGradient>
          </defs>
        </svg>

        <div class="ex-rating-score">
          <span class="ex-rating-score-value">{{ averageDisplay }}</span>
          <span class="ex-rating-score-unit">/ 5</span>
        </div>
        <div class="ex-rating-votes">{{ voteCountLabel }}</div>

        <div class="ex-rating-stars" @mouseleave="hoveredRating = 0">
          <button
            v-for="value in RATING_VALUES"
            :key="value"
            type="button"
            class="ex-star"
            :class="{ 'ex-star--on': value <= highlightedRating }"
            :aria-label="`Rate ${value} out of 5`"
            :aria-pressed="value === ownRating"
            @mouseenter="hoveredRating = value"
            @focus="hoveredRating = value"
            @click="handleRate(value)"
          >
            <svg class="ex-star-glyph" viewBox="0 0 24 24" aria-hidden="true"><path :d="STAR_PATH" /></svg>
          </button>
        </div>
      </ModuleDisplay>

      <!-- RIGHT · contacts (existing container, repositioned into the panel) -->
      <ModuleDisplay ref="contactPanelRef" accent="#f09b3a" class="ex-contact">
        <template #label>03 · CONTACT</template>
        <div class="ex-contact-host">
          <LogsContact />
        </div>
      </ModuleDisplay>

    </div>

    <!-- Legal bow; raised by the PRESS FOR LEGAL label, closed by a press outside it -->
    <LegalSheet ref="sheetRef" v-model="isLegalOpen" accent="#f09b3a">
      <template #hint>LEGAL</template>

      <div class="ex-legal">
        <div class="ex-legal-name">Vadim Niedental</div>
        <div class="ex-legal-rights">© {{ CURRENT_YEAR }} — All rights reserved.</div>
      </div>
    </LegalSheet>

  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { gsap } from 'gsap'
  import { currentSection } from '@modules/sectionsCore'
  import { getSectionIndexById } from '@modules/sectionLookup'
  import { onSectionStatesChange } from '@modules/sectionsStateMachine'
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'
  import { isLiteMode } from '@modules/miscAnimationMode'
  import { playLiteEnter, playLiteLeave } from '@modules/animationLiteFallback'
  import LabelSet from '@components/Misc/Label-Set.vue'
  import ModuleDisplay from '@components/Misc/Module-Display.vue'
  import MagneticButton from '@components/Misc/Magnetic-Button.vue'
  import LogsContact from '@components/Main/Logs Section/Contact.vue'
  import LegalSheet from '@components/Misc/Legal-Sheet.vue'
  import { canEditComment, comments, isCommentsLoaded, isCommentsUnavailable, loadComments, ownComment, saveCommentEdit, submitComment, submitState } from '@modules/extraComments'
  import { loadRatingSummary, ownRating, ratingSummary, submitRating } from '@modules/extraRating'
  import { resolveVisitorSession } from '@modules/visitorSession'

  const EXTRA_LABELS = [
    { text: 'IMPRESSED? // SAY_HI!', pos: { top: '5%', left: '4%' }, stretch: true },
    { text: 'PRESS FOR LEGAL', pos: { bottom: '5%', right: '4%' }, press: true },
  ]

  const CURRENT_YEAR = new Date().getFullYear()

  // Rendered top-down, so the highest score sits at the top of the column and
  // the fill grows upwards as the visitor picks a higher rating.
  const RATING_VALUES = [5, 4, 3, 2, 1]
  const STAR_PATH = 'M12 2.2 14.95 8.65 22 9.55 16.8 14.4 18.15 21.4 12 17.9 5.85 21.4 7.2 14.4 2 9.55 9.05 8.65Z'

  const draftName = ref('')
  const draftText = ref('')
  const isEditingComment = ref(false)

  const hasPosted = computed(() => ownComment.value !== null)
  const isDraftValid = computed(() => draftName.value.trim() !== '' && draftText.value.trim() !== '')

  // SEND while nothing is posted, EDIT once a comment exists, SAVE while that one
  // permitted edit is open. All three share the button slot, so the visitor never
  // sees two calls to action at once.
  const commentAction = computed(() => !hasPosted.value ? 'send' : isEditingComment.value ? 'save' : 'edit')
  const commentActionLabel = computed(() => commentAction.value.toUpperCase())

  const isDraftLocked = computed(() => hasPosted.value && !isEditingComment.value)
  const draftPlaceholder = computed(() =>
    isDraftLocked.value ? 'You already left your message.' : 'Leave a message…')

  const isCommentActionEnabled = computed(() => {
    if (submitState.value === 'sending') return false
    if (commentAction.value === 'edit') return canEditComment.value
    return isDraftValid.value
  })

  const submitFeedback = computed(() => {
    switch (submitState.value) {
      case 'sent': return 'Message saved — thanks!'
      case 'saved': return 'Edit saved — that was your one.'
      case 'alreadyPosted': return 'You already have a comment.'
      case 'editSpent': return 'You have already used your one edit.'
      case 'rateLimited': return 'Too many attempts — try again in a few minutes.'
      case 'error': return 'Could not reach the guestbook. Try again later.'
      default: return ''
    }
  })

  function formatCommentDate(isoDate: string) {
    return new Date(isoDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  async function handleCommentAction() {
    if (!isCommentActionEnabled.value) return

    if (commentAction.value === 'edit') {
      draftName.value = ownComment.value?.name ?? ''
      draftText.value = ownComment.value?.text ?? ''
      isEditingComment.value = true
      return
    }

    if (commentAction.value === 'send') {
      await submitComment(draftName.value.trim(), draftText.value.trim())
      return
    }

    await saveCommentEdit(draftName.value.trim(), draftText.value.trim())
    // Closes on a rejection too — the server just told us the edit is gone, and
    // leaving the form open would invite the visitor to retry something it refuses.
    isEditingComment.value = false
  }

  function handleCommentEnter(element: Element, done: () => void) {
    gsap.fromTo(element,
      { x: '-100%', opacity: 0 },
      { x: '0%', opacity: 1, duration: 0.55, ease: 'back.out(1.4)', overwrite: 'auto', onComplete: done })
  }

  function handleCommentLeave(element: Element, done: () => void) {
    gsap.to(element, { x: '-100%', opacity: 0, duration: 0.25, ease: 'power2.in', overwrite: 'auto', onComplete: done })
  }

  // ── rating ──
  // The stars carry the visitor's own pick; the readout carries everyone's.
  const hoveredRating = ref(0)

  const highlightedRating = computed(() => hoveredRating.value || ownRating.value || 0)
  const averageDisplay = computed(() =>
    ratingSummary.value && ratingSummary.value.count > 0 ? ratingSummary.value.average.toFixed(1) : '—')
  const voteCountLabel = computed(() => {
    const count = ratingSummary.value?.count ?? 0
    return count === 1 ? '1 VOTE' : `${count} VOTES`
  })

  function handleRate(value: number) {
    void submitRating(value)
  }

  const rootRef = ref<HTMLElement | null>(null)
  const eyebrowRef = ref<HTMLElement | null>(null)
  const commentsPanelRef = ref<InstanceType<typeof ModuleDisplay> | null>(null)
  const ratingPanelRef = ref<InstanceType<typeof ModuleDisplay> | null>(null)
  const contactPanelRef = ref<InstanceType<typeof ModuleDisplay> | null>(null)
  const sheetRef = ref<InstanceType<typeof LegalSheet> | null>(null)
  const isLegalOpen = ref(false)

  const extraIndex = getSectionIndexById('extra')

  // ── enter / leave ──
  function playReveal() {
    const commentsEl = commentsPanelRef.value?.element ?? null,
      ratingEl = ratingPanelRef.value?.element ?? null,
      contactEl = contactPanelRef.value?.element ?? null
    gsap.killTweensOf([eyebrowRef.value, commentsEl, ratingEl, contactEl])

    if (isLiteMode.value) {
      playLiteEnter([eyebrowRef.value, commentsEl, contactEl, ratingEl])
      sheetRef.value?.reveal(SECTION_ENTER_DELAY + 0.35)
      return
    }

    const timeline = gsap.timeline({ delay: SECTION_ENTER_DELAY })
    timeline.fromTo(eyebrowRef.value, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1)
    timeline.fromTo(commentsEl, { x: '-28vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.65, ease: 'back.out(1.3)' }, 0.18)
    timeline.fromTo(contactEl, { x: '28vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.65, ease: 'back.out(1.3)' }, 0.18)
    timeline.fromTo(ratingEl, { y: '24vh', opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'back.out(1.3)' }, 0.26)
    sheetRef.value?.reveal(SECTION_ENTER_DELAY + 0.35)
  }

  function playLeave() {
    const commentsEl = commentsPanelRef.value?.element ?? null,
      ratingEl = ratingPanelRef.value?.element ?? null,
      contactEl = contactPanelRef.value?.element ?? null
    gsap.killTweensOf([eyebrowRef.value, commentsEl, ratingEl, contactEl])

    if (isLiteMode.value) {
      playLiteLeave([eyebrowRef.value, commentsEl, contactEl, ratingEl])
      sheetRef.value?.hide()
      return
    }

    gsap.to(eyebrowRef.value, { y: -20, opacity: 0, duration: 0.22, ease: 'power3.in', overwrite: 'auto' })
    gsap.to(commentsEl, { x: '-28vw', opacity: 0, duration: 0.28, ease: 'power2.in', overwrite: 'auto' })
    gsap.to(contactEl, { x: '28vw', opacity: 0, duration: 0.28, ease: 'power2.in', overwrite: 'auto' })
    gsap.to(ratingEl, { y: '24vh', opacity: 0, duration: 0.28, ease: 'power2.in', overwrite: 'auto' })
    sheetRef.value?.hide()
  }

  let stopSectionWatch: (() => void) | null = null

  onMounted(() => {
    stopSectionWatch = onSectionStatesChange((meta) => {
      if (meta.isLeavingSection(extraIndex)) playLeave()
      else if (meta.isEnteringSection(extraIndex)) playReveal()
    })
    if (currentSection.value === extraIndex) playReveal()
    // Identity was already asked for at the EXPLORE press; this awaits that answer
    // rather than sending a second one. The public lists are per-visit, so they load here.
    void resolveVisitorSession()
    void loadComments()
    void loadRatingSummary()
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
    // wrapper, landing one viewport down; pull back up to fill the viewport.
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
    grid-template-columns: 2fr .5fr 1fr;
    gap: 18px;

    @include allMobile {
      grid-template-columns: 1fr;
      grid-template-rows: 1.2fr 0.8fr 1fr;
    }
  }

  // ── comments skeleton ──
  // Sits in the panel's top-right corner, opposite ModuleDisplay's own label.
  // The card opens downward and stays inside the panel, which clips overflow.
  .ex-info {
    position: absolute;
    top: 10px;
    right: 12px;
    z-index: 6;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #3a3a3a;
    border-radius: 50%;
    color: #6a6a6a;
    cursor: help;
    transition: color 0.2s, border-color 0.2s;

    &:hover,
    &:focus-visible {
      color: var(--accent);
      border-color: var(--accent);
      outline: none;
    }
  }

  .ex-info-mark {
    font-family: 'Mono';
    font-size: 11px;
    line-height: 1;
  }

  .ex-info-card {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: min(300px, 70vw);
    padding: 12px 14px;
    background: #141414;
    border: 1px solid #2c2c2c;
    border-radius: 8px;
    opacity: 0;
    transform: translateY(-6px);
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .ex-info:hover .ex-info-card,
  .ex-info:focus-visible .ex-info-card {
    opacity: 1;
    transform: translateY(0);
  }

  .ex-info-title {
    margin-bottom: 8px;
    font-family: 'Audiowide';
    font-size: 9px;
    letter-spacing: 2px;
    color: var(--accent);
  }

  .ex-info-text {
    margin: 0 0 8px;
    font-family: 'Mono';
    font-size: 10px;
    line-height: 1.6;
    color: #8a8a8a;
    text-align: left;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .ex-comment-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    // Posted comments slide in from off the panel's left edge; clip the travel
    // so they never bleed over the panel border.
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 4px 18px;
  }

  .ex-comment {
    display: flex;
    gap: 16px;
    padding: 16px 18px;
    border: 1px solid #222;
    border-radius: 10px;
    background: #171717;
    will-change: transform, opacity;
  }

  .ex-comment-move {
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .ex-comment-avatar {
    flex: 0 0 auto;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #232323;
    border: 1px solid #2e2e2e;
    font-family: 'Audiowide';
    font-size: 1.15rem;
    color: #f09b3a;
  }

  .ex-comment-body {
    min-width: 0;
  }

  .ex-comment-meta {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 6px;
  }

  .ex-comment-name {
    font-family: 'Audiowide';
    font-size: 13px;
    letter-spacing: 1px;
    color: #f09b3a;
  }

  .ex-comment-date {
    font-family: 'Mono';
    font-size: 10px;
    color: #8a8a8a;
  }

  .ex-comment-text {
    font-family: 'Mono';
    font-size: 14px;
    line-height: 1.6;
    color: #b07c43;
  }

  .ex-comment-empty {
    margin: auto;
    width: 60%;
    padding: 18px 16px;
    text-align: center;
    border: 1px dashed #2a2a2a;
    border-radius: 8px;
    background: rgba(23, 23, 23, 0.6);
  }

  .ex-comment-empty-title {
    font-family: 'Audiowide';
    font-size: 11px;
    letter-spacing: 3px;
    color: #f09b3a;
    margin-bottom: 6px;
  }

  .ex-comment-empty-text {
    font-family: 'Mono';
    font-size: 11px;
    color: #6a6a6a;
  }

  .ex-comment-input {
    display: flex;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid #202020;
  }

  .ex-input {
    flex: 1;
    // Explicit height rather than the textarea's `rows`, so the name field, the
    // message field and the SEND button all share one control height.
    height: 42px;
    resize: none;
    padding: 10px 14px;
    font-family: 'Mono';
    font-size: 13px;
    line-height: 1.5;
    // Centred while empty so the placeholder sits in the middle of the field;
    // typing flips it to the left so long text doesn't crawl outwards.
    text-align: center;
    color: #bbb;
    background: #181818;
    border: 1px solid #2a2a2a;
    border-radius: 6px;

    &::placeholder { color: #4a4a4a; }
    &:disabled { cursor: not-allowed; }
  }

  .ex-input--filled {
    text-align: left;
  }

  .ex-input-name {
    flex: 0 0 14%;
  }

  .ex-submit-feedback {
    padding: 0 16px 12px;
    font-family: 'Mono';
    font-size: 11px;
    color: #f09b3a;
  }

  .ex-send-wrap {
    align-self: stretch;

    :deep(.mag-btn) {
      height: 100%;
      padding: 0px 24px;
      font-family: 'Audiowide';
      font-size: 14px;
      letter-spacing: 2px;
      color: #0e0e0e;
      background: #f09b3a;
      border-radius: 6px;
    }

    &:has(:disabled) :deep(.mag-btn) { opacity: 0.35; }
  }

  // ── rating panel ──
  // Zero-size host for the shared star gradient; the stars reference it by id.
  .ex-star-defs {
    position: absolute;
    width: 0;
    height: 0;
  }

  .ex-rating-score {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 6px;
  }

  .ex-rating-score-value {
    font-family: 'Audiowide';
    font-size: 2rem;
    letter-spacing: 2px;
    color: #f09b3a;
  }

  .ex-rating-score-unit {
    font-family: 'Mono';
    font-size: 11px;
    color: #4a4a4a;
  }

  .ex-rating-votes {
    margin-top: 4px;
    text-align: center;
    font-family: 'Mono';
    font-size: 10px;
    letter-spacing: 2px;
    color: #6a6a6a;
  }

  .ex-rating-stars {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .ex-star {
    padding: 2px;
    line-height: 0;
    background: none;
    border: none;
    cursor: pointer;

    &:focus-visible {
      outline: 1px solid #f09b3a;
      outline-offset: 2px;
      border-radius: 4px;
    }

    &:hover .ex-star-glyph { transform: scale(1.12); }
  }

  .ex-star-glyph {
    width: clamp(1.9rem, 3.2vw, 3.2rem);
    height: auto;
    transition: transform 0.2s ease, filter 0.2s ease;

    path {
      fill: transparent;
      stroke: #333;
      stroke-width: 1.2;
      transition: fill 0.2s ease, stroke 0.2s ease;
    }
  }

  .ex-star--on {
    .ex-star-glyph { filter: drop-shadow(0 0 7px rgba(240, 155, 58, 0.4)); }

    path {
      fill: url(#exStarGradient);
      stroke: rgba(255, 208, 140, 0.55);
    }
  }

  // ── contact panel: re-anchor the existing container inside the panel ──
  .ex-contact-host {
    position: relative;
    flex: 1;
    min-height: 0;

    // The container is sized for the wide Logs layout; the 20% column here is
    // far narrower, so re-scale it to the panel instead of letting it overflow.
    :deep(.contact-container) {
      @include absoluteCenter(50%, 50%);
      width: 100%;
      height: auto;

      > a {
        width: clamp(3.5rem, 7vw, 7rem);
        height: clamp(3.5rem, 7vw, 7rem);
        margin: 1.2rem 0;
      }

      > span {
        font-size: clamp(0.85rem, 1.1vw, 1.3rem);
      }
    }
  }

  // ── legal content (inside LegalSheet slot) ──
  .ex-legal {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
  }

  .ex-legal-name {
    font-family: 'Audiowide';
    font-size: 16px;
    letter-spacing: 4px;
  }

  .ex-legal-rights {
    font-family: 'Mono';
    font-size: 12px;
    color: rgba(22, 22, 22, 0.7);
  }
</style>
