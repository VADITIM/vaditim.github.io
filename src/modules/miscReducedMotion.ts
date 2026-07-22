import { gsap } from 'gsap'
import { ref } from 'vue'

/**
 * Site-wide reduced-motion mode, gated on `prefers-reduced-motion: reduce`.
 *
 * Rather than branching in every handler, the whole of GSAP is collapsed at the
 * root: the global timeline runs far faster than real time, so every tween still
 * reaches its end state — nothing is stranded off-screen or invisible — but the
 * travel between states is over inside a frame. Delays collapse with it, so the
 * section-enter gate stops holding content back too.
 *
 * Two animations are carved out by name (see TASKS.md): the Perks name typewriter
 * and the Projects info modules. They are the content, not decoration — reading
 * them is the point — so they keep real-time playback via `keepFullMotion`.
 */

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * High enough that a one-second tween finishes within a frame, low enough that
 * `keepFullMotion`'s reciprocal stays far away from GSAP's timeScale precision floor.
 */
const COLLAPSED_TIME_SCALE = 120

const reduceQuery = window.matchMedia(REDUCE_QUERY)

/**
 * Seeded at module load, not in `initializeReducedMotion`, because modules that
 * read it while initialising their own state import it long before startup runs.
 */
export const prefersReducedMotion = ref(reduceQuery.matches)

/**
 * Opts one animation out of the collapse. A child's timeScale multiplies its
 * parent's, so the reciprocal of the global scale restores real time for it alone.
 */
export function keepFullMotion<T extends gsap.core.Animation>(animation: T): T {
  animation.timeScale(prefersReducedMotion.value ? 1 / COLLAPSED_TIME_SCALE : 1)
  return animation
}

/** Call once from app startup. Returns a cleanup function. */
export function initializeReducedMotion(): () => void {
  const applyPreference = () => {
    prefersReducedMotion.value = reduceQuery.matches
    gsap.globalTimeline.timeScale(reduceQuery.matches ? COLLAPSED_TIME_SCALE : 1)
  }

  applyPreference()
  reduceQuery.addEventListener('change', applyPreference)
  return () => reduceQuery.removeEventListener('change', applyPreference)
}
