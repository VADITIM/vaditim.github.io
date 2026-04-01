import { ref } from 'vue';

const SMALL_DESKTOP_BREAKPOINT = 1200;
const MOBILE_MAX_WIDTH = SMALL_DESKTOP_BREAKPOINT - 1;

export const IsMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  return viewportWidth <= MOBILE_MAX_WIDTH;
};

export const isMobile = ref<boolean>(IsMobileDevice());

if (typeof window !== 'undefined') {
  let rafId = 0;

  const update = () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      isMobile.value = IsMobileDevice();
    });
  };

  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('orientationchange', update, { passive: true });
}
