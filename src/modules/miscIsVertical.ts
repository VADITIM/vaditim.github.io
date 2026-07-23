import { ref } from 'vue';

// The app has two layouts, switched by viewport ORIENTATION rather than width:
// a portrait viewport gets the vertical layout, landscape gets the desktop one.
// Portrait covers both a phone (mostly 9:16) and a 90°-rotated desktop monitor,
// and sizing within the vertical layout is viewport-proportional so the one
// layout scales across every portrait screen size.
export const IsVerticalViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth || document.documentElement.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight;
  return height > width;
};

export const isVertical = ref<boolean>(IsVerticalViewport());

if (typeof window !== 'undefined') {
  let rafId = 0;

  const update = () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      isVertical.value = IsVerticalViewport();
    });
  };

  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('orientationchange', update, { passive: true });
}
