/**
 * Site-wide animation mode. `full` is everything as designed; `lite` is the
 * fallback for visitors without hardware acceleration — ambient loops, canvases
 * and the transition overlay are dropped, and generic section reveals fall back
 * to the shared pair in `animationLiteFallback`.
 *
 * The choice is the visitor's, made once in the hardware-acceleration notice and
 * changeable afterwards from the settings modal. It lives in localStorage, so it
 * survives reloads and is read back before any animation registers.
 */

import { computed, ref } from 'vue'

export type AnimationMode = 'full' | 'lite'

const MODE_STORAGE_KEY = 'animation-mode'

/** Pre-settings key: its mere presence meant "notice dismissed", i.e. full motion. */
const LEGACY_NOTICE_KEY = 'hardware-acceleration-notice-dismissed'

const LITE_MODE_CLASS = 'is-lite-mode'

function readStoredMode(): AnimationMode | null {
  const stored = localStorage.getItem(MODE_STORAGE_KEY)
  if (stored === 'full' || stored === 'lite') return stored
  return localStorage.getItem(LEGACY_NOTICE_KEY) === '1' ? 'full' : null
}

/**
 * Seeded at module load, not from an init call, because animation handlers read
 * it while registering — long before app startup would have run.
 */
export const animationMode = ref<AnimationMode>(readStoredMode() ?? 'full')

export const isLiteMode = computed(() => animationMode.value === 'lite')

/** False until the visitor has answered the notice; that is what makes it show. */
export function hasChosenAnimationMode(): boolean {
  return readStoredMode() !== null
}

export function setAnimationMode(mode: AnimationMode): void {
  localStorage.setItem(MODE_STORAGE_KEY, mode)
  localStorage.removeItem(LEGACY_NOTICE_KEY)
  animationMode.value = mode
  applyLiteModeClass()
}

/** CSS-side half of the switch: ambient keyframes, filters and shadows key off this. */
export function applyLiteModeClass(): void {
  document.documentElement.classList.toggle(LITE_MODE_CLASS, isLiteMode.value)
}
