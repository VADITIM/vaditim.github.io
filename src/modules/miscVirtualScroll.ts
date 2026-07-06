import { navigationLockRef } from './miscNavigationLock';
import { isSectionLocked } from './sectionLookup';

let totalSections = 3;
let sectionHeightVh = 100;
let resizeRaf = 0;
let smoothScrollRaf = 0;
let wheelIntent = 0;
let targetScrollY = 0;

let touchStartY: number | null = null;
let touchStartX: number | null = null;
let activeTouchId: number | null = null;

const WHEEL_STROKE_THRESHOLD = 100;
const TOUCH_SWIPE_THRESHOLD_PX = 50;
const SMOOTH_FACTOR = 0.2;
const MIN_SCROLL_DELTA = 0.5;

// A wheel gesture (especially trackpad inertia) emits events long after the
// stroke that triggered a transition. After the gate releases, wheel input
// stays dead until the stream pauses for at least this long, so momentum from
// the previous gesture can never fire a second stroke.
const WHEEL_REST_MS = 200;

// Safety net: if the release signal from sectionsCore never arrives (lost
// timer, interrupted transition), the gate force-releases and realigns so
// scrolling can never dead-lock.
const GATE_FALLBACK_RELEASE_MS = 2600;

/**
 * Scroll gate — the single authority over whether scroll input may register.
 *
 * - `idle`: strokes accumulate and may trigger exactly one ±1 section step.
 * - `locked`: engaged the instant a stroke fires AND whenever sectionsCore
 *   signals a section change (nav clicks included). Every wheel/touch/key
 *   input is dropped and intent is discarded.
 * - `awaitingWheelRest`: entered on release; wheel input stays dropped until
 *   the gesture's momentum tail has rested (see WHEEL_REST_MS).
 */
type ScrollGateState = 'idle' | 'locked' | 'awaitingWheelRest';
let scrollGateState: ScrollGateState = 'idle';
let lastWheelEventMs = 0;
let gateFallbackTimer = 0;

// Authoritative section tracker for the scroll layer. Strokes step this by
// exactly ±1; it is re-synced to sectionsCore's currentSection on every gate
// release, so scroll position and displayed section can never drift apart.
let currentVirtualSectionIndex = 0;

// The virtual scroll only runs on desktop (see App.vue); sectionsCore calls
// the gate hooks unconditionally, so they must no-op until initialized.
let isVirtualScrollActive = false;

const BLOCKED_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ',
]);

const absorbEvent = (event: Event) => event.preventDefault();

// Scroll keys are absorbed permanently — native key scrolling would move
// scrollY outside the stroke system and desync the section tracking.
const absorbScrollKey = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
  if (BLOCKED_KEYS.has(event.key)) event.preventDefault();
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getTotalHeightVh = () => totalSections * sectionHeightVh;

// Locked sections (currently just Classified) sit at the end of the registry and
// must never be a reachable scroll target.
const getMaxReachableSectionIndex = () => {
  let index = totalSections - 1;
  while (index > 0 && isSectionLocked(index)) index -= 1;
  return index;
};

const getMaxScroll = () =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

export const getVirtualSectionHeightVh = () => sectionHeightVh;

export const getVirtualSectionHeightPx = () =>
  window.innerHeight * (sectionHeightVh / 100);

const getSectionIndexFromScroll = (scrollY: number) => {
  const sectionHeight = getVirtualSectionHeightPx();

  if (sectionHeight <= 0) return 0;

  return clamp(
    Math.round(scrollY / sectionHeight),
    0,
    Math.max(0, totalSections - 1)
  );
};

const updateScrollHeight = () => {
  const totalHeightVh = getTotalHeightVh();
  document.body.style.height = `${totalHeightVh}vh`;
  document.documentElement.style.height = `${totalHeightVh}vh`;
};

const handleResize = () => {
  if (resizeRaf) return;
  resizeRaf = window.requestAnimationFrame(() => {
    resizeRaf = 0;
    updateScrollHeight();
    targetScrollY = clamp(targetScrollY, 0, getMaxScroll());
  });
};

const normalizeWheelDelta = (event: WheelEvent) => {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * window.innerHeight;
  }

  return event.deltaY;
};

const startSmoothScroll = () => {
  if (smoothScrollRaf) return;

  const animate = () => {
    if (navigationLockRef.value) {
      // Paused while a transition holds the navigation lock; the gate release
      // realigns targetScrollY and restarts, so the scroll always completes
      // to the correct section boundary.
      smoothScrollRaf = 0;
      return;
    }

    const maxScroll = getMaxScroll();
    targetScrollY = clamp(targetScrollY, 0, maxScroll);

    const currentScroll = window.scrollY;
    const distance = targetScrollY - currentScroll;

    if (Math.abs(distance) <= MIN_SCROLL_DELTA) {
      window.scrollTo({ top: targetScrollY });
      smoothScrollRaf = 0;
      return;
    }

    const nextScroll = currentScroll + distance * SMOOTH_FACTOR;
    window.scrollTo({ top: nextScroll });
    smoothScrollRaf = window.requestAnimationFrame(animate);
  };

  smoothScrollRaf = window.requestAnimationFrame(animate);
};

const isScrollGateLocked = () =>
  scrollGateState === 'locked' || navigationLockRef.value;

