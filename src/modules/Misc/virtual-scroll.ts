import { navigationLockRef } from './navigation-lock';
let totalSections = 3;
let sectionHeightVh = 100;
let resizeRaf = 0;
let smoothScrollRaf = 0;
let wheelIntent = 0;
let targetScrollY = 0;

let touchStartY: number | null = null;
let touchStartX: number | null = null;
let activeTouchId: number | null = null;

const STROKE_DISTANCE_VH = 100;
const SECTION_SCROLL_COOLDOWN_MS = 1000;
const WHEEL_STROKE_THRESHOLD = 100;
const TOUCH_SWIPE_THRESHOLD_PX = 50;
const SMOOTH_FACTOR = 0.2;
const MIN_SCROLL_DELTA = 0.5;

let scrollLockedUntilMs = 0;
let lastReachedSectionIndex = 0;
let sectionLockTimer = 0;

const BLOCKED_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ',
]);

const absorbEvent = (e: Event) => e.preventDefault();
const absorbKey   = (e: KeyboardEvent) => { if (BLOCKED_KEYS.has(e.key)) e.preventDefault(); };

const lockScrollInput = () => {
  window.addEventListener('wheel',      absorbEvent, { passive: false });
  window.addEventListener('touchmove',  absorbEvent, { passive: false });
  window.addEventListener('keydown',    absorbKey,   { passive: false });
};

const unlockScrollInput = () => {
  window.removeEventListener('wheel',     absorbEvent);
  window.removeEventListener('touchmove', absorbEvent);
  window.removeEventListener('keydown',   absorbKey);
};

const beginSectionCooldown = () => {
  lockScrollInput();
  scrollLockedUntilMs = performance.now() + SECTION_SCROLL_COOLDOWN_MS;

  if (sectionLockTimer) clearTimeout(sectionLockTimer);
  sectionLockTimer = window.setTimeout(() => {
    unlockScrollInput();
    scrollLockedUntilMs = 0;
    sectionLockTimer = 0;
  }, SECTION_SCROLL_COOLDOWN_MS);
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getTotalHeightVh = () => totalSections * sectionHeightVh;

const getMaxScroll = () =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

export const getVirtualSectionHeightVh = () => sectionHeightVh;

export const getVirtualSectionHeightPx = () =>
  window.innerHeight * (sectionHeightVh / 100);

const getStrokeDistancePx = () =>
  window.innerHeight * (STROKE_DISTANCE_VH / 100);

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
      targetScrollY = window.scrollY;
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

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();

  if (navigationLockRef.value) {
    wheelIntent = 0;
    return;
  }

  if (scrollLockedUntilMs > 0) {
    wheelIntent = 0;
    return;
  }

  wheelIntent += normalizeWheelDelta(event);

  let steps = 0;

  while (Math.abs(wheelIntent) >= WHEEL_STROKE_THRESHOLD) {
    const direction = Math.sign(wheelIntent);
    steps += direction;
    wheelIntent -= direction * WHEEL_STROKE_THRESHOLD;
  }

  if (steps === 0) return;

  const strokeDistancePx = getStrokeDistancePx();
  const sectionHeight = getVirtualSectionHeightPx();
  const newTargetY = clamp(
    targetScrollY + steps * strokeDistancePx,
    0,
    getMaxScroll()
  );

  const newSectionIndex = clamp(
    Math.round(newTargetY / sectionHeight),
    0,
    totalSections - 1
  );
  targetScrollY = newSectionIndex * sectionHeight;

  if (newSectionIndex !== lastReachedSectionIndex) {
    lastReachedSectionIndex = newSectionIndex;
    beginSectionCooldown();
  }

  startSmoothScroll();
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

  if (navigationLockRef.value) {
    touchStartY = null;
    touchStartX = null;
    activeTouchId = null;
    return;
  }

  const changed = Array.from(event.changedTouches).find(
    (t) => t.identifier === activeTouchId
  );
  if (!changed) return;

  if (scrollLockedUntilMs > 0) {
    touchStartY = null;
    touchStartX = null;
    activeTouchId = null;
    return;
  }

  const deltaY = changed.clientY - touchStartY;
  const deltaX = changed.clientX - touchStartX;

  touchStartY = null;
  touchStartX = null;
  activeTouchId = null;

  if (Math.abs(deltaY) < TOUCH_SWIPE_THRESHOLD_PX) return;
  if (Math.abs(deltaY) < Math.abs(deltaX)) return;

  // Swipe up (deltaY < 0) => move forward (down the page)
  const step = deltaY < 0 ? 1 : -1;
  const sectionHeight = getVirtualSectionHeightPx();
  const baseIndex = getSectionIndexFromScroll(window.scrollY);
  const newSectionIndex = clamp(baseIndex + step, 0, Math.max(0, totalSections - 1));

  targetScrollY = newSectionIndex * sectionHeight;

  if (newSectionIndex !== lastReachedSectionIndex) {
    lastReachedSectionIndex = newSectionIndex;
    beginSectionCooldown();
  }

  startSmoothScroll();
};

export function InitializeVirtualScroll(sectionCount = 3, sectionVh = 100) {
  totalSections = sectionCount;
  sectionHeightVh = Math.max(1, sectionVh);
  updateScrollHeight();
  targetScrollY = clamp(window.scrollY, 0, getMaxScroll());
  wheelIntent = 0;
  scrollLockedUntilMs = 0;
  sectionLockTimer = 0;
  lastReachedSectionIndex = getSectionIndexFromScroll(window.scrollY);
  window.addEventListener("resize", handleResize);
  window.addEventListener("wheel", handleWheel, { passive: false });

  // Touch devices (mobile/tablet) don't emit wheel events reliably.
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });
}

export function setVirtualSectionHeightVh(sectionVh: number) {
  sectionHeightVh = Math.max(1, sectionVh);
  updateScrollHeight();
  targetScrollY = clamp(targetScrollY, 0, getMaxScroll());
  lastReachedSectionIndex = getSectionIndexFromScroll(window.scrollY);
}

export function unlockScroll() {
  unlockScrollInput();
  if (sectionLockTimer) clearTimeout(sectionLockTimer);
  scrollLockedUntilMs = 0;
  sectionLockTimer = 0;
}
