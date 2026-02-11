let totalSections = 3;
let resizeRaf = 0;
let wheelRaf = 0;
let pendingWheelDelta = 0;

const SCROLL_MULTIPLIER = 3;

const updateScrollHeight = () => {
  const height = window.innerHeight * totalSections;
  document.body.style.height = `${height}px`;
  document.documentElement.style.height = `${height}px`;
};

const handleResize = () => {
  if (resizeRaf) return;
  resizeRaf = window.requestAnimationFrame(() => {
    resizeRaf = 0;
    updateScrollHeight();
  });
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  pendingWheelDelta += event.deltaY * SCROLL_MULTIPLIER;

  if (wheelRaf) return;

  wheelRaf = window.requestAnimationFrame(() => {
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const nextScroll = clamp(
      window.scrollY + pendingWheelDelta,
      0,
      maxScroll
    );

    window.scrollTo({ top: nextScroll });
    
    // Trigger scroll event for section tracking
    window.dispatchEvent(new Event('scroll'));
    
    pendingWheelDelta = 0;
    wheelRaf = 0;
  });
};

export function initVirtualScroll(sectionCount = 3) {
  totalSections = sectionCount;
  updateScrollHeight();
  window.addEventListener("resize", handleResize);
  window.addEventListener("wheel", handleWheel, { passive: false });
}

export function destroyVirtualScroll() {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("wheel", handleWheel);
  if (resizeRaf) {
    window.cancelAnimationFrame(resizeRaf);
    resizeRaf = 0;
  }
  if (wheelRaf) {
    window.cancelAnimationFrame(wheelRaf);
    wheelRaf = 0;
  }
  pendingWheelDelta = 0;
}