const engageScrollGate = () => {
  if (!isVirtualScrollActive) return;

  wheelIntent = 0;
  scrollGateState = 'locked';
  window.addEventListener('touchmove', absorbEvent, { passive: false });

  if (gateFallbackTimer) clearTimeout(gateFallbackTimer);
  gateFallbackTimer = window.setTimeout(() => {
    releaseScrollGate(currentVirtualSectionIndex);
  }, GATE_FALLBACK_RELEASE_MS);
};

const realignToSection = (sectionIndex: number) => {
  currentVirtualSectionIndex = clamp(sectionIndex, 0, Math.max(0, totalSections - 1));
  targetScrollY = currentVirtualSectionIndex * getVirtualSectionHeightPx();
  startSmoothScroll();
};

const clearGateLock = () => {
  if (gateFallbackTimer) {
    clearTimeout(gateFallbackTimer);
    gateFallbackTimer = 0;
  }
  window.removeEventListener('touchmove', absorbEvent);
  wheelIntent = 0;
};

const releaseScrollGate = (activeSectionIndex: number) => {
  if (!isVirtualScrollActive) return;

  clearGateLock();
  scrollGateState = 'awaitingWheelRest';
  realignToSection(activeSectionIndex);
};

const requestSectionStep = (step: 1 | -1) => {
  const nextSectionIndex = clamp(
    currentVirtualSectionIndex + step,
    0,
    getMaxReachableSectionIndex()
  );

  if (nextSectionIndex === currentVirtualSectionIndex) return;

  currentVirtualSectionIndex = nextSectionIndex;
  targetScrollY = nextSectionIndex * getVirtualSectionHeightPx();
  engageScrollGate();
  startSmoothScroll();
};

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();

  const now = performance.now();
  const msSincePreviousWheelEvent = now - lastWheelEventMs;
  lastWheelEventMs = now;

  if (isScrollGateLocked()) {
    wheelIntent = 0;
    return;
  }

  if (scrollGateState === 'awaitingWheelRest') {
    if (msSincePreviousWheelEvent < WHEEL_REST_MS) return;
    scrollGateState = 'idle';
  }

  wheelIntent += normalizeWheelDelta(event);

  if (Math.abs(wheelIntent) < WHEEL_STROKE_THRESHOLD) return;

  // One stroke per gesture: a single ±1 step, intent fully discarded.
  const step = wheelIntent > 0 ? 1 : -1;
  wheelIntent = 0;
  requestSectionStep(step);
};

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length !== 1) return;
  const touch = event.touches[0];
  activeTouchId = touch.identifier;
  touchStartY = touch.clientY;
  touchStartX = touch.clientX;
};

const handleTouchEnd = (event: TouchEvent) => {
  if (touchStartY === null || touchStartX === null || activeTouchId === null) return;

  const changed = Array.from(event.changedTouches).find(
    (touch) => touch.identifier === activeTouchId
  );

  const startY = touchStartY;
  const startX = touchStartX;
  touchStartY = null;
  touchStartX = null;
  activeTouchId = null;

  if (!changed) return;
  if (isScrollGateLocked()) return;

  const deltaY = changed.clientY - startY;
  const deltaX = changed.clientX - startX;

  if (Math.abs(deltaY) < TOUCH_SWIPE_THRESHOLD_PX) return;
  if (Math.abs(deltaY) < Math.abs(deltaX)) return;

  // Swipe up (deltaY < 0) => move forward (down the page)
  requestSectionStep(deltaY < 0 ? 1 : -1);
};

export function InitializeVirtualScroll(sectionCount = 3, sectionVh = 100) {
  totalSections = sectionCount;
  sectionHeightVh = Math.max(1, sectionVh);
  updateScrollHeight();
  targetScrollY = clamp(window.scrollY, 0, getMaxScroll());
  wheelIntent = 0;
  scrollGateState = 'idle';
  currentVirtualSectionIndex = getSectionIndexFromScroll(window.scrollY);
  isVirtualScrollActive = true;
  window.addEventListener('resize', handleResize);
  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('keydown', absorbScrollKey, { passive: false });

  // Touch devices (mobile/tablet) don't emit wheel events reliably.
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
}

export function setVirtualSectionHeightVh(sectionVh: number) {
  sectionHeightVh = Math.max(1, sectionVh);
  updateScrollHeight();
  targetScrollY = clamp(targetScrollY, 0, getMaxScroll());
  currentVirtualSectionIndex = getSectionIndexFromScroll(window.scrollY);
}

/** Engage the gate the moment a section-change signal fires (sectionsCore). */
export function lockVirtualScrollForSectionTransition() {
  engageScrollGate();
}

/**
 * Release the gate once the transition has fully finished (sectionsCore).
 * `activeSectionIndex` is the authoritative currentSection; the scroll layer
 * realigns to it so the displayed section is always correct.
 */
export function releaseVirtualScrollAfterSectionTransition(activeSectionIndex: number) {
  releaseScrollGate(activeSectionIndex);
}

/** Keep the scroll layer in sync with programmatic jumps (nav menu clicks). */
export function syncVirtualScrollToSection(sectionIndex: number) {
  if (!isVirtualScrollActive) return;
  currentVirtualSectionIndex = clamp(sectionIndex, 0, Math.max(0, totalSections - 1));
  targetScrollY = currentVirtualSectionIndex * getVirtualSectionHeightPx();
}

export function unlockScroll() {
  clearGateLock();
  scrollGateState = 'idle';
}
